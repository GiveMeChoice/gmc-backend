import { ProductsModule } from '@lib/products';
import { SearchModule } from '@lib/search';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'libs/database/src';
import configuration from '../config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductRefreshConsumer } from './consumers/product-refresh.consumer';
import { JobsController } from './controllers/jobs.controller';
import { ProvidersController } from './controllers/providers.controller';
import { EtlModule } from './etl/etl.module';
import { SourceMonitorJob } from './jobs/source-monitor.job';
import { ProductSource } from './model/product-source.entity';
import { Provider } from './model/provider.entity';
import { SourceRun } from './model/source-run.entity';
import { JobsService } from './services/jobs.service';
import { ProductSourcesService } from './services/product-sources.service';
import { ProvidersService } from './services/providers.service';
import { SourceRunsService } from './services/source-runs.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Provider, ProductSource, SourceRun]),
    DatabaseModule,
    ProductsModule,
    // SearchModule,
    forwardRef(() => EtlModule),
  ],
  controllers: [AppController, ProvidersController, JobsController],
  providers: [
    AppService,
    ProductRefreshConsumer,
    ProvidersService,
    ProductSourcesService,
    SourceRunsService,
    JobsService,
    SourceMonitorJob,
  ],
  exports: [ProvidersService, ProductSourcesService, SourceRunsService],
})
export class AppModule {}
