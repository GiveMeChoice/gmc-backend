import { Logger } from '@nestjs/common';
import { MigrationInterface, QueryRunner } from 'typeorm';
import * as path from 'path';
import * as csv from 'csvtojson';
import { LabelGroup } from '@app/provider-integration/model/label-group.entity';

export class SeedLabelGroups1670421246294 implements MigrationInterface {
  private readonly logger = new Logger(SeedLabelGroups1670421246294.name);

  public async up(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Executing Migration');
    const csvFile = path.join(__dirname, '../seeds/gmc-label-groups.seed.csv');
    this.logger.debug('Loading CSV Data: ' + csvFile);
    const labelGroupsSeed = await csv().fromFile(csvFile);
    await queryRunner.connection
      .getRepository(LabelGroup)
      .save(labelGroupsSeed);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const repo = queryRunner.connection.getRepository(LabelGroup);
    this.logger.log('Reverting Migration');
    await repo.query('DELETE FROM gmc_label_group');
  }
}
