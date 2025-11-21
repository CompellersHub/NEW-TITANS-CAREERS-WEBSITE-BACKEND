import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { PageLayout } from "@/components/layouts/PageLayout";

export default function RefundPolicy() {
  return (
    <PageLayout intensity3D="subtle" show3D={true}>
      <SEO 
        title="Refund Policy | Titans Careers"
        description="Learn about Titans Careers refund policy, including your rights to cancel, digital course refunds, and subscription cancellations."
      />
      
      <div className="py-20">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Refund Policy</h1>
            <p className="text-muted-foreground">Effective Date: May 1, 2025</p>
          </div>

          <Alert className="mb-8">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              At Titans Careers, we are committed to delivering high-quality training to help individuals build rewarding careers. This policy outlines your rights and our obligations under UK law regarding refunds for our courses and subscriptions.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Your Right to Cancel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="list-disc pl-6 space-y-2">
                  <li>14-day cooling-off period from date of purchase</li>
                  <li>Right may be waived if you begin accessing digital content</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Digital Course Refunds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-green-600 mb-2">Eligible When:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Requested within 14 days</li>
                    <li>Less than 20% content accessed</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-red-600 mb-2">Not Eligible When:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>More than 20% content accessed</li>
                    <li>After 14 days from purchase</li>
                    <li>Certificate issued</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Subscription Cancellations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Cancel anytime, but no pro-rata refunds for unused time</li>
                  <li>Access continues until end of billing cycle</li>
                  <li>Cancel at least 24 hours before renewal to avoid charges</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Exceptional Circumstances</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>We may consider refunds for verified:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Medical emergencies</li>
                  <li>Technical failures not caused by user</li>
                  <li>Bereavement or force majeure</li>
                </ul>
                <p className="text-sm text-muted-foreground italic">
                  Supporting documentation may be required.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Requesting a Refund</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>
                  Email{" "}
                  <a 
                    href="mailto:support@titanscareers.com" 
                    className="text-primary hover:underline font-medium"
                  >
                    support@titanscareers.com
                  </a>{" "}
                  with:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Full name and email used during purchase</li>
                  <li>Course/subscription title</li>
                  <li>Reason for request</li>
                </ul>
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <p className="font-medium">Response Time:</p>
                  <p className="text-sm">Within 3 working days</p>
                  <p className="font-medium mt-2">Refund Processing:</p>
                  <p className="text-sm">7-10 business days</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Dispute Resolution</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Initial attempt to resolve amicably</li>
                  <li>Alternative Dispute Resolution (ADR) available</li>
                  <li>
                    Online Dispute Resolution platform:{" "}
                    <a
                      href="https://ec.europa.eu/consumers/odr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      ODR platform
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                <strong>Important Note:</strong> This policy does not affect your statutory rights under UK consumer law. Titans Careers reserves the right to amend this policy with changes published on our website.
              </AlertDescription>
            </Alert>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              For any questions regarding this refund policy, please contact us at{" "}
              <a 
                href="mailto:support@titanscareers.com" 
                className="text-primary hover:underline"
              >
                support@titanscareers.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
