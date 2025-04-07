import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  AllProductsResponse,
  CategoriesResponse,
  CreateProductRequest,
  DeleteProductRequest,
  MessageResponse,
  ProductResponse,
  SearchProductRequest,
  SearchProductResponse,
  UpdateProductRequest,
} from "../../types/api-types";

export const productAPI = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_SERVER}/api/v1/product/`, // Ensure the correct environment variable is used
  }),
  tagTypes: ["Product"], // Define the tag that will be used for cache invalidation

  endpoints: (builder) => ({
    // Query for latest products
    latestProducts: builder.query<AllProductsResponse, void>({
      query: () => "latest", // Adjust this to the appropriate endpoint for latest products
      providesTags: ["Product"], // Associate this query with "Product" tag
    }),

    // Query for all products
    allProducts: builder.query<AllProductsResponse, void>({
      query: () => "search", // Adjust this to the appropriate endpoint
      providesTags: ["Product"], // Associate this query with "Product" tag
    }),

    // Query for categories
    categories: builder.query<CategoriesResponse, void>({
      query: () => "category", // Adjust this to the appropriate endpoint
    }),

    // Query for searching products
    searchProduct: builder.query<SearchProductResponse, SearchProductRequest>({
      query: ({ price, search, sort, category, page }) => {
        const params = new URLSearchParams();

        if (typeof price === "number") params.append("price", price.toString());
        if (search) params.append("search", search);
        if (sort) params.append("sort", sort);
        if (category) params.append("category", category);
        if (typeof page === "number") params.append("page", page.toString());
        
        return `search?${params.toString()}`;
      },
      providesTags: ["Product"], // Cache invalidation for search queries
    }),

    // Mutation to create or update a product
    createProduct:builder.mutation<MessageResponse,CreateProductRequest >({
      query: ({ formData, id }) => ({
        url: `new?id=${id}`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation<
    UpdateProductRequest,
    { formData: FormData; userId: string; productId: string }
  >({
    query: ({ formData, userId, productId }) => ({
      url: `${productId}?id=${userId}`, // Correctly using productId and userId in the URL
      method: "PUT",
      body: formData,
    }),
    // Invalidate product-related cache and refetch
    invalidatesTags: [{ type: "Product", id: "LIST" }], // Provide a tag when a product is updated
  }),
  

  deleteProduct: builder.mutation<
  DeleteProductRequest,
  { userId: string; productId: string }
>({
  query: ({ userId, productId }) => ({
    url: `${productId}?id=${userId}`, // Endpoint for deleting a product
    method: "DELETE",
  }),
  // Invalidate product-related cache and refetch
  invalidatesTags: [{ type: "Product", id: "LIST" }], // Ensure the product list is updated
}),


    // Query for product details
    productDetails: builder.query<ProductResponse, string>({
      query: (id) => `${id}`, // Adjust this to the appropriate endpoint
      providesTags: ["Product"],
    }),
  }),
});

export const {
  useLatestProductsQuery,
  useAllProductsQuery,
  useCategoriesQuery,
  useSearchProductQuery,
  useCreateProductMutation,
  useProductDetailsQuery,
  useDeleteProductMutation,
  useUpdateProductMutation // Exposing the query hook for use in components
} = productAPI;
