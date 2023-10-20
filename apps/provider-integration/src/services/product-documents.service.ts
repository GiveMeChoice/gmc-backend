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
import { ConfigService } from '@nestjs/config';
import { FindProductsDto } from '../api/dto/find-products.dto';
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
import { ProductImageType } from '../model/enum/product-image-type.enum';

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
        this.logger.debug('document : ' + document);
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
  async indexBatchAsync(findDto: FindProductsDto): Promise<number> {
    findDto.status = ProductStatus.LIVE; // ensure only LIVE products are reindexed
    let total = 0;
    const pageRequest: PageRequest = { skip: 0, take: this._indexBatchSize };
    this.logger.debug('Attempting Index with DTO ' + JSON.stringify(findDto));
    let page = await this.productsService.find(findDto, pageRequest, true);
    if (page.meta.count > 0) {
      total += page.meta.count;
      await this.messagingService.sendToQueue(
        new IndexProductBatchCommand({
          productIds: page.data.map((p) => p.id),
        }),
      );
    } else {
      this.logger.debug('No Products Found For Index :(');
    }
    while (pageRequest.skip + pageRequest.take < page.meta.totalCount) {
      pageRequest.skip += this._indexBatchSize;
      console.log('checking: ' + JSON.stringify(pageRequest));
      page = await this.productsService.find(findDto, pageRequest, true);
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
    this.logger.debug(
      `Indexing product batch: ${documentBatch.length} documents from ${productIds.length} Ids`,
    );
    if (documentBatch.length > 0) {
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
    this.logger.debug('mapping');
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
      labels: this.mapLabelDocuments(product.merchantLabels, false),
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
    let detailImages = images.filter(
      (img) => img.type === ProductImageType.LIST,
    );
    if (detailImages.length === 0 && images.length > 0) {
      detailImages = [images[0]];
    }
    return detailImages.map((img) => ({
      url: img.url,
      primary: img.primary,
      type: img.type,
    }));
  }

  private mapBrandDocument(brand: MerchantBrand): BrandDocument {
    this.logger.debug('brand' + JSON.stringify(brand));
    if (!brand.gmcBrand) {
      throw new Error('GMC Brand Unassigned');
    }
    return {
      merchantCode: brand.merchantBrandCode,
      name: brand.gmcBrand.name,
      // description: brand.gmcBrand.description,
      // logo: brand.gmcBrand.logo,
      // url: brand.gmcBrand.url,
      slug: brand.gmcBrand.slug,
    };
  }

  private mapMerchantDocument(merchant: Merchant): MerchantDocument {
    this.logger.debug('merchant');

    return {
      region: merchant.region,
      key: merchant.key,
      name: merchant.name,
      // description: merchant.description,
      // logo: merchant.logo,
      // url: merchant.url,
    };
  }

  private mapCategoryDocument(
    category: MerchantCategory,
    checkAssignments: boolean,
  ): CategoryDocument {
    this.logger.debug('category');
    let gmcCategory: GmcCategoryDocument = null;

    if (category.gmcCategory) {
      gmcCategory = {
        name: category.gmcCategory.name,
        slug: category.gmcCategory.slug,
        // description: category.gmcCategory.description,
      };

      if (
        category.gmcCategory.parent &&
        category.gmcCategory.parent.name !== 'Root'
      ) {
        gmcCategory = {
          name: category.gmcCategory.parent.name,
          slug: category.gmcCategory.parent.slug,
          // description: category.gmcCategory.parent.description,
          subcategory: gmcCategory,
        };
        if (
          category.gmcCategory.parent.parent &&
          category.gmcCategory.parent.parent.name !== 'Root'
        ) {
          gmcCategory = {
            name: category.gmcCategory.parent.parent.name,
            slug: category.gmcCategory.parent.parent.slug,
            // description: category.gmcCategory.parent.parent.description,
            subcategory: gmcCategory,
          };
        }
      }
    } else if (checkAssignments) {
      throw new Error('Category Not Assigned');
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
    this.logger.debug('labels');

    const labelDocuments: LabelDocument[] = [];
    for (const label of merchantLabels) {
      let gmcLabel: GmcLabelDocument = null;
      if (label.gmcLabel) {
        gmcLabel = {
          slug: label.gmcLabel.slug,
          name: label.gmcLabel.name,
          // description: label.gmcLabel.description,
        };
        if (label.gmcLabel.parent && label.gmcLabel.parent.name !== 'Root') {
          gmcLabel = {
            slug: label.gmcLabel.parent.slug,
            name: label.gmcLabel.parent.name,
            // description: label.gmcLabel.parent.description,
            sublabel: gmcLabel,
          };
          if (
            label.gmcLabel.parent.parent &&
            label.gmcLabel.parent.parent.name !== 'Root'
          ) {
            gmcLabel = {
              slug: label.gmcLabel.parent.parent.slug,
              name: label.gmcLabel.parent.parent.name,
              // description: label.gmcLabel.parent.parent.description,
              sublabel: gmcLabel,
            };
          }
        }
        labelDocuments.push({
          merchantLabel: {
            code: label.merchantLabelCode,
            name: label.name,
            // description: label.description,
            // logo: label.logo,
            // url: label.url,
          },
          gmcLabel,
        });
      } else if (checkAssignments) {
        throw new Error('GMC Label Unassigned');
      }
    }
    if (labelDocuments.length === 0)
      throw new Error("At Least 1 Label Must Be Mapped... C'mon man!");
    return labelDocuments;
  }
}
