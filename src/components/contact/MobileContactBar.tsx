import { Phone, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileContactBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-lg border-t-2 border-accent/30 shadow-2xl animate-fade-in">
      <div className="container px-4 py-3">
        <div className="grid grid-cols-3 gap-3">
          {/* WhatsApp Button */}
          <a
            href="https://wa.me/447539434403"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              className="w-full h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs">WhatsApp</span>
            </Button>
          </a>

          {/* Call Button */}
          <a href="tel:+442045720475" className="block">
            <Button
              className="w-full h-14 bg-accent hover:bg-accent/90 text-accent-foreground font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-lg"
            >
              <Phone className="w-5 h-5" />
              <span className="text-xs">Call Now</span>
            </Button>
          </a>

          {/* Email Button */}
          <a href="mailto:info@titanscareers.com" className="block">
            <Button
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-lg"
            >
              <Mail className="w-5 h-5" />
              <span className="text-xs">Email</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Gradient overlay at the top for smooth blend */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent"></div>
    </div>
  );
}
