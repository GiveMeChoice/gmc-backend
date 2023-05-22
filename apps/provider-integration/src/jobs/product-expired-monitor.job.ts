import { Injectable } from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { JobBase } from './shared/job-base.abstract';
import { JobExecutionResult } from './shared/job-execution-result.interface';
import { JobName } from './shared/job-name.enum';

@Injectable()
export class ProductExpiredMonitorJob extends JobBase {
  constructor(private readonly productsService: ProductsService) {
    super();
  }
  public lastResult: JobExecutionResult;

  getName() {
    return JobName.PRODUCT_EXPIRED_MONITOR;
  }

  async execute() {
    const count = await this.productsService.flagAllExpired();
    return `Found and updated ${count} expired Products`;
  }
}
