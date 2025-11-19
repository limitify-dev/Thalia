import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axios/http";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (cursor = null, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/notifications/`, {
        params: cursor ? { cursor } : {},
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markNotificationAsRead",
  async (notificationId, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/notifications/${notificationId}/read`
      );
      const data = response.data;
      return {
        success: data.success,
        notification: data.data,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
export const deleteNotification = createAsyncThunk(
  "notifications/deleteNotification",
  async (notificationId, thunkAPI) => {
    try {
      await axiosInstance.delete(`/notifications/${notificationId}`);
      return notificationId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchNotificationPreferences = createAsyncThunk(
  "notifications/fetchPreferences",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/notifications/preferences");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateNotificationPreferences = createAsyncThunk(
  "notifications/updatePreferences",
  async ({ userPreferences, sitePreferences }, thunkAPI) => {
    try {
      const response = await axiosInstance.put("/notifications/preferences", {
        userPreferences,
        sitePreferences,
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);
