import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { User } from "../../types";

interface AuthState {
  user: User | null;
  isLogged: boolean;
}

const initialState: AuthState = {
  user: null,
  isLogged: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isLogged = true;
    },
    logOut: (state) => {
      state.user = null;
      state.isLogged = false;
    },
  },
});

export const { setUser, logOut } = authSlice.actions;

export default authSlice.reducer;
