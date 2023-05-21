import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Channel } from '@app/provider-integration/model/channel.entity';
import { Provider } from '@app/provider-integration/model/provider.entity';
import { Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import * as path from 'path';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { Merchant } from '@app/provider-integration/model/merchant.entity';

export class SeedProductSourcesEthicalSuperstore1000000000004
  implements MigrationInterface
{
  private readonly logger = new Logger(
    SeedProductSourcesEthicalSuperstore1000000000004.name,
  );

  public async up(queryRunner: QueryRunner): Promise<void> {
    this.logger.log('Executing Migration');
    const providerRepo = queryRunner.connection.getRepository(Provider);
    const merchantsRepo = queryRunner.connection.getRepository(Merchant);
    const channelsRepo = queryRunner.connection.getRepository(Channel);
    const csvFile = path.join(
      __dirname,
      '../seeds/pi-channels-ethical-superstore.seed.csv',
    );
    this.logger.debug('Loading Provider Source Data: ' + csvFile);
    const channels = await csv().fromFile(csvFile);
    for (const channel of channels) {
      const { id: providerId } = await providerRepo.findOne({
        where: { key: channel.providerKey },
        select: { id: true },
      });
      if (!providerId) {
        throw new Error(`Provider not found using key: ${channel.providerKey}`);
      }
      const { id: merchantId } = await merchantsRepo.findOne({
        where: { key: channel.merchantKey },
        select: { id: true },
      });
      if (!merchantId) {
        throw new Error(`Merchant not found using key: ${channel.merchantKey}`);
      }
      channel.providerId = providerId;
      channel.merchantId = merchantId;
      delete channel.providerKey;
      delete channel.merchantKey;
      this.logger.debug(channel);
      await channelsRepo.save(channel);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const repo = queryRunner.connection.getRepository(Channel);
    this.logger.log('Reverting migration');
    await repo.query('DELETE FROM pi_product_source');
  }
}
