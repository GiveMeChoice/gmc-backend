import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';
import { MessagingService } from '@lib/messaging';
import { SearchService } from '@lib/search';
import { SearchCategoryDto } from '@lib/search/dto/search-category.dto';
import { SearchProductDto } from '@lib/search/dto/search-product.dto';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import * as moment from 'moment';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  In,
  Repository,
} from 'typeorm';
import { FindProductsDto } from '../api/dto/find-products.dto';
import { IndexProductBatchCommand } from '../messages/index-product-batch.command';
import { IndexProductCommand } from '../messages/index-product.command';
import { MerchantBrand } from '../model/merchant-brand.entity';
import { Category } from '../model/category.entity';
import { ProductStatus } from '../model/enum/product-status.enum';
import { ProductRefreshReason } from '../model/enum/product-refresh-reason.enum';
import { MerchantLabel } from '../model/merchant-label.entity';
import { Channel } from '../model/channel.entity';
import { Product } from '../model/product.entity';
import { MerchantCategory } from '../model/merchant-category.entity';
import { Provider } from '../model/provider.entity';
import { Run } from '../model/run.entity';
import { formatErrorMessage } from '../utils/format-error-message';
import { MerchantBrandsService } from './merchant-brands.service';
import { CategoriesService } from './categories.service';
import { MerchantLabelsService } from './merchant-labels.service';
import { MerchantCategoriesService } from './merchant-categories.service';
import { SearchLabelDto } from '@lib/search/dto/search-label.dto';
import { LabelGroup } from '../model/label-group.entity';
import { LabelGroupsService } from './label-groups.service';
import { MerchantsService } from './merchants.service';

