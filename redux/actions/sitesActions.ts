import NetInfo from "@react-native-community/netinfo";
import { createAsyncThunk } from "@reduxjs/toolkit";
import Toast from "react-native-toast-message";
import axiosInstance from "../../axios/http";

const checkInternet = async () => {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) {
    Toast.show({
      type: "error",
      text1: "No Internet Connection",
      text2: "Please check your network and try again.",
    });
    return false;
  }
  return true;
};

export const getAllSitesAction = createAsyncThunk<
  any,
  { callback?: () => void }
>(
  "sites/getAllSitesAction",
  async ({ callback }, { rejectWithValue }) => {
    const isConnected = await checkInternet();
    if (!isConnected) return rejectWithValue("No internet connection");
    try {
      const response = await axiosInstance.get("/sites");
      console.log("response===", response);
      callback?.();
      return response.data;
    } catch (error) {
      console.log("error===", error);
      Toast.show({
        type: "error",
        text1: (error as any).response?.data?.message || "No data found",
      });
      return rejectWithValue((error as any).response?.data || "No data found");
    }
  },
  {
    getPendingMeta: () => ({ showLoading: false }),
  }
);

export const getAllBookMarkAction = createAsyncThunk<
  any,
  { callback?: () => void }
>("sites/getAllBookMarkAction", async ({ callback }, { rejectWithValue }) => {
  const isConnected = await checkInternet();
  if (!isConnected) return rejectWithValue("No internet connection");
  try {
    const response = await axiosInstance.get("/sites/bookmarked");
    console.log("response====>1651927", response);
    callback?.();
    return response.data;
  } catch (error) {
    Toast.show({
      type: "error",
      text1: (error as any).response?.data?.message || "No data found",
    });
    return rejectWithValue((error as any).response?.data || "No data found");
  }
});

export const siteBookMarkedAction = createAsyncThunk<
  any,
  { id: string; callback: (res: any) => void }
>(
  "sites/siteBookMarkedAction",
  async ({ id, callback }, { rejectWithValue }) => {
    console.log("new id", id);
    const isConnected = await checkInternet();
    if (!isConnected) return rejectWithValue("No internet connection");
    try {
      const response = await axiosInstance.post(`/sites/${id}/bookmark/toggle`);
      console.log("response", response);
      callback?.(response.data.data);
      return response.data.data;
    } catch (error) {
      console.log("❌ error:", (error as any).response?.data);
      Toast.show({
        type: "error",
        text1: (error as any).response?.data?.message || "No data found",
      });
      return rejectWithValue((error as any).response?.data || "No data found");
    }
  }
);

export const likeSiteAction = createAsyncThunk<
  any,
  { id: string; callback?: (res: any) => void }
>("sites/likeSiteAction", async ({ id, callback }, { rejectWithValue }) => {
  const isConnected = await checkInternet();
  if (!isConnected) return rejectWithValue("No internet connection");
  try {
    const response = await axiosInstance.post(`/sites/like/${id}`);
    const liked = response.data.data.liked;
    if (callback) callback(response.data.data);
    return { id, liked };
  } catch (error) {
    Toast.show({
      type: "error",
      text1: (error as any).response?.data?.message || "Failed to like site",
    });
    return rejectWithValue((error as any).response?.data || "Like failed");
  }
});

export const getReservationsAction = createAsyncThunk<
  any,
  { callback?: () => void }
>(
  "reservations/getReservationsAction",
  async ({ callback }, { rejectWithValue }) => {
    const isConnected = await checkInternet();
    if (!isConnected) return rejectWithValue("No internet connection");
    try {
      const response = await axiosInstance.get("/sites/reservation");
      if (callback) callback();
      return response.data.data;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: (error as any).response?.data?.message || "No Reserver Site 😊",
      });
      return rejectWithValue((error as any).response?.data || "Network error");
    }
  }
);

export const getSiteByIdAction = createAsyncThunk<any, string>(
  "sites/getSiteByIdAction",
  async (id, { rejectWithValue }) => {
    const isConnected = await checkInternet();
    if (!isConnected) return rejectWithValue("No internet connection");
    try {
      const response = await axiosInstance.get(`/sites/${id}`);
      return response.data.data;
    } catch (error) {
      Toast.show({
        type: "error",
        text1:
          (error as any).response?.data?.message ||
          "Failed to fetch site details",
      });
      return rejectWithValue((error as any).response?.data || "Network error");
    }
  }
);

export const searchSite = createAsyncThunk<any, string>(
  "/searchHistory/sites",
  async (siteTitle, { rejectWithValue, getState }) => {
    if ((siteTitle as string).trim() === "") {
      return { sites: (getState() as any).sites.allSites || [] };
    }
    const isConnected = await checkInternet();
    if (!isConnected) return rejectWithValue("No internet connection");
    try {
      const response = await axiosInstance.post("/search-history/sites/", {
        query: siteTitle,
      });
      return response.data;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: (error as any).response?.data?.message || "No data found",
      });
      return rejectWithValue((error as any).response?.data || "No data found");
    }
  }
);

export const clearSearchResults = () => ({
  type: "sites/clearSearchResults",
});

