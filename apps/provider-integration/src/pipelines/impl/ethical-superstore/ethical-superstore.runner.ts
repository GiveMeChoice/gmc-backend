import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProviderSourceRun } from '@app/provider-integration/providers/model/provider-source-run.entity';
import { ProviderSource } from '@app/provider-integration/providers/model/provider-source.entity';
import { ProductsService } from '@lib/products';
import { Inject, Injectable } from '@nestjs/common';
import {
  EXTRACTOR_FACTORY,
  TRANSFORMER_FACTORY,
} from '../../pipelines.constants';
import { ExtractorFactory } from '../../shared/extractor/extractor.factory';
import { PipelineRunner } from '../../shared/runner/pipeline-runner.interface';
import { TransformerFactory } from '../../shared/transformer/transformer.factory';
import { EthicalSuperstoreExtractor } from './ethical-superstore.extractor';
import { EthicalSuperstoreTransformer } from './ethical-superstore.transformer';

@Injectable()
export class EthicalSuperstoreRunner implements PipelineRunner {
  providerKey: ProviderKey = ProviderKey.ETHICAL_SUPERSTORE;
  private readonly _extractor: EthicalSuperstoreExtractor;
  private readonly _transformer: EthicalSuperstoreTransformer;

  constructor(
    private readonly productsService: ProductsService,
    @Inject(EXTRACTOR_FACTORY) extractorFactory: ExtractorFactory,
    @Inject(TRANSFORMER_FACTORY) transformerFactory: TransformerFactory,
  ) {
    this._extractor = extractorFactory.getExtractor(
      this.providerKey,
    ) as EthicalSuperstoreExtractor;
    this._transformer = transformerFactory.getTransformer(
      this.providerKey,
    ) as EthicalSuperstoreTransformer;
  }

  runSourcePipeline(
    source: ProviderSource,
  ): Promise<Partial<ProviderSourceRun>> {
    this._extractor.extractSource(source);
    throw new Error('Method not implemented.');
  }
  runProductPipeline(providerProductId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
