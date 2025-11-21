import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { PageLayout } from "@/components/layouts/PageLayout";

export default function TermsConditions() {
  return (
    <PageLayout intensity3D="subtle" show3D={true}>
      <SEO 
        title="Terms and Conditions | Titans Careers"
        description="Read Titans Careers terms and conditions, covering service usage, subscriptions, content policies, intellectual property, and user responsibilities."
      />
      
      <div className="py-20">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Terms and Conditions</h1>
            <p className="text-muted-foreground">Last updated: May 30, 2025</p>
          </div>

          <Alert className="mb-8">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Please read these terms and conditions carefully before using Our Service.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {/* Interpretation and Definitions */}
            <Card>
              <CardHeader>
                <CardTitle>Interpretation and Definitions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Interpretation</h3>
                  <p className="text-sm text-muted-foreground">
                    The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Definitions</h3>
                  <p className="text-sm text-muted-foreground mb-2">For the purposes of these Terms and Conditions:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><strong>Application</strong> means the software program provided by the Company downloaded by You on any electronic device, named Titans Careers</li>
                    <li><strong>Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares</li>
                    <li><strong>Country</strong> refers to: United Kingdom</li>
                    <li><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to TITANS CAREERS, 3rd Floor, 45 Albemarle Street, Mayfair</li>
                    <li><strong>Content</strong> refers to content such as text, images, or other information that can be posted, uploaded, linked to or otherwise made available by You</li>
                    <li><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet</li>
                    <li><strong>Service</strong> refers to the Application or the Website or both</li>
                    <li><strong>Subscriptions</strong> refer to the services or access to the Service offered on a subscription basis by the Company to You</li>
                    <li><strong>Website</strong> refers to Titans Careers, accessible from www.titanscareers.com</li>
                    <li><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Acknowledgment */}
            <Card>
              <CardHeader>
                <CardTitle>Acknowledgment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
                <p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>
                <p>By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.</p>
                <p>You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.</p>
                <p>Your access to and use of the Service is also conditioned on Your acceptance of and compliance with the Privacy Policy of the Company. Our Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your personal information when You use the Application or the Website and tells You about Your privacy rights and how the law protects You. Please read Our Privacy Policy carefully before using Our Service.</p>
              </CardContent>
            </Card>

            {/* Subscriptions */}
            <Card>
              <CardHeader>
                <CardTitle>Subscriptions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Subscription Period</h3>
                  <p className="text-sm text-muted-foreground">The Service or some parts of the Service are available only with a paid Subscription. You will be billed in advance on a recurring and periodic basis (such as daily, weekly, monthly or annually), depending on the type of Subscription plan you select when purchasing the Subscription.</p>
                  <p className="text-sm text-muted-foreground mt-2">At the end of each period, Your Subscription will automatically renew under the exact same conditions unless You cancel it or the Company cancels it.</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Subscription Cancellations</h3>
                  <p className="text-sm text-muted-foreground">You may cancel Your Subscription renewal either through Your Account settings page or by contacting the Company. You will not receive a refund for the fees You already paid for Your current Subscription period and You will be able to access the Service until the end of Your current Subscription period.</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Billing</h3>
                  <p className="text-sm text-muted-foreground">You shall provide the Company with accurate and complete billing information including full name, address, state, zip code, telephone number, and a valid payment method information.</p>
                  <p className="text-sm text-muted-foreground mt-2">Should automatic billing fail to occur for any reason, the Company will issue an electronic invoice indicating that you must proceed manually, within a certain deadline date, with the full payment corresponding to the billing period as indicated on the invoice.</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Fee Changes</h3>
                  <p className="text-sm text-muted-foreground">The Company, in its sole discretion and at any time, may modify the Subscription fees. Any Subscription fee change will become effective at the end of the then-current Subscription period.</p>
                  <p className="text-sm text-muted-foreground mt-2">The Company will provide You with reasonable prior notice of any change in Subscription fees to give You an opportunity to terminate Your Subscription before such change becomes effective.</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Refunds</h3>
                  <p className="text-sm text-muted-foreground">Except when required by law, paid Subscription fees are non-refundable.</p>
                  <p className="text-sm text-muted-foreground mt-2">Certain refund requests for Subscriptions may be considered by the Company on a case-by-case basis and granted at the sole discretion of the Company.</p>
                </div>
              </CardContent>
            </Card>

            {/* Promotions */}
            <Card>
              <CardHeader>
                <CardTitle>Promotions</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Any Promotions made available through the Service may be governed by rules that are separate from these Terms.</p>
                <p className="mt-2">If You participate in any Promotions, please review the applicable rules as well as our Privacy policy. If the rules for a Promotion conflict with these Terms, the Promotion rules will apply.</p>
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Your Right to Post Content</h3>
                  <p className="text-sm text-muted-foreground">Our Service allows You to post Content. You are responsible for the Content that You post to the Service, including its legality, reliability, and appropriateness.</p>
                  <p className="text-sm text-muted-foreground mt-2">By posting Content to the Service, You grant Us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service. You retain any and all of Your rights to any Content You submit, post or display on or through the Service and You are responsible for protecting those rights.</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Content Restrictions</h3>
                  <p className="text-sm text-muted-foreground mb-2">The Company is not responsible for the content of the Service's users. You may not transmit any Content that is:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                    <li>Unlawful or promoting unlawful activity</li>
                    <li>Defamatory, discriminatory, or mean-spirited content</li>
                    <li>Spam or unauthorized advertising</li>
                    <li>Containing viruses, malware, or other harmful content</li>
                    <li>Infringing on any proprietary rights</li>
                    <li>Impersonating any person or entity</li>
                    <li>Violating the privacy of any third person</li>
                    <li>False information and features</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Content Backups</h3>
                  <p className="text-sm text-muted-foreground">Although regular backups of Content are performed, the Company does not guarantee there will be no loss or corruption of data.</p>
                  <p className="text-sm text-muted-foreground mt-2">You agree to maintain a complete and accurate copy of any Content in a location independent of the Service.</p>
                </div>
              </CardContent>
            </Card>

            {/* Copyright Policy */}
            <Card>
              <CardHeader>
                <CardTitle>Copyright Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <h3 className="font-semibold mb-2">Intellectual Property Infringement</h3>
                  <p>We respect the intellectual property rights of others. It is Our policy to respond to any claim that Content posted on the Service infringes a copyright or other intellectual property infringement of any person.</p>
                  <p className="mt-2">If You are a copyright owner, or authorized on behalf of one, and You believe that the copyrighted work has been copied in a way that constitutes copyright infringement that is taking place through the Service, You must submit Your notice in writing to the attention of our copyright agent via email at{" "}
                    <a href="mailto:support@titanscareers.com" className="text-primary hover:underline">support@titanscareers.com</a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card>
              <CardHeader>
                <CardTitle>Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>The Service and its original content (excluding Content provided by You or other users), features and functionality are and will remain the exclusive property of the Company and its licensors.</p>
                <p className="mt-2">The Service is protected by copyright, trademark, and other laws of both the Country and foreign countries.</p>
                <p className="mt-2">Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of the Company.</p>
              </CardContent>
            </Card>

            {/* Links to Other Websites */}
            <Card>
              <CardHeader>
                <CardTitle>Links to Other Websites</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Our Service may contain links to third-party web sites or services that are not owned or controlled by the Company.</p>
                <p className="mt-2">The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such web sites or services.</p>
                <p className="mt-2">We strongly advise You to read the terms and conditions and privacy policies of any third-party web sites or services that You visit.</p>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card>
              <CardHeader>
                <CardTitle>Termination</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.</p>
                <p className="mt-2">Upon termination, Your right to use the Service will cease immediately.</p>
              </CardContent>
            </Card>

            {/* Limitation of Liability */}
            <Card>
              <CardHeader>
                <CardTitle>Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of this Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven't purchased anything through the Service.</p>
                <p className="mt-2">To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, loss of data or other information, for business interruption, for personal injury, loss of privacy arising out of or in any way related to the use of or inability to use the Service, third-party software and/or third-party hardware used with the Service, or otherwise in connection with any provision of this Terms).</p>
              </CardContent>
            </Card>

            {/* "AS IS" and "AS AVAILABLE" Disclaimer */}
            <Card>
              <CardHeader>
                <CardTitle>"AS IS" and "AS AVAILABLE" Disclaimer</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>The Service is provided to You "AS IS" and "AS AVAILABLE" and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Service.</p>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card>
              <CardHeader>
                <CardTitle>Governing Law</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>The laws of the Country, excluding its conflicts of law rules, shall govern this Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.</p>
              </CardContent>
            </Card>

            {/* Disputes Resolution */}
            <Card>
              <CardHeader>
                <CardTitle>Disputes Resolution</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>If You have any concern or dispute about the Service, You agree to first try to resolve the dispute informally by contacting the Company.</p>
                <p className="mt-2"><strong>For European Union (EU) Users:</strong> If You are a European Union consumer, you will benefit from any mandatory provisions of the law of the country in which You are resident.</p>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Changes to These Terms and Conditions</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.</p>
                <p className="mt-2">By continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms. If You do not agree to the new terms, in whole or in part, please stop using the website and the Service.</p>
              </CardContent>
            </Card>

            {/* Contact Us */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="mb-2">If you have any questions about these Terms and Conditions, You can contact us:</p>
                <ul className="space-y-1">
                  <li>By email: <a href="mailto:support@titanscareers.com" className="text-primary hover:underline">support@titanscareers.com</a></li>
                  <li>By visiting this page on our website: <a href="https://www.titanscareers.com" className="text-primary hover:underline">www.titanscareers.com</a></li>
                  <li>By phone number: 02045720475</li>
                  <li>By mail: 3rd Floor, 45, Albemarle Street, Mayfair, London, United Kingdom, W1S 4JL</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
