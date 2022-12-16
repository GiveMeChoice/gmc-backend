import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Logger } from '@nestjs/common';
import { SourceMapper } from './source-mapper.interface';

export const MAPPER_CONTAINER = 'MAPPER_CONTAINER';

export class MapperContainer {
  constructor(private readonly mappers: SourceMapper<any, any>[]) {}

  public getMapper(providerKey: ProviderKey) {
    try {
      const mapper = this.mappers.find((t) => t.providerKey === providerKey);
      if (mapper) return mapper;
    } catch (e) {
      Logger.error(e);
    }
    throw new Error(
      `Unable to find source mapper for provider key: ${providerKey}`,
    );
  }
}
