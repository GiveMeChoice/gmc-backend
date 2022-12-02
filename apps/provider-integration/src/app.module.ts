import { MessagingModule } from '@lib/messaging';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'libs/database/src';
import configuration from '../config/configuration';
import { IntegrationController } from './api/controllers/integration.controller';
import { JobsController } from './api/controllers/jobs.controller';
import { ProductRunsController } from './api/controllers/product-runs.controller';
import { ProductSourcesController } from './api/controllers/product-sources.controller';
import { ProductsController } from './api/controllers/products.controller';
import { ProvidersController } from './api/controllers/providers.controller';
import { IntegrateSourceConsumer } from './consumers/integrate-source.consumer';
import { RefreshProductConsumer } from './consumers/refresh-product.consumer';
import { EtlModule } from './etl/etl.module';
import { ProductExpiredMonitorJob } from './jobs/product-expired-monitor.job';
import { JobContainer, JOB_CONTAINER } from './jobs/shared/job.container';
import { SourceDueMonitorJob } from './jobs/source-due-monitor.job';
import { ProductRun } from './model/product-run.entity';
import { ProductSource } from './model/product-source.entity';
import { Product } from './model/product.entity';
import { Provider } from './model/provider.entity';
import { IntegrationService } from './services/integration.service';
import { JobsService } from './services/jobs.service';
import { ProductRunsService } from './services/product-runs.service';
import { ProductSourcesService } from './services/product-sources.service';
import { ProductsService } from './services/products.service';
import { ProvidersService } from './services/providers.service';
import { TasksService } from './services/tasks.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Provider, ProductSource, ProductRun, Product]),
    DatabaseModule,
    MessagingModule,
    // SearchModule,
    forwardRef(() => EtlModule),
  ],
  controllers: [
    IntegrationController,
    ProvidersController,
    ProductSourcesController,
    ProductRunsController,
    JobsController,
    ProductsController,
  ],
  providers: [
    // messaging
    RefreshProductConsumer,
    IntegrateSourceConsumer,
    // services
    IntegrationService,
    ProvidersService,
    ProductSourcesService,
    ProductRunsService,
    ProductsService,
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
