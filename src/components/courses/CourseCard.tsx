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
      compliance: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      data: "bg-green-500/10 text-green-500 border-green-500/20",
      cybersecurity: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      business: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      marketing: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    };
    return colors[category] || "bg-primary/10 text-primary border-primary/20";
  };

  return (
    <Card className="group p-8 hover:shadow-glow transition-all duration-500 border-border/50 bg-gradient-card flex flex-col h-full relative overflow-hidden hover:-translate-y-2 hover:border-primary/30">
      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-shine opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" 
           style={{ transform: 'translateX(-100%)', animation: 'shimmer 2s infinite' }} />
      
      <Badge className={`mb-4 w-fit font-semibold text-xs tracking-wider uppercase ${getCategoryColor(course.category)}`}>
        {course.category}
      </Badge>
      
      <Link to={`/course/${course.slug}`} className="group/link">
        <h3 className="text-2xl font-bold mb-3 group-hover/link:text-primary transition-all duration-300 leading-tight">
          {course.title}
        </h3>
      </Link>
      
      <p className="text-muted-foreground mb-5 text-sm font-medium leading-relaxed">{course.tagline}</p>
      
      <div className="flex gap-6 mb-5 text-sm text-muted-foreground">
        <span className="flex items-center gap-2 font-medium">
          <Clock className="h-4 w-4 text-primary" />
          {course.duration}
        </span>
        <span className="flex items-center gap-2 font-medium">
          <BookOpen className="h-4 w-4 text-primary" />
          {course.projectCount} Projects
        </span>
      </div>
      
      <p className="mb-6 line-clamp-3 text-sm leading-relaxed flex-grow text-foreground/70">{course.description}</p>
      
      <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
        <div>
          <p className="text-xs text-muted-foreground mb-1 font-medium">One-time payment</p>
          <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
