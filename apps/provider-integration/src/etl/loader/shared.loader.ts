import { IntegrateProductCommand } from '@app/provider-integration/messages/integrate-product.command';
import { ProviderProductDataDto } from '@app/provider-integration/etl/dto/provider-product-data.dto';
import { ProductStatus } from '@app/provider-integration/model/enum/product-status.enum';
import { ProductRefreshReason } from '@app/provider-integration/model/enum/product-refresh-reason.enum';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { ProviderSource } from '@app/provider-integration/model/provider-source.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { ProviderSourceRun } from '@app/provider-integration/model/provider-source-run.entity';
import { ProductsService } from '@app/provider-integration/services/products.service';
import { formatErrorMessage } from '@app/provider-integration/utils/format-error-message';
import { MessagingService } from '@lib/messaging';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as moment from 'moment';
import { Loader } from './loader.interface';

@Injectable()
export abstract class SharedLoader implements Loader {
  private readonly logger = new Logger(SharedLoader.name);

  @Inject()
  protected readonly productsService: ProductsService;
  @Inject()
  protected readonly messagingService: MessagingService;

  // Hooks -> can implement custom logic and return true to prevent default follow-on actions
  protected afterCreateHook?(
    product: Product,
    run: ProviderSourceRun,
  ): Promise<boolean>;
  protected afterReloadHook?(
    product: Product,
    run: ProviderSourceRun,
    reason: ProductRefreshReason,
  ): Promise<boolean>;

  // ABSTRACT STUFF
  abstract providerKey: ProviderKey;
  protected abstract isOfferUpdated(
    sourceItem: ProviderProductDataDto,
    product: Product,
  ): boolean;
  protected abstract pickOfferUpdatedSourceFields(
    sourceItem: ProviderProductDataDto,
  ): ProviderProductDataDto;

  async loadProductDetail(
    id: string,
    productDetail: ProviderProductDataDto,
    source: ProviderSource,
    runId: string,
    reason: ProductRefreshReason,
  ) {
    return await this.productsService.refresh(
      id,
      productDetail,
      source,
      runId,
      reason,
    );
  }

  async loadSourceItem(
    sourceItem: ProviderProductDataDto,
    run: ProviderSourceRun,
  ) {
    run.foundCount++;
    try {
      const product = await this.productsService.findByMerchant(
        run.source.provider.merchantId,
        sourceItem.merchantProductId,
      );
      if (!product) {
        await this.createProduct(sourceItem, run);
      } else {
        if (product.sourceId === run.source.id) {
          await this.handleOwnedProduct(sourceItem, product, run);
        } else {
          await this.handleForeignProduct(sourceItem, product, run);
        }
      }
    } catch (err) {
      this.logger.error(formatErrorMessage(err));
      run.failureCount++;
    }
    return run;
  }

  private async createProduct(
    sourceProduct: Partial<Product>,
    run: ProviderSourceRun,
  ) {
    const toCreate: Partial<Product> = {
      ...sourceProduct,
      integrationStatus: ProductStatus.PENDING,
    };
    const created = await this.productsService.create(toCreate, run);
    run.createdCount++;
    // hook: can be used to refresh directly (set product LIVE + add to index) and prevent integrate product command send
    if (this.afterCreateHook && (await this.afterCreateHook(created, run))) {
      return;
    }
    await this.messagingService.sendToQueue(
      new IntegrateProductCommand({
        productId: created.id,
        runId: created.createdByRunId,
        reason: ProductRefreshReason.CREATED,
        skipCache: false,
      }),
    );
  }

  private async handleOwnedProduct(
    sourceItem: ProviderProductDataDto,
    product: Product,
    run: ProviderSourceRun,
  ) {
    run.ownedCount++;
    switch (product.integrationStatus) {
      case ProductStatus.LIVE:
        await this.handleLiveProduct(sourceItem, product, run);
        break;
      case ProductStatus.REMAP:
        await this.reloadProduct(
          sourceItem,
          product,
          run,
          ProductRefreshReason.REQUESTED,
        );
        break;
      case ProductStatus.EXPIRED:
        await this.reloadProduct(
          sourceItem,
          product,
          run,
          ProductRefreshReason.EXPIRED,
        );
        break;
      case ProductStatus.PENDING:
        run.pendingCount++;
        await this.messagingService.sendToQueue(
          new IntegrateProductCommand({
            productId: product.id,
            runId: run.id,
            reason: ProductRefreshReason.PENDING_RESEND,
          }),
        );
        run.refreshSignalCount++;
      default:
        break;
    }
  }

  private async handleLiveProduct(
    sourceItem: ProviderProductDataDto,
    product: Product,
    run: ProviderSourceRun,
  ) {
    if (
      moment(run.sourceDate).isAfter(product.refreshedAt) &&
      this.isOfferUpdated(sourceItem, product)
    ) {
      // product offer updated
      await this.productsService.refresh(
        product.id,
        this.pickOfferUpdatedSourceFields(sourceItem),
        run.source,
        run.id,
        ProductRefreshReason.OFFER_UPDATED,
      );
    } else {
      // issue keep alive
      await this.productsService.keepAlive(product, run);
      run.keepAliveSignalCount++;
    }
  }

  private async reloadProduct(
    sourceItem: ProviderProductDataDto,
    product: Product,
    run: ProviderSourceRun,
    reason: ProductRefreshReason,
  ) {
    product = await this.productsService.update(
      product.id,
      {
        ...sourceItem,
        source: run.source, // ensure source adoption in case of foreign expired
        integrationStatus: ProductStatus.PENDING,
      },
      true,
    );
    // hook: can be used to refresh directly skip integrate product command send
    if (
      this.afterReloadHook &&
      (await this.afterReloadHook(product, run, reason))
    ) {
      return;
    }
    await this.messagingService.sendToQueue(
      new IntegrateProductCommand({
        productId: product.id,
        runId: run.id,
        reason,
      }),
    );
  }

  private async handleForeignProduct(
    sourceItem: ProviderProductDataDto,
    product: Product,
    run: ProviderSourceRun,
  ) {
    if (product.integrationStatus === ProductStatus.EXPIRED) {
      // adopt expired foreign product
      await this.reloadProduct(
        sourceItem,
        product,
        run,
        ProductRefreshReason.ADOPTED,
      );
      run.adoptedCount++;
      run.refreshSignalCount++;
    } else {
      run.foreignCount++;
    }
  }
}
