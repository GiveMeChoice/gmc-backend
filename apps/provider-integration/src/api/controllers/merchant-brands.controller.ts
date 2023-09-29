import { MerchantBrand } from '@app/provider-integration/model/merchant-brand.entity';
import { MerchantBrandsService } from '@app/provider-integration/services/merchant-brands.service';
import { TransformPageRequestPipe } from '@app/provider-integration/utils/transform-page.pipe';
import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Page } from '@lib/database/interface/page.interface';
import {
  Controller,
  Get,
  Query,
  Param,
  Put,
  Body,
  Post,
  Logger,
} from '@nestjs/common';
import { FindMerchantBrandsDto } from '../dto/find-merchant-brands.dto';
import { UpdateMerchantBrandDto } from '../dto/update-merchant-brand.dto';

@Controller('merchant-brands')
export class MerchantBrandsController {
  private readonly logger = new Logger(MerchantBrandsController.name);

  constructor(private readonly merchantBrandsService: MerchantBrandsService) {}

  @Get()
  async getAll(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
  ): Promise<Page<MerchantBrand>> {
    return await this.merchantBrandsService.findAll(pageRequest);
  }

  @Get(':id')
  async getOne(@Param('id') id): Promise<MerchantBrand> {
    return await this.merchantBrandsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMerchantBrandDto,
  ): Promise<MerchantBrand> {
    return this.merchantBrandsService.update(id, updateDto);
  }

  @Post('find')
  async find(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindMerchantBrandsDto,
  ) {
    this.logger.debug(JSON.stringify(findDto));
    return await this.merchantBrandsService.find(findDto, pageRequest);
  }

  @Post(':id/assign')
  async assign(
    @Param('id') id: string,
    @Query('gmcBrandId') gmcBrandId?: string,
  ): Promise<MerchantBrand> {
    this.logger.debug(
      `Assigning merchant brand ${id} to GMC Brand ${gmcBrandId}`,
    );
    return this.merchantBrandsService.assignGmcBrand(id, gmcBrandId);
  }
}
