import { Merchant } from '@app/provider-integration/model/merchant.entity';
import { Provider } from '@app/provider-integration/model/provider.entity';
import { Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import * as path from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProviders1662645991181 implements MigrationInterface {
  private readonly logger = new Logger(SeedProviders1662645991181.name);

  public async up(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Executing Migration');
    const csvFile = path.join(__dirname, '../seeds/pi-providers.seed.csv');
    this.logger.debug('Loading CSV Data: ' + csvFile);
    const providersSeed = await csv().fromFile(csvFile);
    const merchantsRepo = queryRunner.connection.getRepository(Merchant);
    const providersRepo = queryRunner.connection.getRepository(Provider);
    for (const provider of providersSeed) {
      if (!provider.merchantKey) {
        throw new Error(`No merchant key seeded for provider ${provider.key}`);
      }
      const { id: merchantId } = await merchantsRepo.findOne({
        where: { key: provider.merchantKey },
        select: { id: true },
      });
      if (!merchantId) {
        throw new Error(
          `Merchant not found using key: ${provider.merchantKey}`,
        );
      }
      provider.merchantId = merchantId;
      delete provider.merchantKey;
      this.logger.debug(provider);
      await providersRepo.save(provider);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Reverting migration');
    const repo = queryRunner.connection.getRepository(Provider);
    await repo.query('DELETE FROM pi_provider');
  }
}
