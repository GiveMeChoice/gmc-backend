import { IntegrateProductCommand } from '@app/provider-integration/messages/integrate-product.command';
import { ProductRefreshReason } from '@app/provider-integration/model/enum/product-refresh-reason.enum';
import { ProductIntegrationStatus } from '@app/provider-integration/model/enum/product-integration-status.enum';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { SourceRun } from '@app/provider-integration/model/source-run.entity';
import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { ProductsService } from '@app/provider-integration/services/products.service';
import { formatErrorMessage } from '@app/provider-integration/utils/format-error-message';
import { renewExpirationDate } from '@app/provider-integration/utils/renew-expiration-date';
import { MessagingService } from '@lib/messaging';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as moment from 'moment';
import { Pipeline } from './pipeline.interface';

@Injectable()
export abstract class PipelineBase {
  // @Inject()
  // protected readonly productsService: ProductsService;
  // @Inject()
  // protected readonly messagingService: MessagingService;
  // abstract providerKey: ProviderKey;
  // abstract executeSource(run: SourceRun): Promise<SourceRun>;
  // abstract executeProduct(
  //   product: Product,
  //   runId: string,
  //   reason: ProductRefreshReason,
  //   skipCache?: boolean,
  // );
  // /*
  //   Allows individual pipelines to determine whether a
  //   product is "stale" (i.e needs a full refresh (skipCache=true))
  //   using its own criteria.
  //   <br>
  //   E.g. comparing new source product data to
  //   the existing product for price or availability changes,
  //   setting an upper limit on time since last product
  //   refresh or number of keep alives, etc...
  //  */
  // protected abstract isProductStale(
  //   existingProduct: Product,
  //   sourceProduct: Partial<Product>,
  //   source: ProductSource,
  // ): boolean;
  // /*
  //   As part of a full product refresh, data only available on the
  //   source list itself (vs the direct product refresh) may need
  //   to be applied to the product.
  //   <br>
  //   Pipelines choose here how to apply updates from the source item
  //   to the existing product (may be none).
  // */
  // protected abstract applySourceRefresh(
  //   existing: Product,
  //   source: Partial<Product>,
  // ): Product;
  // /*
  //   Products can only be adopted if they are expired and
  //   do not have an integration error.
  // */
  // private isAdoptable(product: Product): boolean {
  //   return product.integrationStatus === ProductIntegrationStatus.EXPIRED;
  // }
  // protected async loadSourceProduct(
  //   sourceProduct: Partial<Product>,
  //   run: SourceRun,
  // ) {
  //   run.foundCount++;
  //   try {
  //     const existingProduct = await this.productsService.findByProvider(
  //       run.source.provider.id,
  //       sourceProduct.providerProductId,
  //     );
  //     if (!existingProduct) {
  //       // always create net new products and assign to this source
  //       await this.createProduct(sourceProduct, run);
  //       run.createdCount++;
  //       run.refreshSignalCount++;
  //     } else {
  //       if (existingProduct.sourceId === run.source.id) {
  //         run.ownedCount++;
  //         switch (existingProduct.integrationStatus) {
  //           case ProductIntegrationStatus.EXPIRED:
  //             run.staleCount++;
  //             await this.refreshStaleProduct(
  //               this.applySourceRefresh(existingProduct, sourceProduct),
  //               run,
  //             );
  //             run.refreshSignalCount++;
  //             break;
  //           case ProductIntegrationStatus.PENDING:
  //             run.pendingCount++;
  //             await this.sendRefreshSignal(
  //               existingProduct.id,
  //               run.id,
  //               ProductRefreshReason.PENDING_RESEND,
  //             );
  //             run.refreshSignalCount++;
  //           case ProductIntegrationStatus.LIVE:
  //             if (
  //               // only can be stale if source is newer than last product refresh
  //               moment(run.sourceDate).isAfter(existingProduct.refreshedAt) &&
  //               this.isProductStale(existingProduct, sourceProduct, run.source)
  //             ) {
  //               run.staleCount++;
  //               await this.refreshStaleProduct(
  //                 this.applySourceRefresh(existingProduct, sourceProduct),
  //                 run,
  //               );
  //               run.refreshSignalCount++;
  //             } else {
  //               await this.keepAliveProduct(existingProduct, run);
  //               run.keepAliveSignalCount++;
  //             }
  //             break;
  //           default:
  //             break;
  //         }
  //       } else {
  //         if (this.isAdoptable(existingProduct)) {
  //           await this.adoptExpiredProduct(existingProduct, run);
  //           run.adoptedCount++;
  //           run.refreshSignalCount++;
  //         } else {
  //           run.foreignCount++;
  //         }
  //       }
  //     }
  //   } catch (err) {
  //     Logger.error(formatErrorMessage(err));
  //     run.failureCount++;
  //   }
  //   return run;
  // }
  // /*
  //   Product is not yet in DB. This will create product and assign to current source.
  //   Will refresh using cache if available.
  // */
  // private async createProduct(sourceProduct: Partial<Product>, run: SourceRun) {
  //   sourceProduct.integrationStatus = ProductIntegrationStatus.PENDING;
  //   sourceProduct.createdByRunId = run.id;
  //   sourceProduct.keepAliveCount = 0;
  //   sourceProduct.source = run.source;
  //   sourceProduct.expiresAt = renewExpirationDate(run.source);
  //   const { id: productId } = await this.productsService.create(
  //     run.source.providerId,
  //     sourceProduct.providerProductId,
  //     sourceProduct,
  //   );
  //   await this.sendRefreshSignal(
  //     productId,
  //     run.id,
  //     ProductRefreshReason.CREATED,
  //   );
  // }
  // /*
  //   Product is found but does not need to be refreshed.
  //   Extend product's expiration date to prevent removal.
  // */
  // private async keepAliveProduct(product: Product, run: SourceRun) {
  //   product.keepAliveCount++;
  //   product.expiresAt = renewExpirationDate(run.source);
  //   await this.productsService.save(product);
  // }
  // /*
  //   Product data is out-of-date. Set to status PENDING and request hard refresh.
  // */
  // private async refreshStaleProduct(product: Product, run: SourceRun) {
  //   product.integrationStatus = ProductIntegrationStatus.PENDING;
  //   await this.productsService.save(product);
  //   await this.sendRefreshSignal(
  //     product.id,
  //     run.id,
  //     ProductRefreshReason.STALE,
  //     true,
  //   );
  // }
  // /*
  //   Product is not owned by source and is expired.
  //   Adopt it to this source and request refresh.
  // */
  // private async adoptExpiredProduct(product: Product, run: SourceRun) {
  //   product.integrationStatus = ProductIntegrationStatus.PENDING;
  //   product.source = run.source;
  //   product.expiresAt = renewExpirationDate(run.source);
  //   await this.productsService.save(product);
  //   await this.sendRefreshSignal(
  //     product.id,
  //     run.id,
  //     ProductRefreshReason.ADOPTED,
  //   );
  // }
  // private async sendRefreshSignal(
  //   productId: string,
  //   runId: string,
  //   reason: ProductRefreshReason,
  //   skipCache = false,
  // ) {
  //   await this.messagingService.sendToQueue(
  //     new IntegrateProductCommand({
  //       productId,
  //       runId,
  //       reason,
  //       skipCache,
  //     }),
  //   );
  // }
}
