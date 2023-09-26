import { MerchantCategory } from '@app/provider-integration/model/merchant-category.entity';
import { MerchantCategoriesService } from '@app/provider-integration/services/merchant-categories.service';
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
import { FindMerchantCategoriesDto } from '../dto/find-merchant-categories.dto';
import { UpdateMerchantCategoryDto } from '../dto/update-merchant-category.dto';

@Controller('merchant-categories')
export class MerchantCategoriesController {
  private readonly logger = new Logger(MerchantCategoriesController.name);

  constructor(
    private readonly merchantCategoriesService: MerchantCategoriesService,
  ) {}

  @Post('find')
  async find(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindMerchantCategoriesDto,
  ) {
    this.logger.debug(JSON.stringify(findDto));
    return await this.merchantCategoriesService.find(findDto, pageRequest);
  }

  @Get()
  async getAll(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
  ): Promise<Page<MerchantCategory>> {
    return await this.merchantCategoriesService.findAll(pageRequest);
  }

  @Get(':id')
  async getOne(@Param('id') id): Promise<MerchantCategory> {
    const merchantCategory = await this.merchantCategoriesService.findOne(id);
    if (!merchantCategory) {
      throw new Error(`Merchant Category not found: ${id}`);
    } else {
      return merchantCategory;
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMerchantCategoryDto,
  ): Promise<MerchantCategory> {
    this.logger.debug(`Updating merchant category ${id}: ${updateDto}`);
    return this.merchantCategoriesService.update(id, updateDto);
  }

  @Post(':id/assign')
  async assign(
    @Param('id') id: string,
    @Query('gmcCategoryId') gmcCategoryId?: string,
  ): Promise<MerchantCategory> {
    this.logger.debug(
      `Assigning merchant category ${id} to GMC category ${gmcCategoryId}`,
    );
    return this.merchantCategoriesService.assignGmcCategory(id, gmcCategoryId);
  }
}
