import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_PREFIX = "museum_cache_";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Cache structure
interface CacheItem {
  data: any;
  timestamp: number;
  expiry: number;
}

export const cacheManager = {
  // Store data in cache
  set: async (key: string, data: any, duration: number = CACHE_DURATION) => {
    try {
      const cacheItem: CacheItem = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + duration,
      };
      await AsyncStorage.setItem(
        `${CACHE_PREFIX}${key}`,
        JSON.stringify(cacheItem)
      );
    } catch (error) {
      console.warn("Cache set error:", error);
    }
  },

  // Retrieve data from cache
  get: async (key: string): Promise<any> => {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const cacheItem: CacheItem = JSON.parse(cached);

      // Check if cache is expired
      if (Date.now() > cacheItem.expiry) {
        await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn("Cache get error:", error);
      return null;
    }
  },

  // Remove specific cache item
  remove: async (key: string) => {
    try {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      console.warn("Cache remove error:", error);
    }
  },

  // Clear all cache
  clearAll: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn("Cache clear error:", error);
    }
  },

  // Generate cache key for coordinates
  generateCoordinateKey: (
    lat: number,
    lng: number,
    radius: number,
    type: string = "museums"
  ) => {
    const roundedLat = Math.round(lat * 10000) / 10000;
    const roundedLng = Math.round(lng * 10000) / 10000;
    return `${type}_${roundedLat}_${roundedLng}_${radius}`;
  },
};
