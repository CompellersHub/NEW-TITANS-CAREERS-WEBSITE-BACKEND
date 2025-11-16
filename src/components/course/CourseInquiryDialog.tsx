import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CourseInquiryForm } from "./CourseInquiryForm";
import { Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseInquiryDialogProps {
  courseSlug: string;
  courseTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CourseInquiryDialog({
  courseSlug,
  courseTitle,
  isOpen,
  onOpenChange,
}: CourseInquiryDialogProps) {
  const [selectedInquiryType, setSelectedInquiryType] = useState<"free_session" | "whatsapp_group" | null>(null);

  const handleBack = () => {
    setSelectedInquiryType(null);
  };

  const handleSuccess = () => {
    setTimeout(() => {
      onOpenChange(false);
      setSelectedInquiryType(null);
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-accent to-gold bg-clip-text text-transparent">
            {selectedInquiryType === null && "Get Started with This Course"}
            {selectedInquiryType === "free_session" && "Book Your Free Session"}
            {selectedInquiryType === "whatsapp_group" && "Join WhatsApp Group"}
          </DialogTitle>
          <DialogDescription>
            {selectedInquiryType === null && "Choose how you'd like to proceed"}
            {selectedInquiryType === "free_session" && "We'll contact you within 24 hours to schedule your free consultation"}
            {selectedInquiryType === "whatsapp_group" && "Get instant access to our course community on WhatsApp"}
          </DialogDescription>
        </DialogHeader>

        {selectedInquiryType === null ? (
          <div className="grid gap-4 py-6">
            <Button
              onClick={() => setSelectedInquiryType("free_session")}
              size="lg"
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-2 hover:border-accent hover:bg-accent/5 transition-all group"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-lg text-foreground">Book a Free Session</div>
                  <div className="text-sm text-muted-foreground">Get a personalized consultation about this course</div>
                </div>
              </div>
            </Button>

            <Button
              onClick={() => setSelectedInquiryType("whatsapp_group")}
              size="lg"
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-2 hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-center gap-3 w-full">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-lg text-foreground">Join WhatsApp Group</div>
                  <div className="text-sm text-muted-foreground">Connect with students and get course updates</div>
                </div>
              </div>
            </Button>
          </div>
        ) : (
          <CourseInquiryForm
            courseSlug={courseSlug}
            courseTitle={courseTitle}
            inquiryType={selectedInquiryType}
            onSuccess={handleSuccess}
            onBack={handleBack}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
