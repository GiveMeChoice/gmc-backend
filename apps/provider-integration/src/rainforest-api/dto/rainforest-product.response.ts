import { RainforestResponse } from './rainforest.response';

export interface RainforestProductResponse extends RainforestResponse {
  product: any;
  climate_pledge_friendly: any;
  brand_store: any;
  frequently_bought_together: any;
}
