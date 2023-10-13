import { IsNotEmpty, IsOptional, IsString, NotContains } from 'class-validator';

export class ReadEntityBySlugDto {
  @IsNotEmpty()
  @IsString()
  @NotContains(' ')
  slug: string;

  @IsNotEmpty()
  @IsString()
  @NotContains(' ')
  parentSlug: string;

  @IsOptional()
  @IsString()
  @NotContains(' ')
  superParentSlug?: string;
}
