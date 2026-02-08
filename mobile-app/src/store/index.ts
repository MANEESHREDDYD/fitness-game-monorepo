import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import matchesReducer from "./slices/matchesSlice";
import zonesReducer from "./slices/zonesSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    matches: matchesReducer,
    zones: zonesReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
