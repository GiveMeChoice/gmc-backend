// import { Product } from "@app/products/model/product.entity";
// import { response } from "express";
// import { ProviderCategory } from "../../provider/model/provider-cateogry.entity";
// import { RainforestProductResponse } from "../../rainforest-api/dto/rainforest-product.response";

// {network} => ProviderGateway -> clientResponse -> adapter() -> <providerProductDto> -> map() -> <Product>

export const connectorFactory = {};

// interface ProviderGateway {

//   callProviderCategoryLocation(providerCategory): response;

//   callProviderProductLocation(providerProductId): response;

// }

// class RainforestS3CsvClient {
//   getCategoryList(providerCategory): any {}//RainforestS3CategoryResponse;
//   getProductList(providerCategory): any {}// RainforestS3CsvProductListResponse;
// }

// class RainforestApiClient {

// }

// interface RainforestClient {

//   getCategoryList(providerCategory): any//RainforestCategoryListResponse;
//   getProductList(providerCategory): any//RainforestProductListResponse;
//   getProduct(providerProductId): RainforestProductResponse;

// }

// class RainforestS3CsvAdapter implements RainforestClient {
//   // private client: RainforestS3CsvClient = new RainforestS3CsvClient();
//   getCategoryList(providerCategory: any) {
//     return
//   }
//   getProductList(providerCategory: any) {
//     throw new Error("Method not implemented.");
//   }
//   getProduct(providerProductId: any): RainforestProductResponse {
//     throw new Error("Method not implemented.");
//   }
// }

// export interface Integrator {
//   async getCategoryList(category: ProviderCategory): Product[];
// }
