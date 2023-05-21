import { ProviderProductDataDto } from '@app/provider-integration/etl/dto/provider-product-data.dto';
import { Channel } from '@app/provider-integration/model/channel.entity';
import { MerchantKey } from '@app/provider-integration/model/enum/merchant-key.enum';
import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { MerchantBrand } from '@app/provider-integration/model/merchant-brand.entity';
import { MerchantCategory } from '@app/provider-integration/model/merchant-category.entity';
import { MerchantLabel } from '@app/provider-integration/model/merchant-label.entity';
import { Merchant } from '@app/provider-integration/model/merchant.entity';
import { ProductImage } from '@app/provider-integration/model/product-image.entity';
import { ProductReview } from '@app/provider-integration/model/product-review.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { normalizeIdCode } from '@app/provider-integration/utils/normalize-id-code';
import { Injectable } from '@nestjs/common';
import { PipelineError } from '../../exception/pipeline.error';
import { Mapper } from '../../mapper/mapper.interface';
import {
  RainforestApiClimatePledgeFriendlyDto,
  RainforestApiImageDto,
  RainforestApiPriceDto,
  RainforestApiProductDto,
  RainforestApiTopReviewDto,
} from './dto/rainforest-api-product.dto';
import { RainforestApiSourceItemDto } from './dto/rainforest-api-source-item.dto';

@Injectable()
export class RainforestApiMapper
  implements Mapper<RainforestApiSourceItemDto, RainforestApiProductDto>
{
  providerKey: ProviderKey = ProviderKey.RAINFOREST_API;

  mapChannelItem(item: RainforestApiSourceItemDto): ProviderProductDataDto {
    try {
      const product: ProviderProductDataDto = {
        merchant: {
          key: MerchantKey.AMAZON_UK,
        } as Merchant,
        merchantProductNumber: item.result.category_results.asin,
        price: Number(item.result.category_results.price.value),
        images: [
          {
            url: item.result.category_results.image,
            type: ProductImageType.LIST,
            primary: true,
          } as ProductImage,
        ],
        offerUrl: item.result.category_results.link,
      };
      return product;
    } catch (err) {
      throw new PipelineError('MAP_ERROR', err);
    }
  }

  mapProductDetail(
    existingProduct: Product,
    rainforestProduct: RainforestApiProductDto,
  ): ProviderProductDataDto {
    try {
      const product: ProviderProductDataDto = {
        sku: rainforestProduct.product.asin,
        title: rainforestProduct.product.title,
        rating: rainforestProduct.product.rating,
        ratingsTotal: rainforestProduct.product.ratings_total,
        offerUrl: rainforestProduct.product.link,
        price: rainforestProduct.product.buybox_winner.price.value,
        shippingPrice: this.mapShippingPrice(
          rainforestProduct.product.buybox_winner.shipping,
        ),
        currency: rainforestProduct.product.buybox_winner.price.currency,
        images: this.mapImages(
          existingProduct.images,
          rainforestProduct.product.images,
        ),
        // mainImage: data.product.main_image.link,
        // secondaryImage: this.mapSecondaryImage(data.product.images),
        description: this.mapDescription(rainforestProduct),
        merchantBrand: this.mapBrand(
          rainforestProduct.product.brand,
        ) as MerchantBrand,
        merchantCategory: this.mapMerchantCategory(
          rainforestProduct.product.categories_flat,
          existingProduct.channel,
        ) as MerchantCategory,
        reviews: this.mapReviews(
          rainforestProduct.product.top_reviews,
        ) as ProductReview[],
        merchantLabels: this.mapMerchantLabels(
          rainforestProduct.climate_pledge_friendly,
        ) as MerchantLabel[],
      };
      return product;
    } catch (err) {
      throw new PipelineError('MAP_ERROR', err);
    }
  }

  private mapImages(
    existingImages: ProductImage[],
    rainforestImages: RainforestApiImageDto[],
  ) {
    const images: ProductImage[] = [];
    if (rainforestImages) {
      rainforestImages.forEach((img, i) => {
        images.push({
          url: img.link,
          type: ProductImageType.DETAIL,
          primary: img.variant === 'MAIN',
        } as ProductImage);
      });
    }
    return images;
  }

  private mapShippingPrice(shipping: RainforestApiPriceDto): any {
    if (shipping && shipping.raw) {
      return shipping.raw === 'FREE' ? 0 : shipping.value;
    } else {
      return null;
    }
  }

  private mapSecondaryImage(images: RainforestApiImageDto[]): string {
    let secImg: RainforestApiImageDto | null = null;
    if (images && images.length) {
      secImg = images.find((img) => img.variant === 'PT01');
      if (!secImg) {
        secImg = images.find((img) => img.variant === 'PT02');
      }
    }
    return secImg ? secImg.link : null;
  }

  private mapDescription(data: RainforestApiProductDto): string {
    if (!data.product.description) {
      if (data.product.feature_bullets && data.product.feature_bullets.length) {
        let dxn = '';
        data.product.feature_bullets.forEach((bullet) => {
          dxn += `${bullet.trim()}\n\n`;
        });
        return dxn.trim();
      } else {
        return null;
      }
    }
    if (data.product.description.endsWith('See more')) {
      data.product.description = data.product.description.slice(0, -9);
    }
    return data.product.description.trim();
  }

  private mapBrand(brandName: string): Partial<MerchantBrand> {
    return {
      code: normalizeIdCode(brandName),
      name: brandName,
    };
  }

  private mapMerchantCategory(
    categoriesFlat: string,
    source: Channel,
  ): Partial<MerchantCategory> {
    if (!categoriesFlat) {
      throw new PipelineError('MAP_ERROR', 'Unable to find product category');
    }
    return {
      code: categoriesFlat
        .split(' > ')
        .slice(0, 3)
        .join('_')
        .toLowerCase() // lowercase only
        .replace(/\&/g, 'and') // spaces -> dashes
        .replace(/\s+/g, '-') // spaces -> dashes
        .replace(/[^a-zA-Z0-9-_]/g, '') // remove non-alphanumeric
        .trim(), // remove whitespace;,
      name: categoriesFlat.split(' > ').slice(0, 3).join(' > '),
    };
  }

  private mapReviews(
    topReviews: RainforestApiTopReviewDto[],
  ): Partial<ProductReview>[] {
    const reviews = !topReviews
      ? []
      : topReviews.map((review) => ({
          author: review.profile ? review.profile.name : null,
          rating: review.rating,
          submittedOn: review.date ? review.date.utc : null,
          text: this.prepareReviewText(review.title, review.body),
        }));
    return reviews.length > 3 ? reviews.slice(0, 5) : reviews;
  }

  private prepareReviewText(title: string, body: string): string {
    if (body && body.length) {
      if (body.endsWith('Read more')) {
        body = body.slice(0, body.length - 9);
      }
      return body.length > 255 ? `${body.slice(0, 252)}...` : body;
    } else {
      return title;
    }
  }

  private mapMerchantLabels(
    climatePledge: RainforestApiClimatePledgeFriendlyDto,
  ): Partial<MerchantLabel>[] {
    return [
      {
        code: normalizeIdCode(climatePledge.text),
        name: climatePledge.text,
        description: climatePledge.text,
        logo: climatePledge.image,
      },
    ];
  }
}
