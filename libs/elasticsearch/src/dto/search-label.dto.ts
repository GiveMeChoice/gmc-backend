export interface SearchLabelDto {
  merchantLabel: SearchMerchantLabelDto;
  group?: SearchLabelGroupDto;
}

export interface SearchMerchantLabelDto {
  code: string;
  name: string;
  description?: string;
  logoUrl?: string;
  infoLink?: string;
}

export interface SearchLabelGroupDto {
  name: string;
  description?: string;
  sublabel?: SearchLabelGroupDto;
}
