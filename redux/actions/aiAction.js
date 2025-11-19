import { createAsyncThunk } from "@reduxjs/toolkit";
import Toast from "react-native-toast-message";
import axiosInstance from "../../axios/http";

export const saveAIHistory = createAsyncThunk(
  "ai/saveAIHistory",
  async ({ chatId, messageType, senderType, content }, { rejectWithValue }) => {
    try {
      console.log("Saving to API:", {
        chatId,
        messageType,
        senderType,
        content,
      });
      const response = await axiosInstance.post("ai/history", {
        chatId,
        messageType,
        senderType,
        content,
      });
      console.log("api ai history", response);
      return response.data;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error.response?.data?.message || "Failed to save AI history",
      });
      return rejectWithValue(error.response?.data || "No data found");
    }
  }
);

export const fetchAIHistory = createAsyncThunk(
  "ai/fetchAIHistory",
  async (
    { chatId, limit = 100, sort = "newest", cursor = null },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.get("/ai/history", {
        params: { chatId, limit, sort, cursor },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Fetch AI history error:",
        error.response?.data || error.message
      );
      return rejectWithValue(error.response?.data || "No data found");
    }
  }
);

export const deleteAIHistory = createAsyncThunk(
  "ai/deleteAIHistory",
  async ({ chatId }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete("/ai/history", { data: { chatId } });
      return [];
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error.response?.data?.message || "Failed to delete AI history",
      });
      return rejectWithValue(
        error.response?.data || "Failed to delete history"
      );
    }
  }
);

export const deleteSingleAIHistory = createAsyncThunk(
  "ai/deleteSingleAIHistory",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/ai/history/${id}`);
      return id;
    } catch (error) {
      Toast.show({
        type: "error",
        text1:
          error.response?.data?.message || "Failed to delete AI history item",
      });
      return rejectWithValue(
        error.response?.data || "Failed to delete history item"
      );
    }
  }
);

// New thunk for image upload
export const uploadAIImage = createAsyncThunk(
  "ai/uploadAIImage",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/ai/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.url;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error.response?.data?.message || "Failed to upload image",
      });
      return rejectWithValue(error.response?.data || "Upload failed");
    }
  }
);
