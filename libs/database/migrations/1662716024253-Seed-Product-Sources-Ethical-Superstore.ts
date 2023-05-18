import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { ProviderSource } from '@app/provider-integration/model/provider-source.entity';
import { Provider } from '@app/provider-integration/model/provider.entity';
import { Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import * as path from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProductSourcesEthicalSuperstore1662716024253
  implements MigrationInterface
{
  private readonly logger = new Logger(
    SeedProductSourcesEthicalSuperstore1662716024253.name,
  );

  public async up(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Executing Migration');
    const providerRepo = queryRunner.connection.getRepository(Provider);
    const sourceRepo = queryRunner.connection.getRepository(ProviderSource);
    const csvFile = path.join(
      __dirname,
      '../seeds/pi-product-sources-ethical-superstore.seed.csv',
    );
    this.logger.debug('Loading Provider Source Data: ' + csvFile);
    const sourcesSeed = await csv().fromFile(csvFile);
    const provider = await providerRepo.findOneBy({
      key: ProviderKey.ETHICAL_SUPERSTORE_WEB,
    });
    for (const source of sourcesSeed) {
      source.provider = provider;
      this.logger.debug(source);
      await sourceRepo.save(source);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const repo = queryRunner.connection.getRepository(ProviderSource);
    this.logger.log('Reverting migration');
    await repo.query('DELETE FROM pi_product_source');
  }
}
