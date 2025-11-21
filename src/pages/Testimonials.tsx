import { PageLayout } from "@/components/layouts/PageLayout";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { KeyboardShortcutsHelper } from "@/components/ui/keyboard-shortcuts-helper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { testimonials } from "@/data/testimonials";
import { Star, TrendingUp, Award, Play, Users, Briefcase, DollarSign, X } from "lucide-react";
import { useState } from "react";
import { useNavigationShortcuts } from "@/hooks/useKeyboardShortcuts";

const Testimonials = () => {
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  
  // Enable keyboard shortcuts
  useNavigationShortcuts();

  const filteredTestimonials = selectedTrack === "all" 
    ? testimonials 
    : testimonials.filter(t => t.track === selectedTrack);

  // Real video testimonials with YouTube and Vimeo support
  const videoTestimonials = [
    {
      id: 1,
      title: "From Warehouse Worker to AML Analyst - Sarah's Journey",
      platform: "youtube",
      videoId: "X5REM-3nWHg", // Example: Replace with actual video ID
      name: "Sarah M.",
      role: "AML Analyst at Global Bank",
      description: "Watch Sarah explain how she went from night shifts in a warehouse to landing a £48k AML role in just 6 months."
    },
    {
      id: 2,
      title: "Career Switch Success: Data Analysis Journey",
      platform: "youtube",
      videoId: "pN34FNbOKXc", // Example: Replace with actual video ID
      name: "James K.",
      role: "Data Analyst at NHS",
      description: "James shares his experience transitioning from hospitality to data analysis and the practical skills that made the difference."
    },
    {
      id: 3,
      title: "UK Migration Success: From Security to KYC Analyst",
      platform: "vimeo",
      videoId: "76979871", // Example: Replace with actual video ID
      name: "Mohammed A.",
      role: "KYC Analyst at Law Firm",
      description: "Mohammed discusses moving to the UK and breaking into compliance with no prior experience in the field."
    }
  ];

  const getVideoThumbnail = (video: any) => {
    if (video.platform === "youtube") {
      return `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`;
    } else if (video.platform === "vimeo") {
      // Vimeo thumbnails require API, using placeholder for now
      return `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=450&fit=crop`;
    }
    return "";
  };

  const getVideoEmbedUrl = (video: any) => {
    if (video.platform === "youtube") {
      return `https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0`;
    } else if (video.platform === "vimeo") {
      return `https://player.vimeo.com/video/${video.videoId}?autoplay=1`;
    }
    return "";
  };

  const stats = [
    { icon: Users, number: "300+", label: "Career Switchers" },
    { icon: Briefcase, number: "85%", label: "Job Placement Rate" },
    { icon: DollarSign, number: "£48k", label: "Average Starting Salary" },
    { icon: TrendingUp, number: "6 months", label: "Average Time to Role" }
  ];

  return (
    <PageLayout intensity3D="subtle" show3D={true}>
      
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 md:py-28">
        <div className="container max-w-7xl">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge className="bg-accent/20 text-accent border-accent/30 font-sans">
              <Award className="w-3 h-3 mr-2" />
              SUCCESS STORIES
            </Badge>
            
            <h1 className="font-kanit text-4xl md:text-6xl font-bold">
              Real People. <span className="text-accent">Real Results.</span>
            </h1>
            
            <p className="font-sans text-xl text-primary-foreground/80 leading-relaxed">
              Meet the warehouse workers, care staff, and career switchers who transformed 
              their lives with Titans Careers training.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-16 bg-background">
        <div className="container max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="border-2 border-accent/20 hover:border-accent/50 transition-all">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                    <stat.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div className="font-kanit text-3xl md:text-4xl font-bold text-primary">
                    {stat.number}
                  </div>
                  <div className="font-sans text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-accent/10 text-accent border-accent/30 font-sans">
              <Play className="w-3 h-3 mr-2" />
              VIDEO STORIES
            </Badge>
            
            <h2 className="font-kanit text-3xl md:text-4xl font-bold text-primary">
              Hear It From Our Graduates
            </h2>
            
            <p className="font-sans text-xl text-muted-foreground max-w-3xl mx-auto">
              Watch real students share their journey from their previous roles to professional careers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {videoTestimonials.map((video) => (
              <Card 
                key={video.id} 
                className="overflow-hidden group border-2 hover:border-accent/50 transition-all hover:shadow-xl cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <CardContent className="p-0">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={getVideoThumbnail(video)} 
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback to standard thumbnail if maxres doesn't exist
                        if (video.platform === "youtube") {
                          e.currentTarget.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-primary/40 group-hover:bg-primary/30 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                        <Play className="w-8 h-8 text-accent-foreground fill-accent-foreground ml-1" />
                      </div>
                    </div>
                    
                    {/* Platform Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary/80 text-primary-foreground border-0 font-sans">
                        {video.platform === "youtube" ? "YouTube" : "Vimeo"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-3">
                    <h3 className="font-kanit font-bold text-lg text-primary leading-tight group-hover:text-accent transition-colors">
                      {video.title}
                    </h3>
                    
                    <p className="font-sans text-sm text-muted-foreground line-clamp-2">
                      {video.description}
                    </p>
                    
                    <div className="pt-2 border-t border-border">
                      <p className="font-sans font-semibold text-primary">{video.name}</p>
                      <p className="font-sans text-sm text-muted-foreground">{video.role}</p>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full text-accent font-sans font-bold group-hover:bg-accent/10 hover:text-accent/90"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Watch Video
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Video Player Modal */}
          <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
            <DialogContent className="max-w-5xl p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="font-kanit text-2xl font-bold text-primary pr-8">
                  {selectedVideo?.title}
                </DialogTitle>
              </DialogHeader>
              
              {selectedVideo && (
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={getVideoEmbedUrl(selectedVideo)}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              
              {selectedVideo && (
                <div className="p-6 bg-muted/30">
                  <p className="font-sans text-muted-foreground mb-4">
                    {selectedVideo.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-sans font-semibold text-primary">{selectedVideo.name}</p>
                      <p className="font-sans text-sm text-muted-foreground">{selectedVideo.role}</p>
                    </div>
                    <Badge className="bg-accent text-accent-foreground font-sans">
                      {selectedVideo.platform === "youtube" ? "YouTube" : "Vimeo"}
                    </Badge>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <div className="text-center mt-12">
            <p className="font-sans text-muted-foreground mb-4">
              More video testimonials coming soon from our latest graduates!
            </p>
          </div>
        </div>
      </section>

      {/* Written Reviews Filter */}
      <section className="py-20 bg-background">
        <div className="container max-w-7xl">
          <div className="text-center mb-12 space-y-4">
            <Badge className="bg-accent/10 text-accent border-accent/30 font-sans">
              <Star className="w-3 h-3 mr-2" />
              WRITTEN REVIEWS
            </Badge>
            
            <h2 className="font-kanit text-3xl md:text-4xl font-bold text-primary">
              Student Success Stories
            </h2>
            
            <p className="font-sans text-xl text-muted-foreground">
              Read detailed accounts from our graduates about their career transformation
            </p>
          </div>

          {/* Track Filter */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <Button
              variant={selectedTrack === "all" ? "default" : "outline"}
              onClick={() => setSelectedTrack("all")}
              className={`font-sans font-semibold ${
                selectedTrack === "all"
                  ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                  : "border-2 hover:border-accent hover:text-accent"
              }`}
            >
              All Stories ({testimonials.length})
            </Button>
            <Button
              variant={selectedTrack === "aml-kyc" ? "default" : "outline"}
              onClick={() => setSelectedTrack("aml-kyc")}
              className={`font-sans font-semibold ${
                selectedTrack === "aml-kyc"
                  ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                  : "border-2 hover:border-accent hover:text-accent"
              }`}
            >
              AML/KYC ({testimonials.filter(t => t.track === "aml-kyc").length})
            </Button>
            <Button
              variant={selectedTrack === "data" ? "default" : "outline"}
              onClick={() => setSelectedTrack("data")}
              className={`font-sans font-semibold ${
                selectedTrack === "data"
                  ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                  : "border-2 hover:border-accent hover:text-accent"
              }`}
            >
              Data Analysis ({testimonials.filter(t => t.track === "data").length})
            </Button>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-2 hover:border-accent/50 transition-all hover:shadow-xl">
                <CardContent className="p-6 space-y-4">
                  {/* Rating */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>

                  {/* Story */}
                  <p className="font-sans text-muted-foreground leading-relaxed text-sm italic">
                    "{testimonial.story}"
                  </p>

                  {/* Career Progression */}
                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="font-sans text-xs text-muted-foreground">From:</span>
                      <span className="font-sans text-sm font-semibold text-foreground flex-1">
                        {testimonial.previousRole}
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-accent mt-0.5" />
                      <div className="flex-1">
                        <span className="font-sans text-xs text-muted-foreground">To:</span>
                        <p className="font-kanit text-sm font-bold text-accent">
                          {testimonial.role}
                        </p>
                        {testimonial.company && (
                          <p className="font-sans text-xs text-muted-foreground">
                            at {testimonial.company}
                          </p>
                        )}
                      </div>
                    </div>

                    {testimonial.mentor && (
                      <div className="pt-2">
                        <Badge variant="outline" className="font-sans text-xs border-border">
                          Mentor: {testimonial.mentor}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Student Info */}
                  <div className="pt-2">
                    <p className="font-sans font-bold text-primary">- {testimonial.name}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Metrics Detail */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="container max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-accent/20 text-accent border-accent/30 font-sans">
              <TrendingUp className="w-3 h-3 mr-2" />
              GRADUATE OUTCOMES
            </Badge>
            
            <h2 className="font-kanit text-3xl md:text-4xl font-bold">
              The Numbers Don't Lie
            </h2>
            
            <p className="font-sans text-xl text-primary-foreground/80 max-w-3xl mx-auto">
              Our commitment to practical training and career support delivers real results
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="bg-primary-foreground/10 backdrop-blur border-primary-foreground/20">
              <CardContent className="p-8 space-y-6">
                <h3 className="font-kanit text-2xl font-bold text-accent">AML/KYC Track</h3>
                
                <div className="space-y-4 font-sans">
                  <div className="flex justify-between items-center pb-3 border-b border-primary-foreground/20">
                    <span className="text-primary-foreground/80">Average Starting Salary</span>
                    <span className="font-kanit text-2xl font-bold text-accent">£32k</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-primary-foreground/20">
                    <span className="text-primary-foreground/80">Job Placement Rate</span>
                    <span className="font-kanit text-2xl font-bold text-accent">87%</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-primary-foreground/20">
                    <span className="text-primary-foreground/80">Time to First Offer</span>
                    <span className="font-kanit text-2xl font-bold text-accent">5 months</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-primary-foreground/80">Total Graduates</span>
                    <span className="font-kanit text-2xl font-bold text-accent">180+</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary-foreground/10 backdrop-blur border-primary-foreground/20">
              <CardContent className="p-8 space-y-6">
                <h3 className="font-kanit text-2xl font-bold text-accent">Data Analysis Track</h3>
                
                <div className="space-y-4 font-sans">
                  <div className="flex justify-between items-center pb-3 border-b border-primary-foreground/20">
                    <span className="text-primary-foreground/80">Average Starting Salary</span>
                    <span className="font-kanit text-2xl font-bold text-accent">£35k</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-primary-foreground/20">
                    <span className="text-primary-foreground/80">Job Placement Rate</span>
                    <span className="font-kanit text-2xl font-bold text-accent">83%</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-primary-foreground/20">
                    <span className="text-primary-foreground/80">Time to First Offer</span>
                    <span className="font-kanit text-2xl font-bold text-accent">6 months</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-primary-foreground/80">Total Graduates</span>
                    <span className="font-kanit text-2xl font-bold text-accent">120+</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="font-sans text-primary-foreground/80 mb-6 text-lg">
              *Data based on graduates who completed the full program and actively applied for roles
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container max-w-4xl text-center space-y-8">
          <h2 className="font-kanit text-3xl md:text-5xl font-bold text-primary">
            Your Success Story <span className="text-accent">Starts Here</span>
          </h2>
          
          <p className="font-sans text-xl text-muted-foreground leading-relaxed">
            Join our free Q&A session and discover which course path is right for your career goals.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-sans font-bold text-lg px-8"
              asChild
            >
              <a 
                href="https://wa.me/447539434403"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Award className="w-5 h-5 mr-2" />
                Join Free Session
              </a>
            </Button>
            
            <Button size="lg" variant="outline" className="border-primary text-primary font-sans text-lg px-8 hover:bg-primary hover:text-primary-foreground">
              <Briefcase className="w-5 h-5 mr-2" />
              View Courses
            </Button>
          </div>
        </div>
      </section>

      <ScrollToTop />
      <KeyboardShortcutsHelper />
    </PageLayout>
  );
};

export default Testimonials;
