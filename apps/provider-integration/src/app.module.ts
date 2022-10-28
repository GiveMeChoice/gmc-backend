import { ProductsModule } from '@lib/products';
import { SearchModule } from '@lib/search';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'libs/database/src';
import configuration from '../config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductRefreshConsumer } from './consumers/product-refresh.consumer';
import { PipelinesModule } from './pipelines/pipelines.module';
import { ProvidersModule } from './providers/providers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    ProductsModule,
    ProvidersModule,
    PipelinesModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService, ProductRefreshConsumer],
})
export class AppModule {}
