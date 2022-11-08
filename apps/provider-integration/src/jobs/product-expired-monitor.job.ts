import { ProductsService } from '@lib/products';
import { Injectable } from '@nestjs/common';
import { ProductExpiredMonitorResultDto } from './dto/product-expired-monitor-result.dto';
import { JobName } from './shared/job-name.enum';
import { Job } from './shared/job.interface';

@Injectable()
export class ProductExpiredMonitorJob
  implements Job<ProductExpiredMonitorResultDto>
{
  constructor(private readonly productsService: ProductsService) {}

  getName() {
    return JobName.PRODUCT_EXPIRED_MONITOR;
  }

  async execute(): Promise<ProductExpiredMonitorResultDto> {
    return {
      expiredProducts: await this.productsService.updateAllExpired(),
    };
  }
}
