import { Brand } from '@app/provider-integration/model/brand.entity';
import { Category } from '@app/provider-integration/model/category.entity';
import {
  ProductDataDto,
  SourceItemDataDto,
} from '@app/provider-integration/model/dto/product-data.dto';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Label } from '@app/provider-integration/model/label.entity';
import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { Review } from '@app/provider-integration/model/review.entity';
import { capitalizeWord } from '@app/provider-integration/utils/capitalize-word';
import { Injectable } from '@nestjs/common';
import { PipelineError } from '../../shared/exception/pipeline.error';
import { SourceTransformer } from '../../shared/transformer/transformer.interface';
import {
  EthicalSuperstoreEthicsAndTagsDto,
  EthicalSuperstoreProductDto,
  EthicalSuperstoreReviewDto,
} from './dto/ethical-superstore-product.dto';
import { EthicalSuperstoreSourceItemDto } from './dto/ethical-superstore-source-item.dto';
import { ETHICAL_SUPERSTORE_BASE_URL } from './ethical-superstore.constants';

@Injectable()
export class EthicalSuperstoreTransformer
  implements
    SourceTransformer<
      EthicalSuperstoreSourceItemDto,
      EthicalSuperstoreProductDto
    >
{
  providerKey: ProviderKey = ProviderKey.ETHICAL_SUPERSTORE;

  mapSourceItem(item: EthicalSuperstoreSourceItemDto): SourceItemDataDto {
    try {
      const product: SourceItemDataDto = {
        providerProductId: item.id,
      };
      product.price = item.price ? Number(item.price) : null;
      product.listImage = item.image;
      product.offerLink = `${ETHICAL_SUPERSTORE_BASE_URL}${item.href}`;
      return product;
    } catch (err) {
      throw new PipelineError('TRANSFORM_ERROR', err);
    }
  }

  mapProductData(
    data: EthicalSuperstoreProductDto,
    source: ProductSource,
  ): ProductDataDto {
    try {
      const product: ProductDataDto = {
        ...this.mapImages(data),
      };
      product.sku = this.mapSku(data);

      product.title = data.productInfo.title;
      product.description = data.productInfo.description
        .replace('�', '')
        .replace('�', '')
        .replace('�', '')
        .replace('�', '')
        .replace('�', '')
        .replace('���', '•')
        .replace('����', '•')
        .replace('����', '•')
        .replace('����', '•')
        .replace('����', '•')
        .replace('����', '•');

      product.rating = data.rating;
      product.ratingsTotal = data.reviewCount;
      product.price = data.productInfo.price.price;
      product.currency = data.productInfo.price.currency;

      product.categoryDetail = source.identifier
        .split('/')
        .map((s) =>
          (s.endsWith('.htm') ? s.slice(0, -3) : s)
            .split('-')
            .map(capitalizeWord)
            .join(' '),
        )
        .join(' > ');
      product.brand = this.mapBrand(data) as Brand;
      product.category = this.mapCategory(source) as Category;
      product.reviews = this.mapReviews(data.reviews) as Review[];
      product.labels = this.mapLabels(data.ethicsAndTags) as Label[];
      return product;
    } catch (err) {
      throw new PipelineError('TRANSFORM_ERROR', err);
    }
  }

  private mapImages(data: EthicalSuperstoreProductDto): ProductDataDto {
    const primary = data.images.find((img) => img.isPrimary);
    const secondary = data.images.find((img) => !img.isPrimary);
    return {
      mainImage: primary ? primary.url : null,
      secondaryImage: secondary ? secondary.url : null,
    };
  }

  private mapSku(data: EthicalSuperstoreProductDto): string {
    const splits = data.productInfo.productCodeText.split(':');
    return splits.length > 1 && !isNaN(splits[1].trim() as unknown as number)
      ? splits[1].trim()
      : null;
  }

  private mapBrand(data: EthicalSuperstoreProductDto): Partial<Brand> {
    return {
      title: data.productInfo.brand,
      logo: data.manufacturer ? data.manufacturer.logo : null,
      description: data.manufacturer ? data.manufacturer.description : null,
    };
  }

  private mapCategory(source: ProductSource): Partial<Category> {
    return {
      title: source.category,
      description: source.category.split('-').map(capitalizeWord).join(' '),
    };
  }

  private mapReviews(reviews: EthicalSuperstoreReviewDto[]): Partial<Review>[] {
    return reviews;
  }

  private mapLabels(
    ethicsAndTags: EthicalSuperstoreEthicsAndTagsDto[],
  ): Partial<Label>[] {
    return ethicsAndTags.map((tag) => ({
      title: tag.title,
      infoLink: `${ETHICAL_SUPERSTORE_BASE_URL}${tag.href}`,
      icon: `${ETHICAL_SUPERSTORE_BASE_URL}${tag.icon}`,
    }));
  }
}
