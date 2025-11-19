import {createSlice} from '@reduxjs/toolkit';
import {
  deleteAIHistory,
  deleteSingleAIHistory,
  fetchAIHistory,
  saveAIHistory,
} from '../actions/aiAction';

const initialState = {
  isLoading: false,
  error: null,
  history: [],
};

const aiHistorySlice = createSlice({
  name: 'aiHistory',
  initialState,
  reducers: {
    resetAIHistoryState: state => {
      state.isLoading = false;
      state.error = null;
      state.history = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(saveAIHistory.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveAIHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('Saved AI history:', action.payload);
        state.history.push(action.payload.data);
      })
      .addCase(saveAIHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // console.error('Save AI history error:', action.payload);
      })
      .addCase(fetchAIHistory.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAIHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        // console.log('Fetched AI history:', action.payload);
        state.history = action.payload.data;
      })
      .addCase(fetchAIHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // console.error('Fetch AI history error:', action.payload);
      })
      .addCase(deleteAIHistory.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAIHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.history = [];
        console.log('Deleted AI history:', action.payload);
      })
      .addCase(deleteAIHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.error('Delete AI history error:', action.payload);
      })
      .addCase(deleteSingleAIHistory.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSingleAIHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.payload;
        console.log('Deleted single AI history:', deletedId);
        state.history = state.history.filter(item => item._id !== deletedId);
      })
      .addCase(deleteSingleAIHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.error('Delete single AI history error:', action.payload);
      });
  },
});

export const {resetAIHistoryState} = aiHistorySlice.actions;
export default aiHistorySlice.reducer;
