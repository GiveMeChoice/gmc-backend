import { AwsModule } from '@lib/aws';
import { ProductsModule } from '@lib/products';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersModule } from '../providers/providers.module';
import {
  EXTRACTOR_FACTORY,
  RUNNER_FACTORY,
  TRANSFORMER_FACTORY,
} from './constants/integration.tokens';
import { PipelineResult } from './model/pipeline-result.entity';
import { RainforestExtractor } from './pipelines/rainforest/rainforest.extractor';
import { RainforestRunner } from './pipelines/rainforest/rainforest.runner';
import { RainforestTransformer } from './pipelines/rainforest/rainforest.transformer';
import { IntegrationService } from './services/integration.service';
import { PipelineResultsService } from './services/pipeline-results.service';
import { ExtractorFactory } from './shared/extract/extractor.factory';
import { PipelineRunnerFactory } from './shared/runner/pipeline-runner.factory';
import { TransformerFactory } from './shared/transform/transformer.factory';

@Module({
  imports: [
    TypeOrmModule.forFeature([PipelineResult]),
    ProductsModule,
    ProvidersModule,
    AwsModule,
  ],
  providers: [
    // shared
    PipelineResultsService,
    // impl
    RainforestRunner,
    RainforestExtractor,
    RainforestTransformer,
    {
      provide: RUNNER_FACTORY,
      useFactory: (rainforestRunner: RainforestRunner) =>
        new PipelineRunnerFactory([rainforestRunner]),
      inject: [RainforestRunner],
    },
    {
      provide: EXTRACTOR_FACTORY,
      useFactory: (rainforestExtractor: RainforestExtractor) =>
        new ExtractorFactory([rainforestExtractor]),
      inject: [RainforestExtractor],
    },
    {
      provide: TRANSFORMER_FACTORY,
      useFactory: (rainforestTranformer: RainforestTransformer) =>
        new TransformerFactory([rainforestTranformer]),
      inject: [RainforestTransformer],
    },
    // api
    IntegrationService,
  ],
  exports: [RUNNER_FACTORY, EXTRACTOR_FACTORY, TRANSFORMER_FACTORY],
})
export class IntegrationModule {}
