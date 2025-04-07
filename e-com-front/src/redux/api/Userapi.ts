import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import axios from "axios";
import {
  AllUsersResponse,
  DeleteUserRequest,
  MessageResponse,
} from "../../types/api-types";
import { User } from "../../types/types";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_SERVER}/api/v1/user`,
    // credentials: "include" // Uncomment if working with cookies/sessions
  }),
  tagTypes: ["users"],
  endpoints: (builder) => ({
    // ✅ Register / Login Mutation
    loginUser: builder.mutation<MessageResponse, User>({
      query: (userData) => ({
        url: "new",
        method: "POST",
        body: userData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["users"],
    }),

    // ✅ Delete User Mutation
    deleteUser: builder.mutation<MessageResponse, DeleteUserRequest>({
      query: ({ userId, adminUserId }) => ({
        url: `${userId}?id=${adminUserId}`, // Matches the backend route: /:userId?id=adminId
        method: "DELETE",
      }),
      invalidatesTags: ["users"],
    }),

    // ✅ Get All Users Query
    allUsers: builder.query<AllUsersResponse, string>({
      query: (id) => `all?id=${id}`, // ✅ Correct query parameter syntax
      providesTags: ["users"],
    }),
  }),
});

// ✅ Axios helper function (Optional)
export const getUser = async (id: string) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_SERVER}/api/v1/user/${id}`
    );
    return response.data;
  } catch (error) {
    return null;
  }
};

// ✅ Export hooks from userApi
export const {
  useLoginUserMutation,
  useAllUsersQuery,
  useDeleteUserMutation,
} = userApi;
