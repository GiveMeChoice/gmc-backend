import { Merchant } from '@app/provider-integration/model/merchant.entity';
import { MerchantsService } from '@app/provider-integration/services/merchants.service';
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
import { Provider } from '../../model/provider.entity';
import { FindMerchantsDto } from '../dto/find-merchants.dto';
import { UpdateMerchantDto } from '../dto/update-merchant.dto';

@Controller('merchants')
export class MerchantsController {
  private readonly logger = new Logger(MerchantsController.name);

  constructor(private readonly merchantsService: MerchantsService) {}

  @Post('find')
  async find(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindMerchantsDto,
  ): Promise<Page<Merchant>> {
    this.logger.debug(JSON.stringify(findDto));
    return await this.merchantsService.find(findDto, pageRequest);
  }

  @Get()
  async getAll(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
  ): Promise<Page<Merchant>> {
    return await this.merchantsService.findAll(pageRequest);
  }

  @Get(':id')
  async getOne(@Param('id') id): Promise<Merchant> {
    return await this.merchantsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id,
    @Body() updateDto: UpdateMerchantDto,
  ): Promise<Merchant> {
    return this.merchantsService.update(id, updateDto);
  }
}
