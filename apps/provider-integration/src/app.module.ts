import { ProductsModule } from '@lib/products';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'libs/database/src';
import configuration from '../config/configuration';
import { IntegrationController } from './api/controllers/integration.controller';
import { IntegrationService } from './services/integration.service';
import { IntegrateProductConsumer } from './consumers/integrate-product.consumer';
import { JobsController } from './api/controllers/jobs.controller';
import { ProductSourcesController } from './api/controllers/product-sources.controller';
import { ProvidersController } from './api/controllers/providers.controller';
import { EtlModule } from './etl/etl.module';
import { SourceMonitorJob } from './jobs/source-monitor.job';
import { ProductSource } from './model/product-source.entity';
import { Provider } from './model/provider.entity';
import { SourceRun } from './model/source-run.entity';
import { JobsService } from './services/jobs.service';
import { ProductSourcesService } from './services/product-sources.service';
import { ProvidersService } from './services/providers.service';
import { SourceRunsService } from './services/source-runs.service';
import { MessagingModule } from '@lib/messaging';
import { IntegrateSourceConsumer } from './consumers/integrate-source.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Provider, ProductSource, SourceRun]),
    DatabaseModule,
    MessagingModule,
    // SearchModule,
    ProductsModule,
    forwardRef(() => EtlModule),
  ],
  controllers: [
    IntegrationController,
    ProvidersController,
    ProductSourcesController,
    JobsController,
  ],
  providers: [
    IntegrationService,
    IntegrateProductConsumer,
    IntegrateSourceConsumer,
    ProvidersService,
    ProductSourcesService,
    SourceRunsService,
    JobsService,
    SourceMonitorJob,
  ],
  exports: [ProvidersService, ProductSourcesService, SourceRunsService],
})
export class AppModule {}
