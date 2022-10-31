import { AwsModule } from '@lib/aws';
import { ProductsModule } from '@lib/products';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { EthicalSuperstoreExtractor } from './impl/ethical-superstore/ethical-superstore.extractor';
import { EthicalSuperstorePipeline } from './impl/ethical-superstore/ethical-superstore.pipeline';
import { EthicalSuperstoreTransformer } from './impl/ethical-superstore/ethical-superstore.transformer';
import { RainforestApiExtractor } from './impl/rainforest-api/rainforest-api.extractor';
import { RainforestApiPipeline } from './impl/rainforest-api/rainforest-api.pipeline';
import { RainforestApiTransformer } from './impl/rainforest-api/rainforest-api.transformer';
import {
  EXTRACTOR_FACTORY,
  PIPELINE_FACTORY,
  TRANSFORMER_FACTORY,
} from './etl.constants';
import { EtlService } from './etl.service';
import { ProductCacheManager } from './shared/cache/product-cache.manager';
import { SourceCacheManager } from './shared/cache/source-cache.manager';
import { ExtractorFactory } from './shared/extractor/extractor.factory';
import { PipelineFactory } from './shared/pipeline/pipeline.factory';
import { TransformerFactory } from './shared/transformer/transformer.factory';

@Module({
  imports: [ProductsModule, ProvidersModule, AwsModule, HttpModule],
  providers: [
    EtlService,
    ProductCacheManager,
    SourceCacheManager,
    RainforestApiPipeline,
    RainforestApiExtractor,
    RainforestApiTransformer,
    EthicalSuperstorePipeline,
    EthicalSuperstoreExtractor,
    EthicalSuperstoreTransformer,
    {
      provide: PIPELINE_FACTORY,
      useFactory: (
        rainforestRunner: RainforestApiPipeline,
        ethicalRunner: EthicalSuperstorePipeline,
      ) => new PipelineFactory([rainforestRunner, ethicalRunner]),
      inject: [RainforestApiPipeline, EthicalSuperstorePipeline],
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
  exports: [EtlService],
})
export class EtlModule {}
