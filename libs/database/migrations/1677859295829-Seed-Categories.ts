import { Category } from '@app/provider-integration/model/category.entity';
import { Logger } from '@nestjs/common';
import { MigrationInterface, QueryRunner, TreeRepository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

export class SeedCategories1677859295829 implements MigrationInterface {
  private readonly logger = new Logger(SeedCategories1677859295829.name);

  public async up(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Executing Migration');

    const categoriesSeed = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../seeds/gmc-categories.seed.json'),
        'utf-8',
      ),
    );
    const repo = queryRunner.connection.getTreeRepository(Category);
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
    const repo = queryRunner.connection.getRepository(Category);
    await repo.query('DELETE FROM gmc_category');
  }

  private async buildCategoryTree(
    current: any,
    parent: Category,
    repo: TreeRepository<Category>,
  ) {
    this.logger.debug(current.name);
    let category = new Category(current.name);
    category.parent = parent;
    category.providerCategories = [];
    category = await repo.save(category);
    for (const s of current.categories) {
      await this.buildCategoryTree(s, category, repo);
    }
  }
}
