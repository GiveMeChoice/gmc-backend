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
import { GmcNestedEntityPageDataDto } from '../dto/lookup-gmc-label-response.dto';
import { UpdateGmcCategoryDto } from '../dto/update-gmc-category.dto';

@Controller('gmc-categories')
export class GmcCategoriesController {
  private readonly logger = new Logger(GmcCategoriesController.name);

  constructor(private readonly gmcCategoriesService: GmcCategoriesService) {}

  @Get()
  async getAll(
    @Query('deep') deep: boolean,
    @Query('slim') slim: boolean,
  ): Promise<any> {
    return this.gmcCategoriesService.findAll(deep, slim);
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @Query('deep') deep: boolean,
  ): Promise<GmcCategory> {
    return await this.gmcCategoriesService.findOne(id, deep);
  }

  @Get('page-data/:slug/:subslug1?/:subslug2?')
  async getPageData(
    @Param('slug') slug: string,
    @Param('subslug1') subslug1?: string,
    @Param('subslug2') subslug2?: string,
  ): Promise<GmcNestedEntityPageDataDto> {
    this.logger.debug(`
      slug: ${slug}
      subslug1: ${subslug1}
      subslug2: ${subslug2}
    `);
    const roots = await this.gmcCategoriesService.findAll(false);
    const entity = await this.gmcCategoriesService.findOneBySlug(
      slug,
      subslug1,
      subslug2,
    );
    const activeRoot = roots.find((r) => r.slug === slug);
    const pageTree = await this.gmcCategoriesService.findOne(
      activeRoot.id,
      true,
    );
    return {
      roots,
      pageTree,
      entity,
      slug,
      subslug1,
      subslug2,
    };
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
