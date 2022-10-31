import { Injectable } from '@nestjs/common';
import { EtlService } from './etl/etl.service';
import { SourceRun } from './providers/model/source-run.entity';
import { ProductSourcesService } from './providers/services/product-sources.service';

@Injectable()
export class AppService {
  constructor(
    private productSourcesService: ProductSourcesService,
    private etlService: EtlService,
  ) {}

  async inegrateProductSource(sourceId: string): Promise<SourceRun> {
    const source = await this.productSourcesService.findOne(sourceId);
    return await this.etlService.runSourcePipeline(source);
  }
}
