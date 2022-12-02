import { AwsModule } from '@lib/aws';
import { MessagingModule } from '@lib/messaging';
import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { AppModule } from '../app.module';
import { EthicalSuperstoreExtractor } from './impl/ethical-superstore/ethical-superstore.extractor';
import { EthicalSuperstorePipeline } from './impl/ethical-superstore/ethical-superstore.pipeline';
import { EthicalSuperstoreTransformer } from './impl/ethical-superstore/ethical-superstore.transformer';
import { RainforestApiExtractor } from './impl/rainforest-api/rainforest-api.extractor';
import { RainforestApiPipeline } from './impl/rainforest-api/rainforest-api.pipeline';
import { RainforestApiTransformer } from './impl/rainforest-api/rainforest-api.transformer';
import { ProductCacheManager } from './shared/cache/product-cache.manager';
import { SourceCacheManager } from './shared/cache/source-cache.manager';
import {
  ExtractorContainer,
  EXTRACTOR_CONTAINER,
} from './shared/extractor/extractor.container';
import {
  PipelineContainer,
  PIPELINE_CONTAINER,
} from './shared/pipeline/pipeline.container';
import {
  TransformerContainer,
  TRANSFORMER_CONTAINER,
} from './shared/transformer/transformer.container';

@Module({
  imports: [
    forwardRef(() => AppModule),
    AwsModule,
    HttpModule,
    MessagingModule,
  ],
  providers: [
    ProductCacheManager,
    SourceCacheManager,
    RainforestApiPipeline,
    RainforestApiExtractor,
    RainforestApiTransformer,
    EthicalSuperstorePipeline,
    EthicalSuperstoreExtractor,
    EthicalSuperstoreTransformer,
    {
      provide: PIPELINE_CONTAINER,
      useFactory: (
        rainforestPipeline: RainforestApiPipeline,
        ethicalPipeline: EthicalSuperstorePipeline,
      ) => new PipelineContainer([rainforestPipeline, ethicalPipeline]),
      inject: [RainforestApiPipeline, EthicalSuperstorePipeline],
    },
    {
      provide: EXTRACTOR_CONTAINER,
      useFactory: (
        rainforestExtractor: RainforestApiExtractor,
        ethicalExtractor: EthicalSuperstoreExtractor,
      ) => new ExtractorContainer([rainforestExtractor, ethicalExtractor]),
      inject: [RainforestApiExtractor, EthicalSuperstoreExtractor],
    },
    {
      provide: TRANSFORMER_CONTAINER,
      useFactory: (
        rainforestTranformer: RainforestApiTransformer,
        ethicalTransformer: EthicalSuperstoreTransformer,
      ) => new TransformerContainer([rainforestTranformer, ethicalTransformer]),
      inject: [RainforestApiTransformer, EthicalSuperstoreTransformer],
    },
  ],
  exports: [PIPELINE_CONTAINER, EXTRACTOR_CONTAINER, TRANSFORMER_CONTAINER],
})
export class EtlModule {}
