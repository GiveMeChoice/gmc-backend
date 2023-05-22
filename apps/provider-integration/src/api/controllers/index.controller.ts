import { IndexService } from '@app/provider-integration/services/index.service';
import { Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { ElasticsearchService } from 'libs/elasticsearch/src';

@Controller('index')
export class IndexController {
  private readonly logger = new Logger(IndexController.name);

  constructor(
    private readonly indexService: IndexService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  @Get(':id')
  async getCurrentlyIndexed(@Param('productId') id): Promise<any> {
    if (await this.elasticsearchService.existsDocument(id)) {
      return await this.elasticsearchService.getDocument(id);
    }
  }

  @Post(':id/map')
  async getIndexable(@Param('productId') id): Promise<any> {
    return await this.indexService.mapIndexable(id);
  }

  @Post(':id/save')
  async index(@Param('productId') id): Promise<any> {
    this.logger.debug(`(Re)Indexing Product: ${id}`);
    return await this.indexService.indexProduct(id);
  }
}
