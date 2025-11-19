import {createSlice} from '@reduxjs/toolkit';
import {
  deleteNotification,
  fetchNotifications,
  markNotificationAsRead,
  updateNotificationPreferences,
} from '../actions/notifictionAction';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    data: [],
    loading: false,
    error: null,
    nextCursor: null,
    updateLoading: false,
    preferences: {
      userPreferences: null,
      sitePreferences: null,
    },
    preferencesLoading: false,
    preferencesError: null,
  },
  reducers: {
    clearNotifications: state => {
      state.data = [];
      state.nextCursor = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder

      .addCase(fetchNotifications.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const {success, data} = action.payload;

        if (success && data?.notifications) {
          const newNotifications = data.notifications;

          const existingIds = new Set(state.data.map(n => n._id));
          const uniqueNewNotifications = newNotifications.filter(
            n => !existingIds.has(n._id),
          );

          state.data = [...state.data, ...uniqueNewNotifications];
          const nextPage = data.pagination?.page || 1;
          state.nextCursor = nextPage + 1;
        }

        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markNotificationAsRead.pending, state => {
        state.updateLoading = true;
      })

      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const {success, notification} = action.payload;

        if (success && notification) {
          state.data = state.data.map(n =>
            n._id === notification._id ? {...n, isRead: true} : n,
          );
        }

        state.loading = false;
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteNotification.pending, state => {
        state.updateLoading = true;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationId = action.payload;
        state.data = state.data.filter(
          notification => notification._id !== notificationId,
        );
        state.loading = false;
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateNotificationPreferences.pending, state => {
        state.preferencesLoading = true;
        state.preferencesError = null;
      })
      .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
        const {success, data} = action.payload;
        if (success && data) {
          state.preferences = {
            userPreferences: data.userPreferences,
            sitePreferences: data.sitePreferences,
          };
        }
        state.preferencesLoading = false;
      })
      .addCase(updateNotificationPreferences.rejected, (state, action) => {
        state.preferencesLoading = false;
        state.preferencesError = action.payload;
      });
  },
});

export const {clearNotifications} = notificationSlice.actions;
export default notificationSlice.reducer;
