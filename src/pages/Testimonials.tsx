import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { testimonials } from "@/data/testimonials";
import { Star, TrendingUp, Award, Play, Users, Briefcase, DollarSign, X } from "lucide-react";
import { useState } from "react";

const Testimonials = () => {
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-tc-navy text-white py-20 md:py-28">
        <div className="container max-w-7xl">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge className="bg-tc-amber/20 text-tc-amber border-tc-amber/30">
              <Award className="w-3 h-3 mr-2" />
              SUCCESS STORIES
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold">
              Real People. <span className="text-tc-amber">Real Results.</span>
            </h1>
            
            <p className="text-xl text-white/80 leading-relaxed">
              Meet the warehouse workers, care staff, and career switchers who transformed 
              their lives with Titans Careers training.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-16 bg-white">
        <div className="container max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="border-2 border-tc-amber/20 hover:border-tc-amber/50 transition-all">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-tc-amber/10 rounded-full flex items-center justify-center mx-auto">
                    <stat.icon className="w-6 h-6 text-tc-amber" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-tc-navy">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonials */}
      <section className="py-20 bg-secondary/30">
        <div className="container max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-tc-amber/10 text-tc-navy border-tc-amber/30">
              <Play className="w-3 h-3 mr-2" />
              VIDEO STORIES
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold text-tc-navy">
              Hear It From Our Graduates
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Watch real students share their journey from their previous roles to professional careers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {videoTestimonials.map((video) => (
              <Card 
                key={video.id} 
                className="overflow-hidden group border-2 hover:border-tc-amber/50 transition-all hover:shadow-xl cursor-pointer"
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
                    <div className="absolute inset-0 bg-tc-navy/40 group-hover:bg-tc-navy/30 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 bg-tc-amber rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                        <Play className="w-8 h-8 text-tc-navy fill-tc-navy ml-1" />
                      </div>
                    </div>
                    
                    {/* Platform Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-tc-navy/80 text-white border-0">
                        {video.platform === "youtube" ? "YouTube" : "Vimeo"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-3">
                    <h3 className="font-bold text-lg text-tc-navy leading-tight group-hover:text-tc-amber transition-colors">
                      {video.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {video.description}
                    </p>
                    
                    <div className="pt-2 border-t">
                      <p className="font-semibold text-tc-navy">{video.name}</p>
                      <p className="text-sm text-muted-foreground">{video.role}</p>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full text-tc-amber font-bold group-hover:bg-tc-amber/10"
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
                <DialogTitle className="text-2xl font-bold text-tc-navy pr-8">
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
                <div className="p-6 bg-secondary/30">
                  <p className="text-muted-foreground mb-4">
                    {selectedVideo.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-tc-navy">{selectedVideo.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedVideo.role}</p>
                    </div>
                    <Badge className="bg-tc-amber text-tc-navy">
                      {selectedVideo.platform === "youtube" ? "YouTube" : "Vimeo"}
                    </Badge>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              More video testimonials coming soon from our latest graduates!
            </p>
          </div>
        </div>
      </section>

      {/* Written Reviews Filter */}
      <section className="py-20 bg-white">
        <div className="container max-w-7xl">
          <div className="text-center mb-12 space-y-4">
            <Badge className="bg-tc-amber/10 text-tc-navy border-tc-amber/30">
              <Star className="w-3 h-3 mr-2" />
              WRITTEN REVIEWS
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold text-tc-navy">
              Student Success Stories
            </h2>
            
            <p className="text-xl text-muted-foreground">
              Read detailed accounts from our graduates about their career transformation
            </p>
          </div>

          {/* Track Filter */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <Button
              variant={selectedTrack === "all" ? "default" : "outline"}
              onClick={() => setSelectedTrack("all")}
              className={
                selectedTrack === "all"
                  ? "bg-tc-amber hover:bg-tc-gold text-tc-navy font-bold"
                  : "border-2 hover:border-tc-amber text-tc-navy"
              }
            >
              All Stories ({testimonials.length})
            </Button>
            <Button
              variant={selectedTrack === "aml-kyc" ? "default" : "outline"}
              onClick={() => setSelectedTrack("aml-kyc")}
              className={
                selectedTrack === "aml-kyc"
                  ? "bg-tc-amber hover:bg-tc-gold text-tc-navy font-bold"
                  : "border-2 hover:border-tc-amber text-tc-navy"
              }
            >
              AML/KYC ({testimonials.filter(t => t.track === "aml-kyc").length})
            </Button>
            <Button
              variant={selectedTrack === "data" ? "default" : "outline"}
              onClick={() => setSelectedTrack("data")}
              className={
                selectedTrack === "data"
                  ? "bg-tc-amber hover:bg-tc-gold text-tc-navy font-bold"
                  : "border-2 hover:border-tc-amber text-tc-navy"
              }
            >
              Data Analysis ({testimonials.filter(t => t.track === "data").length})
            </Button>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-2 hover:border-tc-amber/50 transition-all hover:shadow-xl">
                <CardContent className="p-6 space-y-4">
                  {/* Rating */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-tc-amber text-tc-amber" />
                    ))}
                  </div>

                  {/* Story */}
                  <p className="text-muted-foreground leading-relaxed text-sm italic">
                    "{testimonial.story}"
                  </p>

                  {/* Career Progression */}
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-muted-foreground">From:</span>
                      <span className="text-sm font-semibold text-tc-navy flex-1">
                        {testimonial.previousRole}
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-tc-amber mt-0.5" />
                      <div className="flex-1">
                        <span className="text-xs text-muted-foreground">To:</span>
                        <p className="text-sm font-bold text-tc-amber">
                          {testimonial.role}
                        </p>
                        {testimonial.company && (
                          <p className="text-xs text-muted-foreground">
                            at {testimonial.company}
                          </p>
                        )}
                      </div>
                    </div>

                    {testimonial.mentor && (
                      <div className="pt-2">
                        <Badge variant="outline" className="text-xs border-tc-navy/20">
                          Mentor: {testimonial.mentor}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Student Info */}
                  <div className="pt-2">
                    <p className="font-bold text-tc-navy">- {testimonial.name}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Metrics Detail */}
      <section className="py-20 bg-gradient-to-br from-tc-navy to-tc-blue text-white">
        <div className="container max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-tc-amber/20 text-tc-amber border-tc-amber/30">
              <TrendingUp className="w-3 h-3 mr-2" />
              GRADUATE OUTCOMES
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold">
              The Numbers Don't Lie
            </h2>
            
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Our commitment to practical training and career support delivers real results
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-8 space-y-6">
                <h3 className="text-2xl font-bold text-tc-amber">AML/KYC Track</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="text-white/80">Average Starting Salary</span>
                    <span className="text-2xl font-bold text-tc-amber">£32k</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="text-white/80">Job Placement Rate</span>
                    <span className="text-2xl font-bold text-tc-amber">87%</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="text-white/80">Time to First Offer</span>
                    <span className="text-2xl font-bold text-tc-amber">5 months</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Total Graduates</span>
                    <span className="text-2xl font-bold text-tc-amber">180+</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-8 space-y-6">
                <h3 className="text-2xl font-bold text-tc-amber">Data Analysis Track</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="text-white/80">Average Starting Salary</span>
                    <span className="text-2xl font-bold text-tc-amber">£35k</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="text-white/80">Job Placement Rate</span>
                    <span className="text-2xl font-bold text-tc-amber">83%</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="text-white/80">Time to First Offer</span>
                    <span className="text-2xl font-bold text-tc-amber">6 months</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Total Graduates</span>
                    <span className="text-2xl font-bold text-tc-amber">120+</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-white/80 mb-6 text-lg">
              *Data based on graduates who completed the full program and actively applied for roles
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-tc-navy">
            Your Success Story <span className="text-tc-amber">Starts Here</span>
          </h2>
          
          <p className="text-xl text-muted-foreground leading-relaxed">
            Join our free Q&A session and discover which course path is right for your career goals.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-tc-amber hover:bg-tc-gold text-tc-navy font-bold text-lg px-8"
            >
              <Award className="w-5 h-5 mr-2" />
              Join Free Session
            </Button>
            
            <Button size="lg" variant="outlineWhite" className="border-tc-navy text-tc-navy text-lg px-8">
              <Briefcase className="w-5 h-5 mr-2" />
              View Courses
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Testimonials;
