import { useEffect, useState, useCallback, useRef } from "react";
import { useHapticFeedback } from "./useHapticFeedback";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
}: UsePullToRefreshOptions) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  const { triggerHaptic } = useHapticFeedback();
  
  const startY = useRef(0);
  const currentY = useRef(0);
  const hasTriggeredHaptic = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only allow pull-to-refresh when at the top of the page
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setCanPull(true);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!canPull || isRefreshing) return;

      currentY.current = e.touches[0].clientY;
      const deltaY = currentY.current - startY.current;

      if (deltaY > 0 && window.scrollY === 0) {
        // Apply resistance to make it feel more natural
        const distance = Math.min(deltaY / resistance, threshold * 1.5);
        setPullDistance(distance);

        // Trigger haptic feedback when threshold is reached
        if (distance >= threshold && !hasTriggeredHaptic.current) {
          triggerHaptic("medium");
          hasTriggeredHaptic.current = true;
        }

        // Prevent default scroll behavior when pulling
        if (deltaY > 10) {
          e.preventDefault();
        }
      }
    },
    [canPull, isRefreshing, threshold, resistance, triggerHaptic]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!canPull) return;

    setCanPull(false);
    hasTriggeredHaptic.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      triggerHaptic("success");

      try {
        await onRefresh();
      } catch (error) {
        console.error("Refresh failed:", error);
        triggerHaptic("error");
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [canPull, pullDistance, threshold, isRefreshing, onRefresh, triggerHaptic]);

  useEffect(() => {
    const element = document.body;

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    pullDistance,
    isRefreshing,
    isAtThreshold: pullDistance >= threshold,
  };
};
