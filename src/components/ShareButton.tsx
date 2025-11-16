import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Twitter, Facebook, Linkedin, Link2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareButtonProps {
  title: string;
  url: string;
  description?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const ShareButton = ({ 
  title, 
  url, 
  description,
  variant = "outline",
  size = "default",
  className = ""
}: ShareButtonProps) => {
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
        description: "Share link copied to clipboard.",
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-2">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Share via</p>
        </div>
        
        <DropdownMenuItem
          onClick={() => window.open(shareUrls.twitter, '_blank', 'noopener,noreferrer')}
          className="cursor-pointer"
        >
          <Twitter className="w-4 h-4 mr-2 text-[#1DA1F2]" />
          Share on Twitter
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => window.open(shareUrls.facebook, '_blank', 'noopener,noreferrer')}
          className="cursor-pointer"
        >
          <Facebook className="w-4 h-4 mr-2 text-[#1877F2]" />
          Share on Facebook
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => window.open(shareUrls.linkedin, '_blank', 'noopener,noreferrer')}
          className="cursor-pointer"
        >
          <Linkedin className="w-4 h-4 mr-2 text-[#0A66C2]" />
          Share on LinkedIn
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleCopyLink}
          className="cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-success" />
              Link Copied!
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4 mr-2" />
              Copy Link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
