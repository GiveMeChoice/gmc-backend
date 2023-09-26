import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import * as moment from 'moment';
import { In, Repository } from 'typeorm';
import { FindProductsDto } from '../api/dto/find-products.dto';
import { Channel } from '../model/channel.entity';
import { MerchantKey } from '../model/enum/merchant-key.enum';
import { ProductRefreshReason } from '../model/enum/product-refresh-reason.enum';
import { ProductStatus } from '../model/enum/product-status.enum';
import { MerchantBrand } from '../model/merchant-brand.entity';
import { MerchantCategory } from '../model/merchant-category.entity';
import { MerchantLabel } from '../model/merchant-label.entity';
import { Product } from '../model/product.entity';
import { Run } from '../model/run.entity';
import { formatErrorMessage } from '../utils/format-error-message';
import { MerchantBrandsService } from './merchant-brands.service';
import { MerchantCategoriesService } from './merchant-categories.service';
import { MerchantLabelsService } from './merchant-labels.service';
import { ProductDocumentsService } from './product-documents.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    private readonly labelsService: MerchantLabelsService,
    @Inject(forwardRef(() => ProductDocumentsService))
    private readonly productDocumentsService: ProductDocumentsService,
    @Inject(forwardRef(() => MerchantCategoriesService))
    private readonly merchantCategoriesService: MerchantCategoriesService,
    private readonly brandsService: MerchantBrandsService,
  ) {}

  async find(
    findDto: FindProductsDto,
    pageRequest?: PageRequest,
  ): Promise<Page<Product>> {
    const query = this.productsRepo.createQueryBuilder('product');
    if (findDto.merchantLabel) {
      let addJoin = false;
      if (findDto.merchantLabel.merchantLabelCode) {
        query.andWhere('merchantLabel.merchantLabelCode=:code', {
          code: findDto.merchantLabel.merchantLabelCode,
        });
        addJoin = true;
      }
      if (findDto.merchantLabel.gmcLabelId) {
        query.andWhere('merchantLabel.gmcLabelId=:id', {
          id: findDto.merchantLabel.gmcLabelId,
        });
        addJoin = true;
      }
      if (addJoin) {
        query.innerJoin('product.merchantLabels', 'merchantLabel');
      }
      delete findDto.merchantLabel;
    }
    if (findDto.error) {
      query.andWhere('product.errorMessage is not null');
      delete findDto.error;
    }
    query.setFindOptions({
      ...pageRequest,
      where: {
        ...findDto,
      },
      relations: {
        channel: true,
        merchant: true,
        merchantLabels: true,
        merchantCategory: {
          gmcCategory: true,
        },
      },
    });
    const [products, count] = await query.getManyAndCount();
    return buildPage<Product>(products, count, pageRequest);
  }

  async findAll(pageRequest?: PageRequest): Promise<Page<Product>> {
    const [toCreate, count] = await this.productsRepo.findAndCount({
      ...pageRequest,
    });
    return buildPage<Product>(toCreate, count, pageRequest);
  }

  findOne(id: string): Promise<Product> {
    return this.productsRepo.findOne({
      where: [{ ...((isUUID(id) && { id }) || { shortId: id }) }],
      relations: {
        images: true,
        reviews: true,
        merchantLabels: {
          gmcLabel: {
            parent: {
              parent: true,
            },
          },
        },
        channel: {
          provider: true,
        },
        merchant: true,
        merchantCategory: {
          gmcCategory: {
            parent: {
              parent: true,
            },
          },
        },
        merchantBrand: true,
      },
    });
  }

  findMany(ids: string[]): Promise<Product[]> {
    return this.productsRepo.find({
      where: { id: In(ids) },
      relations: {
        images: true,
        reviews: true,
        merchantLabels: {
          gmcLabel: {
            parent: {
              parent: true,
            },
          },
        },
        channel: {
          provider: true,
        },
        merchant: true,
        merchantCategory: {
          gmcCategory: {
            parent: {
              parent: true,
            },
          },
        },
        merchantBrand: true,
      },
    });
  }

  async findIds(
    findDto: Partial<Product>,
    pageRequest?: PageRequest,
  ): Promise<Page<Product>> {
    const [data, count] = await this.productsRepo.findAndCount({
      ...pageRequest,
      where: {
        ...findDto,
      },
      select: {
        id: true,
      },
    });
    return buildPage<Product>(data, count, pageRequest);
  }

  findByMerchant(
    merchantId: string,
    merchantProductCode?: string,
  ): Promise<Product> {
    return this.productsRepo.findOneBy({
      merchantId,
      merchantProductCode,
    });
  }

  async flagAllExpired(): Promise<number> {
    const raw = await this.productsRepo
      .createQueryBuilder()
      .update(Product)
      .set({
        status: ProductStatus.EXPIRED,
        expiresAt: null,
      })
      .where('expiresAt < :now', { now: new Date() })
      .execute();
    return raw.affected;
  }

  async getCurrentStatus(id: string): Promise<ProductStatus> {
    const { status: status } = await this.productsRepo.findOne({
      select: {
        status: true,
      },
      where: {
        id,
      },
    });
    return status;
  }

  async create(product: Partial<Product>, run: Run): Promise<Product> {
    await this.validateIsCreateable(product, run);
    product.createdByRunId = run.id;
    product.keepAliveCount = 0;
    product.expiresAt = await this.renewExpirationDate(run.channel);
    product = await this.normalizeProduct(run.channel.merchantId, product);
    const toCreate = Product.factory(product, run.channel);
    this.logger.debug(JSON.stringify(toCreate));
    return await this.productsRepo.save(toCreate);
  }

  async update(
    id: string,
    updates: Partial<Product>,
    renewExpiration?: boolean,
  ): Promise<Product> {
    this.logger.debug(id);
    const { channel } = await this.productsRepo.findOne({
      where: [{ ...((isUUID(id) && { id }) || { shortId: id }) }],
      relations: {
        channel: {
          provider: true,
        },
      },
      select: {
        channel: {
          merchantId: true,
          expirationHours: true,
          provider: {
            expirationHours: true,
          },
        },
      },
    });
    this.logger.debug(JSON.stringify(channel));
    await this.productsRepo.save({
      id,
      ...(await this.normalizeProduct(channel.merchantId, updates)),
      ...(renewExpiration && {
        expirationDate: this.renewExpirationDate(channel),
      }),
    });
    return await this.findOne(id);
  }

  async updateAll(ids: string[], updates: Partial<Product>): Promise<number> {
    const result = await this.productsRepo
      .createQueryBuilder()
      .update(Product)
      .set(updates)
      .where({ id: In(ids) })
      .execute();
    return result.affected;
  }

  async refresh(
    id: string,
    updates: Partial<Product>,
    channel: Channel,
    runId: string,
    reason: ProductRefreshReason,
  ) {
    if (!this.existsById(id)) throw new Error(`Product not found: ${id}`);
    try {
      updates.errorMessage = null;
      updates.refreshedAt = new Date();
      updates.refreshReason = reason;
      updates.expiresAt = this.renewExpirationDate(channel);
      updates.keepAliveCount = 0;
      updates.refreshedByRunId = runId;
      updates.status = ProductStatus.LIVE;
      const product = await this.update(id, updates);
      await this.productDocumentsService.index(product.id);
      return product;
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      this.logger.error(`Product ${id} Refresh Failed: ${errorMessage}`);
      return await this.update(id, { errorMessage });
    }
  }

  async keepAlive(product: Product, run: Run) {
    product.keepAliveCount++;
    product.expiresAt = this.renewExpirationDate(run.channel);
    await this.productsRepo.save(product);
  }

  private async existsById(id: string): Promise<boolean> {
    return (
      id &&
      (await this.productsRepo
        .createQueryBuilder('product')
        .select('product.id')
        .where('product.id = :id', { id })
        .getRawOne())
    );
  }

  private async existsByMerchant(
    merchantId: string,
    merchantProductCode: string,
  ): Promise<boolean> {
    return (
      merchantId &&
      merchantProductCode &&
      (await this.productsRepo
        .createQueryBuilder('product')
        .select('product.id')
        .where('product.merchantId = :merchantId', { merchantId })
        .andWhere('product.merchantProductCode = :merchantProductCode', {
          merchantProductCode,
        })
        .getRawOne())
    );
  }

  private async validateIsCreateable(product: Partial<Product>, run: Run) {
    // Validate the mapped merchant key exists
    if (
      !product.merchant ||
      !Object.values(MerchantKey).includes(product.merchant.key)
    ) {
      throw new Error(
        `Merchant not found by Key: ${JSON.stringify(
          product.merchant,
        )} (Run ID: ${run.id})`,
      );
    }
    // Validate the mapped merchant key matches that of the current run's channel
    if (run.channel.merchant.key !== product.merchant.key) {
      throw new Error(
        `Mapped product merchant (${product.merchant.key}) does not match channel merchant (${run.channel.merchant.key})`,
      );
    }
    // Validate this merchant product doesn't already exist
    if (
      !this.existsByMerchant(
        run.channel.providerId,
        product.merchantProductCode,
      )
    ) {
      throw new Error(
        `Merchant product (${run.channel.merchant.key}: ${product.merchantProductCode}) already exists`,
      );
    }
  }

  private renewExpirationDate(channel: Channel): Date {
    if (channel && channel.expirationHours) {
      return moment().add(channel.runIntervalHours, 'hours').toDate();
    } else if (channel.provider && channel.provider.expirationHours) {
      return moment().add(channel.provider.expirationHours, 'hours').toDate();
    } else {
      // default if no config found is 24 hours
      return moment().add(24, 'hours').toDate();
    }
  }

  private async normalizeProduct(
    merchantId: string,
    product: Partial<Product>,
  ): Promise<Partial<Product>> {
    if (product.merchantCategory) {
      product.merchantCategory = await this.normalizeCategory(
        merchantId,
        product.merchantCategory,
      );
    }
    if (product.merchantBrand) {
      product.merchantBrand = await this.normalizeBrand(
        merchantId,
        product.merchantBrand,
      );
    }
    if (product.merchantLabels) {
      product.merchantLabels = await this.normalizeLabels(
        merchantId,
        product.merchantLabels,
      );
    }
    return product;
  }

  private async normalizeCategory(
    merchantId: string,
    category: MerchantCategory,
  ): Promise<MerchantCategory> {
    if (category.id) {
      return category;
    } else {
      const existing = await this.merchantCategoriesService.findOneByMerchant(
        merchantId,
        category.merchantCategoryCode,
      );
      return existing
        ? existing
        : MerchantCategory.factory(
            merchantId,
            category.merchantCategoryCode,
            category,
          );
    }
  }

  private async normalizeBrand(
    merchantId: string,
    brand: MerchantBrand,
  ): Promise<MerchantBrand> {
    if (brand.id) {
      return brand;
    } else {
      const existing = await this.brandsService.findOneByMerchant(
        merchantId,
        brand.merchantBrandCode,
      );
      return existing
        ? existing
        : MerchantBrand.factory(merchantId, brand.merchantBrandCode, brand);
    }
  }

  private async normalizeLabels(
    merchantId: string,
    rawLabels: MerchantLabel[],
  ): Promise<MerchantLabel[]> {
    const labels: MerchantLabel[] = [];
    for (const label of rawLabels) {
      if (labels.find((l) => l.merchantLabelCode === label.merchantLabelCode)) {
        // remove duplicates
        continue;
      } else if (label.id) {
        // label was already on product, dont mess with it
        labels.push(label);
      } else {
        const existing = await this.labelsService.findOneByMerchant(
          merchantId,
          label.merchantLabelCode,
        );
        if (existing) {
          // assign existing label
          labels.push(existing);
        } else {
          // create new label
          labels.push(
            MerchantLabel.factory(merchantId, label.merchantLabelCode, label),
          );
        }
      }
    }
    return labels;
  }
}
