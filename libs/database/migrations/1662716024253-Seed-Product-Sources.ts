import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { Provider } from '@app/provider-integration/model/provider.entity';
import { Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import * as path from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProductSources1662716024253 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const providerRepo = queryRunner.connection.getRepository(Provider);
    const sourceRepo = queryRunner.connection.getRepository(ProductSource);
    const csvFile = path.join(__dirname, '../seeds/product-sources.seed.csv');
    Logger.log('Loading Provider Source Data: ' + csvFile);
    const sourcesSeed = await csv().fromFile(csvFile);
    for (const source of sourcesSeed) {
      source.provider = await providerRepo.findOneBy({
        id: source.providerKey,
      });
      Logger.debug(source);
      await sourceRepo.save(source);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const repo = queryRunner.connection.getRepository(ProductSource);
    Logger.log('Reverting migration');
    await repo.query('DELETE FROM pi_product_source');
  }
}
