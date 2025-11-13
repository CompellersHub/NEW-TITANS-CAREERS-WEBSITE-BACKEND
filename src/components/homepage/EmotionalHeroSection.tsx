import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { trackCTA } from '@/lib/analytics';
import { MessageCircle, GraduationCap, ArrowRight, Users, Star, Award, Sparkles, Heart } from 'lucide-react';

export function EmotionalHeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src="/images/education-online-hero.jpg" 
          alt="Online education platform background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary-glow/90 to-primary/95" />
      </div>

      {/* Animated Glow Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gold rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-accent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
      
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

      {/* Hero Content */}
      <div className="relative z-10 container max-w-7xl px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Emotional Copy */}
          <div className="space-y-8 animate-fade-in">
            <Badge className="bg-accent/10 text-accent border-accent/30 px-6 py-2.5 text-sm font-sans shadow-lg">
              <Heart className="w-4 h-4 mr-2" />
              YOUR STORY STARTS HERE
            </Badge>

            <div className="space-y-6">
              <h1 className="font-kanit text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight">
                Your Dream Career
                <br />
                <span className="bg-gradient-to-r from-accent via-gold to-accent bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
                  Is Closer Than You Think
                </span>
              </h1>

              <p className="font-kanit text-2xl md:text-3xl text-accent font-semibold">
                From Warehouse to £50k Office Job in 8 Months
              </p>

              <p className="font-sans text-xl text-primary-foreground/90 max-w-2xl leading-relaxed">
                You don't need UK experience. You don't need a degree. You just need the right training and support. 
                <span className="font-semibold text-primary-foreground"> 300+ people just like you</span> have already made the switch.
              </p>

              <div className="flex flex-wrap gap-4 text-primary-foreground/80 text-sm font-sans">
                <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2 backdrop-blur-sm">
                  <Users className="h-4 w-4 text-accent" />
                  <span className="font-medium">No UK Experience Required</span>
                </div>
                <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2 backdrop-blur-sm">
                  <Award className="h-4 w-4 text-accent" />
                  <span className="font-medium">40 CPD Hours</span>
                </div>
                <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-2 backdrop-blur-sm">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-medium">4.8★ Rating</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-accent to-gold hover:from-gold hover:to-accent text-accent-foreground font-sans font-bold px-10 py-7 text-lg rounded-xl shadow-2xl hover:shadow-accent/50 transition-all duration-300 pulse-glow"
                onClick={() => {
                  trackCTA('Emotional Hero WhatsApp', 'homepage', 'whatsapp');
                  window.open('https://wa.me/447539434403?text=Hi%20TITANS%20CAREERS', '_blank');
                }}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Start Your Transformation
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary px-10 py-7 text-lg rounded-xl font-sans font-semibold backdrop-blur-sm"
                asChild
              >
                <Link to="/courses">
                  View Courses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-gold border-2 border-primary flex items-center justify-center text-primary-foreground font-kanit font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-primary-foreground font-sans">
                <p className="font-bold text-lg">300+</p>
                <p className="text-sm text-primary-foreground/80">Career Switchers</p>
              </div>
            </div>
          </div>

          {/* Right Column - Success Story Image */}
          <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-accent/30">
              <img 
                src="/images/hero-student.png" 
                alt="Success story - Career transformation from warehouse to professional role earning £50k"
                className="w-full h-auto object-cover"
                onError={(e) => {
                  // Fallback gradient if image doesn't load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-glow)))';
                  e.currentTarget.parentElement!.style.minHeight = '500px';
                }}
              />
              
              {/* Overlay Quote Badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-background/95 backdrop-blur-md rounded-2xl p-6 shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-gold flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-accent-foreground" />
                    </div>
                  </div>
                  <div>
                    <p className="font-kanit text-lg font-bold text-primary mb-2">
                      "I'm earning £48k now. Best decision ever."
                    </p>
                    <p className="font-sans text-sm text-muted-foreground font-medium">
                      Sarah M. - Former Supermarket Manager
                    </p>
                    <div className="flex gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -top-4 -right-4 bg-background rounded-2xl p-4 shadow-xl border-2 border-accent">
              <p className="font-kanit text-3xl font-bold text-primary">£40k-£70k</p>
              <p className="font-sans text-sm text-muted-foreground font-medium">Avg Salary</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
