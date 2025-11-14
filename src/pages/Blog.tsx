import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/data/blogPosts";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { SEO } from "@/components/SEO";
import { usePagination } from "@/hooks/usePagination";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state for data fetching
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400);
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

  const {
    currentItems,
    currentPage,
    totalPages,
    goToPage,
    canGoNext,
    canGoPrevious,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination({ items: filteredPosts, itemsPerPage: 9 });

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
          <BlogGrid 
            posts={currentItems} 
            loading={isLoading} 
            getCategoryColor={getCategoryColor}
            formatDate={formatDate}
          />
          
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
            className="mt-12"
          />
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
