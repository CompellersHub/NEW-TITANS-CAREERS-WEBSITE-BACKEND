import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const TermsConditions = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container px-4 max-w-4xl mx-auto">
          <h1 className="font-kanit font-bold text-4xl md:text-5xl text-primary mb-4">
            Terms and Conditions
          </h1>
          <p className="font-sans text-sm text-muted-foreground mb-8">
            Last updated: January 2025
          </p>

          <div className="space-y-8 font-sans text-muted-foreground">
            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                1. Agreement to Terms
              </h2>
              <p className="leading-relaxed">
                By accessing or using Titans Careers Limited's website and services, you agree to be 
                bound by these Terms and Conditions. If you disagree with any part of these terms, 
                you may not access our services.
              </p>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                2. Company Information
              </h2>
              <div className="leading-relaxed space-y-1">
                <p className="font-semibold">Titans Careers Limited</p>
                <p>Company Number: 16369966</p>
                <p>UKRLP Number: 10098472</p>
                <p>Email: info@titanscareers.com</p>
                <p>WhatsApp: +44 7539 434403</p>
              </div>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                3. Course Enrollment
              </h2>
              <p className="leading-relaxed mb-3">
                When you enroll in a course, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Pay all applicable fees for the courses you enroll in</li>
                <li>Use course materials for personal educational purposes only</li>
              </ul>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                4. Payment Terms
              </h2>
              <p className="leading-relaxed">
                Course fees must be paid in full at the time of enrollment unless a payment plan is 
                agreed upon. All prices are in GBP and include VAT where applicable. We reserve the 
                right to change our pricing at any time, but price changes will not affect enrollments 
                already purchased.
              </p>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                5. Payment Plans and Finance Options
              </h2>
              <p className="leading-relaxed">
                Payment plans and "pay later" options are subject to eligibility checks and approval. 
                Terms and conditions of third-party finance providers apply. Failure to meet payment 
                obligations may result in suspension of course access and additional fees.
              </p>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                6. Course Access
              </h2>
              <p className="leading-relaxed">
                Course access is granted upon successful payment and is valid for the duration specified 
                for each course. We reserve the right to modify, suspend, or discontinue any course at 
                any time with reasonable notice.
              </p>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                7. Intellectual Property
              </h2>
              <p className="leading-relaxed">
                All course materials, including but not limited to videos, documents, assessments, and 
                software, are the intellectual property of Titans Careers Limited or our licensors. 
                You may not reproduce, distribute, modify, or create derivative works without our 
                express written permission.
              </p>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                8. User Conduct
              </h2>
              <p className="leading-relaxed mb-3">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Share your account credentials with others</li>
                <li>Copy, distribute, or resell course materials</li>
                <li>Use our services for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Harass or harm other users or instructors</li>
              </ul>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                9. Certification and Qualifications
              </h2>
              <p className="leading-relaxed">
                Certificates of completion are awarded upon successful completion of course requirements. 
                These certificates represent completion of our training programs but do not guarantee 
                employment or professional certification. Some courses prepare you for external 
                certification exams, which are administered by third parties.
              </p>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                10. Limitation of Liability
              </h2>
              <p className="leading-relaxed">
                To the maximum extent permitted by law, Titans Careers Limited shall not be liable for 
                any indirect, incidental, special, consequential, or punitive damages resulting from 
                your use of or inability to use our services.
              </p>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                11. Governing Law
              </h2>
              <p className="leading-relaxed">
                These Terms and Conditions are governed by and construed in accordance with the laws 
                of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of 
                the courts of England and Wales.
              </p>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                12. Changes to Terms
              </h2>
              <p className="leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any 
                material changes via email or through our website. Continued use of our services after 
                changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                13. Contact Information
              </h2>
              <p className="leading-relaxed">
                For questions about these Terms and Conditions, please contact:
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

export default TermsConditions;
