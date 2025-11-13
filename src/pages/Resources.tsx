import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileText, Briefcase, ClipboardList, TrendingUp, BookOpen, CheckCircle } from "lucide-react";

const Resources = () => {
  const careerGuides = [
    {
      title: "Complete Career Switcher's Guide",
      description: "Everything you need to know about switching careers into tech, analytics, or compliance.",
      fileSize: "2.5 MB",
      icon: BookOpen
    },
    {
      title: "From Graduate to Professional",
      description: "Step-by-step roadmap for recent grads entering the professional world.",
      fileSize: "1.8 MB",
      icon: TrendingUp
    },
    {
      title: "UK Job Market 2024 Report",
      description: "Current salary trends, in-demand roles, and hiring patterns across industries.",
      fileSize: "3.2 MB",
      icon: FileText
    }
  ];

  const resumeTemplates = [
    {
      title: "ATS-Optimized Resume Template",
      description: "Modern template that passes Applicant Tracking Systems with ease.",
      fileSize: "450 KB",
      icon: FileText
    },
    {
      title: "Career Switcher Resume Template",
      description: "Highlight transferable skills when changing careers.",
      fileSize: "520 KB",
      icon: Briefcase
    },
    {
      title: "LinkedIn Profile Optimization Guide",
      description: "Make recruiters notice you with a standout LinkedIn profile.",
      fileSize: "1.1 MB",
      icon: TrendingUp
    }
  ];

  const interviewPrep = [
    {
      title: "200+ Interview Questions Bank",
      description: "Common interview questions with sample answers for tech, analytics & compliance.",
      fileSize: "2.8 MB",
      icon: ClipboardList
    },
    {
      title: "STAR Method Worksheet",
      description: "Master behavioral interviews with our proven framework.",
      fileSize: "650 KB",
      icon: CheckCircle
    },
    {
      title: "Interview Preparation Checklist",
      description: "Never miss a step with our comprehensive pre-interview checklist.",
      fileSize: "380 KB",
      icon: ClipboardList
    }
  ];

  const industryReports = [
    {
      title: "2024 Tech Salary Report UK",
      description: "Detailed breakdown of tech salaries across roles and experience levels.",
      fileSize: "4.2 MB",
      icon: TrendingUp
    },
    {
      title: "Compliance Careers Deep Dive",
      description: "Complete guide to compliance roles, certifications, and career progression.",
      fileSize: "2.9 MB",
      icon: Briefcase
    },
    {
      title: "Analytics & Data Roles Guide",
      description: "Navigate the world of data careers: from analyst to scientist.",
      fileSize: "3.5 MB",
      icon: BookOpen
    }
  ];

  const ResourceCard = ({ title, description, fileSize, icon: Icon }: any) => (
    <Card className="hover:shadow-xl transition-all group border-2 hover:border-tc-amber/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="w-12 h-12 bg-tc-amber/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-tc-amber" />
          </div>
          <Button 
            size="sm" 
            className="bg-tc-navy hover:bg-tc-blue text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
        <CardTitle className="text-xl mt-4 group-hover:text-tc-amber transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="text-base">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span>PDF • {fileSize}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-tc-navy text-white py-20 md:py-28">
        <div className="container max-w-7xl">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge className="bg-tc-amber/20 text-tc-amber border-tc-amber/30">
              <Download className="w-3 h-3 mr-2" />
              FREE RESOURCES
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold">
              Your <span className="text-tc-amber">Free Career Toolkit</span>
            </h1>
            
            <p className="text-xl text-white/80 leading-relaxed">
              Everything you need to kickstart your career transformation. 
              Download our professional guides, templates, and reports - completely free.
            </p>
          </div>
        </div>
      </section>

      {/* Career Guides Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-7xl">
          <div className="mb-12 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-tc-navy flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-tc-amber" />
              Career Guides
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive guides to help you navigate your career journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerGuides.map((resource, index) => (
              <ResourceCard key={index} {...resource} />
            ))}
          </div>
        </div>
      </section>

      {/* Resume Templates Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container max-w-7xl">
          <div className="mb-12 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-tc-navy flex items-center gap-3">
              <FileText className="w-8 h-8 text-tc-amber" />
              Resume Templates
            </h2>
            <p className="text-lg text-muted-foreground">
              Professional templates that get you noticed by recruiters.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumeTemplates.map((resource, index) => (
              <ResourceCard key={index} {...resource} />
            ))}
          </div>
        </div>
      </section>

      {/* Interview Prep Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-7xl">
          <div className="mb-12 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-tc-navy flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-tc-amber" />
              Interview Preparation
            </h2>
            <p className="text-lg text-muted-foreground">
              Ace your interviews with our proven preparation materials.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviewPrep.map((resource, index) => (
              <ResourceCard key={index} {...resource} />
            ))}
          </div>
        </div>
      </section>

      {/* Industry Reports Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container max-w-7xl">
          <div className="mb-12 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-tc-navy flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-tc-amber" />
              Industry Reports
            </h2>
            <p className="text-lg text-muted-foreground">
              Stay informed with our latest industry insights and salary data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industryReports.map((resource, index) => (
              <ResourceCard key={index} {...resource} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-tc-navy to-tc-blue text-white">
        <div className="container max-w-4xl text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to Take the Next Step?
          </h2>
          
          <p className="text-xl text-white/80 leading-relaxed">
            These resources are just the beginning. Join our courses to get personalized 
            guidance, hands-on projects, and direct career support.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-tc-amber hover:bg-tc-gold text-tc-navy font-bold text-lg px-8"
            >
              <Briefcase className="w-5 h-5 mr-2" />
              View Our Courses
            </Button>
            
            <Button size="lg" variant="outlineWhite" className="text-lg px-8">
              <BookOpen className="w-5 h-5 mr-2" />
              Book Free Consultation
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Resources;
