import { ProductsModule } from '@lib/products';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'libs/database/src';
import configuration from '../config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RefreshConsumer } from './consumers/refresh-product.consumer';
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
  ],
  controllers: [AppController],
  providers: [AppService, RefreshConsumer],
})
export class AppModule {}
