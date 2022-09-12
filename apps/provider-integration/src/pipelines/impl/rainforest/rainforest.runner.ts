import { Product } from '@app/products/model/product.entity';
import { Injectable, Logger } from '@nestjs/common';
import * as csv from 'csvtojson';
import { S3Service } from '../../../aws/services/s3.service';
import { Pipeline } from '../../model/pipeline.entity';
import { PipelineRunnerBase } from '../../shared/runner/pipeline-runner.base';
import { SourceTransformer } from '../../shared/transform/transformer.interface';
import { ProviderKey } from '../../../providers/model/enum/provider-key.enum';
import { RainforestCategoryItem } from './dto/rainforest-category-item.dto';
import { RainforestTransformer } from './rainforest.transformer';
import { PipelineResult } from '../../model/pipeline-result.entity';

@Injectable()
export class RainforestRunner extends PipelineRunnerBase {
  providerKey: ProviderKey = ProviderKey.RAINFOREST_API;
  transformer: SourceTransformer<any, any> = new RainforestTransformer();

  constructor(private readonly s3Service: S3Service) {
    super();
  }

  async runInternal(pipeline: Pipeline): Promise<Partial<PipelineResult>> {
    const objKey = `${pipeline.category}/category/Collection_Results_D7F6E89A_2_Page_1_bb6d6dbffba33cbcecd3f56639ac8792d2ddd200.csv`;
    const categoryList: Partial<Product>[] = [];
    await csv()
      // Extract
      .fromStream(
        await this.s3Service.getObjectStream(this.providerKey, objKey),
      )
      // Transform
      .subscribe(async (item: RainforestCategoryItem, lineNumber) => {
        Logger.debug(lineNumber);
        categoryList.push(this.transformer.mapCategoryItem(item));
      });
    return {
      productsFound: categoryList.length,
    };
  }

  getProductInternal(providerProductId: string) {
    throw new Error('Method not implemented.');
  }
}
