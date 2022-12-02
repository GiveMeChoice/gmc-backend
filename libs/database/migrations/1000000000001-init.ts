import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1000000000001 implements MigrationInterface {
  name = 'init1000000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."gmc_product_integration_status_enum" AS ENUM('PENDING', 'LIVE', 'EXPIRED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "gmc_product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider_id" uuid NOT NULL, "provider_product_id" character varying NOT NULL, "short_id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "integration_status" "public"."gmc_product_integration_status_enum" NOT NULL, "source_id" uuid NOT NULL, "created_by_run_id" character varying NOT NULL, "refreshed_by_run_id" character varying, "refreshed_at" TIMESTAMP WITH TIME ZONE, "expires_at" TIMESTAMP WITH TIME ZONE, "keep_alive_count" integer NOT NULL DEFAULT '0', "has_integration_error" boolean NOT NULL DEFAULT false, "error_message" character varying, "sku" character varying, "title" character varying, "description" character varying, "rating" numeric(3,2), "ratings_total" integer, "price" numeric(10,2), "currency" character varying, "brand_id" character varying, "brand_name" character varying, "image" character varying, "link" character varying, CONSTRAINT "UQ_67f713819b7224ab9808b08a5a1" UNIQUE ("short_id"), CONSTRAINT "PK_6e0408e4e723f1bb1f080b26cd8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_67ef77b05f5bc23e9ed7f78a41" ON "gmc_product" ("provider_id", "provider_product_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."pi_provider_id_enum" AS ENUM('rainforest-api', 'ethical-superstore', 'kelkoo', 'tesco')`,
    );
    await queryRunner.query(
      `CREATE TABLE "pi_provider" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" "public"."pi_provider_id_enum" NOT NULL, "description" character varying NOT NULL, "active" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_5b9bbfad750c2f497b4c52e880f" UNIQUE ("key"), CONSTRAINT "PK_81da20ed0b61efbc4ad35c3e599" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."pi_product_source_status_enum" AS ENUM('READY', 'BUSY', 'DOWN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "pi_product_source" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider_id" uuid NOT NULL, "identifier" character varying NOT NULL, "status" "public"."pi_product_source_status_enum" NOT NULL DEFAULT 'READY', "description" character varying NOT NULL, "active" boolean NOT NULL DEFAULT false, "run_interval_hours" integer NOT NULL DEFAULT '0', "last_run_at" TIMESTAMP WITH TIME ZONE, "owned_count" integer NOT NULL DEFAULT '0', "retry_count" integer NOT NULL DEFAULT '0', "retry_limit" integer NOT NULL DEFAULT '3', "category" character varying NOT NULL, "subcategory_1" character varying NOT NULL, "subcategory_2" character varying NOT NULL, CONSTRAINT "UQ_84b91a68382ae9b4f9df978b10b" UNIQUE ("provider_id", "identifier"), CONSTRAINT "PK_9cdb208469ea52aa2d4299193d7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pi_product_run" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "source_id" uuid NOT NULL, "found_count" integer NOT NULL DEFAULT '0', "owned_count" integer NOT NULL DEFAULT '0', "created_count" integer NOT NULL DEFAULT '0', "adopted_count" integer NOT NULL DEFAULT '0', "stale_count" integer NOT NULL DEFAULT '0', "keep_alive_signal_count" integer NOT NULL DEFAULT '0', "refresh_signal_count" integer NOT NULL DEFAULT '0', "failure_count" integer NOT NULL DEFAULT '0', "run_at" TIMESTAMP WITH TIME ZONE NOT NULL, "run_time" numeric(10,2), "error_message" character varying, CONSTRAINT "PK_0f463bbcf891723328fd2f4ac0e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" ADD CONSTRAINT "FK_2a27d934a964b31cfa52ecabe1a" FOREIGN KEY ("provider_id") REFERENCES "pi_provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" ADD CONSTRAINT "FK_4efd1e0c534ad4ed516edf2470a" FOREIGN KEY ("source_id") REFERENCES "pi_product_source"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_product_source" ADD CONSTRAINT "FK_b6e6107e63fa06273bbfdb190a2" FOREIGN KEY ("provider_id") REFERENCES "pi_provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_product_run" ADD CONSTRAINT "FK_f34d30984d067afae2a8456941b" FOREIGN KEY ("source_id") REFERENCES "pi_product_source"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pi_product_run" DROP CONSTRAINT "FK_f34d30984d067afae2a8456941b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_product_source" DROP CONSTRAINT "FK_b6e6107e63fa06273bbfdb190a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" DROP CONSTRAINT "FK_4efd1e0c534ad4ed516edf2470a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" DROP CONSTRAINT "FK_2a27d934a964b31cfa52ecabe1a"`,
    );
    await queryRunner.query(`DROP TABLE "pi_product_run"`);
    await queryRunner.query(`DROP TABLE "pi_product_source"`);
    await queryRunner.query(
      `DROP TYPE "public"."pi_product_source_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "pi_provider"`);
    await queryRunner.query(`DROP TYPE "public"."pi_provider_id_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_67ef77b05f5bc23e9ed7f78a41"`,
    );
    await queryRunner.query(`DROP TABLE "gmc_product"`);
    await queryRunner.query(
      `DROP TYPE "public"."gmc_product_integration_status_enum"`,
    );
  }
}
