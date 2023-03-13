import { Provider } from '@app/provider-integration/model/provider.entity';
import { Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import * as path from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProviders1662645991181 implements MigrationInterface {
  private readonly logger = new Logger(SeedProviders1662645991181.name);

  public async up(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Executing Migration');
    const csvFile = path.join(__dirname, '../seeds/gmc-providers.seed.csv');
    this.logger.debug('Loading CSV Data: ' + csvFile);
    const providersSeed = await csv().fromFile(csvFile);
    await queryRunner.connection.getRepository(Provider).save(providersSeed);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Reverting migration');
    const repo = queryRunner.connection.getRepository(Provider);
    await repo.query('DELETE FROM pi_provider');
  }
}
