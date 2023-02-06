import { MessagingModule } from '@lib/messaging';
import { SearchModule } from '@lib/search';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'libs/database/src';
import configuration from '../config/configuration';
import { BrandsController } from './api/controllers/brands.controller';
import { CategoriesController } from './api/controllers/categories.controller';
import { CategoryGroupsController } from './api/controllers/category-groups.controller';
import { IntegrationController } from './api/controllers/integration.controller';
import { JobsController } from './api/controllers/jobs.controller';
import { LabelGroupsController } from './api/controllers/label-groups.controller';
import { LabelsController } from './api/controllers/labels.controller';
import { ProductRunsController } from './api/controllers/product-runs.controller';
import { ProductSourcesController } from './api/controllers/product-sources.controller';
import { ProductsController } from './api/controllers/products.controller';
import { ProvidersController } from './api/controllers/providers.controller';
import { IntegrateSourceConsumer } from './consumers/integrate-source.consumer';
import { RefreshProductConsumer } from './consumers/refresh-product.consumer';
import { IndexProductBatchConsumer } from './consumers/index-product-batch.consumer';
import { IndexProductConsumer } from './consumers/index-product.consumer';
import { EtlModule } from './etl/etl.module';
import { ProductExpiredMonitorJob } from './jobs/product-expired-monitor.job';
import { JobContainer, JOB_CONTAINER } from './jobs/shared/job.container';
import { SourceDueMonitorJob } from './jobs/source-due-monitor.job';
import { Brand } from './model/brand.entity';
import { CategoryGroup } from './model/category-group.entity';
import { Category } from './model/category.entity';
import { LabelGroup } from './model/label-group.entity';
import { Label } from './model/label.entity';
import { ProductRun } from './model/product-run.entity';
import { ProductSource } from './model/product-source.entity';
import { Product } from './model/product.entity';
import { Provider } from './model/provider.entity';
import { Review } from './model/review.entity';
import { BrandsService } from './services/brands.service';
import { CategoriesService } from './services/categories.service';
import { CategoryGroupsService } from './services/category-groups.service';
import { IntegrationService } from './services/integration.service';
import { JobsService } from './services/jobs.service';
import { LabelGroupsService } from './services/label-groups.service';
import { LabelsService } from './services/labels.service';
import { ProductRunsService } from './services/product-runs.service';
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
      ProductRun,
      Product,
      Label,
      LabelGroup,
      Category,
      CategoryGroup,
      Brand,
      Review,
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
    ProductSourcesController,
    ProductRunsController,
    LabelsController,
    LabelGroupsController,
    CategoriesController,
    CategoryGroupsController,
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
    IntegrationService,
    ProvidersService,
    ProductSourcesService,
    ProductRunsService,
    ProductsService,
    LabelsService,
    LabelGroupsService,
    CategoriesService,
    CategoryGroupsService,
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
    ProductRunsService,
    ProductsService,
  ],
})
export class AppModule {}
