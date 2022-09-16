import { AwsModule } from '@lib/aws';
import { ProductsModule } from '@lib/products';
import { Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { RainforestExtractor } from './impl/rainforest/rainforest.extractor';
import { RainforestRunner } from './impl/rainforest/rainforest.runner';
import { RainforestTransformer } from './impl/rainforest/rainforest.transformer';
import {
  EXTRACTOR_FACTORY,
  RUNNER_FACTORY,
  TRANSFORMER_FACTORY,
} from './pipelines.constants';
import { PipelinesService } from './pipelines.service';
import { ExtractorFactory } from './shared/extractor/extractor.factory';
import { PipelineRunnerFactory } from './shared/runner/pipeline-runner.factory';
import { TransformerFactory } from './shared/transformer/transformer.factory';

@Module({
  imports: [ProductsModule, ProvidersModule, AwsModule],
  providers: [
    PipelinesService,
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
  ],
  exports: [PipelinesService],
})
export class PipelinesModule {}
