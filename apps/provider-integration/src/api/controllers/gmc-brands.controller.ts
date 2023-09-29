import { GmcBrand } from '@app/provider-integration/model/gmc-brand.entity';
import { GmcBrandsService } from '@app/provider-integration/services/gmc-brands.service';
import { TransformPageRequestPipe } from '@app/provider-integration/utils/transform-page.pipe';
import { PageRequest } from '@lib/database/interface/page-request.interface';
import {
  Controller,
  Logger,
  Get,
  Query,
  Param,
  Delete,
  Post,
  Body,
  Put,
} from '@nestjs/common';
import { CreateGmcBrandDto } from '../dto/create-gmc-brand.dto';
import { UpdateGmcBrandDto } from '../dto/update-gmc-brand.dto';

@Controller('gmc-brands')
export class GmcBrandsController {
  private readonly logger = new Logger(GmcBrandsController.name);

  constructor(private readonly gmcBrandsService: GmcBrandsService) {}

  @Post('find')
  async find(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: any,
  ) {
    this.logger.debug(JSON.stringify(findDto));
    return await this.gmcBrandsService.find(findDto, pageRequest);
  }

  @Get()
  async getAll(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
  ): Promise<any> {
    return this.gmcBrandsService.findAll(pageRequest);
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<GmcBrand> {
    return await this.gmcBrandsService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.gmcBrandsService.delete(id);
  }

  @Post()
  async create(@Body() createDto: CreateGmcBrandDto) {
    return await this.gmcBrandsService.create(createDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateGmcBrandDto) {
    return this.gmcBrandsService.update(id, updateDto);
  }
}
