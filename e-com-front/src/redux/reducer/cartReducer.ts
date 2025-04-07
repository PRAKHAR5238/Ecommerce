import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartReducerInitialState } from "../../types/reducer-types";
import { CartItem, shippinginfo } from "../../types/types";

// Initial State
const initialState: CartReducerInitialState = {
  Cartitems: [],
  subtotal: 0,
  tax: 0,
  shippingCharges: 0,
  total: 0,
  discount: 0,
  shippinginfo: {
    address: "",
    city: "",
    country: "",
    // pincode: "",
    state: "",
    toFixed: undefined,
    zip: ""
  },
  loading: false,
  coupon: "",
};

// Utility function to recalculate totals
const calculateTotals = (state: CartReducerInitialState) => {
  state.subtotal = Math.max(
    state.Cartitems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    0
  );

  state.shippingCharges = state.subtotal > 1000 ? 0 : 200;
  state.tax = Math.round(state.subtotal * 0.18);

  state.total = Math.max(
    state.subtotal + state.tax + state.shippingCharges - state.discount,
    0
  );
};

export const CartReducer = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const index = state.Cartitems.findIndex(
        (i) => i.productId === action.payload.productId
      );

      if (index !== -1) {
        // Update the existing item
        state.Cartitems[index] = action.payload;
      } else {
        // Add a new item
        state.Cartitems.push(action.payload);
      }

      calculateTotals(state);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.Cartitems = state.Cartitems.filter(
        (item) => item.productId !== action.payload
      );

      calculateTotals(state);
    },

    calculatePrice: (state) => {
      calculateTotals(state);
    },

    discountApplied: (state, action: PayloadAction<number>) => {
      state.discount = action.payload;

      calculateTotals(state);
    },

    saveCoupon: (state, action: PayloadAction<string>) => {
      state.coupon = action.payload;
    },

    saveShippingInfo: (state, action: PayloadAction<shippinginfo>) => {
      state.shippinginfo = action.payload;
    },

    resetCart: () => ({
      ...initialState,
    }),
  },
});

// Export actions
export const {
  addToCart,
  removeFromCart,
  discountApplied,
  saveCoupon,
  saveShippingInfo,
  resetCart,
  calculatePrice,
} = CartReducer.actions;

// Export reducer
export default CartReducer.reducer;
