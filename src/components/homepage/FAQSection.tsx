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
