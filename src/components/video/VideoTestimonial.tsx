import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface VideoTestimonialProps {
  videoUrl: string;
  thumbnailUrl: string;
  name: string;
  role: string;
  company?: string;
  avatarUrl?: string;
  caption?: string;
}

export function VideoTestimonial({
  videoUrl,
  thumbnailUrl,
  name,
  role,
  company,
  avatarUrl,
  caption
}: VideoTestimonialProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handlePlayPause = () => {
    setHasInteracted(true);
    const video = document.getElementById(`video-${name}`) as HTMLVideoElement;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-accent">
      <div className="relative aspect-video bg-muted">
        <video
          id={`video-${name}`}
          className="w-full h-full object-cover"
          poster={thumbnailUrl}
          preload={hasInteracted ? 'auto' : 'metadata'}
          onEnded={() => setIsPlaying(false)}
        >
          {hasInteracted && <source src={videoUrl} type="video/mp4" />}
        </video>
        
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-100 group-hover:opacity-100 transition-opacity">
          <Button
            size="lg"
            variant="secondary"
            className="rounded-full w-16 h-16"
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>
        </div>

        {caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <p className="text-white text-sm">{caption}</p>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12 border-2 border-accent">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-kanit font-semibold text-lg">{name}</h4>
            <p className="text-sm text-muted-foreground">
              {role}
              {company && ` • ${company}`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
