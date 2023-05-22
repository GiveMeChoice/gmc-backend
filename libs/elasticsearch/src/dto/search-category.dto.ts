export interface SearchCategoryDto {
  name: string;
  subcategory?: SearchCategoryDto;
}
