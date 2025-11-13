import { Phone, Mail, MessageCircle, ArrowUp, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useToast } from "@/hooks/use-toast";
import { QuickContactFormModal } from "@/components/contact/QuickContactFormModal";

export function MobileContactBar() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { triggerHaptic } = useHapticFeedback();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      // Show scroll-to-top button when user scrolls past the hero section (approximately 600px)
      const scrollPosition = window.scrollY;
      setShowScrollTop(scrollPosition > 600);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    triggerHaptic("medium");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleContactClick = (type: "whatsapp" | "call" | "email") => {
    triggerHaptic("light");
    if (type === "whatsapp") {
      toast({
        title: "⚡ Quick Response",
        description: "Average response: 5 mins",
        duration: 3000,
      });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Scroll to Top Button - appears above the action bar */}
      <div
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 transition-all duration-300 ${
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <Button
          onClick={scrollToTop}
          className="w-12 h-12 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-2xl hover:shadow-accent/50 hover:scale-110 transition-all active:scale-95"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Action Bar */}
      <div className="bg-background/95 backdrop-blur-lg border-t-2 border-accent/30 shadow-2xl animate-fade-in">
        <div className="container px-4 py-3">
          {/* Quick Contact Form Button */}
          <div className="mb-3">
            <QuickContactFormModal>
              <Button
                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg hover:shadow-xl"
              >
                <MessagesSquare className="w-5 h-5" />
                <span>Quick Contact Form</span>
              </Button>
            </QuickContactFormModal>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* WhatsApp Button */}
            <a
              href="https://wa.me/447539434403"
              target="_blank"
              rel="noopener noreferrer"
              className="block relative"
              onClick={(e) => {
                e.preventDefault();
                handleContactClick("whatsapp");
                // Small delay before opening WhatsApp
                setTimeout(() => {
                  window.open("https://wa.me/447539434403", "_blank");
                }, 300);
              }}
            >
              <Button
                className="w-full h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs">WhatsApp</span>
              </Button>
              {/* Pulsing Badge */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse shadow-lg">
                <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-75"></div>
              </div>
            </a>

            {/* Call Button */}
            <a
              href="tel:+442045720475"
              className="block"
              onClick={() => handleContactClick("call")}
            >
              <Button
                className="w-full h-14 bg-accent hover:bg-accent/90 text-accent-foreground font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-lg hover:shadow-xl"
              >
                <Phone className="w-5 h-5" />
                <span className="text-xs">Call Now</span>
              </Button>
            </a>

            {/* Email Button */}
            <a
              href="mailto:info@titanscareers.com"
              className="block"
              onClick={() => handleContactClick("email")}
            >
              <Button
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-lg hover:shadow-xl"
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
    </div>
  );
}
