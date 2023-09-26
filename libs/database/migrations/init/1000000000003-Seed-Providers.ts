import { Provider } from '@app/provider-integration/model/provider.entity';
import { Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import * as path from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProviders1000000000003 implements MigrationInterface {
  private readonly logger = new Logger(SeedProviders1000000000003.name);

  public async up(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Executing Providers Migration');
    const csvFile = path.join(__dirname, '../../seeds/pi-providers.seed.csv');
    this.logger.debug('Loading CSV Data: ' + csvFile);
    const providers = await csv().fromFile(csvFile);
    await queryRunner.connection.getRepository(Provider).save(providers);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Reverting migration');
    const repo = queryRunner.connection.getRepository(Provider);
    await repo.query('DELETE FROM pi_provider');
  }
}
