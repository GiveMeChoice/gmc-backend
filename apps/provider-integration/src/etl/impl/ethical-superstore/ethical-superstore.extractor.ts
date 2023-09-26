import { ProviderKey } from '@app/provider-integration/model/enum/provider-key.enum';
import { Channel } from '@app/provider-integration/model/channel.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Element, load } from 'cheerio';
import { lastValueFrom, map, mergeMap, Observable } from 'rxjs';
import { ProductCacheManager } from '../../cache/product-cache.manager';
import { SourceCacheManager } from '../../cache/source-cache.manager';
import { PipelineError } from '../../exception/pipeline.error';
import { ExtractResult } from '../../extractor/extract-result.interface';
import { Extractor } from '../../extractor/extractor.interface';
import { EthicalSuperstoreProductDto } from './dto/ethical-superstore-product.dto';
import { EthicalSuperstoreSourceItemDto } from './dto/ethical-superstore-source-item.dto';
import { ETHICAL_SUPERSTORE_BASE_URL } from './ethical-superstore.constants';

@Injectable()
export class EthicalSuperstoreExtractor
  implements
    Extractor<
      Observable<EthicalSuperstoreSourceItemDto>,
      EthicalSuperstoreProductDto
    >
{
  private readonly logger = new Logger(EthicalSuperstoreExtractor.name);

  providerKey: ProviderKey = ProviderKey.ETHICAL_SUPERSTORE;

  constructor(
    private readonly httpService: HttpService,
    private readonly sourceCacheManager: SourceCacheManager,
    private readonly productCacheManager: ProductCacheManager,
  ) {}

  extractChannel(source: Channel): Observable<EthicalSuperstoreSourceItemDto> {
    try {
      return this.fetchSource(source).pipe(
        map((html) => this.extractItemsFromHtml(html)),
        mergeMap((items) => items),
      );
      // return from(
      //   this.sourceCacheManager.get<EthicalSuperstoreSourceItemDto[]>(source),
      // ).pipe(
      //   switchMap((cachedResponse) => {
      //     return cachedResponse
      //       ? of(cachedResponse.data)
      //       : this.fetchSource(source).pipe(
      //           map((html) => this.extractItemsFromHtml(html)),
      //           tap((items) =>
      //             this.sourceCacheManager.put<EthicalSuperstoreSourceItemDto[]>(
      //               source,
      //               items,
      //             ),
      //           ),
      //         );
      //   }),
      //   mergeMap((items) => items),
      // );
    } catch (err) {
      throw new PipelineError('EXTRACT_ERROR', err);
    }
  }

  private fetchSource(source: Channel): Observable<string> {
    const url = `${ETHICAL_SUPERSTORE_BASE_URL}/products/${source.etlCode1}?limit=100`;
    this.logger.debug(`Fetching source: ${url}`);
    return this.httpService.get<string>(url).pipe(map((res) => res.data));
  }

  private extractItemsFromHtml(html: string): EthicalSuperstoreSourceItemDto[] {
    const $ = load(html);
    const products: EthicalSuperstoreSourceItemDto[] = [];
    $('.cat-listing-wrapper')
      .find('.cat-list--products')
      .each((i, el) => {
        const vpl = $(el).find('.view_product_link').get()[0];
        const imageSource = $(el)
          .find('picture')
          .children('img')
          .first()
          .attr('data-src');
        const atext = $(el).find('form').children('a').first().text();
        products.push({
          href: vpl.attribs['href'],
          id: vpl.attribs['data-product-id'],
          sku: vpl.attribs['data-product-sku'],
          title: vpl.attribs['data-product-name'],
          price: vpl.attribs['data-product-price'],
          brand: vpl.attribs['data-product-brand'],
          category: vpl.attribs['data-product-category'],
          categoryFull: vpl.attribs['data-product-list'],
          inStock: !atext.trim().toLowerCase().includes('out of stock'),
          imageSource: imageSource.startsWith('//')
            ? imageSource.substring(2)
            : imageSource,
        });
      });
    return products;
  }

  async extractProduct(
    product: Product,
    skipCache: boolean,
  ): Promise<ExtractResult<EthicalSuperstoreProductDto>> {
    try {
      let cachedResponse = null;
      if (!skipCache) {
        cachedResponse =
          await this.productCacheManager.get<EthicalSuperstoreProductDto>(
            this.providerKey,
            product.merchantProductCode,
          );
      }
      if (cachedResponse) {
        return {
          sourceDate: cachedResponse.retrievedAt,
          fromCache: true,
          data: cachedResponse.data,
        };
      } else {
        const extractedData = this.extractProductFromHtml(
          product.channel,
          await lastValueFrom(this.fetchProduct(product)),
        );
        this.productCacheManager.put<EthicalSuperstoreProductDto>(
          this.providerKey,
          product.merchantProductCode,
          extractedData,
        );
        return {
          sourceDate: new Date(),
          fromCache: false,
          data: extractedData,
        };
      }
    } catch (err) {
      throw new PipelineError('EXTRACT_ERROR', err);
    }
  }

  private fetchProduct(product: Product): Observable<string> {
    const url = product.offerUrl;
    this.logger.debug(`Fetching Product: ${url}`);
    return this.httpService.get<string>(url).pipe(map((res) => res.data));
  }

  private extractProductFromHtml(
    channel: Channel,
    html: string,
  ): EthicalSuperstoreProductDto {
    try {
      const dto: EthicalSuperstoreProductDto = {
        category: '',
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
            .attr('data-src'),
        });
      });
      // extract product info
      $('nav.breadcrumb')
        .children()
        .last()
        .children('li')
        .each((i, el) => {
          if (
            el.lastChild.type === 'tag' &&
            $(el.lastChild).text() !== 'Home'
          ) {
            dto.category = dto.category
              ? `${dto.category} > ${$(el.lastChild).text()}`
              : $(el.lastChild).text();
          }
        });
      // .children()
      // .each((i, el) => {
      //   dto.category += JSON.stringify(el.attribs);
      // });

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
        url: `${ETHICAL_SUPERSTORE_BASE_URL}/products/${channel.etlCode1}`,
      };

      // $('span[property=manufacturer]')
      //   .first()
      //   .parent()
      //   .next()
      //   .children('p,a')
      //   .each((i, el) => {
      //     dto.manufacturer.url += `${$(el)
      //       .text()
      //       .replace(/\s+/g, ' ')
      //       .trim()}\n`;
      //   });
      // dto.manufacturer.url = dto.manufacturer.url.trim();

      // in stock?
      $('.product-info > span.icon-tick').each((i, el) => {
        if ($(el).text().includes('In Stock')) dto.inStock = true;
      });
      // description
      dto.productInfo.description;
      $('.accordion__content[itemprop=description]')
        .children('p')
        .each((i, el) => {
          dto.productInfo.description += `${$(el)
            .text()
            .replace(/\s+/g, ' ')
            .trim()}\n\n`;
        });
      // .first()
      // .text()
      // .replace(/\s+/g, ' ')
      // .trim();

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
