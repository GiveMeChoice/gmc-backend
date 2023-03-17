import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Logger } from '@nestjs/common';
import { Loader } from './loader.interface';

export const LOADER_CONTAINER = 'LOADER_CONTAINER';

export class LoaderContainer {
  private readonly logger = new Logger(LoaderContainer.name);

  constructor(private readonly loaders: Loader[]) {}

  public getLoader(providerKey: ProviderKey) {
    try {
      const loader = this.loaders.find((t) => t.providerKey === providerKey);
      if (loader) return loader;
    } catch (e) {
      this.logger.error(e);
    }
    throw new Error(`Unable to find loader for provider key: ${providerKey}`);
  }
}
