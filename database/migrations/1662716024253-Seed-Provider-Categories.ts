import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { ProviderCategory } from '@app/provider-integration/providers/model/provider-cateogry.entity';
import { Provider } from '@app/provider-integration/providers/model/provider.entity';
import { Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import * as path from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProviderCategories1662716024253 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const providerRepo = queryRunner.connection.getRepository(Provider);
    const categoryRepo = queryRunner.connection.getRepository(ProviderCategory);
    const csvFile = path.join(
      __dirname,
      '../seeds/provider-categories.seed.csv',
    );
    Logger.log('Loading CSV Data: ' + csvFile);
    const categoriesSeed = await csv().fromFile(csvFile);
    for (const category of categoriesSeed) {
      category.provider = await providerRepo.findOneBy({
        key: category.providerKey,
      });
      Logger.debug(category);
      await categoryRepo.save(category);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const repo = queryRunner.connection.getRepository(ProviderCategory);
    Logger.log('Reverting migration');
    await repo.query('DELETE FROM pi_provider_category');
  }
}
