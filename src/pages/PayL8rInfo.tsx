import { useState } from "react";
import { PageLayout } from "@/components/layouts/PageLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, CreditCard, Calendar, ShieldCheck, HelpCircle } from "lucide-react";
import { PayL8rCalculator } from "@/components/payment/PayL8rCalculator";

const PayL8rInfo = () => {
  const [exampleCourse] = useState({ price: 1500, title: "Professional Development Course" });

  return (
    <PageLayout intensity3D="subtle" show3D={true}>
      <SEO
        title="PayL8r Payment Options - Spread the Cost of Your Training"
        description="Spread the cost of your training with 0% APR. Pay over 3, 6, 9, or 12 months with PayL8r. Simple approval process, instant decisions."
        keywords="payl8r, payment plans, spread cost, 0% apr, installment payments"
      />
      <main className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PayL8r Payment Options
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Invest in your future with flexible payment plans. Spread the cost of your training with 0% APR options.
            </p>
          </div>

          {/* Key Benefits */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CreditCard className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">0% APR</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No interest charges. Pay only the course price.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Flexible Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Choose from 3, 6, 9, or 12 month payment plans.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle2 className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Instant Decision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Get approved in minutes with our quick online process.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ShieldCheck className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Secure & Safe</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">FCA regulated with secure payment processing.</p>
              </CardContent>
            </Card>
          </div>

          {/* Calculator */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Calculate Your Monthly Payments</h2>
            <div className="max-w-2xl mx-auto">
              <PayL8rCalculator
                coursePrice={exampleCourse.price}
              />
            </div>
          </div>

          {/* How It Works */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">How PayL8r Works</CardTitle>
              <CardDescription>Simple steps to finance your training</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Choose Your Course</h3>
                    <p className="text-muted-foreground">Select the training course you want to enroll in.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Select PayL8r at Checkout</h3>
                    <p className="text-muted-foreground">Choose PayL8r as your payment method and select your preferred term.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Complete Quick Application</h3>
                    <p className="text-muted-foreground">Fill in a simple online form (takes about 2 minutes).</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Get Instant Decision</h3>
                    <p className="text-muted-foreground">Receive an immediate approval decision.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Start Learning</h3>
                    <p className="text-muted-foreground">Access your course immediately while spreading the cost.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Eligibility */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">Am I Eligible?</CardTitle>
              <CardDescription>Check if you meet the basic requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Requirements
                  </h3>
                  <ul className="space-y-2 text-muted-foreground ml-7">
                    <li>• Be 18 years or older</li>
                    <li>• Be a UK resident</li>
                    <li>• Have a UK bank account</li>
                    <li>• Have a regular income</li>
                    <li>• Pass a credit check</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-600" />
                    What You'll Need
                  </h3>
                  <ul className="space-y-2 text-muted-foreground ml-7">
                    <li>• Your full name and address</li>
                    <li>• Date of birth</li>
                    <li>• Employment details</li>
                    <li>• Bank account information</li>
                    <li>• Contact details</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="max-w-3xl mx-auto">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is there really 0% interest?</AccordionTrigger>
                <AccordionContent>
                  Yes! PayL8r offers genuine 0% APR finance. You'll only pay the course price split into equal monthly installments. There are no hidden fees or interest charges.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>When do I start my course?</AccordionTrigger>
                <AccordionContent>
                  You can start your course immediately after approval. You don't need to wait for full payment - that's the beauty of finance!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>What if I want to pay off early?</AccordionTrigger>
                <AccordionContent>
                  You can pay off your finance agreement early at any time with no penalties. Simply contact PayL8r to arrange early settlement.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>Will this affect my credit score?</AccordionTrigger>
                <AccordionContent>
                  The initial application involves a soft credit check which doesn't affect your credit score. Only if you proceed with the finance will a full credit check be performed, which may have a minor temporary impact.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>What happens if I miss a payment?</AccordionTrigger>
                <AccordionContent>
                  It's important to keep up with payments. Missing payments can result in late fees and may affect your credit score. If you're having difficulty, contact PayL8r immediately to discuss your options.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>Is my application secure?</AccordionTrigger>
                <AccordionContent>
                  Absolutely. PayL8r is FCA regulated and uses bank-level encryption to protect your personal and financial information. Your data is completely secure.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger>Can I use PayL8r for any course?</AccordionTrigger>
                <AccordionContent>
                  PayL8r is available for most of our training courses. The option will be presented at checkout if the course is eligible for finance.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger>How long does approval take?</AccordionTrigger>
                <AccordionContent>
                  Most applications receive an instant decision. In some cases, additional verification may be required, which typically takes 1-2 business days.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Important Information */}
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle>Important Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="space-y-2">
                <p>• PayL8r is a trading name of Social Money Limited, who is authorised by the FCA (Ref. Number 675283).</p>
                <p>• Credit is subject to status and affordability. Terms and conditions apply.</p>
                <p>• You must be 18 or over to apply. UK residents only.</p>
                <p>• Missing payments may affect your credit score and ability to obtain credit in the future.</p>
                <p>• Representative APR 65.5% on payment agreements from 3-12 months.</p>
              </div>
              <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <p className="text-xs text-amber-900 dark:text-amber-100">
                  TITANS CAREERS LIMITED is an Introducer Appointed Representative of Social Money Limited t/a Payl8r who is authorised by the FCA under Ref. Number 675283. Credit is subject to creditworthiness and affordability assessments. Missed payments may affect your credit file, future borrowing and incur fees. Representative APR 65.5%
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
    </PageLayout>
  );
};

export default PayL8rInfo;
