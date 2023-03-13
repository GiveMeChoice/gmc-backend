import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { MessagingService } from '@lib/messaging';
import { SearchService } from '@lib/search';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import * as moment from 'moment';
import { In, Repository } from 'typeorm';
import { FindProductsDto } from '../api/dto/find-products.dto';
import { IndexProductBatchCommand } from '../messages/index-product-batch.command';
import { IndexProductCommand } from '../messages/index-product.command';
import { Brand } from '../model/brand.entity';
import { ProductIntegrationStatus } from '../model/enum/product-integration-status.enum';
import { ProductRefreshReason } from '../model/enum/product-refresh-reason.enum';
import { ProviderKey } from '../model/enum/provider-key.enum';
import { Label } from '../model/label.entity';
import { ProductSource } from '../model/product-source.entity';
import { Product } from '../model/product.entity';
import { ProviderCategory } from '../model/provider-category.entity';
import { Provider } from '../model/provider.entity';
import { SourceRun } from '../model/source-run.entity';
import { formatErrorMessage } from '../utils/format-error-message';
import { BrandsService } from './brands.service';
import { LabelsService } from './labels.service';
import { ProviderCategoriesService } from './provider-categories.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    // private readonly messagingService: MessagingService,
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    private readonly labelsService: LabelsService,
    private readonly categoriesService: ProviderCategoriesService,
    private readonly brandsService: BrandsService,
    private readonly messagingService: MessagingService,
    private readonly searchService: SearchService,
  ) {}

  async indexProductAsync(productId: string) {
    await this.messagingService.sendToQueue(
      new IndexProductCommand({
        productId,
      }),
    );
  }

  async indexProduct(productId: string) {
    const toCreate = await this.findOnetoCreate(productId);
    return this.searchService.indexDocument(toCreate.shortId, toCreate);
  }

  async indexProductBatchAsync(findDto: Partial<Product>) {
    findDto.integrationStatus = ProductIntegrationStatus.LIVE;
    const BATCH_SIZE = 15;
    const pageRequest: PageRequest = { skip: 0, take: BATCH_SIZE };
    let page = await this.findIds(findDto, pageRequest);
    if (page.meta.count > 0) {
      await this.messagingService.sendToQueue(
        new IndexProductBatchCommand({
          productIds: page.data.map((p) => p.id),
        }),
      );
    }
    while (pageRequest.skip + pageRequest.take < page.meta.totalCount) {
      pageRequest.skip += BATCH_SIZE;
      page = await this.findIds(findDto, pageRequest);
      if (page.meta.count > 0) {
        await this.messagingService.sendToQueue(
          new IndexProductBatchCommand({
            productIds: page.data.map((p) => p.id),
          }),
        );
      }
    }
  }

  async indexProductBatch(productIds: string[]) {
    const batchtoCreate = await this.productsRepo.find({
      where: { id: In(productIds) },
      relations: {
        labels: true,
        provider: true,
        providerCategory: true,
        brand: true,
      },
      select: {
        shortId: true,
        sku: true,
        title: true,
        description: true,
        price: true,
        currency: true,
        listImage: true,
        rating: true,
        ratingsTotal: true,
        provider: {
          key: true,
        },
        labels: {
          code: true,
          description: true,
        },
        providerCategory: {
          code: true,
          description: true,
        },
        brand: {
          code: true,
          description: true,
        },
      },
    });
    await this.searchService.bulk(
      batchtoCreate.map((p) => ({
        id: p.shortId,
        ...p,
      })),
    );
  }

  async find(
    findDto: FindProductsDto,
    pageRequest?: PageRequest,
  ): Promise<Page<Product>> {
    const query = this.productsRepo.createQueryBuilder('product');
    if (findDto.label) {
      let addJoin = false;
      if (findDto.label.code) {
        query.andWhere('label.code=:code', { code: findDto.label.code });
        addJoin = true;
      }
      if (findDto.label.groupId) {
        query.andWhere('label.group=:groupId', {
          groupId: findDto.label.groupId,
        });
        addJoin = true;
      }
      if (addJoin) {
        query.innerJoin('product.labels', 'label');
      }
      delete findDto.label;
    }
    query.setFindOptions({
      ...pageRequest,
      where: {
        ...findDto,
      },
      relations: {
        source: true,
      },
      select: {
        source: {
          identifier: true,
          description: true,
        },
      },
    });
    const [toCreate, count] = await query.getManyAndCount();
    return buildPage<Product>(toCreate, count, pageRequest);
  }

  async findIds(
    findDto: Partial<Product>,
    pageRequest?: PageRequest,
  ): Promise<Page<Product>> {
    const [toCreate, count] = await this.productsRepo.findAndCount({
      ...pageRequest,
      where: {
        ...findDto,
      },
      select: {
        id: true,
      },
    });
    return buildPage<Product>(toCreate, count, pageRequest);
  }

  async existsById(id: string): Promise<boolean> {
    return (
      id &&
      (await this.productsRepo
        .createQueryBuilder('product')
        .select('product.id')
        .where('product.id = :id', { id })
        .getRawOne())
    );
  }

  async existsByProvider(
    providerId: string,
    providerProductId: string,
  ): Promise<boolean> {
    return (
      providerId &&
      providerProductId &&
      (await this.productsRepo
        .createQueryBuilder('product')
        .select('product.id')
        .where('product.providerId = :providerId', { providerId })
        .andWhere('product.providerProductId = :providerProductId', {
          providerProductId,
        })
        .getRawOne())
    );
  }

  async findAll(pageRequest?: PageRequest): Promise<Page<Product>> {
    const [toCreate, count] = await this.productsRepo.findAndCount({
      ...pageRequest,
    });
    return buildPage<Product>(toCreate, count, pageRequest);
  }

  async updateAllExpired(): Promise<number> {
    const raw = await this.productsRepo
      .createQueryBuilder()
      .update(Product)
      .set({
        integrationStatus: ProductIntegrationStatus.EXPIRED,
        expiresAt: null,
      })
      .where('expiresAt < :now', { now: new Date() })
      .execute();
    return raw.affected;
  }

  async setToRemapByProvider(id: string): Promise<number> {
    const raw = await this.productsRepo
      .createQueryBuilder()
      .update(Product)
      .set({
        integrationStatus: ProductIntegrationStatus.REMAP,
      })
      .where('providerId = :id', { id })
      .andWhere('integrationStatus != :expired', {
        expired: ProductIntegrationStatus.EXPIRED,
      })
      .execute();
    return raw.affected;
  }

  findByProvider(
    providerId: string,
    providerProductId?: string,
  ): Promise<Product> {
    return this.productsRepo.findOneBy({
      providerId,
      providerProductId,
    });
  }

  findOne(id: string): Promise<Product> {
    return this.productsRepo.findOne({
      where: [{ ...((isUUID(id) && { id }) || { shortId: id }) }],
      relations: { provider: true, source: true },
    });
  }

  findOneExternal(id: string): Promise<Product> {
    return this.productsRepo.findOne({
      where: [{ ...((isUUID(id) && { id }) || { shortId: id }) }],
      relations: {
        reviews: true,
        labels: true,
        source: true,
        provider: true,
        providerCategory: true,
        brand: true,
      },
      select: {
        source: {
          identifier: true,
          description: true,
        },
        provider: {
          key: true,
        },
      },
    });
  }

  async findtoCreate(
    findDto: Partial<Product>,
    pageRequest?: PageRequest,
  ): Promise<Page<Product>> {
    const [toCreate, count] = await this.productsRepo.findAndCount({
      ...pageRequest,
      where: {
        ...findDto,
      },
      relations: {
        labels: true,
        provider: true,
        providerCategory: true,
        brand: true,
      },
      select: {
        id: true,
        shortId: true,
        sku: true,
        title: true,
        description: true,
        price: true,
        currency: true,
        listImage: true,
        rating: true,
        ratingsTotal: true,
        provider: {
          key: true,
        },
        labels: {
          code: true,
          description: true,
        },
        providerCategory: {
          code: true,
          description: true,
        },
        brand: {
          code: true,
          description: true,
        },
      },
    });
    return buildPage<Product>(toCreate, count, pageRequest);
  }

  findOnetoCreate(id: string): Promise<Product> {
    return this.productsRepo.findOne({
      where: [{ ...((isUUID(id) && { id }) || { shortId: id }) }],
      relations: {
        labels: true,
        provider: true,
        providerCategory: true,
        brand: true,
      },
      select: {
        id: true,
        shortId: true,
        sku: true,
        title: true,
        description: true,
        price: true,
        currency: true,
        listImage: true,
        rating: true,
        ratingsTotal: true,
        provider: {
          key: true,
        },
        labels: {
          code: true,
          description: true,
        },
        providerCategory: {
          code: true,
          description: true,
        },
        brand: {
          code: true,
          description: true,
        },
      },
    });
  }

  async getStatus(id: string): Promise<ProductIntegrationStatus> {
    const { integrationStatus: status } = await this.productsRepo.findOne({
      select: {
        integrationStatus: true,
      },
      where: {
        id,
      },
    });
    return status;
  }

  async create(toCreate: Partial<Product>, run: SourceRun): Promise<Product> {
    if (
      !this.existsByProvider(run.source.providerId, toCreate.providerProductId)
    ) {
      throw new Error(
        `Provider ${run.source.providerId} product ${toCreate.providerProductId} already exists!`,
      );
    }
    toCreate.provider = run.source.provider;
    toCreate.source = run.source;
    toCreate.createdByRunId = run.id;
    toCreate.keepAliveCount = 0;
    toCreate.expiresAt = await this.renewExpirationDate(
      run.source.provider,
      run.source,
    );
    if (toCreate.providerCategory) {
      toCreate.providerCategory = await this.normalizeCategory(
        run.source.providerId,
        toCreate.providerCategory,
      );
    }
    if (toCreate.brand) {
      toCreate.brand = await this.normalizeBrand(
        run.source.providerId,
        toCreate.brand,
      );
    }
    if (toCreate.labels) {
      toCreate.labels = await this.normalizeLabels(
        run.source.providerId,
        toCreate.labels,
      );
    }
    return await this.productsRepo.save(Product.factory(toCreate));
  }

  async update(
    id: string,
    updates: Partial<Product>,
    renewExpiration?: boolean,
  ): Promise<Product> {
    let expirationDate;
    if (renewExpiration) {
      const { provider, source } = await this.productsRepo.findOne({
        where: {
          id,
        },
        select: {
          provider: {
            expirationHours: true,
          },
          source: {
            expirationHours: true,
          },
        },
      });
      expirationDate = this.renewExpirationDate(provider, source);
    }

    if (updates.providerCategory || updates.brand || updates.labels) {
      const { providerId } = await this.productsRepo.findOne({
        where: { id },
        select: { providerId: true },
      });
      if (updates.providerCategory) {
        updates.providerCategory = await this.normalizeCategory(
          providerId,
          updates.providerCategory,
        );
      }
      if (updates.brand) {
        updates.brand = await this.normalizeBrand(providerId, updates.brand);
      }
      if (updates.labels) {
        updates.labels = await this.normalizeLabels(providerId, updates.labels);
      }
    }
    await this.productsRepo.save({
      id,
      ...updates,
      ...(renewExpiration && { expirationDate }),
    });
    return await this.findOne(id);
  }

  async search(q: string): Promise<Product[]> {
    const response = await this.searchService.search<Product>(q);
    return response.hits.hits.map((hit) => hit._source);
  }

  async remove(id: string): Promise<void> {
    await this.productsRepo.delete(id);
  }

  async refresh(
    id: string,
    updates: Partial<Product>,
    source: ProductSource,
    runId: string,
    reason: ProductRefreshReason,
  ) {
    if (!this.existsById(id)) throw new Error(`Product not found: ${id}`);
    try {
      updates.hasIntegrationError = false;
      updates.errorMessage = null;
      updates.refreshedAt = new Date();
      updates.refreshReason = reason;
      updates.expiresAt = this.renewExpirationDate(source.provider, source);
      updates.keepAliveCount = 0;
      updates.refreshedByRunId = runId;
      updates.integrationStatus = ProductIntegrationStatus.LIVE;
      const product = await this.update(id, updates);
      await this.indexProductAsync(product.id);
      return product;
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      this.logger.error(`Product ${id} Refresh Failed: ${errorMessage}`);
      return await this.update(id, { hasIntegrationError: true, errorMessage });
    }
  }

  async keepAlive(product: Product, run: SourceRun) {
    product.keepAliveCount++;
    product.expiresAt = this.renewExpirationDate(
      run.source.provider,
      run.source,
    );
    await this.productsRepo.save(product);
  }

  private renewExpirationDate(provider: Provider, source: ProductSource): Date {
    if (source && source.expirationHours) {
      return moment().add(source.runIntervalHours, 'hours').toDate();
    } else if (provider && provider.expirationHours) {
      return moment().add(provider.expirationHours, 'hours').toDate();
    } else {
      return moment().add(24, 'hours').toDate();
    }
  }

  private async normalizeCategory(
    providerId: string,
    category: ProviderCategory,
  ): Promise<ProviderCategory> {
    if (category.id) {
      return category;
    } else {
      const existing = await this.categoriesService.findOneByProvider(
        providerId,
        category.code,
      );
      return existing
        ? existing
        : ProviderCategory.factory(providerId, category.code, category);
    }
  }

  private async normalizeBrand(
    providerId: string,
    brand: Brand,
  ): Promise<Brand> {
    if (brand.id) {
      return brand;
    } else {
      const existing = await this.brandsService.findOneByProvider(
        providerId,
        brand.code,
      );
      return existing ? existing : Brand.factory(providerId, brand.code, brand);
    }
  }

  private async normalizeLabels(
    providerId: string,
    rawLabels: Label[],
  ): Promise<Label[]> {
    const labels: Label[] = [];
    for (const label of rawLabels) {
      if (labels.find((l) => l.code === label.code)) {
        // remove duplicates
        continue;
      } else if (label.id) {
        // label was already on product, dont mess with it
        labels.push(label);
      } else {
        const existing = await this.labelsService.findOneByProvider(
          providerId,
          label.code,
        );
        if (existing) {
          // assign existing label
          labels.push(existing);
        } else {
          // create new label
          labels.push(Label.factory(providerId, label.code, label));
        }
      }
    }
    return labels;
  }
}
