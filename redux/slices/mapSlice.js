import {createSlice} from '@reduxjs/toolkit';
import {getNearbyMapSites} from '../actions/mapAction';

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
      .addCase(getNearbyMapSites.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNearbyMapSites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(getNearbyMapSites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default nearbySitesSlice.reducer;
