import { PageRequest } from '@lib/database/interface/page-request.interface';
import { SearchCategoryDto } from '@lib/elasticsearch/dto/search-category.dto';
import { SearchLabelDto } from '@lib/elasticsearch/dto/search-label.dto';
import { SearchProductDto } from '@lib/elasticsearch/dto/search-product.dto';
import { ElasticsearchService } from '@lib/elasticsearch/elasticsearch.service';
import { MessagingService } from '@lib/messaging';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  In,
  Repository,
} from 'typeorm';
import { IndexProductBatchCommand } from '../messages/index-product-batch.command';
import { IndexProductCommand } from '../messages/index-product.command';
import { ProductStatus } from '../model/enum/product-status.enum';
import { GmcCategory } from '../model/gmc-category.entity';
import { GmcLabel } from '../model/gmc-label.entity';
import { MerchantLabel } from '../model/merchant-label.entity';
import { Product } from '../model/product.entity';
import { GmcCategoriesService } from './gmc-categories.service';
import { GmcLabelsService } from './gmc-labels.service';
import { Page } from '@lib/database/interface/page.interface';
import { buildPage } from '@lib/database/utils/build-page';

const indexableFieldFindOptions = {
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
export class IndexService {
  private readonly logger = new Logger(IndexService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly categoriesService: GmcCategoriesService,
    private readonly labelGroupsService: GmcLabelsService,
    private readonly messagingService: MessagingService,
  ) {}

  async indexProductAsync(productId: string) {
    await this.messagingService.sendToQueue(
      new IndexProductCommand({
        productId,
      }),
    );
  }

  async indexProduct(id: string) {
    const toIndex = await this.mapIndexable(id);
    return await this.elasticsearchService.indexDocument(toIndex.id, toIndex);
  }

  async mapIndexable(id: string): Promise<SearchProductDto> {
    const product = await this.productsRepo.findOne({
      where: [{ ...((isUUID(id) && { id }) || { shortId: id }) }],
      ...indexableFieldFindOptions,
    });
    return await this.mapToIndexable(product);
  }

  private async mapToIndexable(
    product: Partial<Product>,
  ): Promise<SearchProductDto> {
    let category: GmcCategory = null;
    if (product.merchantCategory.gmcCategoryId) {
      category = await this.categoriesService.findOne(
        product.merchantCategory.gmcCategoryId,
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
          product.merchantCategory.gmcCategoryId,
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
    )) as GmcCategory;
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
          logoUrl: merchantLabel.logo,
          infoLink: merchantLabel.url,
        },
      };
      this.logger.debug(`mapping label ${merchantLabel.code}`);
      if (merchantLabel.gmcLabelId) {
        const group = (await this.labelGroupsService.findAncestors(
          merchantLabel.gmcLabelId,
          true,
        )) as GmcLabel;
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

  private flattenCategoryTree(
    node: GmcCategory,
    flattened: string[],
  ): string[] {
    flattened.push(node.name);
    return node.parent && node.parent.name !== 'Root'
      ? this.flattenCategoryTree(node.parent, flattened)
      : flattened;
  }

  private flattenLabelGroupTree(node: GmcLabel, flattened: any[]): any[] {
    flattened.push({ name: node.name, description: node.description });
    return node.parent && node.parent.name !== 'Root'
      ? this.flattenLabelGroupTree(node.parent, flattened)
      : flattened;
  }

  /* 
    Sends product IDs to queue in batches to be reindexed.
    Returns total number of products sent to queue.
  */
  async indexProductBatchAsync(findDto: Partial<Product>): Promise<number> {
    findDto.status = ProductStatus.LIVE; // ensure only LIVE products are reindexed
    const INDEX_BATCH_SIZE = 30;
    let total = 0;
    const pageRequest: PageRequest = { skip: 0, take: INDEX_BATCH_SIZE };
    let page = await this.findIds(findDto, pageRequest);
    if (page.meta.count > 0) {
      total += page.meta.count;
      await this.messagingService.sendToQueue(
        new IndexProductBatchCommand({
          productIds: page.data.map((p) => p.id),
        }),
      );
    }
    while (pageRequest.skip + pageRequest.take < page.meta.totalCount) {
      pageRequest.skip += INDEX_BATCH_SIZE;
      page = await this.findIds(findDto, pageRequest);
      if (page.meta.count > 0) {
        total += page.meta.count;
        await this.messagingService.sendToQueue(
          new IndexProductBatchCommand({
            productIds: page.data.map((p) => p.id),
          }),
        );
      }
    }
    return total;
  }

  private async findIds(
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

  async indexProductBatch(productIds: string[]) {
    const batchToIndex = await this.productsRepo.find({
      where: { id: In(productIds) },
      ...indexableFieldFindOptions,
    });
    const documentBatch = [];
    for (const product of batchToIndex) {
      documentBatch.push({
        id: product.shortId,
        ...(await this.mapToIndexable(product)),
      });
    }
    this.logger.debug(`Index product batch: ${documentBatch.length} documents`);
    await this.elasticsearchService.bulk(documentBatch);
  }
}
