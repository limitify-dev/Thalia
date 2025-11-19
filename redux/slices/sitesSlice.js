import {createSlice} from '@reduxjs/toolkit';
import {
  deleteSearchAll,
  deleteSearchSingle,
  getAllBookMarkAction,
  getAllSitesAction,
  getRecentlyVisitedSites,
  getReservationsAction,
  getSiteByIdAction,
  likeSiteAction,
  searchSite,
  searchSiteVisit,
  siteBookMarkedAction,
  deletePastReservation,
  addReview,
  deleteReview,
  likeReview,
} from '../actions/sitesActions';

const sitesSlice = createSlice({
  name: 'sites',
  initialState: {
    sites: [],
    allSites: [],
    displayedSites: [],
    originalSites: [],
    searchResults: [],
    reservations: [],
    recentlyVisited: [],
    reviews: [],
    reviewLoading: false,
    isLoading: false,
    error: null,
    site: null,
    likedStatus: {},
    isLiking: false,
    loading: false,
    isLoggingVisit: false,
    isVisited: false,
    isDeletingHistory: false,
    isDeletingSingleSearch: false,
    bookmarkLoading: false,
    bookmarkError: null,
  },
  reducers: {
    setSites: (state, action) => {
      state.sites = action.payload.updatedSites;
    },
    clearSearchResults: state => {
      state.displayedSites = state.allSites;
      state.searchResults = [];
    },
    optimisticUpdateSites: (state, action) => {
      const {sites} = action.payload;
      state.sites = sites;
      state.allSites = sites;
      state.displayedSites = sites;
      console.log('optimisticUpdateSites:', {sites: state.sites});
    },
    optimisticDeleteReview: (state, action) => {
      const {reviewId, siteId} = action.payload;
      if (state.site && state.site._id === siteId) {
        state.site.reviews = state.site.reviews.filter(
          review => review._id !== reviewId,
        );
      }
    },
    // ✅ NEW: Clear site data before fetching new one
    clearSite: state => {
      state.site = null;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(getAllSitesAction.pending, (state, action) => {
        const showLoading = action.meta?.showLoading !== false;
        const hasSites = Array.isArray(state.sites) && state.sites.length > 0;
        state.isLoading = showLoading && !hasSites;
        state.error = null;
      })
      .addCase(getAllSitesAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sites = action.payload;
        state.allSites = action.payload;
        state.displayedSites = action.payload;
      })
      .addCase(getAllSitesAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getAllBookMarkAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sites = action.payload;
      })
      .addCase(siteBookMarkedAction.pending, state => {
        state.bookmarkLoading = true;
        state.error = null;
      })
      .addCase(siteBookMarkedAction.fulfilled, (state, action) => {
        state.bookmarkLoading = false;
        const {id, bookmarkBy} = action.payload;
        const siteIndex = state.sites.findIndex(site => site._id === id);
        if (siteIndex !== -1 && bookmarkBy) {
          state.sites[siteIndex].bookmarkBy = bookmarkBy;
        }
      })
      .addCase(siteBookMarkedAction.rejected, (state, action) => {
        state.bookmarkLoading = false;
        state.error = action.payload;
      })
      .addCase(likeSiteAction.pending, state => {
        state.isLiking = true;
        state.error = null;
      })
      .addCase(likeSiteAction.fulfilled, (state, action) => {
        const {id, liked} = action.payload;
        state.likedStatus[id] = liked;
        state.isLiking = false;
      })
      .addCase(likeSiteAction.rejected, (state, action) => {
        state.isLiking = false;
        state.error = action.payload;
      })
      .addCase(getReservationsAction.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReservationsAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reservations = action.payload;
      })
      .addCase(getReservationsAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getSiteByIdAction.pending, state => {
        state.isLoading = true;
      })
      .addCase(getSiteByIdAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.site = action.payload;
      })
      .addCase(getSiteByIdAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(searchSite.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchSite.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.sites || [];

        const searchTerm = action.meta.arg?.trim();
        if (searchTerm) {
          state.displayedSites = action.payload.sites || [];
        } else {
          state.displayedSites = state.allSites || [];
        }

        state.error = null;
      })
      .addCase(searchSite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(searchSiteVisit.pending, state => {
        state.isLoggingVisit = true;
        state.error = null;
      })
      .addCase(searchSiteVisit.fulfilled, state => {
        state.isLoggingVisit = false;
      })
      .addCase(searchSiteVisit.rejected, (state, action) => {
        state.isLoggingVisit = false;
        state.error = action.payload;
      })
      .addCase(getRecentlyVisitedSites.pending, state => {
        state.isVisited = true;
        state.error = null;
      })
      .addCase(getRecentlyVisitedSites.fulfilled, (state, action) => {
        state.isVisited = false;
        state.recentlyVisited = action.payload || [];
        state.error = null;
      })
      .addCase(getRecentlyVisitedSites.rejected, (state, action) => {
        state.isVisited = false;
        state.error = action.payload;
      })
      .addCase(deleteSearchAll.pending, state => {
        state.isDeletingHistory = true;
        state.error = null;
      })
      .addCase(deleteSearchAll.fulfilled, state => {
        state.isDeletingHistory = false;
        state.recentlyVisited = [];
      })
      .addCase(deleteSearchAll.rejected, (state, action) => {
        state.isDeletingHistory = false;
        state.error = action.payload;
      })
      .addCase(deleteSearchSingle.pending, state => {
        state.isDeletingSingleSearch = true;
        state.error = null;
      })
      .addCase(deleteSearchSingle.fulfilled, (state, action) => {
        const {siteId} = action.payload;
        state.recentlyVisited = state.recentlyVisited.filter(
          item => item.siteId !== siteId,
        );
        state.isDeletingSingleSearch = false;
      })
      .addCase(deleteSearchSingle.rejected, (state, action) => {
        state.isDeletingSingleSearch = false;
        state.error = action.payload;
      })
      .addCase(deletePastReservation.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePastReservation.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.meta.arg;
        state.reservations = state.reservations.filter(
          reservation => reservation.siteId !== deletedId,
        );
      })
      .addCase(deletePastReservation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addReview.pending, state => {
        state.reviewLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.reviewLoading = false;
        state.success = true;
      })
      .addCase(addReview.rejected, (state, action) => {
        state.reviewLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(deleteReview.pending, state => {
        state.reviewLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviewLoading = false;
        state.success = true;
        if (state.site) {
          const deletedReview = state.site.reviews.find(
            review => review._id === action.meta.arg.reviewId,
          );
          if (deletedReview && state.site.reviewStats) {
            const newCount = state.site.reviewStats.totalReviews - 1;
            const newSum =
              state.site.reviewStats.totalReviews *
                state.site.reviewStats.averageRating -
              deletedReview.rating;
            state.site.reviewStats = {
              ...state.site.reviewStats,
              totalReviews: newCount,
              averageRating: newCount > 0 ? newSum / newCount : 0,
            };
          }
        }
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.reviewLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(likeReview.pending, state => {
        state.reviewLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(likeReview.fulfilled, (state, action) => {
        state.reviewLoading = false;
        state.success = true;
        const {reviewId, likedBy} = action.payload;

        if (state.site?.reviews) {
          state.site.reviews = state.site.reviews.map(review => {
            if (review._id === reviewId) {
              return {...review, likedBy: likedBy || []};
            }
            return review;
          });
        }
      })
      .addCase(likeReview.rejected, (state, action) => {
        state.reviewLoading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

// ✅ Export clearSite here
export const {setSites, clearSite} = sitesSlice.actions;

export default sitesSlice.reducer;
