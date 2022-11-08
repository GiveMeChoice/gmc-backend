import { RefreshProductCommand } from '@app/provider-integration/messages/refresh-product.command';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { SourceRun } from '@app/provider-integration/model/source-run.entity';
import { formatErrorMessage } from '@app/provider-integration/utils/format-error-message';
import { MessagingService } from '@lib/messaging';
import { ProductsService } from '@lib/products';
import { ProductIntegrationStatus } from '@lib/products/model/enum/product-status.enum';
import { Product } from '@lib/products/model/product.entity';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as moment from 'moment';
import { Pipeline } from './pipeline.interface';

@Injectable()
export abstract class PipelineBase implements Pipeline {
  @Inject()
  protected readonly productsService: ProductsService;
  @Inject()
  protected readonly messagingService: MessagingService;

  abstract providerKey: ProviderKey;
  abstract execute(run: SourceRun): Promise<SourceRun>;
  abstract refreshProduct(
    product: Product,
    source: ProductSource,
    runId: string,
    skipCache: boolean,
  ): Promise<Partial<Product>>;

  /* 
    Individual source pipelines will determines whether a 
    full product refresh (skipCache=true) should take place by comparing
    new source data to the existing product data.
    (e.g. price has been updated) 
   */
  protected abstract needsRefresh(
    sourceProduct: Partial<Product>,
    existingProduct: Product,
    source: ProductSource,
  ): boolean;

  /* 
    Whenever a refresh is needed, pipelines can choose how to apply updates from the source item to the existing product (e.g. only updated price).
  */
  protected abstract applySourceUpdate(
    existing: Product,
    source: Partial<Product>,
  ): Product;

  /* 
    Stale products have gone past configured limit of keep alives and must be refreshed (skip cache).
  */
  private isStale(product: Product, source: ProductSource): boolean {
    return (
      source.productKeepAliveLimit &&
      product.keepAliveCount >= source.productKeepAliveLimit
    );
  }

  /* 
    Products can only be adopted if they are expired and
    do not have an integration error.
  */
  private isAdoptable(product: Product): boolean {
    return (
      product.integrationStatus === ProductIntegrationStatus.EXPIRED &&
      !product.hasIntegrationError
    );
  }

  protected async loadSourceProduct(
    sourceProduct: Partial<Product>,
    run: SourceRun,
  ): Promise<SourceRun> {
    run.foundCount++;
    try {
      const existingProduct = await this.productsService.findByProvider(
        run.source.provider.key,
        sourceProduct.providerProductId,
      );
      if (!existingProduct) {
        await this.createProduct(sourceProduct, run);
        run.createdCount++;
        run.refreshSignalCount++;
      } else {
        if (existingProduct.sourceId === run.source.id) {
          run.ownedCount++;
          if (
            existingProduct.integrationStatus !== ProductIntegrationStatus.LIVE
          ) {
            await this.sendRefreshSignal(existingProduct.id, run.id);
            run.refreshSignalCount++;
          } else if (
            this.needsRefresh(sourceProduct, existingProduct, run.source) ||
            this.isStale(existingProduct, run.source)
          ) {
            await this.refreshStaleProduct(
              this.applySourceUpdate(existingProduct, sourceProduct),
              run,
            );
            run.staleCount++;
            run.refreshSignalCount++;
          } else {
            await this.keepAliveProduct(existingProduct, run);
            run.keepAliveSignalCount++;
          }
        } else if (this.isAdoptable(existingProduct)) {
          await this.adoptExpiredProduct(existingProduct, run);
          run.adoptedCount++;
          run.refreshSignalCount++;
        }
      }
    } catch (err) {
      Logger.error(formatErrorMessage(err));
      run.failureCount++;
    }
    return run;
  }

  /* 
    Product is not yet in DB. This will create product and assign to current source.
    Will use cached version if available.
  */
  private async createProduct(sourceProduct: Partial<Product>, run: SourceRun) {
    sourceProduct.integrationStatus = ProductIntegrationStatus.PENDING;
    sourceProduct.sourceId = run.source.id;
    sourceProduct.createdByRunId = run.id;
    sourceProduct.keepAliveCount = 0;
    sourceProduct.expiresAt = this.renewExpirationDate(run.source);
    const { id: productId } = await this.productsService.create(sourceProduct);
    await this.sendRefreshSignal(productId, run.id);
  }

  /* 
    Product is found but does not need to be refreshed.
    Extend product's expiration date to prevent removal.
  */
  private async keepAliveProduct(product: Product, run: SourceRun) {
    product.keepAliveCount++;
    product.expiresAt = this.renewExpirationDate(run.source);
    await this.productsService.save(product);
  }

  /* 
    Product data is out-of-date. Set to status PENDING and request hard refresh.
  */
  private async refreshStaleProduct(product: Product, run: SourceRun) {
    product.integrationStatus = ProductIntegrationStatus.PENDING;
    product.expiresAt = this.renewExpirationDate(run.source);
    await this.productsService.save(product);
    await this.sendRefreshSignal(product.id, run.id, true);
  }

  /* 
    Product is not owned by source and is expired. 
    Adopt it to this source and request refresh.
  */
  private async adoptExpiredProduct(product: Product, run: SourceRun) {
    product.integrationStatus = ProductIntegrationStatus.PENDING;
    product.sourceId = run.source.id;
    product.expiresAt = this.renewExpirationDate(run.source);
    await this.productsService.save(product);
    await this.sendRefreshSignal(product.id, run.id, true);
  }

  /* 
    Returns now + source.runIntervalHours + 24 hours.
    Gives products one more source run plus one day to refresh itself.
  */
  protected renewExpirationDate(source: ProductSource) {
    return moment()
      .add(source.runIntervalHours + 24, 'hours')
      .toDate();
  }

  private async sendRefreshSignal(
    productId: string,
    runId: string,
    hardRefresh = false,
  ) {
    await this.messagingService.sendToQueue(
      new RefreshProductCommand({
        productId,
        runId,
        skipCache: false,
      }),
    );
  }
}
