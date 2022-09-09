import { Controller, Get, Param } from '@nestjs/common';
import { ProviderCategory } from '../model/provider-category.entity';
import { Provider } from '../model/provider.entity';
import { ProvidersService } from '../services/providers.service';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  async getProviders(): Promise<Provider[]> {
    return await this.providersService.findAll();
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
