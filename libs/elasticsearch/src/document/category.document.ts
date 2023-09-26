export interface CategoryDocument {
  merchantCategory?: string;
  gmcCategory?: GmcCategoryDocument;
}

export interface GmcCategoryDocument {
  name: string;
  subcategory?: GmcCategoryDocument;
}
