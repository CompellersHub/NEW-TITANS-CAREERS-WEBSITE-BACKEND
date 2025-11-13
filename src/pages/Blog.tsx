import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { blogPosts, BlogPost } from "@/data/blogPosts";
import { BookOpen, Clock, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { NewsletterSignup } from "@/components/NewsletterSignup";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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
      "aml": "bg-blue-100 text-blue-800 border-blue-200",
      "data": "bg-purple-100 text-purple-800 border-purple-200",
      "career-tips": "bg-green-100 text-green-800 border-green-200",
      "business-analysis": "bg-amber-100 text-amber-800 border-amber-200",
      "cybersecurity": "bg-red-100 text-red-800 border-red-200",
      "industry-news": "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-tc-navy text-white py-20 md:py-28">
        <div className="container max-w-7xl">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge className="bg-tc-amber/20 text-tc-amber border-tc-amber/30">
              <BookOpen className="w-3 h-3 mr-2" />
              CAREER INSIGHTS
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold">
              Learn. Grow. <span className="text-tc-amber">Succeed.</span>
            </h1>
            
            <p className="text-xl text-white/80 leading-relaxed">
              Practical career advice, industry insights, and expert tips to help you 
              break into high-paying professional roles.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-12 bg-white border-b">
        <div className="container max-w-7xl">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={
                  selectedCategory === category.id
                    ? "bg-tc-amber hover:bg-tc-gold text-tc-navy font-bold"
                    : "border-2 hover:border-tc-amber text-tc-navy"
                }
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 bg-secondary/30">
        <div className="container max-w-7xl">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">
                No articles found in this category yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article key={post.id}>
                  <Card className="h-full border-2 hover:border-tc-amber/50 transition-all hover:shadow-xl group">
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
                          className={getCategoryColor(post.category)}
                        >
                          {post.category.replace('-', ' ').toUpperCase()}
                        </Badge>
                        
                        {/* Title */}
                        <h2 className="text-xl font-bold text-tc-navy leading-tight group-hover:text-tc-amber transition-colors">
                          {post.title}
                        </h2>
                        
                        {/* Excerpt */}
                        <p className="text-muted-foreground leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                        
                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
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
                          <p className="text-sm font-semibold text-tc-navy">
                            {post.author.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {post.author.role}
                          </p>
                        </div>
                        
                        {/* Read More Link */}
                        <Link to={`/blog/${post.slug}`}>
                          <Button 
                            variant="ghost" 
                            className="w-full group-hover:bg-tc-amber/10 text-tc-amber font-bold"
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
      <section className="py-20 bg-white">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-tc-navy mb-4">
              Never Miss a Career Insight
            </h2>
            <p className="text-lg text-muted-foreground">
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
      <section className="py-20 bg-tc-navy text-white">
        <div className="container max-w-4xl text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Start Your <span className="text-tc-amber">Career Journey?</span>
          </h2>
          
          <p className="text-xl text-white/80">
            Join our free Q&A session and discover which course is right for you.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-tc-amber hover:bg-tc-gold text-tc-navy font-bold"
            >
              Join Free Session
            </Button>
            
            <Link to="/courses">
              <Button size="lg" variant="outlineWhite">
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
