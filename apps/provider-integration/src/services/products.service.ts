import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { MessagingService } from '@lib/messaging';
import { SearchService } from '@lib/search';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { ArrayContains, DataSource, In, Like, Repository } from 'typeorm';
import { FindProductsDto } from '../api/dto/find-products.dto';
import { IndexProductBatchCommand } from '../messages/index-product-batch.command';
import { IndexProductCommand } from '../messages/index-product.command';
import { Brand } from '../model/brand.entity';
import { Category } from '../model/category.entity';
import { ProductIntegrationStatus } from '../model/enum/product-status.enum';
import { Label } from '../model/label.entity';
import { Product } from '../model/product.entity';
import { normalizeIdCode } from '../utils/normalize-id-code';
import { BrandsService } from './brands.service';
import { CategoriesService } from './categories.service';
import { LabelsService } from './labels.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly dataSource: DataSource,
    // private readonly messagingService: MessagingService,
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    private readonly labelsService: LabelsService,
    private readonly categoriesService: CategoriesService,
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
    const data = await this.findOneData(productId);
    return this.searchService.indexDocument(data.shortId, data);
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
    const batchData = await this.productsRepo.find({
      where: { id: In(productIds) },
      relations: {
        labels: true,
        provider: true,
        category: true,
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
        category: {
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
      batchData.map((p) => ({
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
    const [data, count] = await query.getManyAndCount();
    return buildPage<Product>(data, count, pageRequest);
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
    const [data, count] = await this.productsRepo.findAndCount({
      ...pageRequest,
    });
    return buildPage<Product>(data, count, pageRequest);
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
        category: true,
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

  async findData(
    findDto: Partial<Product>,
    pageRequest?: PageRequest,
  ): Promise<Page<Product>> {
    const [data, count] = await this.productsRepo.findAndCount({
      ...pageRequest,
      where: {
        ...findDto,
      },
      relations: {
        labels: true,
        provider: true,
        category: true,
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
        category: {
          code: true,
          description: true,
        },
        brand: {
          code: true,
          description: true,
        },
      },
    });
    return buildPage<Product>(data, count, pageRequest);
  }

  findOneData(id: string): Promise<Product> {
    return this.productsRepo.findOne({
      where: [{ ...((isUUID(id) && { id }) || { shortId: id }) }],
      relations: {
        labels: true,
        provider: true,
        category: true,
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
        category: {
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

  async create(
    providerId: string,
    providerProductId: string,
    data: Partial<Product>,
  ): Promise<Partial<Product>> {
    if (!this.existsByProvider(providerId, providerProductId)) {
      throw new Error(
        `Provider ${providerProductId} product ${providerProductId} already exists!`,
      );
    }
    if (data.category) {
      data.category = await this.normalizeCategory(providerId, data.category);
    }
    if (data.brand) {
      data.brand = await this.normalizeBrand(providerId, data.brand);
    }
    if (data.labels) {
      data.labels = await this.normalizeLabels(providerId, data.labels);
    }
    const product = Product.factory(providerId, providerProductId, data);
    return await this.productsRepo.save(product);
  }

  async update(
    id: string,
    providerId: string,
    updates: Partial<Product>,
  ): Promise<Product> {
    if (updates.category) {
      updates.category = await this.normalizeCategory(
        providerId,
        updates.category,
      );
    }
    if (updates.brand) {
      updates.brand = await this.normalizeBrand(providerId, updates.brand);
    }
    if (updates.labels) {
      updates.labels = await this.normalizeLabels(providerId, updates.labels);
    }
    await this.productsRepo.save({
      id,
      ...updates,
    });
    return await this.findOne(id);
  }

  async search(q: string): Promise<Product[]> {
    const response = await this.searchService.search<Product>(q);
    return response.hits.hits.map((hit) => hit._source);
  }

  async save(product: Product): Promise<Product> {
    return await this.productsRepo.save(product);
  }

  async remove(id: string): Promise<void> {
    await this.productsRepo.delete(id);
  }

  private async normalizeCategory(
    providerId: string,
    category: Category,
  ): Promise<Category> {
    if (category.id) {
      return category;
    } else {
      const existing = await this.categoriesService.findOneByProvider(
        providerId,
        category.code,
      );
      return existing
        ? existing
        : Category.factory(providerId, category.code, category);
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
