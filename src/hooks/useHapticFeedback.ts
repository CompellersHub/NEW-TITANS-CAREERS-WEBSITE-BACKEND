import { useCallback } from "react";

type HapticPattern = "light" | "medium" | "heavy" | "success" | "error";

export const useHapticFeedback = () => {
  const triggerHaptic = useCallback((pattern: HapticPattern = "light") => {
    // Check if vibration API is supported
    if (!("vibrate" in navigator)) {
      return;
    }

    try {
      switch (pattern) {
        case "light":
          navigator.vibrate(10);
          break;
        case "medium":
          navigator.vibrate(20);
          break;
        case "heavy":
          navigator.vibrate(30);
          break;
        case "success":
          navigator.vibrate([10, 50, 10]);
          break;
        case "error":
          navigator.vibrate([20, 100, 20]);
          break;
        default:
          navigator.vibrate(10);
      }
    } catch (error) {
      // Silently fail if vibration is not supported or blocked
      console.debug("Haptic feedback not available:", error);
    }
  }, []);

  return { triggerHaptic };
};
