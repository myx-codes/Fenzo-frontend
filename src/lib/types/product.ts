import { ProductCollection, ProductGender, ProductStatus, ProductType, ProductUnit } from "../enums/product.enums";

export interface Product {
  _id: string;
  userId: string;
  productStatus: ProductStatus;
  productType: ProductType;
  productCollection: ProductCollection;
  productName: string;
  productDesc: string;
  productPrice: number;
  productDiscountPrice: number;
  productStock: number;
  productUnit: ProductUnit;
  productGender: ProductGender;
  productImages: string[];
  productViews: number;
  productLikes: number;
  productRating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInquiry {
  order?: string;
  page: number;
  limit: number;
  productCollection?: ProductCollection;
  search?: string;
}

export interface ProductReviewUser {
  _id: string;
  userNick: string;
  userImage?: string;
}

export interface ProductReview {
  _id: string;
  productId: string;
  userId: ProductReviewUser | string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReviewSummary {
  average: number;
  total: number;
  distribution: Record<number, number>;
}

export interface ProductReviewsResponse {
  reviews: ProductReview[];
  summary: ProductReviewSummary;
  page: number;
  limit: number;
}
