import { ProductsModule } from '@lib/products';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'libs/database/src';
import configuration from '../config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IntegrationModule } from './integration/integration.module';
import { ProvidersModule } from './providers/providers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    // libraries
    DatabaseModule,
    ProductsModule,
    // local
    ProvidersModule,
    IntegrationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
