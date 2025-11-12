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
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border bg-card flex flex-col h-full">
      <Badge className={`mb-3 w-fit ${getCategoryColor(course.category)}`}>
        {course.category}
      </Badge>
      
      <Link to={`/course/${course.slug}`} className="group">
        <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
      </Link>
      
      <p className="text-muted-foreground mb-4 text-sm">{course.tagline}</p>
      
      <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {course.duration}
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="h-4 w-4" />
          {course.projectCount} Projects
        </span>
      </div>
      
      <p className="mb-6 line-clamp-3 text-sm flex-grow">{course.description}</p>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
        <span className="text-3xl font-bold text-foreground">£{course.price}</span>
        <StripeCheckoutButton
          courseSlug={course.slug}
          courseTitle={course.title}
          price={course.price}
          variant="default"
          size="default"
        />
      </div>
    </Card>
  );
}
