import { Product } from '@lib/products/model/product.entity';
import { Injectable, Logger } from '@nestjs/common';
import { EtlService } from '../etl/etl.service';
import { ProductSourceStatus } from '../model/enum/product-source-status';
import { SourceRun } from '../model/source-run.entity';
import { ProductSourcesService } from './product-sources.service';

@Injectable()
export class IntegrationService {
  constructor(
    private productSourcesService: ProductSourcesService,
    private etlService: EtlService,
  ) {}

  async inegrateSource(sourceId: string): Promise<SourceRun> {
    const source = await this.productSourcesService.findOne(sourceId);
    if (!source.active || !source.provider.active) {
      throw new Error('Source is not active! Skipping integration...');
    }
    if (source.status === ProductSourceStatus.BUSY) {
      throw new Error('Source is busy! Skipping integration...');
    }
    // try {
    const run = await this.productSourcesService.startRun(source);
    // run = await this.etlService.runSourcePipeline(source);
    // } catch (err) {
    //
    // }
    Logger.debug(JSON.stringify(run));
    return await this.productSourcesService.completeRun(run);
  }

  async inegrateProduct(productId: string): Promise<Product> {
    //
    return null;
  }
}
