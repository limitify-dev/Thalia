import NetInfo from "@react-native-community/netinfo";
import { createAsyncThunk } from "@reduxjs/toolkit";
import Toast from "react-native-toast-message";

import { initPaymentSheet, initStripe } from "@stripe/stripe-react-native";
import axiosInstance from "../../axios/http";
import { STRIPE_CONFIG } from "../../utils/stripe";

export const createPaymentIntent = createAsyncThunk(
  "payment/createPaymentIntent",
  async (
    { siteId, datetime, numberOfAdults, numberOfChildren },
    { rejectWithValue }
  ) => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        Toast.show({
          type: "error",
          text1: "No Internet Connection",
          text2: "Please connect to the internet to continue",
        });
        return rejectWithValue("No Internet Connection");
      }
      await initStripe({
        publishableKey: STRIPE_CONFIG.publishableKey,
      });

      const response = await axiosInstance.post("/sites/reservation", {
        siteId,
        datetime,
        numberOfAdults,
        numberOfChildren,
      });

      if (!response.data.success || !response.data.data?.clientSecret) {
        throw new Error(response.data.message || "Failed to initiate payment");
      }

      const { clientSecret, paymentIntentId } = response.data.data;

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        customFlow: true,
        merchantDisplayName: "Your Business Name",
      });

      if (error) {
        Toast.show({
          type: "error",
          text1: "Error initializing payment sheet",
          text2: error.message,
        });
        return rejectWithValue(error);
      }

      return {
        paymentIntentClientSecret: clientSecret,
        paymentIntentId,
      };
    } catch (error) {
      console.error("createPaymentIntent error:", error);
      Toast.show({
        type: "error",
        text1:
          error?.response?.data?.message ||
          error.message ||
          "Error creating payment intent",
      });
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const confirmRegistration = createAsyncThunk(
  "payment/confirmRegistration",
  async ({ eventId, paymentIntentId }, { rejectWithValue }) => {
    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        Toast.show({
          type: "error",
          text1: "No Internet Connection",
          text2: "Please connect to the internet to continue",
        });
        return rejectWithValue("No Internet Connection");
      }
      const response = await axiosInstance.post(
        `/payment/confirm-registration/${eventId}`,
        {
          paymentIntentId,
        }
      );
      return response.data;
    } catch (error) {
      Toast.show({
        type: "error",
        text1:
          error?.response?.data?.message || "Error confirming registration",
      });
      return rejectWithValue(error.response?.data);
    }
  }
);
