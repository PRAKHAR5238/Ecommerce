import { CartItem, shippinginfo, User } from "./types";

export interface userReducerinitialstate{
    user: User | null;
    loading: boolean;

}

  
  export interface CartReducerInitialState {
    Cartitems: CartItem[],       // Array of CartItem objects
    subtotal: number;            // Total price of all cart items before taxes and shipping
    tax: number;                 // Tax amount
    shippingCharges: number;            // Shipping cost
    total: number;               // Final total (subtotal + tax + shipping - discount)
    discount: number;            // Discount applied (if any)
    shippinginfo: shippinginfo;  // Can be an object with various shipping details
    loading: boolean;            // Indicates if the cart is loading data
    coupon:String
  }
  