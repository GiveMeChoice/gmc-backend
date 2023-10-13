export interface CategoryDocument {
  merchantCategory?: string;
  gmcCategory?: GmcCategoryDocument;
}

export interface GmcCategoryDocument {
  name: string;
  description?: string;
  slug: string;
  subcategory?: GmcCategoryDocument;
}
