import { ProductSource } from '@app/provider-integration/model/product-source.entity';
import { PageRequest } from '@lib/database/interface/page-request.interface';
import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsOptional } from 'class-validator';

export class FindSourcesDto
  extends PartialType(ProductSource)
  implements PageRequest
{
  @IsOptional()
  providerId?: string;

  @IsOptional()
  @IsInt()
  skip: number;

  @IsOptional()
  @IsInt()
  take: number;
}
