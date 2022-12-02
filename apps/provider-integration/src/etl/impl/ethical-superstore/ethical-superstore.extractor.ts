import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Element, load } from 'cheerio';
import { from, map, mergeMap, Observable, of, switchMap, tap } from 'rxjs';
import { ProductCacheManager } from '../../shared/cache/product-cache.manager';
import { SourceCacheManager } from '../../shared/cache/source-cache.manager';
import { PipelineError } from '../../shared/exception/pipeline.error';
import { Extractor } from '../../shared/extractor/extractor.interface';
import { EthicalSuperstoreProductDto } from './dto/ethical-superstore-product.dto';
import { EthicalSuperstoreSourceItemDto } from './dto/ethical-superstore-source-item.dto';

@Injectable()
export class EthicalSuperstoreExtractor
  implements
    Extractor<
      Observable<EthicalSuperstoreSourceItemDto>,
      Observable<EthicalSuperstoreProductDto>
    >
{
  public static readonly BASE_URL = 'https://www.ethicalsuperstore.com';
  providerKey: ProviderKey = ProviderKey.ETHICAL_SUPERSTORE;

  constructor(
    private readonly httpService: HttpService,
    private readonly sourceCacheManager: SourceCacheManager,
    private readonly productCacheManager: ProductCacheManager,
  ) {}

  extractSource(
    source: ProductSource,
  ): Observable<EthicalSuperstoreSourceItemDto> {
    try {
      return from(
        this.sourceCacheManager.get<EthicalSuperstoreSourceItemDto[]>(source),
      ).pipe(
        switchMap((cachedResponse) => {
          return cachedResponse
            ? of(cachedResponse.data)
            : this.fetchSource(source).pipe(
                map((html) => this.extractItemsFromHtml(html)),
                tap((items) =>
                  this.sourceCacheManager.put<EthicalSuperstoreSourceItemDto[]>(
                    source,
                    items,
                  ),
                ),
              );
        }),
        mergeMap((items) => items),
      );
    } catch (err) {
      throw new PipelineError('EXTRACT_ERROR', err);
    }
  }

  private fetchSource(source: ProductSource): Observable<string> {
    const url = `${EthicalSuperstoreExtractor.BASE_URL}/category/${source.identifier}?limit=192`;
    Logger.debug(`Fetching source: ${url}`);
    return this.httpService.get<string>(url).pipe(map((res) => res.data));
  }

  private extractItemsFromHtml(html: string): EthicalSuperstoreSourceItemDto[] {
    const $ = load(html);
    const products = [];
    $('.cat-listing-wrapper')
      .find('.media__body')
      .find('.view_product_link')
      .each((i, p) => {
        const src = $(`#p_img_${p.attribs['data-product-id']}`).attr('src');
        p.attribs['img-src'] = src;
        products.push(p);
      });
    return products.map(this.mapItemToDto);
  }

  private mapItemToDto(element: Element): EthicalSuperstoreSourceItemDto {
    return {
      href: element.attribs['href'],
      id: element.attribs['data-product-id'],
      sku: element.attribs['data-product-sku'],
      name: element.attribs['data-product-name'],
      price: element.attribs['data-product-price'],
      brand: element.attribs['data-product-brand'],
      category: element.attribs['data-product-category'],
      list: element.attribs['data-product-list'],
      image: element.attribs['img-src'],
    };
  }

  extractProduct(
    product: Product,
    skipCache: boolean,
  ): Observable<EthicalSuperstoreProductDto> {
    try {
      return from(
        skipCache
          ? null
          : this.productCacheManager.get<EthicalSuperstoreProductDto>(
              this.providerKey,
              product.providerProductId,
            ),
      ).pipe(
        switchMap((cachedResponse) => {
          return cachedResponse
            ? of(cachedResponse.data)
            : this.fetchProduct(product).pipe(
                map((html) => this.extractProductFromHtml(html)),
                tap((extractedProduct) => {
                  this.productCacheManager.put<EthicalSuperstoreProductDto>(
                    this.providerKey,
                    product.providerProductId,
                    extractedProduct,
                  );
                }),
              );
        }),
      );
    } catch (err) {
      throw new PipelineError('EXTRACT_ERROR', err);
    }
  }

  private fetchProduct(product: Product): Observable<string> {
    const url = product.link;
    Logger.debug(`Fetching Product: ${url}`);
    return this.httpService.get<string>(url).pipe(map((res) => res.data));
  }

  private extractProductFromHtml(html: string): EthicalSuperstoreProductDto {
    try {
      const dto: EthicalSuperstoreProductDto = {
        images: [],
        ethicsAndTags: [],
        reviews: [],
      };
      const $ = load(html);
      // extract images
      const primaryImage = $('a#product-image').first().attr('href');
      $('.product-thumbnails > a').each((i, thumbnail) => {
        dto.images.push({
          url: thumbnail.attribs['href'],
          isPrimary: thumbnail.attribs['href'] === primaryImage,
        });
      });
      if (dto.images.length === 0 && primaryImage) {
        dto.images.push({
          url: primaryImage,
          isPrimary: true,
        });
      }
      // extract ethics-tags
      $('.ethics-tag-list__item').each((i, tagItem) => {
        dto.ethicsAndTags.push({
          title: $(tagItem)
            .find('.ethics-tag-list__item-img')
            .first()
            .attr('alt'),
          href: $(tagItem).children('a').first().attr('href'),
          icon: $(tagItem)
            .find('.ethics-tag-list__item-img')
            .first()
            .attr('src'),
        });
      });
      // extract product info
      dto.productInfo = {
        id: $('button[name=add_to_cart]').first().attr('data-product-id'),
        description: '',
        brand: $('button[name=add_to_cart]').first().attr('data-product-brand'),
        title: $('.product-details__title > span').text(),
        productCollectionHref: $('.product-details__code > h2')
          .children()
          .first()
          .attr('href'),
        productCodeText: $('.product-details__code > b').text(),
        price: {
          price: Number(
            $('.product-details__price > span[itemprop=price]').attr('content'),
          ),
          currency: $(
            '.product-details__price > span[itemprop=priceCurrency]',
          ).attr('content'),
        },
      };
      // rating/reviews
      $('div[itemprop=aggregateRating]')
        .children('span')
        .each((i, el) => {
          if (el.attribs['itemprop'] === 'ratingValue') {
            dto.rating = Number($(el).text());
          } else if (el.attribs['itemprop'] === 'reviewCount') {
            dto.reviewCount = Number($(el).text());
          }
        });
      if (dto.reviewCount > 0) {
        $('#customer-reviews')
          .next('div')
          .children('.review')
          .each((i, el) => {
            dto.reviews.push({
              author: $(el).find('[itemprop=name]').first().text(),
              submittedOn: new Date(
                $(el).find('[itemprop=datePublished]').first().attr('content'),
              ),
              rating: Number(
                $(el).find('span[itemprop=ratingValue]').first().text(),
              ),
              text: $(el).find('.review-text').first().text().trim(),
            });
          });
      }
      // manufacturer
      dto.manufacturer = {
        name: $('span[property=manufacturer]').first().text().trim(),
        logo: $('span[property=manufacturer]')
          .first()
          .parent()
          .next()
          .children('img')
          .first()
          .attr('src'),
        description: '',
      };
      $('span[property=manufacturer]')
        .first()
        .parent()
        .next()
        .children('p,a')
        .each((i, el) => {
          dto.manufacturer.description += `${$(el)
            .text()
            .replace(/\s+/g, ' ')
            .trim()}\n`;
        });
      dto.manufacturer.description = dto.manufacturer.description.trim();
      // in stock?
      $('.product-info > span.icon-tick').each((i, el) => {
        if ($(el).text().includes('In Stock')) dto.inStock = true;
      });
      // description
      dto.productInfo.description = $(
        '.accordion__content[itemprop=description]',
      )
        .first()
        .text()
        .replace(/\s+/g, ' ')
        .trim();

      // $('.accordion__content[itemprop=description]')
      //   .first()
      //   .add('.accordion__content[itemprop=description] > p')
      //   .each((i, el) => {
      //     dto.productInfo.description += `${$(el)
      //       .text()
      //       .replace(/\s+/g, ' ')
      //       .trim()}\n`;
      //   });
      dto.productInfo.description = dto.productInfo.description.trim();
      return dto;
    } catch (err) {
      throw new PipelineError('EXTRACT_ERROR', err);
    }
  }
}
