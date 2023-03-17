import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Logger } from '@nestjs/common';
import { Mapper } from './mapper.interface';

export const MAPPER_CONTAINER = 'MAPPER_CONTAINER';

export class MapperContainer {
  private readonly logger = new Logger(MapperContainer.name);

  constructor(private readonly mappers: Mapper<any, any>[]) {}

  public getMapper(providerKey: ProviderKey) {
    try {
      const mapper = this.mappers.find((t) => t.providerKey === providerKey);
      if (mapper) return mapper;
    } catch (e) {
      this.logger.error(e);
    }
    throw new Error(
      `Unable to find source mapper for provider key: ${providerKey}`,
    );
  }
}
