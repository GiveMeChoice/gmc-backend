import { MerchantBrand } from '@app/provider-integration/model/merchant-brand.entity';
import { ProviderProductDataDto } from '@app/provider-integration/etl/dto/provider-product-data.dto';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { MerchantLabel } from '@app/provider-integration/model/merchant-label.entity';
import { ProviderSource } from '@app/provider-integration/model/provider-source.entity';
import { MerchantCategory } from '@app/provider-integration/model/merchant-category.entity';
import { ProductReview } from '@app/provider-integration/model/product-review.entity';
import { capitalizeWord } from '@app/provider-integration/utils/capitalize-word';
import { normalizeIdCode } from '@app/provider-integration/utils/normalize-id-code';
import { Injectable } from '@nestjs/common';
import { PipelineError } from '../../exception/pipeline.error';
import { Mapper } from '../../mapper/mapper.interface';
import {
  EthicalSuperstoreEthicsAndTagsDto,
  EthicalSuperstoreProductDto,
  EthicalSuperstoreReviewDto,
} from './dto/ethical-superstore-product.dto';
import { EthicalSuperstoreSourceItemDto } from './dto/ethical-superstore-source-item.dto';
import { ETHICAL_SUPERSTORE_BASE_URL } from './ethical-superstore.constants';
import { MerchantKey } from '@app/provider-integration/model/enum/merchant-key.enum';
import { Merchant } from '@app/provider-integration/model/merchant.entity';

@Injectable()
export class EthicalSuperstoreMapper
  implements
    Mapper<EthicalSuperstoreSourceItemDto, EthicalSuperstoreProductDto>
{
  providerKey: ProviderKey = ProviderKey.ETHICAL_SUPERSTORE_WEB;

  mapSourceItem(item: EthicalSuperstoreSourceItemDto): ProviderProductDataDto {
    try {
      const product: ProviderProductDataDto = {
        merchant: {
          key: MerchantKey.ETHICAL_SUPERSTORE,
        } as Merchant,
        merchantProductId: item.id,
        price: item.price ? Number(item.price) : null,
        listImage: item.image,
        offerLink: `${ETHICAL_SUPERSTORE_BASE_URL}${item.href}`,
      };
      return product;
    } catch (err) {
      throw new PipelineError('MAP_ERROR', err);
    }
  }

  mapProductDetail(
    data: EthicalSuperstoreProductDto,
    source: ProviderSource,
  ): ProviderProductDataDto {
    try {
      const product: ProviderProductDataDto = {
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
      product.merchantBrand = this.mapBrand(data) as MerchantBrand;
      product.merchantCategory = this.mapCategory(source) as MerchantCategory;
      product.reviews = this.mapReviews(data.reviews) as ProductReview[];
      product.merchantLabels = this.mapLabels(
        data.ethicsAndTags,
      ) as MerchantLabel[];
      return product;
    } catch (err) {
      throw new PipelineError('MAP_ERROR', err);
    }
  }

  private mapImages(data: EthicalSuperstoreProductDto): ProviderProductDataDto {
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

  private mapBrand(data: EthicalSuperstoreProductDto): Partial<MerchantBrand> {
    const brand = data.productInfo.brand
      ? data.productInfo.brand
      : data.manufacturer.name;
    return {
      code: normalizeIdCode(brand),
      name: brand,
      description: data.manufacturer ? data.manufacturer.description : null,
      logoUrl: data.manufacturer ? data.manufacturer.logo : null,
    };
  }

  private mapCategory(source: ProviderSource): Partial<MerchantCategory> {
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

  private mapReviews(
    reviews: EthicalSuperstoreReviewDto[],
  ): Partial<ProductReview>[] {
    return reviews;
  }

  private mapLabels(
    ethicsAndTags: EthicalSuperstoreEthicsAndTagsDto[],
  ): Partial<MerchantLabel>[] {
    return ethicsAndTags.map((tag) => ({
      code: normalizeIdCode(tag.title),
      name: tag.title,
      description: tag.title,
      infoLink: `${ETHICAL_SUPERSTORE_BASE_URL}${tag.href}`,
      icon: `${ETHICAL_SUPERSTORE_BASE_URL}${tag.icon}`,
    }));
  }
}
