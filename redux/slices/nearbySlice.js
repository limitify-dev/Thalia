// slices/nearbySitesSlice.js
import {createSlice} from '@reduxjs/toolkit';
import {getNearbySites} from '../actions/nearbyAction';

const nearbySitesSlice = createSlice({
  name: 'nearbySites',
  initialState: {
    data: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getNearbySites.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNearbySites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(getNearbySites.rejected, (state, action) => {
        state.isLoading = false;
        // Don't set error if request was just cancelled
        if (action.payload !== "Request cancelled") {
          state.error = action.payload;
        }
      });
  },
});

export default nearbySitesSlice.reducer;
