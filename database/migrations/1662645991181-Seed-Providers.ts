import { Product } from '@app/products/model/product.entity';
import { ProviderKey } from '@app/provider-integration/providers/model/enum/provider-key.enum';
import { Provider } from '@app/provider-integration/providers/model/provider.entity';
import { ProviderSeed } from '@database/seeds/providers.seed';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProviders1662645991181 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const providerSeed: any = ProviderSeed;
    await queryRunner.connection.getRepository(Provider).save(providerSeed);
    const test: Product = null;
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const key of Object.keys(ProviderKey)) {
      await queryRunner.connection
        .getRepository(Provider)
        .delete(ProviderKey[key]);
    }
  }
}
