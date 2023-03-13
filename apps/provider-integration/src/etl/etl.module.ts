import { AwsModule } from '@lib/aws';
import { MessagingModule } from '@lib/messaging';
import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { AppModule } from '../app.module';
import { EthicalSuperstoreExtractor } from './impl/ethical-superstore/ethical-superstore.extractor';
import { EthicalSuperstoreLoader } from './impl/ethical-superstore/ethical-superstore.loader';
import { EthicalSuperstoreMapper } from './impl/ethical-superstore/ethical-superstore.mapper';
import { EthicalSuperstorePipeline } from './impl/ethical-superstore/ethical-superstore.pipeline';
import { RainforestApiExtractor } from './impl/rainforest-api/rainforest-api.extractor';
import { RainforestApiLoader } from './impl/rainforest-api/rainforest-api.loader';
import { RainforestApiMapper } from './impl/rainforest-api/rainforest-api.mapper';
import { RainforestApiPipeline } from './impl/rainforest-api/rainforest-api.pipeline';
import { ProductCacheManager } from './shared/cache/product-cache.manager';
import { SourceCacheManager } from './shared/cache/source-cache.manager';
import {
  ExtractorContainer,
  EXTRACTOR_CONTAINER,
} from './shared/extractor/extractor.container';
import {
  LoaderContainer,
  LOADER_CONTAINER,
} from './shared/loader/loader.container';
import {
  MapperContainer,
  MAPPER_CONTAINER,
} from './shared/mapper/mapper.container';
import {
  PipelineContainer,
  PIPELINE_CONTAINER,
} from './shared/pipeline/pipeline.container';

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
    RainforestApiMapper,
    EthicalSuperstorePipeline,
    EthicalSuperstoreExtractor,
    EthicalSuperstoreMapper,
    RainforestApiLoader,
    EthicalSuperstoreLoader,
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
      provide: MAPPER_CONTAINER,
      useFactory: (
        rainforestMapper: RainforestApiMapper,
        ethicalMapper: EthicalSuperstoreMapper,
      ) => new MapperContainer([rainforestMapper, ethicalMapper]),
      inject: [RainforestApiMapper, EthicalSuperstoreMapper],
    },
    {
      provide: LOADER_CONTAINER,
      useFactory: (
        rainforestLoader: RainforestApiLoader,
        ethicalSuperstore: EthicalSuperstoreLoader,
      ) => new LoaderContainer([rainforestLoader, ethicalSuperstore]),
      inject: [RainforestApiLoader, EthicalSuperstoreLoader],
    },
  ],
  exports: [PIPELINE_CONTAINER, EXTRACTOR_CONTAINER, MAPPER_CONTAINER],
})
export class EtlModule {}
