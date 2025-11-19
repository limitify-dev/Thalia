// redux/store.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import aiHistoryReducer from "./slices/aiSlice";
import authReducer from "./slices/authSlice";
import mapbySitesReduceer from "./slices/mapSlice";
import nearbySitesReducer from "./slices/nearbySlice";
import notificationReducer from "./slices/notificationSlice";
import sitesReducer from "./slices/sitesSlice";
import wikipediaMuseumsReducer from "./slices/wikipediaMuseumsSlice";

import { setTokenGetter } from "../axios/http"; // <-- adjust the path if needed

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "theme", "notifications", "language", "aiHistory"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  sites: sitesReducer,
  notifications: notificationReducer,
  aiHistory: aiHistoryReducer,
  nearbySites: nearbySitesReducer,
  mapbySites: mapbySitesReduceer,
  wikipediaMuseums: wikipediaMuseumsReducer,
});

export const store = configureStore({
  reducer: persistReducer(persistConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

setTokenGetter(() => store.getState().auth?.token ?? null);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
