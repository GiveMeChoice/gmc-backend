import { AwsModule } from '@lib/aws';
import { ProductsModule } from '@lib/products';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { EthicalSuperstoreExtractor } from './impl/ethical-superstore/ethical-superstore.extractor';
import { EthicalSuperstoreRunner } from './impl/ethical-superstore/ethical-superstore.runner';
import { EthicalSuperstoreTransformer } from './impl/ethical-superstore/ethical-superstore.transformer';
import { RainforestApiExtractor } from './impl/rainforest-api/rainforest-api.extractor';
import { RainforestApiRunner } from './impl/rainforest-api/rainforest-api.runner';
import { RainforestApiTransformer } from './impl/rainforest-api/rainforest-api.transformer';
import {
  EXTRACTOR_FACTORY,
  RUNNER_FACTORY,
  TRANSFORMER_FACTORY,
} from './pipelines.constants';
import { PipelinesService } from './pipelines.service';
import { ProductCacheManager } from './shared/cache/product-cache.manager';
import { SourceCacheManager } from './shared/cache/source-cache.manager';
import { ExtractorFactory } from './shared/extractor/extractor.factory';
import { PipelineRunnerFactory } from './shared/runner/pipeline-runner.factory';
import { TransformerFactory } from './shared/transformer/transformer.factory';

@Module({
  imports: [ProductsModule, ProvidersModule, AwsModule, HttpModule],
  providers: [
    PipelinesService,
    ProductCacheManager,
    SourceCacheManager,
    RainforestApiRunner,
    RainforestApiExtractor,
    RainforestApiTransformer,
    EthicalSuperstoreRunner,
    EthicalSuperstoreExtractor,
    EthicalSuperstoreTransformer,
    {
      provide: RUNNER_FACTORY,
      useFactory: (
        rainforestRunner: RainforestApiRunner,
        ethicalRunner: EthicalSuperstoreRunner,
      ) => new PipelineRunnerFactory([rainforestRunner, ethicalRunner]),
      inject: [RainforestApiRunner, EthicalSuperstoreRunner],
    },
    {
      provide: EXTRACTOR_FACTORY,
      useFactory: (
        rainforestExtractor: RainforestApiExtractor,
        ethicalExtractor: EthicalSuperstoreExtractor,
      ) => new ExtractorFactory([rainforestExtractor, ethicalExtractor]),
      inject: [RainforestApiExtractor, EthicalSuperstoreExtractor],
    },
    {
      provide: TRANSFORMER_FACTORY,
      useFactory: (
        rainforestTranformer: RainforestApiTransformer,
        ethicalTransformer: EthicalSuperstoreTransformer,
      ) => new TransformerFactory([rainforestTranformer, ethicalTransformer]),
      inject: [RainforestApiTransformer, EthicalSuperstoreTransformer],
    },
  ],
  exports: [PipelinesService],
})
export class PipelinesModule {}
