import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./features/authSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { alianzaApi } from "./services";
import { setupListeners } from "@reduxjs/toolkit/query";

export const store = configureStore({
  reducer: {
    [alianzaApi.reducerPath]: alianzaApi.reducer,
    auth: authSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(alianzaApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
