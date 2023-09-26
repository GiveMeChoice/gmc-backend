import { Merchant } from '@app/provider-integration/model/merchant.entity';
import { Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import * as path from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedMerchants1000000000002 implements MigrationInterface {
  private readonly logger = new Logger(SeedMerchants1000000000002.name);

  public async up(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Executing Merchants Migration');
    const csvFile = path.join(__dirname, '../../seeds/merchants.seed.csv');
    this.logger.debug('Loading CSV Data: ' + csvFile);
    const merchants = await csv().fromFile(csvFile);
    await queryRunner.connection.getRepository(Merchant).save(merchants);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Reverting migration');
    const repo = queryRunner.connection.getRepository(Merchant);
    await repo.query('DELETE FROM merchant');
  }
}
