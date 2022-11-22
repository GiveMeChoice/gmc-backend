import { TransformPageRequestPipe } from '@app/provider-integration/utils/transform-page.pipe';
import { PageRequest } from '@lib/database/interface/page-request.interface';
import { Body, Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { Provider } from '../../model/provider.entity';
import { ProvidersService } from '../../services/providers.service';
import { FindProvidersDto } from '../dto/find-providers.dto';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  async find(
    @Query(TransformPageRequestPipe) pageRequest: PageRequest,
    @Body() findDto: FindProvidersDto,
  ): Promise<Provider[]> {
    return await this.providersService.find(findDto, pageRequest);
  }

  @Get(':id')
  async getProvider(@Param('id') id): Promise<Provider> {
    return await this.providersService.findOne(id);
  }

  @Get(':id/categories')
  async getProviderCategories(@Param('id') id): Promise<Provider> {
    return await this.providersService.getCategories(id);
  }
}