export const searchSiteVisit = createAsyncThunk<any, string>(
  "/searchHistory/visit",
  async (siteId, { rejectWithValue }) => {
    const isConnected = await checkInternet();
    if (!isConnected) return rejectWithValue("No internet connection");
    try {
      const response = await axiosInstance.post("/search-history/visit", {
        siteId,
      });
      return response.data;
    } catch (error) {
      Toast.show({
        type: "error",
        text1: (error as any).response?.data?.message || "Failed to log visit",
      });
      return rejectWithValue(
        (error as any).response?.data || "Failed to log visit"
      );
    }
  }
);

export const getRecentlyVisitedSites = createAsyncThunk<any, void>(
  "recentlyVisitedSites/get",
  async (_, { rejectWithValue }) => {
    const isConnected = await checkInternet();
    if (!isConnected) return rejectWithValue("No internet connection");
    try {
      const response = await axiosInstance.get(
        "/search-history/recently-visited"
      );
      return response.data;
    } catch (error) {
      const message =
        (error as any).response?.data?.message ||
        "Failed to fetch recently visited sites";
      Toast.show({ type: "error", text1: message });
      return rejectWithValue(message);
    }
  }
);

export const deleteSearchAll = createAsyncThunk<any, void>(
  "deleteSearchAll",
  async (_, { rejectWithValue }) => {
    const isConnected = await checkInternet();
    if (!isConnected) return rejectWithValue("No internet connection");
    try {
      const response = await axiosInstance.delete(
        "/search-history/visited-sites"
      );
      Toast.show({
        type: "success",
        text1: "Success",
        text2: response.data.message || "Search history cleared successfully",
      });
      return response.data;
    } catch (error) {
      const message =
        (error as any).response?.data?.message ||
        "Failed to Delete Search History";
      Toast.show({ type: "error", text1: message });
      return rejectWithValue(message);
    }
  }
);

export const deleteSearchSingle = createAsyncThunk<any, string>(
  "deleteSearchSingle",
  async (siteId, { rejectWithValue }) => {
    const isConnected = await checkInternet();
    if (!isConnected) return rejectWithValue("No internet connection");
    try {
      const response = await axiosInstance.delete(
        `/search-history/visited-sites/${siteId}`
      );
      return response.data;
    } catch (error) {
      const message =
        (error as any).response?.data?.message ||
        "Failed to Delete Search History";
      Toast.show({ type: "error", text1: message });
      return rejectWithValue(message);
    }
  }
);

export const deletePastReservation = createAsyncThunk<any, string>(
  "reservation/deletePastReservation",
  async (siteId, { rejectWithValue }) => {
    const isConnected = await checkInternet();
    if (!isConnected) return rejectWithValue("No internet connection");
    try {
      const response = await axiosInstance.delete(
        `/sites/reservation/site/${siteId}/past`
      );
      Toast.show({
        type: "success",
        text1: "Reservation Deleted",
        text2:
          response.data?.message ||
          "The past reservation was removed successfully.",
      });
      return response?.data;
    } catch (error) {
      const message =
        (error as any).response?.data?.message ||
        "Failed to delete past reservation";
      Toast.show({ type: "error", text1: message });
      return rejectWithValue(message);
    }
  }
);

export const addReview = createAsyncThunk<
  any,
  { siteId: string; rating: number; review: string }
>(
  "addReview",
  async ({ siteId, rating, review }, { rejectWithValue, dispatch }) => {
    const isConnected = await checkInternet();
    if (!isConnected) return rejectWithValue("No internet connection");
    try {
      const response = await axiosInstance.post(`/sites/review/${siteId}`, {
        rating,
        review,
      });
      // Dispatch getSiteByIdAction to refresh site data
      dispatch(getSiteByIdAction(siteId));
      return response.data; // Ensure response.data includes the new review and updated averageRating
    } catch (error) {
      const message =
        (error as any).response?.data?.message ||
        "You have already submitted a review on this site";
      Toast.show({ type: "error", text1: message });
      return rejectWithValue(message);
    }
  }
);

export const deleteReview = createAsyncThunk<
  any,
  { siteId: string; reviewId: string }
>(
  "deleteReview",
  async ({ siteId, reviewId }, { rejectWithValue, dispatch }) => {
    const isConnected = await checkInternet();
    if (!isConnected) return rejectWithValue("No internet connection");
    try {
      const response = await axiosInstance.delete(
        `/sites/review/${siteId}/reviews/${reviewId}`
      );
      // Dispatch getSiteByIdAction to refresh site data
      dispatch(getSiteByIdAction(siteId));
      return { siteId, reviewId };
    } catch (error) {
      const message =
        (error as any).response?.data?.message || "Failed to delete review";
      Toast.show({ type: "error", text1: message });
      return rejectWithValue(message);
    }
  }
);

export const likeReview = createAsyncThunk<
  any,
  { siteId: string; reviewId: string }
>("reviews/likeReview", async ({ siteId, reviewId }, { rejectWithValue }) => {
  const isConnected = await checkInternet();
  if (!isConnected) return rejectWithValue("No internet connection");
  try {
    const response = await axiosInstance.post(
      `/sites/review/${siteId}/like/${reviewId}`
    );
    return {
      siteId,
      reviewId,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    const message =
      (error as any).response?.data?.message || "Failed to like review";
    Toast.show({ type: "error", text1: message });
    return rejectWithValue(message);
  }
});
