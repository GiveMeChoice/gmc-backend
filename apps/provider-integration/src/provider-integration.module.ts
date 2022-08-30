import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProviderIntegrationController } from './provider-integration.controller';
import { ProviderIntegrationService } from './provider-integration.service';
import configuration from '../config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@app/products/model/product.entity';
import { ProductsModule } from '@app/products';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('postgres.host'),
        port: configService.get('postgres.port'),
        username: configService.get('postgres.username'),
        password: configService.get('postgres.password'),
        database: configService.get('db.name'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
  ],
  controllers: [ProviderIntegrationController],
  providers: [ProviderIntegrationService],
})
export class ProviderIntegrationModule {}
