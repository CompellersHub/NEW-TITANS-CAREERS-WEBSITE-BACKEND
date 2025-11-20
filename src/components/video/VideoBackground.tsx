import { useEffect, useRef, useState } from 'react';

interface VideoBackgroundProps {
  videoUrl: string;
  posterUrl?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  className?: string;
}

export function VideoBackground({ 
  videoUrl, 
  posterUrl, 
  overlay = true,
  overlayOpacity = 0.5,
  className = ''
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => setIsLoaded(true);
    const handleError = () => setHasError(true);

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div className={`absolute inset-0 bg-gradient-to-br from-primary via-accent to-gold ${className}`}>
        {overlay && (
          <div 
            className="absolute inset-0 bg-background"
            style={{ opacity: overlayOpacity }}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster={posterUrl}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
      
      {overlay && (
        <div 
          className="absolute inset-0 bg-background"
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-gold animate-pulse" />
      )}
    </div>
  );
}
