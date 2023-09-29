import { GmcLabel } from '@app/provider-integration/model/gmc-label.entity';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { MigrationInterface, QueryRunner, TreeRepository } from 'typeorm';

export class SeedGmcLabels1000000000006 implements MigrationInterface {
  private readonly logger = new Logger(SeedGmcLabels1000000000006.name);

  public async up(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Executing Migration');

    const labelGroupsSeed = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../../seeds/gmc-labels.seed.json'),
        'utf-8',
      ),
    );
    const repo = queryRunner.connection.getTreeRepository(GmcLabel);
    try {
      await this.buildLabelGroupsTree(labelGroupsSeed, null, repo);
    } catch (e) {
      this.logger.error(e);
      repo.query('DELETE FROM gmc_label');
      throw Error('Stopping Failed Migration');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Reverting Migration');
    const repo = queryRunner.connection.getRepository(GmcLabel);
    await repo.query('DELETE FROM gmc_label');
  }

  private async buildLabelGroupsTree(
    current: any,
    parent: GmcLabel,
    repo: TreeRepository<GmcLabel>,
  ) {
    this.logger.debug(current.name);
    let labelGroup = new GmcLabel(current.name, current.slug);
    labelGroup.description = current.description;
    labelGroup.parent = parent;
    labelGroup.merchantLabels = [];
    labelGroup = await repo.save(labelGroup);
    for (const s of current.children) {
      await this.buildLabelGroupsTree(s, labelGroup, repo);
    }
  }
}
