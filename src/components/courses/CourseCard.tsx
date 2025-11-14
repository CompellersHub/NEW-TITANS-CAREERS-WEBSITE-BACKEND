import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { Link } from "react-router-dom";
import { Clock, BookOpen } from "lucide-react";

interface CourseCardProps {
  course: {
    slug: string;
    title: string;
    tagline: string;
    price: number;
    duration: string;
    category: string;
    description: string;
    projectCount: number;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      compliance: "bg-accent/10 text-accent border-accent/20",
      data: "bg-gold/10 text-gold border-gold/20",
      cybersecurity: "bg-primary/10 text-primary border-primary/20",
      business: "bg-accent/10 text-accent border-accent/20",
      marketing: "bg-gold/10 text-gold border-gold/20",
    };
    return colors[category] || "bg-primary/10 text-primary border-primary/20";
  };

  return (
    <Card className="group p-8 hover:shadow-lg transition-all duration-300 border-border bg-card flex flex-col h-full relative overflow-visible">
      <Badge className={`mb-4 w-fit font-sans font-semibold text-xs tracking-wider uppercase ${getCategoryColor(course.category)}`}>
        {course.category}
      </Badge>
      
      <Link to={`/course/${course.slug}`} className="group/link">
        <h3 className="font-kanit text-2xl font-bold mb-3 group-hover/link:text-accent transition-all duration-300 leading-tight text-primary">
          {course.title}
        </h3>
      </Link>
      
      <p className="font-sans text-muted-foreground mb-5 text-sm leading-relaxed">{course.tagline}</p>
      
      <div className="flex gap-6 mb-5 text-sm font-sans text-muted-foreground">
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent" />
          {course.duration}
        </span>
        <span className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-accent" />
          {course.projectCount} Projects
        </span>
      </div>
      
      <p className="font-sans mb-6 line-clamp-3 text-sm leading-relaxed flex-grow text-muted-foreground">{course.description}</p>
      
      <div className="flex items-center justify-between mt-auto pt-6 border-t border-border">
        <div>
          <p className="font-sans text-xs text-muted-foreground mb-1">One-time payment</p>
          <span className="font-kanit text-4xl font-bold text-primary">
            £{course.price}
          </span>
        </div>
        <StripeCheckoutButton
          courseSlug={course.slug}
          courseTitle={course.title}
          price={course.price}
          variant="default"
          size="lg"
        />
      </div>
    </Card>
  );
}
