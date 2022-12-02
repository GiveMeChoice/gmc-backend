import { ProductIntegrationStatus } from '@app/provider-integration/model/enum/product-status.enum';
import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { Product } from '@app/provider-integration/model/product.entity';
import { Provider } from '@app/provider-integration/model/provider.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class FindProductsDto extends PartialType(Product) {
  @IsOptional()
  providerProductId?: string;

  @IsOptional()
  integrationStatus?: ProductIntegrationStatus;

  @IsOptional()
  source?: ProductSource;

  @IsOptional()
  provider?: Provider;

  @IsOptional()
  shortId?: string;
}