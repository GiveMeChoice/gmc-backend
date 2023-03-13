import { MessagingModule } from '@lib/messaging';
import { SearchModule } from '@lib/search';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'libs/database/src';
import configuration from '../config/configuration';
import { BrandsController } from './api/controllers/brands.controller';
import { ProviderCategoriesController } from './api/controllers/provider-categories.controller';
import { CategoryController } from './api/controllers/categories.controller';
import { EtlController } from './api/controllers/etl.controller';
import { JobsController } from './api/controllers/jobs.controller';
import { LabelGroupsController } from './api/controllers/label-groups.controller';
import { LabelsController } from './api/controllers/labels.controller';
import { SourceRunsController } from './api/controllers/source-runs.controller';
import { ProductSourcesController } from './api/controllers/product-sources.controller';
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
import { Brand } from './model/brand.entity';
import { Category } from './model/category.entity';
import { ProviderCategory } from './model/provider-category.entity';
import { LabelGroup } from './model/label-group.entity';
import { Label } from './model/label.entity';
import { SourceRun } from './model/source-run.entity';
import { ProductSource } from './model/product-source.entity';
import { Product } from './model/product.entity';
import { Provider } from './model/provider.entity';
import { Review } from './model/review.entity';
import { BrandsService } from './services/brands.service';
import { ProviderCategoriesService } from './services/provider-categories.service';
import { CategoriesService } from './services/categories.service';
import { EtlService } from './services/etl.service';
import { JobsService } from './services/jobs.service';
import { LabelGroupsService } from './services/label-groups.service';
import { LabelsService } from './services/labels.service';
import { SourceRunsService } from './services/source-runs.service';
import { ProductSourcesService } from './services/product-sources.service';
import { ProductsService } from './services/products.service';
import { ProvidersService } from './services/providers.service';
import { TasksService } from './services/tasks.service';
import { PingController } from './api/controllers/ping.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      Provider,
      ProductSource,
      SourceRun,
      Product,
      Label,
      LabelGroup,
      ProviderCategory,
      Category,
      Brand,
      Review,
    ]),
    DatabaseModule,
    MessagingModule,
    SearchModule,
    forwardRef(() => EtlModule),
  ],
  controllers: [
    EtlController,
    PingController,
    ProvidersController,
    ProductSourcesController,
    SourceRunsController,
    LabelsController,
    LabelGroupsController,
    ProviderCategoriesController,
    CategoryController,
    BrandsController,
    JobsController,
    ProductsController,
  ],
  providers: [
    // messaging
    RefreshProductConsumer,
    IntegrateSourceConsumer,
    IndexProductConsumer,
    IndexProductBatchConsumer,
    // core services
    EtlService,
    ProvidersService,
    ProductSourcesService,
    SourceRunsService,
    ProductsService,
    LabelsService,
    LabelGroupsService,
    ProviderCategoriesService,
    CategoriesService,
    BrandsService,
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
    ProductSourcesService,
    SourceRunsService,
    ProductsService,
  ],
})
export class AppModule {}
