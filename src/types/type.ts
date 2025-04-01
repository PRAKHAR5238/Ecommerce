import { Request, Response, NextFunction } from "express";

// Interface for the request body when creating a new user
export interface NewUserRequestBody {
  _id: string;
  name: string;
  email: string;
  photo: string; // Assuming this is a URL or file path to the photo
  gender: string;
  role: string;
  dob: Date; // Date of birth, may come as a string from the client, but should be parsed into a Date object
}

// Interface for the request body when creating a new product
export interface NewProductRequestBody {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  photo: Express.Multer.File; // Use multer's file type for the photo (if using multer for file uploads)
  isActive?: boolean;
}

// Generic controller type to be used with Express routes
export type ControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export type searchRequestquerry={
  search?:string,
  category?:string,
  price?:string,
  sort?:string,
  page?:string,
}

export type invalidatecacheprops={
  product?:boolean;
  order?:boolean;
  admin?:boolean;
}

export type Orderitemstype={
  product_id: string;
  quantity: number;
  price:Number,
  photo:String
};
export interface Neworderequestbody{
  shippingInfo:{},
  user:String,
  subtotal:Number,
  tax:Number,
  total:Number,
  orderitems:Orderitemstype[],
  shippingCharge:Number


}
export type shippinginfotype={
  address:String,
  city:String,
  state:String,
  pincode:number,
  country:String,
};

export interface ICoupon extends Document {
  code: string;
  discountValue: number;
  discountType: string;
  expirationDate: Date;
  usageLimit: number;
  applicableProducts: string[];
  applicableCategories: string[];
}

