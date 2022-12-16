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
import { normalizeIdCode } from '@app/provider-integration/utils/normalize-id-code';
import { Injectable } from '@nestjs/common';
import { PipelineError } from '../../shared/exception/pipeline.error';
import { SourceMapper } from '../../shared/mapper/source-mapper.interface';
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
  implements SourceMapper<RainforestApiSourceItemDto, RainforestApiProductDto>
{
  providerKey: ProviderKey = ProviderKey.RAINFOREST_API;

  mapSourceItem(item: RainforestApiSourceItemDto): SourceItemDataDto {
    try {
      const product: SourceItemDataDto = {
        providerProductId: item.result.category_results.asin,
      };
      product.price = Number(item.result.category_results.price.value);
      product.listImage = item.result.category_results.image;
      product.offerLink = item.result.category_results.link;
      return product;
    } catch (err) {
      throw new PipelineError('MAP_ERROR', err);
    }
  }

  mapProductData(
    data: RainforestApiProductDto,
    source: ProductSource,
  ): ProductDataDto {
    try {
      const product: ProductDataDto = {};
      product.sku = data.product.asin;
      product.title = data.product.title;
      product.rating = data.product.rating;
      product.ratingsTotal = data.product.ratings_total;
      product.offerLink = data.product.link;
      product.price = data.product.buybox_winner.price.value;
      product.shippingPrice = this.mapShippingPrice(
        data.product.buybox_winner.shipping,
      );
      product.currency = data.product.buybox_winner.price.currency;
      product.mainImage = data.product.main_image.link;
      product.secondaryImage = this.mapSecondaryImage(data.product.images);
      product.categoryDetail = data.product.categories_flat;
      product.description = this.mapDescription(data);
      product.brand = this.mapBrand(data.product.brand) as Brand;
      product.category = this.mapCategory(source) as Category;
      product.reviews = this.mapReviews(data.product.top_reviews) as Review[];
      product.labels = this.mapLabels(data.climate_pledge_friendly) as Label[];
      return product;
    } catch (err) {
      throw new PipelineError('MAP_ERROR', err);
    }
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

  private mapBrand(brandName: string): Partial<Brand> {
    return {
      code: normalizeIdCode(brandName),
      description: brandName,
    };
  }

  private mapCategory(source: ProductSource): Partial<Category> {
    return {
      code: normalizeIdCode(source.category),
      description: source.description,
    };
  }

  private mapReviews(
    topReviews: RainforestApiTopReviewDto[],
  ): Partial<Review>[] {
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

  private mapLabels(
    climatePledge: RainforestApiClimatePledgeFriendlyDto,
  ): Partial<Label>[] {
    return [
      {
        code: normalizeIdCode(climatePledge.text),
        description: climatePledge.text,
        icon: climatePledge.image,
      },
    ];
  }
}
