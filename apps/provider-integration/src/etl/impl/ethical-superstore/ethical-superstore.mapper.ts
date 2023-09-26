import { MerchantBrand } from '@app/provider-integration/model/merchant-brand.entity';
import { ProviderProductDataDto } from '@app/provider-integration/etl/dto/provider-product-data.dto';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { MerchantLabel } from '@app/provider-integration/model/merchant-label.entity';
import { Channel } from '@app/provider-integration/model/channel.entity';
import { MerchantCategory } from '@app/provider-integration/model/merchant-category.entity';
import { ProductReview } from '@app/provider-integration/model/product-review.entity';
import { capitalizeWord } from '@app/provider-integration/utils/capitalize-word';
import { normalizeIdCode } from '@app/provider-integration/utils/normalize-id-code';
import { Injectable, Logger } from '@nestjs/common';
import { PipelineError } from '../../exception/pipeline.error';
import { Mapper } from '../../mapper/mapper.interface';
import {
  EthicalSuperstoreEthicsAndTagsDto,
  EthicalSuperstoreImageDto,
  EthicalSuperstoreProductDto,
  EthicalSuperstoreReviewDto,
} from './dto/ethical-superstore-product.dto';
import { EthicalSuperstoreSourceItemDto } from './dto/ethical-superstore-source-item.dto';
import { ETHICAL_SUPERSTORE_BASE_URL } from './ethical-superstore.constants';
import { MerchantKey } from '@app/provider-integration/model/enum/merchant-key.enum';
import { Merchant } from '@app/provider-integration/model/merchant.entity';
import { ProductImage } from '@app/provider-integration/model/product-image.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { ProductImageType } from '@app/provider-integration/model/enum/product-image-type.enum';

@Injectable()
export class EthicalSuperstoreMapper
  implements
    Mapper<EthicalSuperstoreSourceItemDto, EthicalSuperstoreProductDto>
{
  private readonly logger = new Logger(EthicalSuperstoreMapper.name);

  providerKey: ProviderKey = ProviderKey.ETHICAL_SUPERSTORE;

  mapChannelItem(item: EthicalSuperstoreSourceItemDto): ProviderProductDataDto {
    try {
      const product: ProviderProductDataDto = {
        merchant: {
          key: MerchantKey.ETHICAL_SUPERSTORE,
        } as Merchant,
        merchantProductCode: item.id,
        sku: item.sku,
        title: item.title,
        price: item.price ? Number(item.price) : null,
        images: [
          {
            url: item.imageSource,
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
    existingProduct: Product,
    ethicalSuperstoreProduct: EthicalSuperstoreProductDto,
  ): ProviderProductDataDto {
    try {
      const product: ProviderProductDataDto = {};
      // product.sku = this.mapSku(ethicalSuperstoreProduct);
      product.title = ethicalSuperstoreProduct.productInfo.title;
      product.description = ethicalSuperstoreProduct.productInfo.description
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

      product.rating = ethicalSuperstoreProduct.rating;
      product.ratingsTotal = ethicalSuperstoreProduct.reviewCount;
      product.price = ethicalSuperstoreProduct.productInfo.price.price;
      product.shippingPrice = product.price > 50 ? 0 : 4.95;
      product.currency = ethicalSuperstoreProduct.productInfo.price.currency;
      product.merchantBrand = this.mapMerchantBrand(
        existingProduct.channel,
        ethicalSuperstoreProduct,
      ) as MerchantBrand;
      product.merchantCategory = this.mapMerchantCategory(
        ethicalSuperstoreProduct,
      ) as MerchantCategory;
      product.reviews = this.mapReviews(
        ethicalSuperstoreProduct.reviews,
      ) as ProductReview[];
      product.merchantLabels = this.mapMerchantLabels(
        ethicalSuperstoreProduct.ethicsAndTags,
      ) as MerchantLabel[];
      product.images = this.mapImages(
        existingProduct.images,
        ethicalSuperstoreProduct.images,
      );
      return product;
    } catch (err) {
      throw new PipelineError('MAP_ERROR', err);
    }
  }

  private mapImages(
    existingImages: ProductImage[],
    rainforestImages: EthicalSuperstoreImageDto[],
  ): ProductImage[] {
    const images: ProductImage[] = [];
    // preserve list images from channel mapping
    this.logger.debug(JSON.stringify(existingImages));
    existingImages &&
      existingImages.forEach((img) => {
        if (img.type === ProductImageType.LIST) {
          images.push(img);
        }
      });
    // (re)add all detail images
    rainforestImages &&
      rainforestImages.forEach((img) => {
        images.push({
          url: img.url,
          type: ProductImageType.DETAIL,
          primary: img.isPrimary,
        } as ProductImage);
      });
    return images;
  }

  // private mapSku(data: EthicalSuperstoreProductDto): string {
  //   const splits = data.productInfo.productCodeText.split(':');
  //   return splits.length > 1 && !isNaN(splits[1].trim() as unknown as number)
  //     ? splits[1].trim()
  //     : null;
  // }

  private mapMerchantBrand(
    channel: Channel,
    data: EthicalSuperstoreProductDto,
  ): Partial<MerchantBrand> {
    return {
      merchantBrandCode: normalizeIdCode(channel.etlCode1),
      name: channel.etlCode1,
      url: data.manufacturer.url,
      logo: data.manufacturer.logo,
    };
  }

  private mapMerchantCategory(
    data: EthicalSuperstoreProductDto,
  ): Partial<MerchantCategory> {
    return {
      merchantCategoryCode: data.category
        .split('>')
        .map((s) => s.trim().split('-').map(capitalizeWord).join(' '))
        .join('_')
        .toLowerCase() // lowercase only
        .replace(/\&/g, 'and') // spaces -> dashes
        .replace(/\s+/g, '-') // spaces -> dashes
        .replace(/[^a-zA-Z0-9-_]/g, '') // remove non-alphanumeric
        .trim(), // remove whitespace;,
      name: data.category,
    };
  }

  private mapReviews(
    reviews: EthicalSuperstoreReviewDto[],
  ): Partial<ProductReview>[] {
    return reviews;
  }

  private mapMerchantLabels(
    ethicsAndTags: EthicalSuperstoreEthicsAndTagsDto[],
  ): Partial<MerchantLabel>[] {
    return ethicsAndTags.map((tag) => ({
      merchantLabelCode: normalizeIdCode(tag.title),
      name: tag.title,
      description: tag.title,
      url: `${ETHICAL_SUPERSTORE_BASE_URL}${tag.href}`,
      logo: `${ETHICAL_SUPERSTORE_BASE_URL}${tag.icon}`,
    }));
  }
}
