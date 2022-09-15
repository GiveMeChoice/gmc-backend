import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersController } from './controllers/providers.controller';
import { ProviderSource } from './model/provider-source.entity';
import { Provider } from './model/provider.entity';
import { ProductSourcesService } from './services/product-sources.service';
import { ProvidersService } from './services/providers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Provider, ProviderSource])],
  controllers: [ProvidersController],
  providers: [ProvidersService, ProductSourcesService],
  exports: [ProvidersService, ProductSourcesService],
})
export class ProvidersModule {}
