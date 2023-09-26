import { ProductDocumentsService } from '@app/provider-integration/services/product-documents.service';
import { Controller, Get, Logger, Param, Post } from '@nestjs/common';

@Controller('product-documents')
export class ProductDocumentsController {
  private readonly logger = new Logger(ProductDocumentsController.name);

  constructor(
    private readonly productDocumentService: ProductDocumentsService,
  ) {}

  @Get(':id')
  async getOne(@Param('id') id): Promise<any> {
    if (await this.productDocumentService.exists(id)) {
      return await this.productDocumentService.getOne(id);
    } else {
      throw new Error('Product Document Not Found');
    }
  }

  @Post(':id/map')
  async map(@Param('id') id): Promise<any> {
    return await this.productDocumentService.map(id);
  }

  @Post(':id/index')
  async index(@Param('id') id): Promise<any> {
    this.logger.debug(`Indexing Product: ${id}`);
    return await this.productDocumentService.index(id);
  }
}
