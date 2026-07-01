import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import cartReducer from "./slices/cartSlice";
import orderReducer from "./slices/orderSlice";
import userReducer from "./slices/userSlice";
import announcementReducer from "./slices/announcementSlice";
import heroBadgeReducer from "./slices/heroBadgeSlice";
import saleOfferReducer from "./slices/saleOfferSlice";
import trendingReducer from "./slices/trendingSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
    users: userReducer,
    announcements: announcementReducer,
    heroBadges: heroBadgeReducer,
    saleOffers: saleOfferReducer,
    trending: trendingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});
