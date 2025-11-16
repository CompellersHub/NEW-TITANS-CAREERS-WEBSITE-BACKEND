import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, GraduationCap, X } from "lucide-react";
import { Link } from "react-router-dom";

export const TimedCallToAction = () => {
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if dialogs have been shown in this session
    const sessionShown = sessionStorage.getItem("cta_dialogs_shown");
    if (sessionShown) {
      setHasShown(true);
      return;
    }

    // Show first dialog (Book Free Session) after 10 seconds
    const bookingTimer = setTimeout(() => {
      if (!hasShown) {
        setShowBookingDialog(true);
        setHasShown(true);
        sessionStorage.setItem("cta_dialogs_shown", "true");
      }
    }, 10000);

    return () => clearTimeout(bookingTimer);
  }, [hasShown]);

  const handleBookingClose = () => {
    setShowBookingDialog(false);
    
    // Show second dialog (Join Free Session) 3 seconds after closing the first
    setTimeout(() => {
      setShowJoinDialog(true);
    }, 3000);
  };

  return (
    <>
      {/* Book Free Session Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-2 border-accent/20">
          <button
            onClick={handleBookingClose}
            className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all z-10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="bg-gradient-to-br from-accent/10 via-accent/5 to-background p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-accent/20 rounded-2xl flex items-center justify-center">
              <Calendar className="w-8 h-8 text-accent" />
            </div>
            
            <DialogHeader className="space-y-3 mb-6">
              <DialogTitle className="text-2xl font-kanit font-bold text-foreground">
                Book Your Free Career Consultation
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground leading-relaxed">
                Get personalized guidance from our career experts. Discover which tech career path is perfect for you and how we can help you achieve your goals.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3 text-left">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-accent text-xs font-bold">✓</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  1-on-1 consultation with industry professionals
                </p>
              </div>
              <div className="flex items-start gap-3 text-left">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-accent text-xs font-bold">✓</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Personalized learning path recommendations
                </p>
              </div>
              <div className="flex items-start gap-3 text-left">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-accent text-xs font-bold">✓</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Career roadmap tailored to your goals
                </p>
              </div>
            </div>

            <Link to="/contact" onClick={() => setShowBookingDialog(false)}>
              <Button 
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-primary font-sans font-bold text-base h-12 shadow-lg hover:shadow-xl transition-all"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book My Free Session Now
              </Button>
            </Link>
            
            <p className="text-xs text-muted-foreground mt-4">
              No credit card required • 100% free • No obligations
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Free Session Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-2 border-accent/20">
          <button
            onClick={() => setShowJoinDialog(false)}
            className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all z-10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="bg-gradient-to-br from-accent/10 via-accent/5 to-background p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-accent/20 rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-accent" />
            </div>
            
            <DialogHeader className="space-y-3 mb-6">
              <DialogTitle className="text-2xl font-kanit font-bold text-foreground">
                Join Our Free Training Sessions
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground leading-relaxed">
                Experience our teaching style firsthand. Join live training sessions and see why 300+ professionals chose Titans Careers for their transformation.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3 text-left">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-accent text-xs font-bold">✓</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Live interactive training with expert instructors
                </p>
              </div>
              <div className="flex items-start gap-3 text-left">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-accent text-xs font-bold">✓</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Real-world projects and practical exercises
                </p>
              </div>
              <div className="flex items-start gap-3 text-left">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-accent text-xs font-bold">✓</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Network with like-minded career changers
                </p>
              </div>
            </div>

            <Link to="/courses" onClick={() => setShowJoinDialog(false)}>
              <Button 
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-primary font-sans font-bold text-base h-12 shadow-lg hover:shadow-xl transition-all"
              >
                <GraduationCap className="w-5 h-5 mr-2" />
                Browse Free Sessions
              </Button>
            </Link>
            
            <p className="text-xs text-muted-foreground mt-4">
              No registration required • Join anytime • Interactive learning
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
