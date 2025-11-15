import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Do I need UK work experience to join?",
    answer: "No! That's the point. We help you gain the practical experience and skills UK employers want, even if you've never worked in the UK before. Our courses include real-world projects that go straight on your CV.",
  },
  {
    question: "How long does it take to see results?",
    answer: "Most students complete our courses in 8-12 weeks. You'll have a transformed CV and LinkedIn profile within the first 2 weeks. Many students start getting interview calls within 4-6 weeks of starting.",
  },
  {
    question: "Can I really get a remote job?",
    answer: "Absolutely. We focus on remote-friendly roles in high-demand fields like AML/KYC, Data Analysis, Business Analysis, and Cybersecurity. These roles are actively hiring remote workers, especially in the UK market.",
  },
  {
    question: "What's included in the course?",
    answer: "You get live expert training, hands-on projects, CV & LinkedIn complete overhaul, interview prep, access to industry tools, CPD-accredited certification, and 3+ months of ongoing career mentoring and job support.",
  },
  {
    question: "Can I afford this if I'm currently low-paid?",
    answer: "Yes. We offer flexible instalment plans through our FCA-regulated finance partner, with options from £99/month. We also have 0% APR available for selected courses. No one should be locked out due to their current salary.",
  },
  {
    question: "What if I don't have time for a full-time course?",
    answer: "Our courses are designed for working professionals. Live sessions are in the evenings, recordings are available 24/7, and you can work on projects at your own pace. Most students balance it with their current job.",
  },
  {
    question: "Is there a refund policy?",
    answer: "Yes. If you're not satisfied within the first 7 days, we offer a full refund, no questions asked. We're confident you'll see the value immediately.",
  },
  {
    question: "How is this different from YouTube or free courses?",
    answer: "Free content doesn't give you: personalized CV/LinkedIn reviews, real projects for your portfolio, interview practice, expert mentoring, or the accountability of a structured program. We're invested in your success, not just providing content.",
  },
];

export const FAQSection = () => {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-kanit text-4xl md:text-5xl font-bold mb-6 text-primary">
            Frequently Asked Questions
          </h2>
          <p className="font-sans text-xl text-muted-foreground max-w-2xl mx-auto">
            Got questions? We've got answers.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-background rounded-2xl border border-border shadow-sm px-6 py-2 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left text-lg font-kanit font-semibold text-primary hover:text-accent hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="font-sans text-muted-foreground leading-relaxed pt-2 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
