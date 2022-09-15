import { ProductsService } from '@lib/products';
import { Product } from '@lib/products/model/product.entity';
import { ProviderSource } from '@app/provider-integration/providers/model/provider-source.entity';
import { Inject, Injectable, Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import { ProviderKey } from '../../../providers/model/enum/provider-key.enum';
import {
  EXTRACTOR_FACTORY,
  TRANSFORMER_FACTORY,
} from '../../constants/integration.tokens';
import { PipelineResult } from '../../model/pipeline-result.entity';
import { ExtractorFactory } from '../../shared/extract/extractor.factory';
import { PipelineRunnerBase } from '../../shared/runner/pipeline-runner.base';
import { TransformerFactory } from '../../shared/transform/transformer.factory';
import { RainforestCategoryItem } from './dto/rainforest-category-item.dto';
import { RainforestExtractor } from './rainforest.extractor';
import { RainforestTransformer } from './rainforest.transformer';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import {
  DEFAULT_EXCHANGE,
  PRODUCT_REFRESH_QUEUE,
} from '@lib/messaging/messaging.constants';

@Injectable()
export class RainforestRunner extends PipelineRunnerBase {
  providerKey: ProviderKey = ProviderKey.RAINFOREST_API;
  extractor: RainforestExtractor;
  transformer: RainforestTransformer;

  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly productsService: ProductsService,
    @Inject(EXTRACTOR_FACTORY) extractorFactory: ExtractorFactory,
    @Inject(TRANSFORMER_FACTORY) transformerFactory: TransformerFactory,
  ) {
    super();
    this.extractor = extractorFactory.getExtractor(
      this.providerKey,
    ) as RainforestExtractor;
    this.transformer = transformerFactory.getTransformer(
      this.providerKey,
    ) as RainforestTransformer;
    Logger.debug(this.extractor);
    Logger.debug(this.transformer);
  }

  async runListPipelineInternal(
    source: ProviderSource,
  ): Promise<Partial<PipelineResult>> {
    let productsFound = 0,
      productsLoaded = 0;
    for (let i = 0; i < 1000; i++) {
      productsFound++;
      productsLoaded++;
      await this.amqpConnection.publish(
        DEFAULT_EXCHANGE,
        'pi.product.created',
        {
          productsFound,
        },
      );
      Logger.debug(`Creating product: ${productsFound}`);
    }
    // await csv()
    //   .fromStream(
    //     // Extract
    //     await this.extractor.extractSource(source),
    //   )
    //   .subscribe(async (item: RainforestCategoryItem, lineNumber) => {
    //     // Transform
    //     Logger.debug(lineNumber);
    //     productsFound++;
    //     Logger.debug(JSON.stringify(item));
    //     const product = this.transformer.fromSourceItem(item);
    //     // Load
    //     const existing = await this.productsService.findByProviderId(
    //       source.provider.id,
    //       product.providerProductId,
    //     );
    //     if (!existing) {
    //       product.providerId = source.provider.id;
    //       const created = await this.productsService.create(product);
    //       productsLoaded++;
    //       Logger.debug(`Product ${product.providerProductId} created`);
    //       this.refresh(created);
    //     }
    //   });
    return {
      productsFound,
      productsLoaded,
    };
  }

  @RabbitSubscribe({
    exchange: DEFAULT_EXCHANGE,
    routingKey: 'pi.product.*',
    queue: PRODUCT_REFRESH_QUEUE,
  })
  async receive(msg: any) {
    const ms = Math.random() * 10000;
    const start = new Date();
    await delay(ms);
    Logger.debug(
      `Product Refreshed: ${JSON.stringify(msg)}`,
      // --Started at ${start}
      // --Finished at ${new Date()}
      // --Should have taken ~${ms} ms`,
    );
  }

  async refresh(product: Product): Promise<void> {
    const refreshedProduct = await this.transformer.fromProductDetail(
      await this.extractor.extractDetail(product),
    );
    const updated = await this.productsService.update(
      product.id,
      refreshedProduct,
    );
    Logger.debug(updated);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
