import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Volume2, VolumeX, Maximize, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VideoPlayerProps {
  lessonId: string;
  lessonTitle: string;
  videoUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userId?: string;
}

export const VideoPlayer = ({
  lessonId,
  lessonTitle,
  videoUrl,
  isOpen,
  onClose,
  onComplete,
  userId,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const saveProgressIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen && videoRef.current) {
      loadProgress();
    }
    return () => {
      if (saveProgressIntervalRef.current) {
        clearInterval(saveProgressIntervalRef.current);
      }
    };
  }, [isOpen, lessonId]);

  const loadProgress = async () => {
    if (!userId) return;

    try {
      const { data } = await supabase
        .from("user_lesson_progress")
        .select("video_progress_seconds")
        .eq("user_id", userId)
        .eq("lesson_id", lessonId)
        .single();

      if (data && videoRef.current && data.video_progress_seconds > 0) {
        videoRef.current.currentTime = data.video_progress_seconds;
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  };

  const saveProgress = async (currentSeconds: number, totalSeconds: number) => {
    if (!userId || totalSeconds === 0) return;

    const watchedPercentage = (currentSeconds / totalSeconds) * 100;

    try {
      const { data: existing } = await supabase
        .from("user_lesson_progress")
        .select("id")
        .eq("user_id", userId)
        .eq("lesson_id", lessonId)
        .single();

      if (existing) {
        await supabase
          .from("user_lesson_progress")
          .update({
            video_progress_seconds: Math.floor(currentSeconds),
            video_watched_percentage: watchedPercentage,
            last_accessed_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("user_lesson_progress").insert({
          user_id: userId,
          lesson_id: lessonId,
          video_progress_seconds: Math.floor(currentSeconds),
          video_watched_percentage: watchedPercentage,
          completed: false,
        });
      }
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);

      // Save progress every 5 seconds
      saveProgressIntervalRef.current = setInterval(() => {
        if (videoRef.current) {
          saveProgress(videoRef.current.currentTime, videoRef.current.duration);
        }
      }, 5000);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      if (saveProgressIntervalRef.current) {
        clearInterval(saveProgressIntervalRef.current);
      }
      saveProgress(videoRef.current.currentTime, videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setDuration(total);
      setProgress((current / total) * 100);

      // Auto-complete when 95% watched
      if (current / total >= 0.95 && !hasCompleted) {
        handleVideoComplete();
      }
    }
  };

  const handleVideoComplete = async () => {
    if (hasCompleted) return;
    
    setHasCompleted(true);
    
    if (saveProgressIntervalRef.current) {
      clearInterval(saveProgressIntervalRef.current);
    }

    // Save final progress
    if (videoRef.current) {
      await saveProgress(videoRef.current.currentTime, videoRef.current.duration);
    }

    // Mark lesson as complete
    onComplete();
    
    toast.success("Lesson completed! 🎉", {
      description: "Great job! Keep up the good work.",
    });
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            {lessonTitle}
            {hasCompleted && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative bg-black aspect-video">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration);
              }
            }}
            onEnded={handleVideoComplete}
          />
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <Progress value={progress} className="h-1 mb-3" />
            
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isPlaying ? handlePause : handlePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                
                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
