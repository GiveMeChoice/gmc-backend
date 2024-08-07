import { MessagingModule } from 'libs/messaging/src';
import { SearchModule } from 'libs/elasticsearch/src';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'libs/database/src';
import configuration from '../config/configuration';
import { MerchantBrandsController } from './api/controllers/merchant-brands.controller';
import { MerchantCategoriesController } from './api/controllers/merchant-categories.controller';
import { GmcCategoriesController } from './api/controllers/gmc-categories.controller';
import { IntegrationController } from './api/controllers/integration.controller';
import { JobsController } from './api/controllers/jobs.controller';
import { GmcLabelsController } from './api/controllers/gmc-labels.controller';
import { MerchantLabelsController } from './api/controllers/merchant-labels.controller';
import { RunsController } from './api/controllers/runs.controller';
import { ChannelsController } from './api/controllers/channels.controller';
import { ProductsController } from './api/controllers/products.controller';
import { ProvidersController } from './api/controllers/providers.controller';
import { IntegrateSourceConsumer } from './consumers/integrate-source.consumer';
import { RefreshProductConsumer } from './consumers/integrate-product.consumer';
import { IndexProductBatchConsumer } from './consumers/index-product-batch.consumer';
import { IndexProductConsumer } from './consumers/index-product.consumer';
import { EtlModule } from './etl/etl.module';
import { ProductExpiredMonitorJob } from './jobs/product-expired-monitor.job';
import { JobContainer, JOB_CONTAINER } from './jobs/shared/job.container';
import { SourceDueMonitorJob } from './jobs/source-due-monitor.job';
import { MerchantBrand } from './model/merchant-brand.entity';
import { GmcCategory } from './model/gmc-category.entity';
import { MerchantCategory } from './model/merchant-category.entity';
import { GmcLabel } from './model/gmc-label.entity';
import { MerchantLabel } from './model/merchant-label.entity';
import { Run } from './model/run.entity';
import { Channel } from './model/channel.entity';
import { Product } from './model/product.entity';
import { Provider } from './model/provider.entity';
import { ProductReview } from './model/product-review.entity';
import { MerchantBrandsService } from './services/merchant-brands.service';
import { MerchantCategoriesService } from './services/merchant-categories.service';
import { GmcCategoriesService } from './services/gmc-categories.service';
import { IntegrationService } from './services/integration.service';
import { JobsService } from './services/jobs.service';
import { GmcLabelsService } from './services/gmc-labels.service';
import { MerchantLabelsService } from './services/merchant-labels.service';
import { RunsService } from './services/runs.service';
import { ChannelsService } from './services/channels.service';
import { ProductsService } from './services/products.service';
import { ProvidersService } from './services/providers.service';
import { TasksService } from './services/tasks.service';
import { PingController } from './api/controllers/ping.controller';
import { Merchant } from './model/merchant.entity';
import { MerchantsController } from './api/controllers/merchants.controller';
import { MerchantsService } from './services/merchants.service';
import { ProductImage } from './model/product-image.entity';
import { ProductDocumentsController } from './api/controllers/product-document.controller';
import { ProductDocumentsService } from './services/product-documents.service';
import { GmcBrand } from './model/gmc-brand.entity';
import { GmcBrandsController } from './api/controllers/gmc-brands.controller';
import { GmcBrandsService } from './services/gmc-brands.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      Provider,
      Channel,
      Run,
      Product,
      GmcLabel,
      GmcCategory,
      GmcBrand,
      MerchantLabel,
      MerchantCategory,
      MerchantBrand,
      ProductReview,
      ProductImage,
      Merchant,
    ]),
    DatabaseModule,
    MessagingModule,
    SearchModule,
    forwardRef(() => EtlModule),
  ],
  controllers: [
    IntegrationController,
    PingController,
    ProvidersController,
    ChannelsController,
    RunsController,
    GmcCategoriesController,
    GmcLabelsController,
    GmcBrandsController,
    MerchantCategoriesController,
    MerchantLabelsController,
    MerchantBrandsController,
    JobsController,
    ProductsController,
    ProductDocumentsController,
    MerchantsController,
  ],
  providers: [
    // messaging
    RefreshProductConsumer,
    IntegrateSourceConsumer,
    IndexProductConsumer,
    IndexProductBatchConsumer,
    // core services
    IntegrationService,
    ProvidersService,
    ChannelsService,
    RunsService,
    ProductsService,
    ProductDocumentsService,
    MerchantLabelsService,
    GmcCategoriesService,
    GmcLabelsService,
    GmcBrandsService,
    MerchantCategoriesService,
    MerchantBrandsService,
    MerchantsService,
    // helper services
    JobsService,
    TasksService,
    // jobs
    SourceDueMonitorJob,
    ProductExpiredMonitorJob,
    {
      provide: JOB_CONTAINER,
      useFactory: (
        sourceDueMonitorJob: SourceDueMonitorJob,
        productExpiredMonitorJob: ProductExpiredMonitorJob,
      ) => new JobContainer([sourceDueMonitorJob, productExpiredMonitorJob]),
      inject: [SourceDueMonitorJob, ProductExpiredMonitorJob],
    },
  ],
  exports: [
    ProvidersService,
    ChannelsService,
    RunsService,
    ProductsService,
    ProductDocumentsService,
  ],
})
export class AppModule {}
