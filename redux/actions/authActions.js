import { createAsyncThunk } from "@reduxjs/toolkit";
import Toast from "react-native-toast-message";
import axiosInstance from "../../axios/http";

export const setFcmToken = createAsyncThunk(
  "auth/setFcmToken",
  async (token, { rejectWithValue }) => {
    return token;
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ data, callback }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/signin", data);

      console.log("login", response);
      callback();
      return response.data;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error.response?.data?.message || "Login failed",
      });
      return rejectWithValue(error.response?.data || "No data found");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ data, callback }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/signup", data);

      const token = response.data?.token;
      const user = response.data?.user;

      if (token) {
        dispatch(authActions.setToken(token));
        dispatch(authActions.setUser(user));
      }

      Toast.show({
        type: "success",
        text1: "Registration successful!",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Registration failed.",
        text2: error.response?.data?.message || error.message,
      });
    } finally {
      dispatch(authActions.setLoading(false));
    }
  }
);

export const forgotPasswordUser = createAsyncThunk(
  "auth/forgotPasswordUser",
  async ({ data, callback }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/forgot-password", data);

      Toast.show({
        type: "success",
        text1:
          response?.data?.message ||
          "OTP Sent Successfully Please Check Your Email",
      });
      callback();
      return response.data;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error.response?.data?.message || "Registration failed",
      });
      return rejectWithValue(error.response?.data || "Registration failed");
    }
  }
);

export const otpVerificationUser = createAsyncThunk(
  "auth/otpVerificationUser",
  async ({ data, callback }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/validate-otp", data);

      Toast.show({
        type: "success",
        text1: response?.data?.message || "OTP Verified Successfully",
      });
      callback();
      return response.data;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error.response?.data?.message || "OTP Verification Failed",
      });
      return rejectWithValue(error.response?.data || "OTP Verification Failed");
    }
  }
);

export const resetPasswordUser = createAsyncThunk(
  "auth/resetPasswordUser",
  async ({ data, callback }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/reset-password", data);

      Toast.show({
        type: "success",
        text1: response?.data?.message || "Password Reset Successfully",
      });
      callback();
      return response.data;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error.response?.data?.message || "Registration failed",
      });
      return rejectWithValue(error.response?.data || "Registration failed");
    }
  }
);

export const updateProfileAction = createAsyncThunk(
  "user/updateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put("/user/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Toast.show({
        type: "success",
        text1: response?.data?.message || "Profile updated successfully",
      });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return rejectWithValue(message);
    }
  }
);
