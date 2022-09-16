import { Provider } from '@app/provider-integration/providers/model/provider.entity';
import { Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import * as path from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProviders1662645991181 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const csvFile = path.join(__dirname, '../seeds/providers.seed.csv');
    Logger.log('Loading CSV Data: ' + csvFile);
    const providersSeed = await csv().fromFile(csvFile);
    await queryRunner.connection.getRepository(Provider).save(providersSeed);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const repo = queryRunner.connection.getRepository(Provider);
    Logger.log('Reverting migration');
    await repo.query('DELETE FROM pi_provider');
  }
}