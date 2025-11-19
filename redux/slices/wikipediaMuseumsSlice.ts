// redux/slices/wikipediaMuseumsSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { getWikipediaMuseums } from "../actions/wikipediaAction";

type WikipediaMuseumsState = {
  data: any[];
  isLoading: boolean;
  error: string | null;
};

const initialState: WikipediaMuseumsState = {
  data: [],
  isLoading: false,
  error: null,
};

const wikipediaMuseumsSlice = createSlice({
  name: "wikipediaMuseums",
  initialState,
  reducers: {
    clearWikipediaMuseums(state) {
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getWikipediaMuseums.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWikipediaMuseums.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getWikipediaMuseums.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to fetch Wikipedia data";
      });
  },
});

export const { clearWikipediaMuseums } = wikipediaMuseumsSlice.actions;
export default wikipediaMuseumsSlice.reducer;
