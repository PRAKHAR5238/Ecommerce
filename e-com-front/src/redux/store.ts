import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "./api/Userapi";
import userReducer from "./reducer/userreducer";
import { productAPI } from "./api/Productapi";
import { CartReducer } from "./reducer/cartReducer";
import { OrderApi } from "./api/Orderapi";
import { dashboardApi } from "./api/dashboardapi";

export const server = import.meta.env.VITE_SERVER; // Fixed environment variable name

export const store = configureStore({
  reducer: {
    // The userReducer will manage the state for user authentication and related data.
    user: userReducer, // Ensure correct state slice for user information

    // API slices from RTK Query
    [userApi.reducerPath]: userApi.reducer, // Add the userApi to manage user data fetching
    [productAPI.reducerPath]: productAPI.reducer,
    [OrderApi.reducerPath]: OrderApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [CartReducer.name]: CartReducer.reducer,
     // Add the productAPI to manage product-related data
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware) // Middleware for user API
      .concat(productAPI.middleware) // Middleware for product API
      .concat(OrderApi.middleware) // Middleware for order API
      .concat(dashboardApi.middleware), // Middleware for order API
      
});

export type RootState = ReturnType<typeof store.getState>;
