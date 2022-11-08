import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Logger } from '@nestjs/common';
import { SourceTransformer } from './transformer.interface';

export const TRANSFORMER_CONTAINER = 'TRANSFORMER_CONTAINER';

export class TransformerContainer {
  constructor(private readonly transformers: SourceTransformer<any, any>[]) {}

  public getTransformer(providerKey: ProviderKey) {
    try {
      const transformer = this.transformers.find(
        (t) => t.providerKey === providerKey,
      );
      if (transformer) return transformer;
    } catch (e) {
      Logger.error(e);
    }
    throw new Error(
      `Unable to find transformer for provider key: ${providerKey}`,
    );
  }
}
