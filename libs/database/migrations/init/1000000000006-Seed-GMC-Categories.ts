import { GmcCategory } from '@app/provider-integration/model/gmc-category.entity';
import { Logger } from '@nestjs/common';
import { MigrationInterface, QueryRunner, TreeRepository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

export class SeedCategories1000000000006 implements MigrationInterface {
  private readonly logger = new Logger(SeedCategories1000000000006.name);

  public async up(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Executing Migration');

    const categoriesSeed = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../../seeds/gmc-categories.seed.json'),
        'utf-8',
      ),
    );
    const repo = queryRunner.connection.getTreeRepository(GmcCategory);
    try {
      await this.buildCategoryTree(categoriesSeed, null, repo);
    } catch (e) {
      this.logger.error(e);
      repo.query('DELETE FROM gmc_category');
      throw Error('Stopping Failed Migration');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Reverting Migration');
    const repo = queryRunner.connection.getRepository(GmcCategory);
    await repo.query('DELETE FROM gmc_category');
  }

  private async buildCategoryTree(
    current: any,
    parent: GmcCategory,
    repo: TreeRepository<GmcCategory>,
  ) {
    this.logger.debug(current.name);
    let category = new GmcCategory(current.name, current.slug);
    category.parent = parent;
    if (current.color) {
      category.color = current.color;
    }
    category.merchantCategories = [];
    category = await repo.save(category);
    if (current.categories) {
      for (const s of current.categories) {
        await this.buildCategoryTree(s, category, repo);
      }
    }
  }
}
