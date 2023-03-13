import { ProviderCategory } from '@app/provider-integration/model/provider-category.entity';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';

export class FindProviderCategoriesDto extends PartialType(ProviderCategory) {
  @IsOptional()
  providerId?: string;

  @IsOptional()
  categoryId?: string;
}
