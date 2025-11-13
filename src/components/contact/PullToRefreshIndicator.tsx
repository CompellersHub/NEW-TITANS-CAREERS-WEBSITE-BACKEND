import { RefreshCw, CheckCircle } from "lucide-react";

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  isAtThreshold: boolean;
  threshold: number;
}

export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  isAtThreshold,
  threshold,
}: PullToRefreshIndicatorProps) {
  const progress = Math.min((pullDistance / threshold) * 100, 100);
  const opacity = Math.min(pullDistance / 50, 1);

  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center md:hidden"
      style={{
        transform: `translateY(${Math.min(pullDistance, threshold * 1.2)}px)`,
        opacity: opacity,
        transition: isRefreshing ? "transform 0.3s ease-out" : "none",
      }}
    >
      <div className="bg-background/95 backdrop-blur-lg rounded-full shadow-2xl p-4 border-2 border-accent/30">
        <div className="relative w-12 h-12 flex items-center justify-center">
          {/* Progress Circle */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 48 48"
          >
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-muted"
              opacity="0.2"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-accent transition-all duration-200"
              strokeDasharray={`${(progress / 100) * 125.6} 125.6`}
              strokeLinecap="round"
            />
          </svg>

          {/* Icon */}
          {isRefreshing ? (
            <RefreshCw className="w-6 h-6 text-accent animate-spin" />
          ) : isAtThreshold ? (
            <CheckCircle className="w-6 h-6 text-accent animate-scale-in" />
          ) : (
            <RefreshCw
              className="w-6 h-6 text-accent transition-transform"
              style={{ transform: `rotate(${progress * 3.6}deg)` }}
            />
          )}
        </div>
      </div>

      {/* Text Indicator */}
      <div className="absolute top-full mt-2 text-center">
        <p className="text-sm font-semibold text-foreground bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-accent/20">
          {isRefreshing
            ? "Refreshing..."
            : isAtThreshold
            ? "Release to refresh"
            : "Pull to refresh"}
        </p>
      </div>
    </div>
  );
}
