import { Pipeline } from '@app/provider-integration/providers/model/pipeline.entity';
import { Provider } from '@app/provider-integration/providers/model/provider.entity';
import { Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import * as path from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProviderCategories1662716024253 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const providerRepo = queryRunner.connection.getRepository(Provider);
    const pipelineRepo = queryRunner.connection.getRepository(Pipeline);
    const csvFile = path.join(__dirname, '../seeds/pipelines.seed.csv');
    Logger.log('Loading Pipeline CSV Data: ' + csvFile);
    const pipelinesSeed = await csv().fromFile(csvFile);
    for (const pipeline of pipelinesSeed) {
      pipeline.provider = await providerRepo.findOneBy({
        key: pipeline.providerKey,
      });
      Logger.debug(pipeline);
      await pipelineRepo.save(pipeline);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const repo = queryRunner.connection.getRepository(Pipeline);
    Logger.log('Reverting migration');
    await repo.query('DELETE FROM pi_pipeline');
  }
}
