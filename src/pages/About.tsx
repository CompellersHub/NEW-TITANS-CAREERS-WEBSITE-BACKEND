import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Award, Heart, TrendingUp, Zap, BookOpen, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-tc-navy text-white py-20 md:py-28">
        <div className="container max-w-7xl">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge className="bg-tc-amber/20 text-tc-amber border-tc-amber/30">
              <Heart className="w-3 h-3 mr-2" />
              OUR STORY
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold">
              We're Building <span className="text-tc-amber">Real Careers</span>,
              Not Just Courses
            </h1>
            
            <p className="text-xl text-white/80 leading-relaxed">
              Titans Careers was born from a simple frustration: too many talented people 
              stuck in low-paying jobs, and too many training programs that promise the world 
              but deliver nothing.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-tc-amber/10 text-tc-navy border-tc-amber/30">
                <Target className="w-3 h-3 mr-2" />
                OUR MISSION
              </Badge>
              
              <h2 className="text-3xl md:text-4xl font-bold text-tc-navy">
                Break Barriers. Build Futures.
              </h2>
              
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                <p>
                  We exist to give career switchers, recent grads, and anyone stuck in the wrong 
                  job a real path into high-paying professional careers.
                </p>
                
                <p>
                  No coding required. No degree required. Just practical skills, hands-on projects, 
                  and ongoing career support that actually works.
                </p>
                
                <p className="font-semibold text-tc-navy">
                  Our promise: If you put in the work, we'll get you job-ready. Period.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/courses">
                  <Button size="lg" className="bg-tc-amber hover:bg-tc-gold text-tc-navy font-bold">
                    View Our Courses
                  </Button>
                </Link>
                <Link to="/#how-it-works">
                  <Button size="lg" variant="outlineWhite" className="border-tc-navy text-tc-navy">
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
              <div className="absolute -bottom-6 -left-6 bg-tc-amber text-tc-navy p-6 rounded-xl shadow-xl">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8" />
                  <div>
                    <div className="text-2xl font-bold">300+</div>
                    <div className="text-sm font-semibold">Lives Changed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-tc-navy text-white">
        <div className="container max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-tc-amber">
                  {stat.number}
                </div>
                <div className="text-white/80 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-tc-amber/10 text-tc-navy border-tc-amber/30">
              <Zap className="w-3 h-3 mr-2" />
              OUR VALUES
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold text-tc-navy">
              What We Stand For
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              These principles guide everything we do, from course design to student support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-2 hover:border-tc-amber/50 transition-all hover:shadow-xl">
                <CardContent className="p-6 space-y-4">
                  <div className="w-14 h-14 bg-tc-amber/10 rounded-xl flex items-center justify-center">
                    <value.icon className="w-7 h-7 text-tc-amber" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-tc-navy">{value.title}</h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-tc-amber/10 text-tc-navy border-tc-amber/30">
              <Users className="w-3 h-3 mr-2" />
              MEET THE TEAM
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold text-tc-navy">
              The People Behind Your Success
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We've been in your shoes. We know what it takes to switch careers and succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-2xl transition-all group">
                <CardContent className="p-0">
                  <div className="relative h-72 overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-tc-navy/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                      <p className="text-tc-amber font-semibold">{member.role}</p>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-tc-navy to-tc-blue text-white">
        <div className="container max-w-4xl text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to Start Your Career Transformation?
          </h2>
          
          <p className="text-xl text-white/80 leading-relaxed">
            Join our next free Q&A session and see if Titans Careers is right for you.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-tc-amber hover:bg-tc-gold text-tc-navy font-bold text-lg px-8"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Join Free Session
            </Button>
            
            <Link to="/courses">
              <Button size="lg" variant="outlineWhite" className="text-lg px-8">
                <Briefcase className="w-5 h-5 mr-2" />
                View Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
