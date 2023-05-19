import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Channel } from '@app/provider-integration/model/channel.entity';
import { Provider } from '@app/provider-integration/model/provider.entity';
import { Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import * as path from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProductSourcesRainforestApi1662716024253
  implements MigrationInterface
{
  private readonly logger = new Logger(
    SeedProductSourcesRainforestApi1662716024253.name,
  );

  public async up(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Executing Migration');
    const providerRepo = queryRunner.connection.getRepository(Provider);
    const sourceRepo = queryRunner.connection.getRepository(Channel);
    const csvFile = path.join(
      __dirname,
      '../seeds/pi-product-sources-rainforest-api.seed.csv',
    );
    this.logger.debug('Loading Provider Source Data: ' + csvFile);
    const sourcesSeed = await csv().fromFile(csvFile);
    const provider = await providerRepo.findOneBy({
      key: ProviderKey.RAINFOREST_API_UK,
    });
    for (const source of sourcesSeed) {
      source.provider = provider;
      this.logger.debug(source);
      await sourceRepo.save(source);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const repo = queryRunner.connection.getRepository(Channel);
    this.logger.log('Reverting migration');
    await repo.query('DELETE FROM pi_product_source');
  }
}
