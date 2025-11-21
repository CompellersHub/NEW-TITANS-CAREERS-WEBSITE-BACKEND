import { useState, useEffect } from "react";
import { PageTransition } from "@/components/PageTransition";
import { PageLayout } from "@/components/layouts/PageLayout";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { KeyboardShortcutsHelper } from "@/components/ui/keyboard-shortcuts-helper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Award, Heart, TrendingUp, Zap, BookOpen, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { AboutPageSkeleton } from "@/components/admin/AboutPageSkeleton";
import { useNavigationShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SEO } from "@/components/SEO";
import { organizationSchema } from "@/lib/structuredData";
import { ComparisonInfographic } from "@/components/infographics/ComparisonInfographic";
import { VideoTestimonial } from "@/components/video/VideoTestimonial";

const About = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Enable keyboard shortcuts
  useNavigationShortcuts();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <AboutPageSkeleton />;
  }
  const values = [
    {
      icon: Target,
      title: "Practical First",
      description: "No fluff. Just real-world skills that employers actually want."
    },
    {
      icon: Heart,
      title: "Student Success",
      description: "Your career transformation is our only metric that matters."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Learn together, grow together, succeed together."
    },
    {
      icon: Zap,
      title: "Fast Results",
      description: "Get job-ready in months, not years. Real careers, real fast."
    }
  ];

  const stats = [
    { number: "300+", label: "Career Switchers" },
    { number: "85%", label: "Job Placement Rate" },
    { number: "£48k", label: "Average Starting Salary" },
    { number: "4.8/5", label: "Student Rating" }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
      bio: "Former recruiter who saw too many talented people stuck in dead-end jobs."
    },
    {
      name: "David Okafor",
      role: "Head of Training",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
      bio: "15+ years in tech training. Passionate about making tech accessible to everyone."
    },
    {
      name: "Aisha Patel",
      role: "Career Coach",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
      bio: "Helped 200+ students land their dream roles in compliance and analytics."
    }
  ];

  const beforeAfterComparison = [
    { label: "Career Path", before: "Retail Manager", after: "Compliance Officer" },
    { label: "Annual Salary", before: "£24,000", after: "£45,000" },
    { label: "Work-Life Balance", before: false, after: true },
    { label: "Growth Opportunity", before: false, after: true },
    { label: "Remote Work", before: false, after: true }
  ];

  return (
    <PageTransition variant="slide">
      <SEO 
        title="About Titans Training Group - Our Mission & Story"
        description="Learn about Titans Training Group's mission to transform careers through practical training. Meet our team and discover how we've helped 300+ people switch careers with an 85% job placement rate."
        keywords="about titans training, training company, career transformation, professional training team, practical education"
        structuredData={organizationSchema}
      />
      <PageLayout intensity3D="medium" show3D={true}>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-tc-navy to-tc-navy/95 text-white py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-tc-amber/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-tc-gold/8 rounded-full blur-[140px]" />
        
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge className="bg-tc-amber/20 text-tc-amber border-tc-amber/30 font-semibold">
              <Heart className="w-3 h-3 mr-2" />
              OUR STORY
            </Badge>
            
            <h1 className="font-kanit text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              We're Building <span className="text-tc-amber">Real Careers</span>,
              Not Just Courses
            </h1>
            
            <p className="font-sans text-lg md:text-xl text-white/90 leading-relaxed">
              Titans Careers was born from a simple frustration: too many talented people 
              stuck in low-paying jobs, and too many training programs that promise the world 
              but deliver nothing.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-background">
        <div className="container max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-accent/10 text-primary border-accent/30">
                <Target className="w-3 h-3 mr-2" />
                OUR MISSION
              </Badge>
              
              <h2 className="font-kanit text-3xl md:text-4xl font-bold text-primary">
                Break Barriers. Build Futures.
              </h2>
              
              <div className="space-y-4 font-sans text-muted-foreground text-lg leading-relaxed">
                <p>
                  We exist to give career switchers, recent grads, and anyone stuck in the wrong 
                  job a real path into high-paying professional careers.
                </p>
                
                <p>
                  No endless theory. No fake promises. Just practical training, real-world projects, 
                  and ongoing career support that actually works.
                </p>
                
                <p className="font-semibold text-primary">
                  Our promise: If you put in the work, we'll get you job-ready. Period.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/courses">
                  <Button size="lg" className="font-bold">
                    View Our Courses
                  </Button>
                </Link>
                <Link to="/#how-it-works">
                  <Button size="lg" variant="outline">
                    How It Works
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop" 
                alt="Team collaboration"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-accent text-primary p-6 rounded-xl shadow-xl">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8" />
                  <div>
                    <div className="font-kanit text-2xl font-bold">300+</div>
                    <div className="font-sans text-sm font-semibold">Lives Changed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="font-kanit text-4xl md:text-5xl font-bold text-accent">
                  {stat.number}
                </div>
                <div className="font-sans text-primary-foreground/80 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-accent/10 text-primary border-accent/30">
              <Zap className="w-3 h-3 mr-2" />
              OUR VALUES
            </Badge>
            
            <h2 className="font-kanit text-3xl md:text-4xl font-bold text-primary">
              What We Stand For
            </h2>
            
            <p className="font-sans text-xl text-muted-foreground max-w-3xl mx-auto">
              These principles guide everything we do, from course design to student support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-2 hover:border-accent/50 transition-all hover:shadow-xl">
                <CardContent className="p-6 space-y-4">
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center">
                    <value.icon className="w-7 h-7 text-accent" />
                  </div>
                  
                  <h3 className="font-kanit text-xl font-bold text-primary">{value.title}</h3>
                  
                  <p className="font-sans text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Story Comparison */}
      <section className="py-20 bg-secondary/30 backdrop-blur-sm">
        <div className="container max-w-7xl">
          <ComparisonInfographic
            title="Real Career Transformations"
            beforeLabel="Before Titans"
            afterLabel="After Titans"
            items={beforeAfterComparison}
          />
        </div>
      </section>

      {/* Team Section with Video Testimonials */}
      <section className="py-20 bg-background/80 backdrop-blur-sm">
        <div className="container max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-accent/10 text-primary border-accent/30">
              <Users className="w-3 h-3 mr-2" />
              MEET THE TEAM
            </Badge>
            
            <h2 className="font-kanit text-3xl md:text-4xl font-bold text-primary">
              The People Behind Your Success
            </h2>
            
            <p className="font-sans text-xl text-muted-foreground max-w-3xl mx-auto">
              We've been in your shoes. We know what it takes to switch careers and succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <VideoTestimonial
                key={index}
                videoUrl="https://player.vimeo.com/video/example"
                thumbnailUrl={member.image}
                name={member.name}
                role={member.role}
                company="Titans Training"
                caption={member.bio}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary to-primary-glow text-primary-foreground">
        <div className="container max-w-4xl text-center space-y-8">
          <h2 className="font-kanit text-3xl md:text-5xl font-bold">
            Ready to Start Your Career Transformation?
          </h2>
          
          <p className="font-sans text-xl text-primary-foreground/80 leading-relaxed">
            Join our next free Q&A session and see if Titans Careers is right for you.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-8"
              asChild
            >
              <a 
                href="https://wa.me/447539434403"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Join Free Session
              </a>
            </Button>
            
            <Link to="/courses">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-background text-foreground border-border hover:bg-background/90">
                <Briefcase className="w-5 h-5 mr-2" />
                View Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <ScrollToTop />
      <KeyboardShortcutsHelper />
      </PageLayout>
    </PageTransition>
  );
};

export default About;
