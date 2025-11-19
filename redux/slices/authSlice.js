import {createSlice} from '@reduxjs/toolkit';
import {
  loginUser,
  registerUser,
  updateProfileAction,
} from '../actions/authActions';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    profile: {},
    isLoading: false,
    error: null,
    token: null,
    fcmToken: null,
    tokenExpiry: null,
  },
  reducers: {
    logout: state => {
      state.token = null;
      state.user = null;
      state.fcmToken = null;
      state.tokenExpiry = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.fcmToken = action.payload.fcmToken;
        state.tokenExpiry = action.payload.tokenExpiry;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateProfileAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfileAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = {
          ...state.user,
          ...action.payload,
        };
      })
      .addCase(updateProfileAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.tokenExpiry = action.payload.tokenExpiry;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {logout} = authSlice.actions;
export default authSlice.reducer;
