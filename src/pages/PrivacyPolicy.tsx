import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layouts/PageLayout";
import { LegalPageSkeleton } from "@/components/admin/LegalPageSkeleton";

const PrivacyPolicy = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LegalPageSkeleton />;
  }
  return (
    <PageLayout intensity3D="subtle" show3D={true}>
      <main className="pt-24 pb-16">
        <div className="container px-4 max-w-4xl mx-auto">
          <h1 className="font-kanit font-bold text-4xl md:text-5xl text-primary mb-4">
            Privacy Policy
          </h1>
          <p className="font-sans text-sm text-muted-foreground mb-8">
            Last updated: January 2025
          </p>

          <div className="space-y-8 font-sans text-muted-foreground">
            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                1. Introduction
              </h2>
              <p className="leading-relaxed">
                Titans Careers Limited ("we", "our", or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you visit our website or use our services.
              </p>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                2. Information We Collect
              </h2>
              <p className="leading-relaxed mb-3">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, and contact details</li>
                <li>Payment and billing information</li>
                <li>Course enrollment and progress data</li>
                <li>Communication preferences</li>
                <li>Any other information you choose to provide</li>
              </ul>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                3. How We Use Your Information
              </h2>
              <p className="leading-relaxed mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our courses and services</li>
                <li>Process your enrollments and payments</li>
                <li>Send you course materials, updates, and administrative information</li>
                <li>Respond to your comments, questions, and customer service requests</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Monitor and analyze trends, usage, and activities</li>
              </ul>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                4. Information Sharing and Disclosure
              </h2>
              <p className="leading-relaxed">
                We do not sell or rent your personal information to third parties. We may share your 
                information only in the following circumstances: with your consent, to comply with legal 
                obligations, to protect our rights and safety, or with service providers who assist us 
                in operating our website and delivering our services.
              </p>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                5. Data Security
              </h2>
              <p className="leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal 
                information against unauthorized access, alteration, disclosure, or destruction. However, 
                no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                6. Your Rights
              </h2>
              <p className="leading-relaxed mb-3">
                Under GDPR and UK data protection laws, you have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Request restriction of processing</li>
                <li>Data portability</li>
                <li>Withdraw consent</li>
              </ul>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                7. Cookies
              </h2>
              <p className="leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our website and 
                hold certain information. You can instruct your browser to refuse all cookies or to 
                indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="font-kanit font-semibold text-2xl text-primary mb-4">
                8. Contact Us
              </h2>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-3 pl-4">
                <p className="font-semibold">Titans Careers Limited</p>
                <p>Email: info@titanscareers.com</p>
                <p>Company Number: 16369966</p>
                <p>UKRLP Number: 10098472</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </PageLayout>
  );
};

export default PrivacyPolicy;
