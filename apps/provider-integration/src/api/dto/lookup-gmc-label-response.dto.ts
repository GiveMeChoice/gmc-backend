import { GmcCategory } from '@app/provider-integration/model/gmc-category.entity';
import { GmcLabel } from '@app/provider-integration/model/gmc-label.entity';

export class GmcNestedEntityPageDataDto {
  roots: GmcLabel[] | GmcCategory[];
  pageTree: GmcLabel | GmcCategory;
  entity: GmcLabel | GmcCategory;
  slug: string;
  subslug1?: string;
  subslug2?: string;
}
