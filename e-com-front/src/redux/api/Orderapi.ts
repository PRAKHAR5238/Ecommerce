import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  AllOrdersResponse,
  MessageResponse,
  NewOrderRequest,
  OrderDetailResponse,
  UpdateOrderRequest,
} from "../../types/api-types";

export const OrderApi = createApi({
  reducerPath: "orderApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_SERVER}/api/v1/order`,
  }),

  tagTypes: ["orders"],

  endpoints: (builder) => ({
    // ✅ POST: Create New Order
    createOrder: builder.mutation<MessageResponse, NewOrderRequest>({
      query: (order) => ({
        url: "new",
        method: "POST",
        body: order,
      }),
      invalidatesTags: ["orders"],
    }),

    // ✅ PATCH/PUT: Update Order (Admin/Staff Action)
    updateOrder: builder.mutation<MessageResponse, UpdateOrderRequest>({
      query: ({ userId, orderID }) => ({
        url: `${orderID}?id=${userId}`, // PUT /api/v1/order/:orderID?id=userId
        method: "PUT", // or "PATCH" if that's your backend
      }),
      invalidatesTags: ["orders"],
    }),

    // ✅ DELETE: Delete Order
    deleteOrder: builder.mutation<MessageResponse, UpdateOrderRequest>({
      query: ({ userId, orderID }) => ({
        url: `${orderID}?id=${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["orders"],
    }),

    // ✅ GET: User's Orders
    myOrders: builder.query<AllOrdersResponse, string>({
      query: (id) => ({
        url: `myorders?id=${id}`, // GET /api/v1/order/myorders?id=userId
        method: "GET",
      }),
      providesTags: ["orders"],
    }),

    // ✅ GET: All Orders (Admin)
    allOrders: builder.query<AllOrdersResponse, string>({
      query: (id) => ({
        url: `allorders?id=${id}`, // GET /api/v1/order/allorders?id=adminId
        method: "GET",
      }),
      providesTags: ["orders"],
    }),

    // ✅ GET: Order Details
    orderDetails: builder.query<OrderDetailResponse, string>({
      query: (id) => ({
        url: `${id}`, // GET /api/v1/order/:orderID
        method: "GET",
      }),
      providesTags: ["orders"],
    }),
  }),
});

export const {
  useCreateOrderMutation,   // Renamed from getOrders
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useMyOrdersQuery,
  useAllOrdersQuery,
  useOrderDetailsQuery,
} = OrderApi;
