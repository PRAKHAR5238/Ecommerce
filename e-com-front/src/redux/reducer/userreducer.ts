import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { userReducerinitialstate } from "../../types/reducer-types";
import { User } from "../../types/types";

const initialState: userReducerinitialstate = {
  user: null,
  loading: false,


};

export const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    // Action to mark that a user exists.
    // Expecting the payload to be true.
    userExist: (state, action: PayloadAction<User
        >) => {
      state.user = action.payload;
    },
    // Action to mark that a user does not exist.
    // Expecting the payload to be false.
    userNotExist: (state) => {
      state.loading = false;
      state.user = null;
    },
    },
});

// Export the actions for use in your components
export const { userExist, userNotExist } = userSlice.actions;

// Export the reducer to be included in your store
export default userSlice.reducer;
