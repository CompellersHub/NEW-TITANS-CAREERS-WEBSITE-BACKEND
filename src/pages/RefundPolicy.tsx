import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container px-4 max-w-4xl mx-auto">
          <h1 className="font-kanit font-bold text-4xl md:text-5xl text-primary mb-4">
            Refund Policy
          </h1>
          <p className="font-sans text-sm text-muted-foreground mb-8">
            Last updated: January 2025
          </p>

          <div className="space-y-8 font-sans text-muted-foreground">
            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                1. 14-Day Cooling-Off Period
              </h2>
              <p className="leading-relaxed">
                In accordance with UK Consumer Contracts Regulations, you have the right to cancel your 
                course enrollment within 14 days of purchase for a full refund. This cooling-off period 
                begins on the day you enroll in the course.
              </p>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                2. Cancellation After 14 Days
              </h2>
              <p className="leading-relaxed">
                After the 14-day cooling-off period, refunds are considered on a case-by-case basis. 
                We may offer a partial refund if you have completed less than 25% of the course content 
                and can demonstrate exceptional circumstances that prevent you from continuing.
              </p>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                3. How to Request a Refund
              </h2>
              <p className="leading-relaxed mb-3">
                To request a refund, please contact us at:
              </p>
              <div className="pl-4 space-y-1">
                <p>Email: info@titanscareers.com</p>
                <p>WhatsApp: +44 7539 434403</p>
              </div>
              <p className="leading-relaxed mt-3">
                Include your order number, enrollment date, and reason for the refund request.
              </p>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                4. Processing Time
              </h2>
              <p className="leading-relaxed">
                Approved refunds will be processed within 14 business days and credited back to your 
                original payment method. Please allow additional time for your bank or card provider 
                to process the refund.
              </p>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                5. Non-Refundable Items
              </h2>
              <p className="leading-relaxed mb-3">
                The following are non-refundable:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Courses completed more than 25% (unless exceptional circumstances apply)</li>
                <li>Course materials that have been downloaded or accessed</li>
                <li>Administrative or processing fees (if applicable)</li>
                <li>Third-party certification exam fees</li>
              </ul>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                6. Payment Plan Cancellations
              </h2>
              <p className="leading-relaxed">
                If you are enrolled in a payment plan and cancel after the cooling-off period, you 
                may still be liable for payments already made and any outstanding installments for 
                content accessed up to the cancellation date.
              </p>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                7. Course Cancellation by Titans Careers
              </h2>
              <p className="leading-relaxed">
                If we cancel or significantly modify a course, you will receive a full refund or the 
                option to transfer to an alternative course of equal value.
              </p>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                8. Contact Us
              </h2>
              <p className="leading-relaxed">
                For questions about our refund policy, please contact:
              </p>
              <div className="mt-3 pl-4">
                <p className="font-semibold">Titans Careers Limited</p>
                <p>Email: info@titanscareers.com</p>
                <p>WhatsApp: +44 7539 434403</p>
                <p>Company Number: 16369966</p>
                <p>UKRLP Number: 10098472</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RefundPolicy;
