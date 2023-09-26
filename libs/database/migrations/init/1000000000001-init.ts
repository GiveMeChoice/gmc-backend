import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1000000000001 implements MigrationInterface {
  name = 'init1000000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."pi_provider_key_enum" AS ENUM('rainforest-api', 'ethical-superstore-web', 'kelkoo', 'tesco')`,
    );
    await queryRunner.query(
      `CREATE TABLE "pi_provider" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" "public"."pi_provider_key_enum" NOT NULL, "description" character varying NOT NULL, "active" boolean NOT NULL DEFAULT false, "run_interval_hours" integer NOT NULL DEFAULT '24', "expiration_hours" integer NOT NULL DEFAULT '36', CONSTRAINT "UQ_5b9bbfad750c2f497b4c52e880f" UNIQUE ("key"), CONSTRAINT "PK_81da20ed0b61efbc4ad35c3e599" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pi_run" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "channel_id" uuid NOT NULL, "found_count" integer NOT NULL DEFAULT '0', "owned_count" integer NOT NULL DEFAULT '0', "created_count" integer NOT NULL DEFAULT '0', "adopted_count" integer NOT NULL DEFAULT '0', "foreign_count" integer NOT NULL DEFAULT '0', "pending_count" integer NOT NULL DEFAULT '0', "stale_count" integer NOT NULL DEFAULT '0', "keep_alive_signal_count" integer NOT NULL DEFAULT '0', "refresh_signal_count" integer NOT NULL DEFAULT '0', "failure_count" integer NOT NULL DEFAULT '0', "run_at" TIMESTAMP WITH TIME ZONE NOT NULL, "content_date" TIMESTAMP WITH TIME ZONE, "run_time" numeric(10,2), "error_message" character varying, CONSTRAINT "PK_932d7c43f24a26f60db92b95363" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "gmc_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "nsleft" integer NOT NULL DEFAULT '1', "nsright" integer NOT NULL DEFAULT '2', "parentId" uuid, CONSTRAINT "PK_692bf98e94dc833f6a6f4a18874" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "merchant_id" uuid NOT NULL, "merchant_category_code" character varying NOT NULL, "name" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "gmc_category_id" uuid, CONSTRAINT "PK_193eb59c92e574470923f86c469" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_70e7dd4d9302802b787ee69103" ON "merchant_category" ("merchant_id", "merchant_category_code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "gmc_label" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "nsleft" integer NOT NULL DEFAULT '1', "nsright" integer NOT NULL DEFAULT '2', "parentId" uuid, CONSTRAINT "PK_5ce50b41965194384818bf3ae6a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_label" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "merchant_id" uuid NOT NULL, "merchant_label_code" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, "logo" character varying, "url" character varying, "gmc_label_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_224dd583c61344852f31f1a0e84" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ab358abf21829182c038ccb892" ON "merchant_label" ("merchant_id", "merchant_label_code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "product_review" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "author" character varying NOT NULL, "text" character varying NOT NULL, "rating" numeric(3,2), "submitted_on" TIMESTAMP WITH TIME ZONE NOT NULL, "productId" uuid, CONSTRAINT "PK_6c00bd3bbee662e1f7a97dbce9a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."product_image_type_enum" AS ENUM('LIST', 'DETAIL')`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_image" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying NOT NULL, "primary" boolean NOT NULL, "type" "public"."product_image_type_enum" NOT NULL, "productId" uuid, CONSTRAINT "PK_99d98a80f57857d51b5f63c8240" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."product_status_enum" AS ENUM('PENDING', 'LIVE', 'REMAP', 'EXPIRED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."product_refresh_reason_enum" AS ENUM('CREATED', 'OFFER_UPDATED', 'PENDING_RESEND', 'ADOPTED', 'EXPIRED', 'REQUESTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "short_id" character varying NOT NULL, "merchant_id" uuid NOT NULL, "merchant_product_code" character varying NOT NULL, "channel_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "product_status" "public"."product_status_enum" NOT NULL, "created_by_run_id" character varying NOT NULL, "refreshed_by_run_id" character varying, "refreshed_at" TIMESTAMP WITH TIME ZONE, "indexed_at" TIMESTAMP WITH TIME ZONE, "product_refresh_reason" "public"."product_refresh_reason_enum", "expires_at" TIMESTAMP WITH TIME ZONE, "keep_alive_count" integer NOT NULL DEFAULT '0', "error_message" character varying, "sku" character varying, "title" character varying, "description" character varying, "rating" numeric(3,2), "ratings_total" integer, "price" numeric(10,2), "shipping_price" numeric(10,2), "currency" character varying, "offer_url" character varying, "merchantBrandId" uuid, "merchantCategoryId" uuid, CONSTRAINT "UQ_3c1788393d3c93fb6c0461b8846" UNIQUE ("short_id"), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_172f81328f0ee926a88eca8b79" ON "product" ("merchant_id", "merchant_product_code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "gmc_brand" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_b43e8521fc9a91b02f58d23f251" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant_brand" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "merchant_id" uuid NOT NULL, "merchant_brand_code " character varying NOT NULL, "name" character varying NOT NULL, "description" character varying, "logo" character varying, "url" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "gmc_brand_id" uuid, CONSTRAINT "REL_04382678f5d6a1a9d3cceba9e8" UNIQUE ("gmc_brand_id"), CONSTRAINT "PK_7eacb2584c558add9c927fe06a2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5a6d0c9c7f661e307619ead1d2" ON "merchant_brand" ("merchant_id", "merchant_brand_code ") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."merchant_key_enum" AS ENUM('amazon-uk', 'ethical-superstore')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."region_enum" AS ENUM('UK', 'US', 'NL')`,
    );
    await queryRunner.query(
      `CREATE TABLE "merchant" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" "public"."merchant_key_enum" NOT NULL, "region" "public"."region_enum" NOT NULL, "name" character varying NOT NULL, "description" character varying, "logo" character varying, "url" character varying, CONSTRAINT "UQ_d53c2586fa2fbfa2714d4e3ed15" UNIQUE ("key"), CONSTRAINT "PK_9a3850e0537d869734fc9bff5d6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."pi_channel_status_enum" AS ENUM('READY', 'BUSY', 'DOWN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "pi_channel" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying, "provider_id" uuid NOT NULL, "merchant_id" uuid NOT NULL, "status" "public"."pi_channel_status_enum" NOT NULL DEFAULT 'READY', "active" boolean NOT NULL DEFAULT false, "run_interval_hours" integer, "expiration_hours" integer, "retry_limit" integer NOT NULL DEFAULT '4', "retry_count" integer NOT NULL DEFAULT '0', "last_run_at" TIMESTAMP WITH TIME ZONE, "ETL_CODE_1" character varying, "ETL_CODE_2" character varying, "ETL_CODE_3" character varying, "ETL_CODE_4" character varying, "ETL_CODE_5" character varying, CONSTRAINT "PK_88cbcdff12b371d63af212d4ff3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_merchant_label" ("product" uuid NOT NULL, "merchant_label" uuid NOT NULL, CONSTRAINT "PK_173b671cde8833b00d6839d7888" PRIMARY KEY ("product", "merchant_label"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_523876b5f68f7371d6c4772706" ON "product_merchant_label" ("product") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7bd8350eaf08abd1784806514a" ON "product_merchant_label" ("merchant_label") `,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_run" ADD CONSTRAINT "FK_7cfba8544b1558a0e1a79796491" FOREIGN KEY ("channel_id") REFERENCES "pi_channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_category" ADD CONSTRAINT "FK_e0e212c79589c59aad742fec239" FOREIGN KEY ("parentId") REFERENCES "gmc_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_category" ADD CONSTRAINT "FK_5bc500480db15a7ecf133d1dd97" FOREIGN KEY ("merchant_id") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_category" ADD CONSTRAINT "FK_975a84ea93932b30d63f74fc259" FOREIGN KEY ("gmc_category_id") REFERENCES "gmc_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_label" ADD CONSTRAINT "FK_6b1e94b356f0ef29a8f97e80f34" FOREIGN KEY ("parentId") REFERENCES "gmc_label"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_label" ADD CONSTRAINT "FK_9fe95ce2938a1edc8ea51b06e67" FOREIGN KEY ("merchant_id") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_label" ADD CONSTRAINT "FK_a77a196582cd0ca731db517fb80" FOREIGN KEY ("gmc_label_id") REFERENCES "gmc_label"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_review" ADD CONSTRAINT "FK_06e7335708b5e7870f1eaa608d2" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_image" ADD CONSTRAINT "FK_40ca0cd115ef1ff35351bed8da2" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_acef770b58a882e187373703bc8" FOREIGN KEY ("channel_id") REFERENCES "pi_channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_189ace3fc691f857a4abaee6203" FOREIGN KEY ("merchant_id") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_98a8141123dc221268ebe1582c7" FOREIGN KEY ("merchantBrandId") REFERENCES "merchant_brand"("id") ON DELETE NO ACTION ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_b99bdf8ff33eb34c9951bfddcc3" FOREIGN KEY ("merchantCategoryId") REFERENCES "merchant_category"("id") ON DELETE NO ACTION ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_brand" ADD CONSTRAINT "FK_c83440bec55cf33348e8f3d4ea5" FOREIGN KEY ("merchant_id") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_brand" ADD CONSTRAINT "FK_04382678f5d6a1a9d3cceba9e8f" FOREIGN KEY ("gmc_brand_id") REFERENCES "gmc_brand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_channel" ADD CONSTRAINT "FK_2eeaf7850b473fcd0a7e876c222" FOREIGN KEY ("merchant_id") REFERENCES "merchant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_channel" ADD CONSTRAINT "FK_635313b70b91d6e77b70149430d" FOREIGN KEY ("provider_id") REFERENCES "pi_provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_merchant_label" ADD CONSTRAINT "FK_523876b5f68f7371d6c4772706d" FOREIGN KEY ("product") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_merchant_label" ADD CONSTRAINT "FK_7bd8350eaf08abd1784806514ad" FOREIGN KEY ("merchant_label") REFERENCES "merchant_label"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_merchant_label" DROP CONSTRAINT "FK_7bd8350eaf08abd1784806514ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_merchant_label" DROP CONSTRAINT "FK_523876b5f68f7371d6c4772706d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_channel" DROP CONSTRAINT "FK_635313b70b91d6e77b70149430d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_channel" DROP CONSTRAINT "FK_2eeaf7850b473fcd0a7e876c222"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_brand" DROP CONSTRAINT "FK_04382678f5d6a1a9d3cceba9e8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_brand" DROP CONSTRAINT "FK_c83440bec55cf33348e8f3d4ea5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_b99bdf8ff33eb34c9951bfddcc3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_98a8141123dc221268ebe1582c7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_189ace3fc691f857a4abaee6203"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_acef770b58a882e187373703bc8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_image" DROP CONSTRAINT "FK_40ca0cd115ef1ff35351bed8da2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_review" DROP CONSTRAINT "FK_06e7335708b5e7870f1eaa608d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_label" DROP CONSTRAINT "FK_a77a196582cd0ca731db517fb80"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_label" DROP CONSTRAINT "FK_9fe95ce2938a1edc8ea51b06e67"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_label" DROP CONSTRAINT "FK_6b1e94b356f0ef29a8f97e80f34"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_category" DROP CONSTRAINT "FK_975a84ea93932b30d63f74fc259"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_category" DROP CONSTRAINT "FK_5bc500480db15a7ecf133d1dd97"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gmc_category" DROP CONSTRAINT "FK_e0e212c79589c59aad742fec239"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pi_run" DROP CONSTRAINT "FK_7cfba8544b1558a0e1a79796491"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7bd8350eaf08abd1784806514a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_523876b5f68f7371d6c4772706"`,
    );
    await queryRunner.query(`DROP TABLE "product_merchant_label"`);
    await queryRunner.query(`DROP TABLE "pi_channel"`);
    await queryRunner.query(`DROP TYPE "public"."pi_channel_status_enum"`);
    await queryRunner.query(`DROP TABLE "merchant"`);
    await queryRunner.query(`DROP TYPE "public"."region_enum"`);
    await queryRunner.query(`DROP TYPE "public"."merchant_key_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5a6d0c9c7f661e307619ead1d2"`,
    );
    await queryRunner.query(`DROP TABLE "merchant_brand"`);
    await queryRunner.query(`DROP TABLE "gmc_brand"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_172f81328f0ee926a88eca8b79"`,
    );
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TYPE "public"."product_refresh_reason_enum"`);
    await queryRunner.query(`DROP TYPE "public"."product_status_enum"`);
    await queryRunner.query(`DROP TABLE "product_image"`);
    await queryRunner.query(`DROP TYPE "public"."product_image_type_enum"`);
    await queryRunner.query(`DROP TABLE "product_review"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ab358abf21829182c038ccb892"`,
    );
    await queryRunner.query(`DROP TABLE "merchant_label"`);
    await queryRunner.query(`DROP TABLE "gmc_label"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_70e7dd4d9302802b787ee69103"`,
    );
    await queryRunner.query(`DROP TABLE "merchant_category"`);
    await queryRunner.query(`DROP TABLE "gmc_category"`);
    await queryRunner.query(`DROP TABLE "pi_run"`);
    await queryRunner.query(`DROP TABLE "pi_provider"`);
    await queryRunner.query(`DROP TYPE "public"."pi_provider_key_enum"`);
  }
}
