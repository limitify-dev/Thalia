import { useEffect, useMemo, useRef, useState } from "react";
import { InteractionManager } from "react-native";

export function useIncrementalList<T>(
  items: T[] | null | undefined,
  initial = 8,
  step = 10
) {
  const [limit, setLimit] = useState(initial);
  const hasMounted = useRef(false);

  // Safely handle null/undefined items
  const safeItems = useMemo(() => items ?? [], [items]);

  // Defer the first expansion until after UI settles
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      if (!hasMounted.current) {
        hasMounted.current = true;
        setLimit(initial);
      }
    });
    return () => task.cancel();
  }, [initial]);

  // If filters change, reset limit softly
  useEffect(() => {
    setLimit(initial);
  }, [safeItems, initial]);

  const visible = useMemo(() => safeItems.slice(0, limit), [safeItems, limit]);

  const loadMore = () => {
    if (limit < safeItems.length) {
      setLimit((x) => Math.min(x + step, safeItems.length));
    }
  };

  const canLoadMore = limit < safeItems.length;

  return { visible, loadMore, canLoadMore };
}
