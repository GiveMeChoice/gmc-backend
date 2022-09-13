import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { Logger } from '@nestjs/common';
import { SourceTransformer } from './transformer.interface';

export class TransformerFactory {
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
