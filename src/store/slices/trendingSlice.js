import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async thunk to fetch bestseller products
export const fetchBestsellerProducts = createAsyncThunk(
  "bestseller/fetchBestsellerProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.limit) query.set("limit", String(params.limit));
      if (params.sort) query.set("sort", params.sort);
      if (params.cache === false) query.set("cache", "false");
      if (params.category) query.set("category", params.category);

      const queryString = query.toString();
      const response = await api.get(
        `/products/trending${queryString ? `?${queryString}` : ""}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch trending products",
      );
    }
  },
);

// Initial state
const initialState = {
  products: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Slice
const bestsellerSlice = createSlice({
  name: "bestseller",
  initialState,
  reducers: {
    clearBestsellerError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBestsellerProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBestsellerProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.data || [];
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchBestsellerProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch bestseller products";
      });
  },
});

// Selectors
export const selectBestsellerProducts = (state) => state.bestseller.products;
export const selectBestsellerIsLoading = (state) => state.bestseller.isLoading;
export const selectBestsellerError = (state) => state.bestseller.error;
export const selectBestsellerLastUpdated = (state) => state.bestseller.lastUpdated;

export const { clearBestsellerError } = bestsellerSlice.actions;
export default bestsellerSlice.reducer;
