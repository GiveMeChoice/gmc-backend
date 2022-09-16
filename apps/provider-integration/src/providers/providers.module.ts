import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersController } from './controllers/providers.controller';
import { ProviderSourceRun } from './model/provider-source-run.entity';
import { ProviderSource } from './model/provider-source.entity';
import { Provider } from './model/provider.entity';
import { ProviderSourceRunsService } from './services/provider-source-runs.service';
import { ProviderSourcesService } from './services/provider-sources.service';
import { ProvidersService } from './services/providers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Provider, ProviderSource, ProviderSourceRun]),
  ],
  controllers: [ProvidersController],
  providers: [
    ProvidersService,
    ProviderSourcesService,
    ProviderSourceRunsService,
  ],
  exports: [
    ProvidersService,
    ProviderSourcesService,
    ProviderSourceRunsService,
  ],
})
export class ProvidersModule {}
