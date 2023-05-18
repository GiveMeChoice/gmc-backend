import { LabelGroup } from '@app/provider-integration/model/label-group.entity';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { MigrationInterface, QueryRunner, TreeRepository } from 'typeorm';

export class SeedLabelGroups1670421246294 implements MigrationInterface {
  private readonly logger = new Logger(SeedLabelGroups1670421246294.name);

  public async up(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Executing Migration');

    const labelGroupsSeed = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../seeds/gmc-label-groups.seed.json'),
        'utf-8',
      ),
    );
    const repo = queryRunner.connection.getTreeRepository(LabelGroup);
    try {
      await this.buildLabelGroupsTree(labelGroupsSeed, null, repo);
    } catch (e) {
      this.logger.error(e);
      repo.query('DELETE FROM gmc_label_group');
      throw Error('Stopping Failed Migration');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Reverting Migration');
    const repo = queryRunner.connection.getRepository(LabelGroup);
    await repo.query('DELETE FROM gmc_label_group');
  }

  private async buildLabelGroupsTree(
    current: any,
    parent: LabelGroup,
    repo: TreeRepository<LabelGroup>,
  ) {
    this.logger.debug(current.name);
    let labelGroup = new LabelGroup(current.name);
    labelGroup.description = current.description;
    labelGroup.parent = parent;
    labelGroup.merchantLabels = [];
    labelGroup = await repo.save(labelGroup);
    for (const s of current.children) {
      await this.buildLabelGroupsTree(s, labelGroup, repo);
    }
  }
}
