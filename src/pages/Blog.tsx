import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { BlogCardSkeleton } from "@/components/blog/BlogCardSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { blogPosts, BlogPost } from "@/data/blogPosts";
import { BookOpen, Clock, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { SEO } from "@/components/SEO";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state for data fetching
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  const categories = [
    { id: "all", label: "All Articles" },
    { id: "aml", label: "AML Compliance" },
    { id: "data", label: "Data Analysis" },
    { id: "career-tips", label: "Career Tips" },
    { id: "business-analysis", label: "Business Analysis" },
    { id: "cybersecurity", label: "Cybersecurity" },
    { id: "industry-news", label: "Industry News" }
  ];

  const filteredPosts = selectedCategory === "all" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "aml": "bg-accent/10 text-accent border-accent/20",
      "data": "bg-gold/10 text-gold border-gold/20",
      "career-tips": "bg-primary/10 text-primary border-primary/20",
      "business-analysis": "bg-accent/10 text-accent border-accent/20",
      "cybersecurity": "bg-primary/10 text-primary border-primary/20",
      "industry-news": "bg-muted text-muted-foreground border-border"
    };
    return colors[category] || "bg-muted text-muted-foreground border-border";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Career Insights & Training Tips Blog"
        description="Practical career advice, industry insights, and expert tips to help you break into high-paying professional roles. Learn about AML, data analysis, cybersecurity, and more."
        keywords="career blog, professional development tips, AML insights, data analysis advice, cybersecurity news, training tips, career change advice"
      />
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 md:py-28">
        <div className="container max-w-7xl">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge className="bg-accent/20 text-accent border-accent/30 font-sans">
              <BookOpen className="w-3 h-3 mr-2" />
              CAREER INSIGHTS
            </Badge>
            
            <h1 className="font-kanit text-4xl md:text-6xl font-bold">
              Learn. Grow. <span className="text-accent">Succeed.</span>
            </h1>
            
            <p className="font-sans text-xl text-primary-foreground/80 leading-relaxed">
              Practical career advice, industry insights, and expert tips to help you 
              break into high-paying professional roles.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-12 bg-background border-b border-border">
        <div className="container max-w-7xl">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`font-sans font-semibold ${
                  selectedCategory === category.id
                    ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                    : "border-2 hover:border-accent hover:text-accent"
                }`}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-7xl">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-sans text-xl text-muted-foreground">
                No articles found in this category yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article key={post.id}>
                  <Card className="h-full border-2 hover:border-accent/50 transition-all hover:shadow-xl group">
                    <CardContent className="p-0">
                      {/* Featured Image */}
                      {post.featuredImage && (
                        <div className="relative h-48 overflow-hidden rounded-t-xl">
                          <img 
                            src={post.featuredImage} 
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="p-6 space-y-4">
                        {/* Category Badge */}
                        <Badge 
                          variant="outline" 
                          className={`font-sans ${getCategoryColor(post.category)}`}
                        >
                          {post.category.replace('-', ' ').toUpperCase()}
                        </Badge>
                        
                        {/* Title */}
                        <h2 className="font-kanit text-xl font-bold text-primary leading-tight group-hover:text-accent transition-colors">
                          {post.title}
                        </h2>
                        
                        {/* Excerpt */}
                        <p className="font-sans text-muted-foreground leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                        
                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm font-sans text-muted-foreground pt-4 border-t border-border">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <time dateTime={post.publishedAt}>
                              {formatDate(post.publishedAt)}
                            </time>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime} min read</span>
                          </div>
                        </div>
                        
                        {/* Author */}
                        <div className="pt-2">
                          <p className="font-sans text-sm font-semibold text-primary">
                            {post.author.name}
                          </p>
                          <p className="font-sans text-xs text-muted-foreground">
                            {post.author.role}
                          </p>
                        </div>
                        
                        {/* Read More Link */}
                        <Link to={`/blog/${post.slug}`}>
                          <Button 
                            variant="ghost" 
                            className="w-full group-hover:bg-accent/10 text-accent font-sans font-bold hover:text-accent/90"
                          >
                            Read Full Article
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-background">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-kanit text-3xl font-bold text-primary mb-4">
              Never Miss a Career Insight
            </h2>
            <p className="font-sans text-lg text-muted-foreground">
              Get our latest articles, exclusive tips, and career advice delivered to your inbox weekly.
            </p>
          </div>
          <div className="max-w-xl mx-auto">
            <NewsletterSignup 
              variant="card" 
              source="blog-page" 
              showWhatsApp={true}
              showName={true}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container max-w-4xl text-center space-y-6">
          <h2 className="font-kanit text-3xl md:text-4xl font-bold">
            Ready to Start Your <span className="text-accent">Career Journey?</span>
          </h2>
          
          <p className="font-sans text-xl text-primary-foreground/80">
            Join our free Q&A session and discover which course is right for you.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-sans font-bold"
            >
              Join Free Session
            </Button>
            
            <Link to="/courses">
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-sans">
                View All Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