const searchRelevantFieldsFindOptions = {
  relations: {
    merchantLabels: true,
    merchant: true,
    merchantCategory: true,
    merchantBrand: true,
    reviews: true,
  } as FindOptionsRelations<Product>,
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
  } as FindOptionsSelect<Product>,
};

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    private readonly labelsService: MerchantLabelsService,
    private readonly categoriesService: CategoriesService,
    private readonly labelGroupsService: LabelGroupsService,
    private readonly merchantsService: MerchantsService,
    @Inject(forwardRef(() => MerchantCategoriesService))
    private readonly merchantCategoriesService: MerchantCategoriesService,
    private readonly brandsService: MerchantBrandsService,
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

  async indexProduct(id: string) {
    const toIndex = await this.getOneIndexable(id);
    return await this.searchService.indexDocument(toIndex.id, toIndex);
  }

  async getOneIndexable(id: string): Promise<SearchProductDto> {
    const product = await this.productsRepo.findOne({
      where: [{ ...((isUUID(id) && { id }) || { shortId: id }) }],
      ...searchRelevantFieldsFindOptions,
    });
    return await this.mapToIndexable(product);
  }

  private async mapToIndexable(
    product: Partial<Product>,
  ): Promise<SearchProductDto> {
    let category: Category = null;
    if (product.merchantCategory.categoryId) {
      category = await this.categoriesService.findOne(
        product.merchantCategory.categoryId,
      );
    }
    return {
      id: product.shortId,
      merchantProductId: product.merchantProductNumber,
      region: 'UK',
      sku: product.sku,
      merchant: {
        key: product.merchant.key,
        name: product.merchant.name,
        description: product.merchant.description,
        logoUrl: product.merchant.logo,
      },
      title: product.title,
      description: product.description,
      price: product.price,
      offerLink: product.offerUrl,
      images: {
        list: {
          url: product.listImage,
        },
        detail: {
          url: product.mainImage,
        },
      },
      brand: {
        code: product.merchantBrand.code,
        name: product.merchantBrand.name,
        description: product.merchantBrand.description,
        logoUrl: product.merchantBrand.logoUrl,
        infoLink: product.merchantBrand.infoLink,
      },
      category: {
        merchantCategory: product.merchantCategory.code,
        gmcCategory: await this.mapSearchCategory(
          product.merchantCategory.categoryId,
        ),
      },
      labels: await this.mapSearchLabels(product.merchantLabels),
    };
  }

  private async mapSearchCategory(
    categoryId: string,
  ): Promise<SearchCategoryDto> {
    if (!categoryId) return null;

    const category = (await this.categoriesService.findAncestors(
      categoryId,
      true,
    )) as Category;
    if (!category) return null;

    let nodes: string[] = [];
    nodes = this.flattenCategoryTree(category, nodes);
    // return nodes;
    const searchCategory: SearchCategoryDto = {
      name: nodes[nodes.length - 1],
      ...(nodes.length > 1 && {
        subcategory: {
          name: nodes[nodes.length - 2],
          ...(nodes.length > 2 && {
            subcategory: {
              name: nodes[nodes.length - 3],
            },
          }),
        },
      }),
    };
    return searchCategory;
  }

  private async mapSearchLabels(
    merchantLabels: MerchantLabel[],
  ): Promise<SearchLabelDto[]> {
    const labels = [];
    this.logger.debug(merchantLabels.length);
    for (const merchantLabel of merchantLabels) {
      const label: SearchLabelDto = {
        merchantLabel: {
          code: merchantLabel.code,
          name: merchantLabel.name,
          description: merchantLabel.description,
          logoUrl: merchantLabel.logoUrl,
          infoLink: merchantLabel.infoLink,
        },
      };
      this.logger.debug(`mapping label ${merchantLabel.code}`);
      if (merchantLabel.groupId) {
        const group = (await this.labelGroupsService.findAncestors(
          merchantLabel.groupId,
          true,
        )) as LabelGroup;
        if (group) {
          let nodes = [];
          nodes = this.flattenLabelGroupTree(group, nodes);
          label.group = {
            name: nodes[nodes.length - 1].name,
            description: nodes[nodes.length - 1].description,
            ...(nodes.length > 1 && {
              sublabel: {
                name: nodes[nodes.length - 2].name,
                description: nodes[nodes.length - 2].description,
                ...(nodes.length > 2 && {
                  sublabel: {
                    name: nodes[nodes.length - 3].name,
                    description: nodes[nodes.length - 3].description,
                  },
                }),
              },
            }),
          };
        }
      }
      labels.push(label);
    }
    return labels;
  }

  private flattenCategoryTree(node: Category, flattened: string[]): string[] {
    flattened.push(node.name);
    return node.parent && node.parent.name !== 'Root'
      ? this.flattenCategoryTree(node.parent, flattened)
      : flattened;
  }

  private flattenLabelGroupTree(node: LabelGroup, flattened: any[]): any[] {
    flattened.push({ name: node.name, description: node.description });
    return node.parent && node.parent.name !== 'Root'
      ? this.flattenLabelGroupTree(node.parent, flattened)
      : flattened;
  }

  async indexProductBatchAsync(findDto: Partial<Product>) {
    findDto.status = ProductStatus.LIVE;
    const BATCH_SIZE = 30;
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
    const batchToIndex = await this.productsRepo.find({
      where: { id: In(productIds) },
      ...searchRelevantFieldsFindOptions,
    });
    const documentBatch = [];
    for (const product of batchToIndex) {
      documentBatch.push({
        id: product.shortId,
        ...(await this.mapToIndexable(product)),
      });
    }
    this.logger.debug(`Index product batch: ${documentBatch.length} documents`);
    await this.searchService.bulk(documentBatch);
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
        channel: true,
        merchantCategory: {
          category: true,
        },
      },
      select: {
        channel: {
          id: true,
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

  async existsByMerchant(
    merchantId: string,
    merchantProductId: string,
  ): Promise<boolean> {
    return (
      merchantId &&
      merchantProductId &&
      (await this.productsRepo
        .createQueryBuilder('product')
        .select('product.id')
        .where('product.merchantId = :merchantId', { merchantId })
        .andWhere('product.merchantProductId = :merchantProductId', {
          merchantProductId,
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
        status: ProductStatus.EXPIRED,
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
        status: ProductStatus.REMAP,
      })
      .where('providerId = :id', { id })
      .andWhere('integrationStatus != :expired', {
        expired: ProductStatus.EXPIRED,
      })
      .execute();
    return raw.affected;
  }

  findByMerchant(
    merchantId: string,
    merchantProductId?: string,
  ): Promise<Product> {
    return this.productsRepo.findOneBy({
      merchantId,
      merchantProductNumber: merchantProductId,
    });
  }

  findOne(id: string): Promise<Product> {
    return this.productsRepo.findOne({
      where: [{ ...((isUUID(id) && { id }) || { shortId: id }) }],
      relations: {
        merchant: true,
        channel: {
          provider: true,
        },
      },
    });
  }

  findOneExternal(id: string): Promise<Product> {
    return this.productsRepo.findOne({
      where: [{ ...((isUUID(id) && { id }) || { shortId: id }) }],
      relations: {
        reviews: true,
        merchantLabels: true,
        channel: true,
        merchant: true,
        merchantCategory: true,
        merchantBrand: true,
      },
      select: {
        channel: {
          id: true,
          description: true,
        },
        merchant: {
          key: true,
        },
      },
    });
  }

  async getStatus(id: string): Promise<ProductStatus> {
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
    // check Merchant mapped from provider
    if (!product.merchant || !product.merchant.key) {
      throw new Error(`Merchant not mapped by provider! (Run ID: ${run.id}`);
    }
    product.merchant = await this.merchantsService.findOneByKey(
      product.merchant.key,
    );
    if (!product.merchant.id) {
      throw new Error(
        `Merchant not found! (Key: ${product.merchant.key}) (Run ID: ${run.id})`,
      );
    }
    // check product is new
    if (
      !this.existsByMerchant(
        run.channel.providerId,
        product.merchantProductNumber,
      )
    ) {
      throw new Error(
        `Provider ${run.channel.providerId} product ${product.merchantProductNumber} already exists!`,
      );
    }
    // ok lets go!
    product.channel = run.channel;
    product.createdByRunId = run.id;
    product.keepAliveCount = 0;
    product.expiresAt = await this.renewExpirationDate(
      run.channel.provider,
      run.channel,
    );
    if (product.merchantCategory) {
      product.merchantCategory = await this.normalizeCategory(
        product.merchant.id,
        product.merchantCategory,
      );
    }
    if (product.merchantBrand) {
      product.merchantBrand = await this.normalizeBrand(
        product.merchant.id,
        product.merchantBrand,
      );
    }
    if (product.merchantLabels) {
      product.merchantLabels = await this.normalizeLabels(
        product.merchant.id,
        product.merchantLabels,
      );
    }
    return await this.productsRepo.save(Product.factory(product));
  }

  async update(
    id: string,
    updates: Partial<Product>,
    renewExpiration?: boolean,
  ): Promise<Product> {
    let expirationDate;
    if (renewExpiration) {
      const { channel: source } = await this.productsRepo.findOne({
        where: {
          id,
        },
        select: {
          channel: {
            expirationHours: true,
            provider: {
              expirationHours: true,
            },
          },
        },
      });
      expirationDate = this.renewExpirationDate(source.provider, source);
    }

    if (
      updates.merchantCategory ||
      updates.merchantBrand ||
      updates.merchantLabels
    ) {
      const { merchantId: providerId } = await this.productsRepo.findOne({
        where: { id },
        select: { merchantId: true },
      });
      if (updates.merchantCategory) {
        updates.merchantCategory = await this.normalizeCategory(
          providerId,
          updates.merchantCategory,
        );
      }
      if (updates.merchantBrand) {
        updates.merchantBrand = await this.normalizeBrand(
          providerId,
          updates.merchantBrand,
        );
      }
      if (updates.merchantLabels) {
        updates.merchantLabels = await this.normalizeLabels(
          providerId,
          updates.merchantLabels,
        );
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
    source: Channel,
    runId: string,
    reason: ProductRefreshReason,
  ) {
    if (!this.existsById(id)) throw new Error(`Product not found: ${id}`);
    try {
      updates.errorMessage = null;
      updates.refreshedAt = new Date();
      updates.refreshReason = reason;
      updates.expiresAt = this.renewExpirationDate(source.provider, source);
      updates.keepAliveCount = 0;
      updates.refreshedByRunId = runId;
      updates.status = ProductStatus.LIVE;
      const product = await this.update(id, updates);
      await this.indexProductAsync(product.id);
      return product;
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      this.logger.error(`Product ${id} Refresh Failed: ${errorMessage}`);
      return await this.update(id, { errorMessage });
    }
  }

  async keepAlive(product: Product, run: Run) {
    product.keepAliveCount++;
    product.expiresAt = this.renewExpirationDate(
      run.channel.provider,
      run.channel,
    );
    await this.productsRepo.save(product);
  }

  private renewExpirationDate(provider: Provider, source: Channel): Date {
    if (source && source.expirationHours) {
      return moment().add(source.runIntervalHours, 'hours').toDate();
    } else if (provider && provider.expirationHours) {
      return moment().add(provider.expirationHours, 'hours').toDate();
    } else {
      return moment().add(24, 'hours').toDate();
    }
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
        category.code,
      );
      return existing
        ? existing
        : MerchantCategory.factory(merchantId, category.code, category);
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
        brand.code,
      );
      return existing
        ? existing
        : MerchantBrand.factory(merchantId, brand.code, brand);
    }
  }

  private async normalizeLabels(
    merchantId: string,
    rawLabels: MerchantLabel[],
  ): Promise<MerchantLabel[]> {
    const labels: MerchantLabel[] = [];
    for (const label of rawLabels) {
      if (labels.find((l) => l.code === label.code)) {
        // remove duplicates
        continue;
      } else if (label.id) {
        // label was already on product, dont mess with it
        labels.push(label);
      } else {
        const existing = await this.labelsService.findOneByMerchant(
          merchantId,
          label.code,
        );
        if (existing) {
          // assign existing label
          labels.push(existing);
        } else {
          // create new label
          labels.push(MerchantLabel.factory(merchantId, label.code, label));
        }
      }
    }
    return labels;
  }
}
