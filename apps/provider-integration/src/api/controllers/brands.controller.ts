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
import { FindBrandsDto } from '../dto/find-brands.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';

@Controller('brands')
export class BrandsController {
  private readonly logger = new Logger(BrandsController.name);

  constructor(private readonly brandsService: MerchantBrandsService) {}

  @Get()
  async getAll(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
  ): Promise<Page<MerchantBrand>> {
    return await this.brandsService.findAll(pageRequest);
  }

  @Get(':id')
  async getOne(@Param('id') id): Promise<MerchantBrand> {
    return await this.brandsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBrandDto,
  ): Promise<MerchantBrand> {
    return this.brandsService.update(id, updateDto);
  }

  @Post('find')
  async find(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindBrandsDto,
  ) {
    this.logger.debug(JSON.stringify(findDto));
    return await this.brandsService.find(findDto, pageRequest);
  }
}
