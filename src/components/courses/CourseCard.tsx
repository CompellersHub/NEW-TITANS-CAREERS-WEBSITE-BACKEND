import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseEnrollmentButton } from "../payment/CourseEnrollmentButton";
import { FreeSessionBookingDialog } from "@/components/FreeSessionBookingDialog";
import { Link } from "react-router-dom";
import { Clock, Calendar } from "lucide-react";
import { CourseHeroImage } from "./CourseHeroImage";
import amlKycHero from "@/assets/courses/aml-kyc-hero.jpg";
import cryptoComplianceHero from "@/assets/courses/crypto-compliance-hero.jpg";
import dataPrivacyHero from "@/assets/courses/data-privacy-hero.jpg";
import dataAnalysisHero from "@/assets/courses/data-analysis-hero.jpg";
import cybersecurityHero from "@/assets/courses/cybersecurity-hero.jpg";
import businessAnalysisHero from "@/assets/courses/business-analysis-hero.jpg";
import digitalMarketingHero from "@/assets/courses/digital-marketing-hero.jpg";

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

  const getCourseImage = (slug: string) => {
    const images: Record<string, string> = {
      'aml-kyc': amlKycHero,
      'crypto-compliance': cryptoComplianceHero,
      'data-privacy': dataPrivacyHero,
      'data-analysis': dataAnalysisHero,
      'cybersecurity': cybersecurityHero,
      'business-analysis': businessAnalysisHero,
      'digital-marketing': digitalMarketingHero,
    };
    return images[slug] || dataAnalysisHero;
  };

  return (
    <Card className="group hover-lift rounded-2xl border border-border/50 shadow-[0_4px_16px_-4px_hsl(213_69%_13%/0.08)] hover:shadow-[0_12px_32px_-8px_hsl(213_69%_13%/0.15)] hover:border-accent/30 bg-card flex flex-col h-full relative overflow-hidden transition-all duration-400 ease-out">
      <CourseHeroImage
        src={getCourseImage(course.slug)}
        alt={course.title}
        title={course.title}
        subtitle={course.tagline}
      />
      
      <div className="p-8 flex flex-col flex-grow">
        <Badge className={`mb-4 w-fit font-sans font-semibold text-xs tracking-wider uppercase transition-all duration-300 group-hover:shadow-[0_0_16px_hsl(43_100%_50%/0.3)] ${getCategoryColor(course.category)}`}>
          {course.category}
        </Badge>
      
      <Link to={`/course/${course.slug}`} className="group/link">
        <h3 className="font-kanit text-2xl font-bold mb-3 group-hover/link:text-accent transition-colors duration-300 leading-tight text-primary">
          {course.title}
        </h3>
      </Link>
      
      <p className="font-sans text-muted-foreground mb-5 text-sm leading-relaxed">{course.tagline}</p>
      
      <div className="flex gap-6 mb-5 text-sm font-sans text-muted-foreground">
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent" />
          {course.duration}
        </span>
      </div>
      
        <p className="font-sans mb-6 line-clamp-3 text-sm leading-relaxed flex-grow text-muted-foreground">{course.description}</p>
        
        <div className="space-y-4 mt-auto pt-6 border-t border-border">
          {/* Free Session CTA */}
          <div className="flex justify-center">
            <FreeSessionBookingDialog />
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-sans">or</span>
            </div>
          </div>
          
        <div className="flex items-center justify-between">
          <div>
            <p className="font-sans text-xs text-muted-foreground mb-1">One-time payment</p>
            <span className="font-kanit text-4xl font-bold text-primary">
              £{course.price}
            </span>
          </div>
          <CourseEnrollmentButton
            courseSlug={course.slug}
            courseTitle={course.title}
            price={course.price}
            variant="default"
            size="lg"
          />
          </div>
        </div>
      </div>
    </Card>
  );
}
