import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2 } from "lucide-react";

interface EventDetailAccordionProps {
  learningObjectives: string[];
  toolsCovered: string[];
  prerequisites: string;
  careerRelevance: string;
}

export function EventDetailAccordion({
  learningObjectives,
  toolsCovered,
  prerequisites,
  careerRelevance
}: EventDetailAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="objectives">
        <AccordionTrigger>What You'll Learn</AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-2">
            {learningObjectives.map((objective, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="tools">
        <AccordionTrigger>Tools & Technologies</AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-wrap gap-2">
            {toolsCovered.map((tool, idx) => (
              <span key={idx} className="px-3 py-1 bg-accent rounded-full text-sm">
                {tool}
              </span>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="prerequisites">
        <AccordionTrigger>Prerequisites</AccordionTrigger>
        <AccordionContent>
          <p>{prerequisites}</p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="career">
        <AccordionTrigger>Career Relevance</AccordionTrigger>
        <AccordionContent>
          <p>{careerRelevance}</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
