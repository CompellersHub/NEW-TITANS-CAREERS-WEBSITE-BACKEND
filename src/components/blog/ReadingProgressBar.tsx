import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";

interface ReadingProgressBarProps {
  readTime: number | string;
}

export const ReadingProgressBar = ({ readTime }: ReadingProgressBarProps) => {
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

  // Calculate time remaining
  const totalMinutes = typeof readTime === 'string' 
    ? parseInt(readTime.replace(" min read", "")) 
    : readTime;
  const timeRemaining = Math.ceil(totalMinutes * (1 - progress / 100));
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Progress 
        value={progress} 
        className="h-1 rounded-none bg-transparent"
        indicatorClassName="bg-accent transition-all duration-150"
      />
      {progress > 5 && (
        <div className="absolute top-2 right-4 bg-background/95 backdrop-blur-sm border border-border rounded-full px-3 py-1 shadow-lg animate-fade-in">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{timeRemaining} min left</span>
          </div>
        </div>
      )}
    </div>
  );
};
