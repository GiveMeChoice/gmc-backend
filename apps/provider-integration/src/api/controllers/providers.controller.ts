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
import { ProvidersService } from '../../services/providers.service';
import { FindProvidersDto } from '../dto/find-providers.dto';
import { UpdateProviderDto } from '../dto/update-provider.dto';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post('find')
  async find(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindProvidersDto,
  ): Promise<Page<Provider>> {
    Logger.debug(JSON.stringify(findDto));
    return await this.providersService.find(findDto, pageRequest);
  }

  @Get()
  async getAll(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
  ): Promise<Page<Provider>> {
    return await this.providersService.findAll(pageRequest);
  }

  @Get(':id')
  async getOne(@Param('id') id): Promise<Provider> {
    return await this.providersService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id,
    @Body() updateDto: UpdateProviderDto,
  ): Promise<Provider> {
    return this.providersService.update(id, updateDto);
  }
}
