import {createSlice} from '@reduxjs/toolkit';
import {
  confirmRegistration,
  createPaymentIntent,
} from '../actions/paymentAction';

const initialState = {
  loading: false,
  clientSecret: null,
  paymentIntentId: null,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentState: state => {
      state.clientSecret = null;
      state.paymentIntentId = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(createPaymentIntent.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.clientSecret = action.payload.paymentIntentClientSecret;
        state.paymentIntentId = action.payload.paymentIntentId;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(confirmRegistration.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmRegistration.fulfilled, state => {
        state.loading = false;
      })
      .addCase(confirmRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {clearPaymentState} = paymentSlice.actions;

export default paymentSlice.reducer;
