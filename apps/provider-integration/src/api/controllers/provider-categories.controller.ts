import { ProviderCategory } from '@app/provider-integration/model/provider-category.entity';
import { ProviderCategoriesService } from '@app/provider-integration/services/provider-categories.service';
import { TransformPageRequestPipe } from '@app/provider-integration/utils/transform-page.pipe';
import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { FindProviderCategoriesDto } from '../dto/find-provider-categories.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Controller('provider-categories')
export class ProviderCategoriesController {
  private readonly logger = new Logger(ProviderCategoriesController.name);

  constructor(
    private readonly providerCategoriesService: ProviderCategoriesService,
  ) {}

  @Get()
  async getAll(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
  ): Promise<Page<ProviderCategory>> {
    return await this.providerCategoriesService.findAll(pageRequest);
  }

  @Get(':id')
  async getOne(@Param('id') id): Promise<ProviderCategory> {
    const providerCategory = await this.providerCategoriesService.findOne(id);
    if (!providerCategory) {
      throw new Error(`Provider Category not found: ${id}`);
    } else {
      return providerCategory;
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCategoryDto,
  ): Promise<ProviderCategory> {
    this.logger.debug(`Updating provider category ${id}: ${updateDto}`);
    return this.providerCategoriesService.update(id, updateDto);
  }

  @Post(':id/assign')
  async assign(
    @Param('id') id: string,
    @Query('categoryId') categoryId?: string,
  ): Promise<ProviderCategory> {
    this.logger.debug(`Updating provider category ${id}: ${categoryId}`);
    return this.providerCategoriesService.assignCategory(id, categoryId);
  }

  @Post('find')
  async find(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindProviderCategoriesDto,
  ) {
    this.logger.debug(JSON.stringify(findDto));
    return await this.providerCategoriesService.find(findDto, pageRequest);
  }
}
