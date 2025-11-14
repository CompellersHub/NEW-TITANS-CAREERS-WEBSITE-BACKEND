import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollProps<T> {
  items: T[];
  itemsPerPage?: number;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn<T> {
  displayedItems: T[];
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  reset: () => void;
  totalDisplayed: number;
  totalItems: number;
}

export function useInfiniteScroll<T>({
  items,
  itemsPerPage = 12,
  enabled = true,
}: UseInfiniteScrollProps<T>): UseInfiniteScrollReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const totalDisplayed = currentPage * itemsPerPage;
  const displayedItems = items.slice(0, totalDisplayed);
  const hasMore = totalDisplayed < items.length;

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || !enabled) return;

    setIsLoadingMore(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setCurrentPage((prev) => prev + 1);
      setIsLoadingMore(false);
    }, 500);
  }, [hasMore, isLoadingMore, enabled]);

  const reset = useCallback(() => {
    setCurrentPage(1);
    setIsLoadingMore(false);
  }, []);

  // Set up intersection observer for automatic loading
  useEffect(() => {
    if (!enabled || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoadingMore) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '200px', // Start loading 200px before reaching the sentinel
        threshold: 0.1,
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, hasMore, isLoadingMore, loadMore]);

  // Attach observer to sentinel element
  const setSentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      sentinelRef.current = node;
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (node && observerRef.current) {
        observerRef.current.observe(node);
      }
    },
    []
  );

  // Reset when items change (e.g., filtering)
  useEffect(() => {
    reset();
  }, [items.length, reset]);

  return {
    displayedItems,
    hasMore,
    isLoadingMore,
    loadMore,
    reset,
    totalDisplayed,
    totalItems: items.length,
  };
}

// Hook to get the sentinel ref for intersection observer
export function useInfiniteScrollSentinel() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  return sentinelRef;
}
