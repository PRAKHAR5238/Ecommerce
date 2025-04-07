import { User } from "firebase/auth";
import { bar, CartItem, line, Order,  Pie,  Product, shippinginfo } from "./types";

// ✅ Message and User Responses
export type MessageResponse = {
  message: string;
  success: boolean;
};

export type AllUsersResponse = {
  users: User[];
  success: boolean;
};

export type UserResponse = {
  user: User;
  success: boolean;
};

// ✅ User Requests
export interface DeleteUserRequest {
  userId: string;
  adminUserId: string; // strictly a string, can't be undefined
}

// ✅ Product Responses
export type AllProductsResponse = {
  success: boolean;
  products: Product[];
};

export type ProductResponse = {
  success: boolean;
  product: Product;
};

export type CategoriesResponse = {
  success: boolean;
  categories: string[];
};
export type StatsResponse = {
  success: boolean;
  stats: Order;
};
export type PieResponse = {
  success: boolean;
  charts: Pie;
};
export type BarResponse = {
  success: boolean;
  charts: bar;
};
export type LineResponse = {
  success: boolean;
  charts: line;
};

// ✅ Product Requests
export type CreateProductRequest = {
  id: string;
  formData: FormData;
};

export type UpdateProductRequest = {
  userId: string;
  productId: string;
  formData: FormData;
};

export type DeleteProductRequest = {
  userId: string;
  productId: string;
};

// ✅ Product Search
export type SearchProductRequest = {
  price: number;
  page: number;
  category: string;
  search: string;
  sort: string;
};

export type SearchProductResponse = AllProductsResponse & {
  totalPage: number;
};

// ✅ Orders
export type NewOrderRequest = {
  shippingInfo: shippinginfo;
  orderItems: CartItem[];
  subtotal: number;
  tax: number;
  shippingCharges: number;
  discount: number;
  total: number;
  user: string;
};

export type AllOrdersResponse = {
  products: any; // consider typing this better if possible
  success: boolean;
  orders: Order[];
};

export type OrderDetailResponse = {
  success: boolean;
  message: string;
  order: Order;
};

export type UpdateOrderRequest = {
  userId: string;
  orderID: string;
};

// ✅ Error Handling
export type CustomError = {
  status: number;
  data: {
    message: string;
    success: boolean;
  };
};
