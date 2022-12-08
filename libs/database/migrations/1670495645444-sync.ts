import { MigrationInterface, QueryRunner } from 'typeorm';

export class sync1670495645444 implements MigrationInterface {
  name = 'sync1670495645444';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "gmc_review" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "author" character varying NOT NULL, "text" character varying NOT NULL, "rating" numeric(3,2), "submitted_on" TIMESTAMP WITH TIME ZONE NOT NULL, "productId" uuid, CONSTRAINT "PK_1134f4a30427685d8b4732b519a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_review" ADD CONSTRAINT "FK_cc548af39d4f1b63a26389065a0" FOREIGN KEY ("productId") REFERENCES "gmc_product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gmc_review" DROP CONSTRAINT "FK_cc548af39d4f1b63a26389065a0"`,
    );
    await queryRunner.query(`DROP TABLE "gmc_review"`);
  }
}
