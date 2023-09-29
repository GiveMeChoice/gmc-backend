import { GmcCategory } from '@app/provider-integration/model/gmc-category.entity';
import { GmcCategoriesService } from '@app/provider-integration/services/gmc-categories.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateGmcCategoryDto } from '../dto/create-gmc-category.dto';
import { UpdateGmcCategoryDto } from '../dto/update-gmc-category.dto';

@Controller('gmc-categories')
export class GmcCategoriesController {
  private readonly logger = new Logger(GmcCategoriesController.name);

  constructor(private readonly gmcCategoriesService: GmcCategoriesService) {}

  @Get()
  async getAll(@Query('deep') deep: boolean): Promise<any> {
    return this.gmcCategoriesService.findAll(deep);
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @Query('deep') deep: boolean,
  ): Promise<GmcCategory> {
    return await this.gmcCategoriesService.findOne(id, deep);
  }

  @Get(':id/descendents')
  async getDescendents(@Param('id') id: string): Promise<any> {
    return this.gmcCategoriesService.findDescendents(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.gmcCategoriesService.delete(id);
  }

  @Post()
  async create(@Body() createDto: CreateGmcCategoryDto) {
    return await this.gmcCategoriesService.create(createDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateGmcCategoryDto,
  ) {
    return this.gmcCategoriesService.udpate(id, updateDto);
  }
}
