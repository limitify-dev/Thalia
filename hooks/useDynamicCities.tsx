import { useState, useCallback } from "react";
import debounce from "lodash.debounce";

export type City = {
  name: string;
  country: string;
  latlng: [number, number];
};

export function useDynamicCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setCities([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=20&q=${encodeURIComponent(
          query
        )}`;

        const res = await fetch(url, {
          headers: {
            "User-Agent": "Thalia/1.0", // Replace with your app name
            "Accept-Language": "en",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        // Better filtering for cities
        const filtered = data.filter((item: any) => {
          const type = item.type || item.class;
          return (
            ["city", "town", "village", "administrative"].includes(type) ||
            item.importance > 0.3
          );
        });

        const formatted: City[] = filtered.map((item: any) => ({
          name: item.display_name.split(",")[0],
          country: item.address?.country || "Unknown",
          latlng: [parseFloat(item.lat), parseFloat(item.lon)] as [
            number,
            number
          ],
        }));

        // Remove duplicates
        const uniqueCities = formatted.filter(
          (city, index, self) =>
            index ===
            self.findIndex(
              (c) => c.name === city.name && c.country === city.country
            )
        );

        setCities(uniqueCities);
      } catch (err) {
        console.error("Failed to fetch cities:", err);
        setError("Failed to search cities");
        setCities([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const clearCities = useCallback(() => {
    setCities([]);
    setError(null);
  }, []);

  return { cities, fetchCities, loading, error, clearCities };
}
