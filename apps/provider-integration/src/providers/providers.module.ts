import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersController } from './controllers/providers.controller';
import { SourceRun } from './model/source-run.entity';
import { ProductSource } from './model/product-source.entity';
import { Provider } from './model/provider.entity';
import { SourceRunsService } from './services/source-runs.service';
import { ProductSourcesService } from './services/product-sources.service';
import { ProvidersService } from './services/providers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Provider, ProductSource, SourceRun])],
  controllers: [ProvidersController],
  providers: [ProvidersService, ProductSourcesService, SourceRunsService],
  exports: [ProvidersService, ProductSourcesService, SourceRunsService],
})
export class ProvidersModule {}
