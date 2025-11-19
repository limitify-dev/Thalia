import { createAsyncThunk } from "@reduxjs/toolkit";
import Toast from "react-native-toast-message";
import axiosInstance from "../../axios/http";

export const getNearbyMapSites = createAsyncThunk(
  "sites/getNearbyMapSites",
  async (_, { rejectWithValue }) => {
    // ✅ no params
    try {
      const response = await axiosInstance.get(`/sites/top`);
      console.log("response====123map", response.data);
      return response.data;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error.response?.data?.message || "Failed to fetch nearby sites",
      });
      return rejectWithValue(error.response?.data || "No data found");
    }
  }
);
