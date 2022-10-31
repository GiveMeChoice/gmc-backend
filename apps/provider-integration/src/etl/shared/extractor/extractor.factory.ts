import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { Injectable, Logger } from '@nestjs/common';
import { Extractor } from './extractor.interface';

@Injectable()
export class ExtractorFactory {
  constructor(private readonly extractors: Extractor<any, any>[]) {}

  public getExtractor(providerKey: ProviderKey) {
    try {
      const extractor = this.extractors.find(
        (e) => e.providerKey === providerKey,
      );
      if (extractor) return extractor;
    } catch (e) {
      Logger.error(e);
    }
    throw new Error(`Unable to find extractor for provider Key ${providerKey}`);
  }
}
