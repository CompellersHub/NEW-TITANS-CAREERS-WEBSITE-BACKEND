import { PageLayout } from "@/components/layouts/PageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, Mail, ExternalLink } from "lucide-react";

export default function ThankYou() {
  return (
    <PageLayout intensity3D="medium" show3D={true}>
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="flex justify-center">
            <CheckCircle className="h-24 w-24 text-primary" />
          </div>
          
          <h1 className="text-5xl font-bold text-foreground">
            🎉 Welcome to Titans Careers!
          </h1>
          
          <p className="text-xl text-muted-foreground">
            Your enrollment was successful. We're excited to have you on board!
          </p>
          
          <div className="bg-card border border-border rounded-lg p-8 space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold text-lg mb-2">Check Your Email</h3>
                <p className="text-muted-foreground">
                  You'll receive login credentials for the learning platform within the next few minutes.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <ExternalLink className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold text-lg mb-2">Access Your Course</h3>
                <p className="text-muted-foreground">
                  Your course will be available at <strong>learn.titanscareers.com</strong>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link to="/courses">
              <Button variant="outline" size="lg">
                Browse More Courses
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg">
                Return to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
