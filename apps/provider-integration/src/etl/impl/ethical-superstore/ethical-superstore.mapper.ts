import { Brand } from '@app/provider-integration/model/brand.entity';
import { ProductDataDto } from '@app/provider-integration/model/dto/product-data.dto';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Label } from '@app/provider-integration/model/label.entity';
import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { ProviderCategory } from '@app/provider-integration/model/provider-category.entity';
import { Review } from '@app/provider-integration/model/review.entity';
import { capitalizeWord } from '@app/provider-integration/utils/capitalize-word';
import { normalizeIdCode } from '@app/provider-integration/utils/normalize-id-code';
import { Injectable } from '@nestjs/common';
import { PipelineError } from '../../shared/exception/pipeline.error';
import { Mapper } from '../../shared/mapper/mapper.interface';
import {
  EthicalSuperstoreEthicsAndTagsDto,
  EthicalSuperstoreProductDto,
  EthicalSuperstoreReviewDto,
} from './dto/ethical-superstore-product.dto';
import { EthicalSuperstoreSourceItemDto } from './dto/ethical-superstore-source-item.dto';
import { ETHICAL_SUPERSTORE_BASE_URL } from './ethical-superstore.constants';

@Injectable()
export class EthicalSuperstoreMapper
  implements
    Mapper<EthicalSuperstoreSourceItemDto, EthicalSuperstoreProductDto>
{
  providerKey: ProviderKey = ProviderKey.ETHICAL_SUPERSTORE;

  mapSourceItem(item: EthicalSuperstoreSourceItemDto): ProductDataDto {
    try {
      const product: ProductDataDto = {
        providerProductId: item.id,
      };
      product.price = item.price ? Number(item.price) : null;
      product.listImage = item.image;
      product.offerLink = `${ETHICAL_SUPERSTORE_BASE_URL}${item.href}`;
      return product;
    } catch (err) {
      throw new PipelineError('MAP_ERROR', err);
    }
  }

  mapProductDetail(
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
      product.shippingPrice = product.price > 50 ? 0 : 4.95;
      product.currency = data.productInfo.price.currency;
      product.brand = this.mapBrand(data) as Brand;
      product.providerCategory = this.mapCategory(source) as ProviderCategory;
      product.reviews = this.mapReviews(data.reviews) as Review[];
      product.labels = this.mapLabels(data.ethicsAndTags) as Label[];
      return product;
    } catch (err) {
      throw new PipelineError('MAP_ERROR', err);
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
    const brand = data.productInfo.brand
      ? data.productInfo.brand
      : data.manufacturer.name;
    return {
      code: normalizeIdCode(brand),
      description: brand,
      info: data.manufacturer ? data.manufacturer.description : null,
      logo: data.manufacturer ? data.manufacturer.logo : null,
    };
  }

  private mapCategory(source: ProductSource): Partial<ProviderCategory> {
    return {
      code: source.identifier
        .split('/')
        .map((s) =>
          (s.endsWith('.htm') ? s.slice(0, -3) : s)
            .split('-')
            .map(capitalizeWord)
            .join(' '),
        )
        .join('_')
        .toLowerCase() // lowercase only
        .replace(/\&/g, 'and') // spaces -> dashes
        .replace(/\s+/g, '-') // spaces -> dashes
        .replace(/[^a-zA-Z0-9-_]/g, '') // remove non-alphanumeric
        .trim(), // remove whitespace;,
      description: source.identifier
        .split('/')
        .map((s) =>
          (s.endsWith('.htm') ? s.slice(0, -3) : s)
            .split('-')
            .map(capitalizeWord)
            .join(' '),
        )
        .join(' > '),
    };
  }

  private mapReviews(reviews: EthicalSuperstoreReviewDto[]): Partial<Review>[] {
    return reviews;
  }

  private mapLabels(
    ethicsAndTags: EthicalSuperstoreEthicsAndTagsDto[],
  ): Partial<Label>[] {
    return ethicsAndTags.map((tag) => ({
      code: normalizeIdCode(tag.title),
      description: tag.title,
      infoLink: `${ETHICAL_SUPERSTORE_BASE_URL}${tag.href}`,
      icon: `${ETHICAL_SUPERSTORE_BASE_URL}${tag.icon}`,
    }));
  }
}
