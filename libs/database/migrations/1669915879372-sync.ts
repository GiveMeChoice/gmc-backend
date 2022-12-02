import { MigrationInterface, QueryRunner } from 'typeorm';

export class sync1669915879372 implements MigrationInterface {
  name = 'sync1669915879372';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pi_product_run" ADD "source_date" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pi_product_run" DROP COLUMN "source_date"`,
    );
  }
}
