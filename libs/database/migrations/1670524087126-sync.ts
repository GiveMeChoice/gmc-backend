import { MigrationInterface, QueryRunner } from 'typeorm';

export class sync1670524087126 implements MigrationInterface {
  name = 'sync1670524087126';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gmc_product" ADD "secondary_image" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gmc_product" DROP COLUMN "secondary_image"`,
    );
  }
}
