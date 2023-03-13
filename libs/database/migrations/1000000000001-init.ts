import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1000000000001 implements MigrationInterface {
  name = 'init1000000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "gmc_brand" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider_id" character varying NOT NULL, "code" character varying NOT NULL, "description" character varying, "logo" character varying, "info" character varying, "info_link" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b43e8521fc9a91b02f58d23f251" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_aa7621e022cd3f996931409fd0" ON "gmc_brand" ("provider_id", "code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "gmc_label_group" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_924bd195a38d5cc879c4de2b4e0" UNIQUE ("name"), CONSTRAINT "PK_b2f859a1d0d7249a702d8d8c4be" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pi_source_run" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "source_id" uuid NOT NULL, "found_count" integer NOT NULL DEFAULT '0', "owned_count" integer NOT NULL DEFAULT '0', "created_count" integer NOT NULL DEFAULT '0', "adopted_count" integer NOT NULL DEFAULT '0', "foreign_count" integer NOT NULL DEFAULT '0', "pending_count" integer NOT NULL DEFAULT '0', "stale_count" integer NOT NULL DEFAULT '0', "keep_alive_signal_count" integer NOT NULL DEFAULT '0', "refresh_signal_count" integer NOT NULL DEFAULT '0', "failure_count" integer NOT NULL DEFAULT '0', "run_at" TIMESTAMP WITH TIME ZONE NOT NULL, "source_date" TIMESTAMP WITH TIME ZONE, "run_time" numeric(10,2), "error_message" character varying, CONSTRAINT "PK_594fb5cde1657d6334ce091c902" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."pi_product_source_status_enum" AS ENUM('READY', 'BUSY', 'DOWN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "pi_product_source" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider_id" uuid NOT NULL, "identifier" character varying NOT NULL, "status" "public"."pi_product_source_status_enum" NOT NULL DEFAULT 'READY', "description" character varying, "active" boolean NOT NULL DEFAULT false, "run_interval_hours" integer, "expiration_hours" integer, "last_run_at" TIMESTAMP WITH TIME ZONE, "owned_count" integer NOT NULL DEFAULT '0', "retry_count" integer NOT NULL DEFAULT '0', "retry_limit" integer NOT NULL DEFAULT '4', "category" character varying, "source_link" character varying, CONSTRAINT "UQ_84b91a68382ae9b4f9df978b10b" UNIQUE ("provider_id", "identifier"), CONSTRAINT "PK_9cdb208469ea52aa2d4299193d7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."pi_provider_id_enum" AS ENUM('rainforest-api', 'ethical-superstore', 'kelkoo', 'tesco')`,
    );
    await queryRunner.query(
      `CREATE TABLE "pi_provider" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" "public"."pi_provider_id_enum" NOT NULL, "description" character varying NOT NULL, "active" boolean NOT NULL DEFAULT false, "run_interval_hours" integer NOT NULL DEFAULT '24', "expiration_hours" integer NOT NULL DEFAULT '36', CONSTRAINT "UQ_5b9bbfad750c2f497b4c52e880f" UNIQUE ("key"), CONSTRAINT "PK_81da20ed0b61efbc4ad35c3e599" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "gmc_label" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider_id" uuid NOT NULL, "code" character varying NOT NULL, "description" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "info_link" character varying, "icon" character varying, "group_id" uuid, CONSTRAINT "PK_5ce50b41965194384818bf3ae6a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f99991d0829ad85b0fee380fde" ON "gmc_label" ("provider_id", "code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "gmc_review" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "author" character varying NOT NULL, "text" character varying NOT NULL, "rating" numeric(3,2), "submitted_on" TIMESTAMP WITH TIME ZONE NOT NULL, "productId" uuid, CONSTRAINT "PK_1134f4a30427685d8b4732b519a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."gmc_product_integration_status_enum" AS ENUM('PENDING', 'LIVE', 'REMAP', 'EXPIRED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."gmc_product_refresh_reason_enum" AS ENUM('CREATED', 'OFFER_UPDATED', 'PENDING_RESEND', 'ADOPTED', 'EXPIRED', 'REQUESTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "gmc_product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider_id" uuid NOT NULL, "provider_product_id" character varying NOT NULL, "short_id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "integration_status" "public"."gmc_product_integration_status_enum" NOT NULL, "source_id" uuid NOT NULL, "created_by_run_id" character varying NOT NULL, "refreshed_by_run_id" character varying, "refreshed_at" TIMESTAMP WITH TIME ZONE, "refresh_reason" "public"."gmc_product_refresh_reason_enum", "source_date" TIMESTAMP WITH TIME ZONE, "expires_at" TIMESTAMP WITH TIME ZONE, "keep_alive_count" integer NOT NULL DEFAULT '0', "has_integration_error" boolean NOT NULL DEFAULT false, "error_message" character varying, "sku" character varying, "title" character varying, "description" character varying, "rating" numeric(3,2), "ratings_total" integer, "price" numeric(10,2), "shipping_price" numeric(10,2), "currency" character varying, "list_image" character varying, "main_image" character varying, "secondary_image" character varying, "offer_link" character varying, "brandId" uuid, "providerCategoryId" uuid, CONSTRAINT "UQ_67f713819b7224ab9808b08a5a1" UNIQUE ("short_id"), CONSTRAINT "PK_6e0408e4e723f1bb1f080b26cd8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_67ef77b05f5bc23e9ed7f78a41" ON "gmc_product" ("provider_id", "provider_product_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "gmc_provider_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider_id" uuid NOT NULL, "code" character varying NOT NULL, "description" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "category_id" uuid, CONSTRAINT "PK_8bb2e071fca862c110d6a44d33d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_7746ea6a5f45d925c468b51c2d" ON "gmc_provider_category" ("provider_id", "code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "gmc_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "nsleft" integer NOT NULL DEFAULT '1', "nsright" integer NOT NULL DEFAULT '2', "parentId" uuid, CONSTRAINT "PK_692bf98e94dc833f6a6f4a18874" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "gmc_product_label" ("product" uuid NOT NULL, "label" uuid NOT NULL, CONSTRAINT "PK_81d074d222ddbc4be613ddf6e88" PRIMARY KEY ("product", "label"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c7379359c335452adfc292b944" ON "gmc_product_label" ("product") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9db3b794cac4e64cb40bff761c" ON "gmc_product_label" ("label") `,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_source_run" ADD CONSTRAINT "FK_ebdbcb0171e887ea924806c0395" FOREIGN KEY ("source_id") REFERENCES "pi_product_source"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_product_source" ADD CONSTRAINT "FK_b6e6107e63fa06273bbfdb190a2" FOREIGN KEY ("provider_id") REFERENCES "pi_provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_label" ADD CONSTRAINT "FK_55825586272370aa9f38d1c3e14" FOREIGN KEY ("provider_id") REFERENCES "pi_provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_label" ADD CONSTRAINT "FK_b2f859a1d0d7249a702d8d8c4be" FOREIGN KEY ("group_id") REFERENCES "gmc_label_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_review" ADD CONSTRAINT "FK_cc548af39d4f1b63a26389065a0" FOREIGN KEY ("productId") REFERENCES "gmc_product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" ADD CONSTRAINT "FK_2a27d934a964b31cfa52ecabe1a" FOREIGN KEY ("provider_id") REFERENCES "pi_provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" ADD CONSTRAINT "FK_4efd1e0c534ad4ed516edf2470a" FOREIGN KEY ("source_id") REFERENCES "pi_product_source"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" ADD CONSTRAINT "FK_51f5478a1f49e99ccac76d3ee0f" FOREIGN KEY ("brandId") REFERENCES "gmc_brand"("id") ON DELETE NO ACTION ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" ADD CONSTRAINT "FK_194c73a3c319d950de89bb77c30" FOREIGN KEY ("providerCategoryId") REFERENCES "gmc_provider_category"("id") ON DELETE NO ACTION ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_provider_category" ADD CONSTRAINT "FK_26884ae119637a97472809f99d6" FOREIGN KEY ("provider_id") REFERENCES "pi_provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_provider_category" ADD CONSTRAINT "FK_f6a420c6ca1fb463fae9a89e4d6" FOREIGN KEY ("category_id") REFERENCES "gmc_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_category" ADD CONSTRAINT "FK_e0e212c79589c59aad742fec239" FOREIGN KEY ("parentId") REFERENCES "gmc_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product_label" ADD CONSTRAINT "FK_c7379359c335452adfc292b9446" FOREIGN KEY ("product") REFERENCES "gmc_product"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product_label" ADD CONSTRAINT "FK_9db3b794cac4e64cb40bff761cb" FOREIGN KEY ("label") REFERENCES "gmc_label"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gmc_product_label" DROP CONSTRAINT "FK_9db3b794cac4e64cb40bff761cb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product_label" DROP CONSTRAINT "FK_c7379359c335452adfc292b9446"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_category" DROP CONSTRAINT "FK_e0e212c79589c59aad742fec239"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_provider_category" DROP CONSTRAINT "FK_f6a420c6ca1fb463fae9a89e4d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_provider_category" DROP CONSTRAINT "FK_26884ae119637a97472809f99d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" DROP CONSTRAINT "FK_194c73a3c319d950de89bb77c30"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" DROP CONSTRAINT "FK_51f5478a1f49e99ccac76d3ee0f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" DROP CONSTRAINT "FK_4efd1e0c534ad4ed516edf2470a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_product" DROP CONSTRAINT "FK_2a27d934a964b31cfa52ecabe1a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_review" DROP CONSTRAINT "FK_cc548af39d4f1b63a26389065a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_label" DROP CONSTRAINT "FK_b2f859a1d0d7249a702d8d8c4be"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_label" DROP CONSTRAINT "FK_55825586272370aa9f38d1c3e14"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_product_source" DROP CONSTRAINT "FK_b6e6107e63fa06273bbfdb190a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_source_run" DROP CONSTRAINT "FK_ebdbcb0171e887ea924806c0395"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9db3b794cac4e64cb40bff761c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c7379359c335452adfc292b944"`,
    );
    await queryRunner.query(`DROP TABLE "gmc_product_label"`);
    await queryRunner.query(`DROP TABLE "gmc_category"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7746ea6a5f45d925c468b51c2d"`,
    );
    await queryRunner.query(`DROP TABLE "gmc_provider_category"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_67ef77b05f5bc23e9ed7f78a41"`,
    );
    await queryRunner.query(`DROP TABLE "gmc_product"`);
    await queryRunner.query(
      `DROP TYPE "public"."gmc_product_refresh_reason_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."gmc_product_integration_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "gmc_review"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f99991d0829ad85b0fee380fde"`,
    );
    await queryRunner.query(`DROP TABLE "gmc_label"`);
    await queryRunner.query(`DROP TABLE "pi_provider"`);
    await queryRunner.query(`DROP TYPE "public"."pi_provider_id_enum"`);
    await queryRunner.query(`DROP TABLE "pi_product_source"`);
    await queryRunner.query(
      `DROP TYPE "public"."pi_product_source_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "pi_source_run"`);
    await queryRunner.query(`DROP TABLE "gmc_label_group"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_aa7621e022cd3f996931409fd0"`,
    );
    await queryRunner.query(`DROP TABLE "gmc_brand"`);
  }
}
