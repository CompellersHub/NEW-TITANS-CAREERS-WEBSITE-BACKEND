import { PageLayout } from "@/components/layouts/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileText, Briefcase, ClipboardList, TrendingUp, BookOpen, CheckCircle } from "lucide-react";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { ShareButton } from "@/components/ShareButton";

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
    <Card className="hover:shadow-xl transition-all group border-2 hover:border-accent/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-accent" />
          </div>
          <div className="flex gap-2">
            <ShareButton 
              title={title}
              url={window.location.href}
              description={description}
              variant="outline"
              size="sm"
            />
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary-glow text-primary-foreground font-sans"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
        <CardTitle className="font-kanit text-xl mt-4 group-hover:text-accent transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="font-sans text-base">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm font-sans text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span>PDF • {fileSize}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout intensity3D="subtle" show3D={true}>
      
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 md:py-28">
        <div className="container max-w-7xl">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge className="bg-accent/20 text-accent border-accent/30 font-sans">
              <Download className="w-3 h-3 mr-2" />
              FREE RESOURCES
            </Badge>
            
            <h1 className="font-kanit text-4xl md:text-6xl font-bold">
              Your <span className="text-accent">Free Career Toolkit</span>
            </h1>
            
            <p className="font-sans text-xl text-primary-foreground/80 leading-relaxed">
              Everything you need to kickstart your career transformation. 
              Download our professional guides, templates, and reports - completely free.
            </p>
          </div>
        </div>
      </section>

      {/* Career Guides Section */}
      <section className="py-20 bg-background">
        <div className="container max-w-7xl">
          <div className="mb-12 space-y-3">
            <h2 className="font-kanit text-3xl md:text-4xl font-bold text-primary flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-accent" />
              Career Guides
            </h2>
            <p className="font-sans text-lg text-muted-foreground">
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
      <section className="py-20 bg-muted/30">
        <div className="container max-w-7xl">
          <div className="mb-12 space-y-3">
            <h2 className="font-kanit text-3xl md:text-4xl font-bold text-primary flex items-center gap-3">
              <FileText className="w-8 h-8 text-accent" />
              Resume Templates
            </h2>
            <p className="font-sans text-lg text-muted-foreground">
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
      <section className="py-20 bg-background">
        <div className="container max-w-7xl">
          <div className="mb-12 space-y-3">
            <h2 className="font-kanit text-3xl md:text-4xl font-bold text-primary flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-accent" />
              Interview Preparation
            </h2>
            <p className="font-sans text-lg text-muted-foreground">
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
      <section className="py-20 bg-muted/30">
        <div className="container max-w-7xl">
          <div className="mb-12 space-y-3">
            <h2 className="font-kanit text-3xl md:text-4xl font-bold text-primary flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-accent" />
              Industry Reports
            </h2>
            <p className="font-sans text-lg text-muted-foreground">
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

      {/* Newsletter Section */}
      <section className="py-20 bg-background">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-kanit text-3xl font-bold text-primary mb-4">
                Want More Free Resources?
              </h2>
              <p className="font-sans text-lg text-muted-foreground mb-6">
                Subscribe to get new career guides, templates, and industry reports delivered straight to your inbox. Plus, receive exclusive WhatsApp updates with job alerts and quick tips.
              </p>
              <ul className="space-y-3 font-sans text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Weekly career tips and job search strategies</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>New downloadable resources each month</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Early access to course launches</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>Instant WhatsApp job alerts (optional)</span>
                </li>
              </ul>
            </div>
            <div>
              <NewsletterSignup 
                variant="card" 
                source="resources-page" 
                showWhatsApp={true}
                showName={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="container max-w-4xl text-center space-y-8">
          <h2 className="font-kanit text-3xl md:text-5xl font-bold">
            Ready to Take the Next Step?
          </h2>
          
          <p className="font-sans text-xl text-primary-foreground/80 leading-relaxed">
            These resources are just the beginning. Join our courses to get personalized 
            guidance, hands-on projects, and direct career support.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-sans font-bold text-lg px-8"
            >
              <Briefcase className="w-5 h-5 mr-2" />
              View Our Courses
            </Button>
            
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-sans text-lg px-8">
              <BookOpen className="w-5 h-5 mr-2" />
              Book Free Consultation
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Resources;
