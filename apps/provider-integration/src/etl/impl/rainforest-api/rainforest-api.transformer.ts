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
import { Injectable } from '@nestjs/common';
import { PipelineError } from '../../shared/exception/pipeline.error';
import { SourceTransformer } from '../../shared/transformer/transformer.interface';
import {
  RainforestApiClimatePledgeFriendlyDto,
  RainforestApiImageDto,
  RainforestApiProductDto,
  RainforestApiTopReviewDto,
} from './dto/rainforest-api-product.dto';
import { RainforestApiSourceItemDto } from './dto/rainforest-api-source-item.dto';

@Injectable()
export class RainforestApiTransformer
  implements
    SourceTransformer<RainforestApiSourceItemDto, RainforestApiProductDto>
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
      throw new PipelineError('TRANSFORM_ERROR', err);
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
      product.currency = data.product.buybox_winner.price.currency;
      product.mainImage = data.product.main_image.link;
      product.secondaryImage = this.mapSecondaryImage(data.product.images);
      product.categoryDetail = data.product.categories_flat;
      product.description = this.mapDescription(data.product.description);
      product.brand = this.mapBrand(data.product.brand) as Brand;
      product.category = this.mapCategory(source) as Category;
      product.reviews = this.mapReviews(data.product.top_reviews) as Review[];
      product.labels = this.mapLabels(data.climate_pledge_friendly) as Label[];
      return product;
    } catch (err) {
      throw new PipelineError('TRANSFORM_ERROR', err);
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

  private mapDescription(description: string): string {
    if (!description) {
      return null;
    }
    if (description.endsWith('See more')) {
      description = description.slice(0, -9);
    }
    return description.trim();
  }

  private mapBrand(brand: string): Partial<Brand> {
    return {
      title: brand,
    };
  }

  private mapCategory(source: ProductSource): Partial<Category> {
    return {
      title: source.category,
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
        title: climatePledge.text,
        icon: climatePledge.image,
      },
    ];
  }
}
