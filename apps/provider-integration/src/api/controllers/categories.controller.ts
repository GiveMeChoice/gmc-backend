import { Category } from '@app/provider-integration/model/category.entity';
import { CategoriesService } from '@app/provider-integration/services/categories.service';
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
import { FindCategoriesDto } from '../dto/find-categories.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getAll(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
  ): Promise<Page<Category>> {
    return await this.categoriesService.findAll(pageRequest);
  }

  @Get(':id')
  async getOne(@Param('id') id): Promise<Category> {
    return await this.categoriesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateDto);
  }

  @Post('find')
  async find(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindCategoriesDto,
  ) {
    Logger.debug(JSON.stringify(findDto));
    return await this.categoriesService.find(findDto, pageRequest);
  }
}
