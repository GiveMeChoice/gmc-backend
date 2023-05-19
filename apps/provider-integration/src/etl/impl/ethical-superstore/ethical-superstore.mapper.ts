import { MerchantBrand } from '@app/provider-integration/model/merchant-brand.entity';
import { ProviderProductDataDto } from '@app/provider-integration/etl/dto/provider-product-data.dto';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { MerchantLabel } from '@app/provider-integration/model/merchant-label.entity';
import { Channel } from '@app/provider-integration/model/channel.entity';
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
import { ProductImage } from '@app/provider-integration/model/product-image.entity';

@Injectable()
export class EthicalSuperstoreMapper
  implements
    Mapper<EthicalSuperstoreSourceItemDto, EthicalSuperstoreProductDto>
{
  providerKey: ProviderKey = ProviderKey.ETHICAL_SUPERSTORE_WEB;

  mapChannelItem(item: EthicalSuperstoreSourceItemDto): ProviderProductDataDto {
    try {
      const product: ProviderProductDataDto = {
        merchant: {
          key: MerchantKey.ETHICAL_SUPERSTORE,
        } as Merchant,
        merchantProductNumber: item.id,
        price: item.price ? Number(item.price) : null,
        images: [
          {
            url: item.image,
            type: ProductImageType.LIST,
            primary: true,
          } as ProductImage,
        ],
        offerUrl: `${ETHICAL_SUPERSTORE_BASE_URL}${item.href}`,
      };
      return product;
    } catch (err) {
      throw new PipelineError('MAP_ERROR', err);
    }
  }

  mapProductDetail(
    data: EthicalSuperstoreProductDto,
    source: Channel,
  ): ProviderProductDataDto {
    try {
      const product: ProviderProductDataDto = {};
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
      product.images.concat(this.mapImages(data));
      return product;
    } catch (err) {
      throw new PipelineError('MAP_ERROR', err);
    }
  }

  private mapImages(data: EthicalSuperstoreProductDto): ProductImage[] {
    const detailImages = [];
    const primary = data.images.find((img) => img.isPrimary);
    if (primary) {
      detailImages.push({
        url: primary.url,
        type: ProductImageType.DETAIL,
        primary: true,
      } as ProductImage);
    }
    data.images
      .filter((img) => !img.isPrimary)
      .forEach((secondaryImage) => {
        detailImages.push({
          url: secondaryImage.url,
          type: ProductImageType.LIST,
          primary: false,
        } as ProductImage);
      });
    return detailImages;
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

  private mapCategory(source: Channel): Partial<MerchantCategory> {
    return {
      code: source.miscCode1
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
      description: source.miscCode1
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
