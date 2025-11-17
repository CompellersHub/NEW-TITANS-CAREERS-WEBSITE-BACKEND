import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Do I need UK work experience to enroll?",
    answer: "No, you don't need any UK work experience. Our courses are designed to help you build practical skills and a portfolio that UK employers are looking for, regardless of your background.",
  },
  {
    question: "Are the courses CPD accredited?",
    answer: "Yes, all our courses are CPD (Continuing Professional Development) accredited, which means they meet high standards of quality and are recognized by employers across the UK.",
  },
  {
    question: "What kind of support do I get?",
    answer: "You'll get live instruction from expert trainers, peer support from your cohort, hands-on project feedback, career guidance, CV reviews, and ongoing support even after you complete the course.",
  },
  {
    question: "How long are the courses?",
    answer: "Course duration varies by program, typically ranging from 8-12 weeks. Each course includes live sessions, self-paced learning, and practical projects that fit around your schedule.",
  },
  {
    question: "Can I pay in installments?",
    answer: "Yes, we offer flexible payment plans. Contact us to discuss options that work for your situation.",
  },
  {
    question: "What if I can't attend a live session?",
    answer: "All live sessions are recorded and made available to you. You'll also have access to our learning materials 24/7, so you can learn at your own pace.",
  },
];

export const FAQSection = () => {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-white">
      <div className="container max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 md:mb-20 space-y-6 animate-fade-in">
          <h2 className="font-kanit text-3xl md:text-4xl lg:text-6xl font-bold text-tc-navy">
            Got <span className="text-tc-amber">Questions?</span>
          </h2>
          <p className="font-sans text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Find answers to the most common questions about our courses
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card rounded-2xl border border-border/50 shadow-lg px-6 py-2 data-[state=open]:shadow-2xl data-[state=open]:border-tc-amber/30 transition-all duration-400"
              >
                <AccordionTrigger className="text-left text-lg font-kanit font-semibold text-tc-navy hover:text-tc-amber hover:no-underline transition-colors duration-300">
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
