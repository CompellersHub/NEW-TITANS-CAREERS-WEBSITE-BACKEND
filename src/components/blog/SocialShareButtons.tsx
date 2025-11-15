import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Linkedin, Link2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SocialShareButtonsProps {
  title: string;
  url: string;
}

export const SocialShareButtons = ({ title, url }: SocialShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Article link copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not copy link.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="hidden xl:block fixed left-8 top-1/2 -translate-y-1/2 z-40">
      <div className="flex flex-col gap-3 bg-card border border-border rounded-lg p-3 shadow-lg">
        <div className="text-xs font-semibold text-muted-foreground text-center mb-1">
          Share
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] transition-colors"
          onClick={() => window.open(shareUrls.twitter, '_blank', 'noopener,noreferrer')}
          aria-label="Share on Twitter"
        >
          <Twitter className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-[#1877F2]/10 hover:text-[#1877F2] transition-colors"
          onClick={() => window.open(shareUrls.facebook, '_blank', 'noopener,noreferrer')}
          aria-label="Share on Facebook"
        >
          <Facebook className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] transition-colors"
          onClick={() => window.open(shareUrls.linkedin, '_blank', 'noopener,noreferrer')}
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="w-5 h-5" />
        </Button>

        <div className="h-px bg-border my-1" />

        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-accent/10 hover:text-accent transition-colors"
          onClick={handleCopyLink}
          aria-label="Copy link"
        >
          {copied ? (
            <Check className="w-5 h-5 text-success" />
          ) : (
            <Link2 className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
};
