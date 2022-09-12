import { ProductsService } from '@app/products';
import { Product } from '@app/products/model/product.entity';
import { Body, Controller, Get, Inject, Logger, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { PIPELINE_RUNNER_FACTORY } from './pipelines/constants/pipeline.tokens';
import { PipelineRunnerFactory } from './pipelines/shared/runner/pipeline-runner.factory';
import { ProviderKey } from './providers/model/enum/provider-key.enum';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly productsService: ProductsService,
    @Inject(PIPELINE_RUNNER_FACTORY)
    private readonly pipelineRunnerFactory: PipelineRunnerFactory,
  ) {}

  @Get()
  async getProducts(): Promise<Product[]> {
    Logger.debug('Provider Integration controller is getting your products');
    return await this.productsService.findAll();
  }

  @Post()
  async addProduct(@Body() product: Product): Promise<Product> {
    return await this.productsService.create(product);
  }

  @Get('integrate')
  async integrate(): Promise<void> {
    const runner = this.pipelineRunnerFactory.getRunner(
      ProviderKey.RAINFOREST_API,
    );
    await runner.runById('37c4ed20-cf2a-49dd-bb59-a83cbe315434');
  }
}
