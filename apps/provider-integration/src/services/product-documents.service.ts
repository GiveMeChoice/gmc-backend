import { PageRequest } from '@lib/database/interface/page-request.interface';
import { BrandDocument } from '@lib/elasticsearch/document/brand.document';
import {
  CategoryDocument,
  GmcCategoryDocument,
} from '@lib/elasticsearch/document/category.document';
import { ImageDocument } from '@lib/elasticsearch/document/image.document';
import {
  GmcLabelDocument,
  LabelDocument,
} from '@lib/elasticsearch/document/label.document';
import { MerchantDocument } from '@lib/elasticsearch/document/merchant.document';
import { ProductDocument } from '@lib/elasticsearch/document/product.document';
import { ReviewDocument } from '@lib/elasticsearch/document/review.document';
import { ElasticsearchService } from '@lib/elasticsearch/elasticsearch.service';
import { MessagingService } from '@lib/messaging';
import { Injectable, Logger } from '@nestjs/common';
import { IndexProductBatchCommand } from '../messages/index-product-batch.command';
import { IndexProductCommand } from '../messages/index-product.command';
import { ProductStatus } from '../model/enum/product-status.enum';
import { MerchantBrand } from '../model/merchant-brand.entity';
import { MerchantCategory } from '../model/merchant-category.entity';
import { MerchantLabel } from '../model/merchant-label.entity';
import { Merchant } from '../model/merchant.entity';
import { ProductImage } from '../model/product-image.entity';
import { ProductReview } from '../model/product-review.entity';
import { Product } from '../model/product.entity';
import { ProductsService } from './products.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductDocumentsService {
  private readonly logger = new Logger(ProductDocumentsService.name);
  private _indexBatchSize: number;

  constructor(
    private readonly productsService: ProductsService,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly messagingService: MessagingService,
    private readonly configService: ConfigService,
  ) {
    this._indexBatchSize = Number(configService.get('PI_INDEX_BATCH_SIZE'));
  }

  exists(id: string): Promise<boolean> {
    return this.elasticsearchService.existsDocument(id);
  }

  getOne(id: string): Promise<ProductDocument> {
    return this.elasticsearchService.getDocument(id);
  }

  async map(id: string, checkAssignments?: boolean): Promise<ProductDocument> {
    const product = await this.productsService.findOne(id);
    this.logger.debug('product ' + product);
    return await this.mapDocument(product, checkAssignments);
  }

  async indexAsync(id: string) {
    await this.messagingService.sendToQueue(
      new IndexProductCommand({
        productId: id,
      }),
    );
  }

  async index(id: string) {
    try {
      const status = await this.productsService.getCurrentStatus(id);
      if (status === ProductStatus.LIVE) {
        const document = await this.map(id, true);
        await this.elasticsearchService.indexDocument(document.id, document);
        await this.productsService.update(id, {
          indexedAt: new Date(),
          errorMessage: null,
        });
      }
    } catch (e) {
      await this.productsService.update(id, {
        errorMessage: 'Unable to Index - ' + e,
      });
    }
  }

  /* 
    Sends product IDs to queue in batches to be reindexed.
    Returns total number of products sent to queue.
  */
  async indexBatchAsync(findDto: Partial<Product>): Promise<number> {
    findDto.status = ProductStatus.LIVE; // ensure only LIVE products are reindexed
    let total = 0;
    const pageRequest: PageRequest = { skip: 0, take: this._indexBatchSize };
    let page = await this.productsService.findIds(findDto, pageRequest);
    if (page.meta.count > 0) {
      total += page.meta.count;
      await this.messagingService.sendToQueue(
        new IndexProductBatchCommand({
          productIds: page.data.map((p) => p.id),
        }),
      );
    }
    while (pageRequest.skip + pageRequest.take < page.meta.totalCount) {
      pageRequest.skip += this._indexBatchSize;
      console.log('checking: ' + JSON.stringify(pageRequest));
      page = await this.productsService.findIds(findDto, pageRequest);
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

  async indexBatch(productIds: string[]) {
    const products = await this.productsService.findMany(productIds);
    const documentBatch = [];
    const ids = [];
    for (const product of products) {
      try {
        const document = await this.mapDocument(product, true);
        documentBatch.push({
          id: product.shortId,
          ...document,
        });
        ids.push(product.id);
      } catch (e) {
        await this.productsService.update(product.id, {
          errorMessage: 'Unable to Index - ' + e,
        });
      }
    }
    if (documentBatch.length > 0) {
      this.logger.debug(
        `Indexing product batch: ${documentBatch.length} documents`,
      );
      await this.elasticsearchService.bulk(documentBatch);
      // once successful, set indexed date on all updated products
      await this.productsService.updateAll(ids, {
        indexedAt: new Date(),
        errorMessage: null,
      });
    }
  }

  private async mapDocument(
    product: Partial<Product>,
    checkAssignments?: boolean,
  ): Promise<ProductDocument> {
    return {
      id: product.shortId,
      merchantProductCode: product.merchantProductCode,
      sku: product.sku,
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency,
      rating: product.rating,
      ratingsTotal: product.ratingsTotal,
      shippingPrice: product.shippingPrice,
      offerUrl: product.offerUrl,
      // // RELATIONS // //
      brand: this.mapBrandDocument(product.merchantBrand),
      merchant: this.mapMerchantDocument(product.merchant),
      category: this.mapCategoryDocument(
        product.merchantCategory,
        checkAssignments,
      ),
      images: this.mapImageDocuments(product.images),
      reviews: this.mapReviewDocuments(product.reviews),
      labels: this.mapLabelDocuments(product.merchantLabels, checkAssignments),
    };
  }

  private mapReviewDocuments(reviews: ProductReview[]): ReviewDocument[] {
    return reviews.map((review) => ({
      author: review.author,
      text: review.text,
      rating: review.rating,
      submittedOn: review.submittedOn,
    }));
  }

  private mapImageDocuments(images: ProductImage[]): ImageDocument[] {
    return images.map((img) => ({
      url: img.url,
      primary: img.primary,
      type: img.type,
    }));
  }

  private mapBrandDocument(brand: MerchantBrand): BrandDocument {
    return {
      code: brand.merchantBrandCode,
      name: brand.name,
      description: brand.description,
      logo: brand.logo,
      url: brand.url,
    };
  }

  private mapMerchantDocument(merchant: Merchant): MerchantDocument {
    return {
      region: merchant.region,
      key: merchant.key,
      name: merchant.name,
      description: merchant.description,
      logo: merchant.logo,
      url: merchant.url,
    };
  }

  private mapCategoryDocument(
    category: MerchantCategory,
    checkAssignments: boolean,
  ): CategoryDocument {
    let gmcCategory: GmcCategoryDocument = null;

    if (category.gmcCategory) {
      gmcCategory = {
        name: category.gmcCategory.name,
      };

      if (
        category.gmcCategory.parent &&
        category.gmcCategory.parent.name !== 'Root'
      ) {
        gmcCategory = {
          name: category.gmcCategory.parent.name,
          subcategory: gmcCategory,
        };
        if (
          category.gmcCategory.parent.parent &&
          category.gmcCategory.parent.parent.name !== 'Root'
        ) {
          gmcCategory = {
            name: category.gmcCategory.parent.parent.name,
            subcategory: gmcCategory,
          };
        }
      }
    } else if (checkAssignments) {
      throw new Error('GMC Category Unassigned');
    }

    return {
      merchantCategory: category.name,
      gmcCategory,
    };
  }

  private mapLabelDocuments(
    merchantLabels: MerchantLabel[],
    checkAssignments,
  ): LabelDocument[] {
    const documents: LabelDocument[] = [];
    for (const label of merchantLabels) {
      let gmcLabel: GmcLabelDocument = null;
      if (label.gmcLabel) {
        gmcLabel = {
          name: label.gmcLabel.name,
          description: label.gmcLabel.description,
        };
        if (label.gmcLabel.parent && label.gmcLabel.parent.name !== 'Root') {
          gmcLabel = {
            name: label.gmcLabel.parent.name,
            description: label.gmcLabel.parent.description,
            sublabel: gmcLabel,
          };
          if (
            label.gmcLabel.parent.parent &&
            label.gmcLabel.parent.parent.name !== 'Root'
          ) {
            gmcLabel = {
              name: label.gmcLabel.parent.parent.name,
              description: label.gmcLabel.parent.parent.description,
              sublabel: gmcLabel,
            };
          }
        }
      } else if (checkAssignments) {
        throw new Error('GMC Label Unassigned');
      }
      documents.push({
        merchantLabel: {
          code: label.merchantLabelCode,
          name: label.name,
          description: label.description,
          logo: label.logo,
          url: label.url,
        },
        gmcLabel,
      });
    }
    return documents;
  }
}
