import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Injectable, Logger } from '@nestjs/common';
import { Extractor } from './extractor.interface';

export const EXTRACTOR_CONTAINER = 'EXTRACTOR_CONTAINER';

@Injectable()
export class ExtractorContainer {
  private readonly logger = new Logger(ExtractorContainer.name);

  constructor(private readonly extractors: Extractor<any, any>[]) {}

  public getExtractor(providerKey: ProviderKey) {
    try {
      const extractor = this.extractors.find(
        (e) => e.providerKey === providerKey,
      );
      if (extractor) return extractor;
    } catch (e) {
      this.logger.error(e);
    }
    throw new Error(`Unable to find extractor for provider Key ${providerKey}`);
  }
}
