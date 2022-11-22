import { FindOptionsOrderValue } from 'typeorm';

export interface PageRequest {
  order?: {
    [property: string]: FindOptionsOrderValue;
  };
  skip: number;
  take: number;
}
