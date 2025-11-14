import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export const ReadingProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      // Calculate progress percentage
      const scrollableHeight = documentHeight - windowHeight;
      const scrollPercentage = (scrollTop / scrollableHeight) * 100;
      
      setProgress(Math.min(100, Math.max(0, scrollPercentage)));
    };

    // Update on scroll
    window.addEventListener("scroll", updateProgress);
    // Initial calculation
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Progress 
        value={progress} 
        className="h-1 rounded-none bg-transparent"
        indicatorClassName="bg-accent transition-all duration-150"
      />
    </div>
  );
};
