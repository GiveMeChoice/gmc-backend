import { ProviderSource } from '@app/provider-integration/providers/model/provider-source.entity';
import { Provider } from '@app/provider-integration/providers/model/provider.entity';
import { Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import * as path from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProviderCategories1662716024253 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const providerRepo = queryRunner.connection.getRepository(Provider);
    const sourceRepo = queryRunner.connection.getRepository(ProviderSource);
    const csvFile = path.join(__dirname, '../seeds/provider-sources.seed.csv');
    Logger.log('Loading Provider Source Data: ' + csvFile);
    const sourcesSeed = await csv().fromFile(csvFile);
    for (const source of sourcesSeed) {
      source.provider = await providerRepo.findOneBy({
        key: source.providerKey,
      });
      Logger.debug(source);
      await sourceRepo.save(source);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const repo = queryRunner.connection.getRepository(ProviderSource);
    Logger.log('Reverting migration');
    await repo.query('DELETE FROM pi_provider_source');
  }
}
