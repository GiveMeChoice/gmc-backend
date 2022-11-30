import { TransformPageRequestPipe } from '@app/provider-integration/utils/transform-page.pipe';
import { PageRequest } from '@lib/database/interface/page-request.interface';
import { ProductsService } from '@lib/products';
import { Body, Controller, Logger, Post, Query } from '@nestjs/common';
import { FindProductsDto } from '../dto/find-products.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('search')
  async search(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindProductsDto,
  ) {
    Logger.debug(JSON.stringify(findDto));
    return await this.productsService.find(findDto, pageRequest);
  }
}
