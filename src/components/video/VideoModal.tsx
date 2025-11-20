import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

export function VideoModal({ isOpen, onClose, videoUrl, title }: VideoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0">
        {title && (
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="font-kanit">{title}</DialogTitle>
          </DialogHeader>
        )}
        <div className="aspect-video bg-black">
          <video
            controls
            autoPlay
            className="w-full h-full"
            src={videoUrl}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
}
