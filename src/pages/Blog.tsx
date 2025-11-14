import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { BlogCardSkeleton } from "@/components/blog/BlogCardSkeleton";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PullToRefreshIndicator } from "@/components/contact/PullToRefreshIndicator";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { KeyboardShortcutsHelper } from "@/components/ui/keyboard-shortcuts-helper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/data/blogPosts";
import { BookOpen, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { SEO } from "@/components/SEO";
import { usePagination } from "@/hooks/usePagination";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useNavigationShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Enable keyboard shortcuts
  useNavigationShortcuts();

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

  // Pagination for desktop
  const {
    currentItems: paginatedItems,
    currentPage,
    totalPages,
    goToPage,
    canGoNext,
    canGoPrevious,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination({ items: filteredPosts, itemsPerPage: 9 });

  // Infinite scroll for mobile
  const {
    displayedItems: infiniteScrollItems,
    hasMore,
    isLoadingMore,
    loadMore,
    totalDisplayed,
    reset: resetInfiniteScroll,
  } = useInfiniteScroll({ items: filteredPosts, itemsPerPage: 9, enabled: isMobile });

  // Pull to refresh functionality
  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    resetInfiniteScroll();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 400);
    toast({
      title: "Articles refreshed",
      description: "The article list has been updated.",
    });
  };

  const {
    pullDistance,
    isRefreshing: isPullRefreshing,
    isAtThreshold,
  } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  });

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!isMobile || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [isMobile, hasMore, isLoadingMore, loadMore]);

  const displayItems = isMobile ? infiniteScrollItems : paginatedItems;

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
      
      {/* Pull to Refresh Indicator */}
      {isMobile && (
        <PullToRefreshIndicator
          pullDistance={pullDistance}
          isRefreshing={isPullRefreshing}
          isAtThreshold={isAtThreshold}
          threshold={80}
        />
      )}
      
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
            posts={displayItems} 
            loading={isLoading} 
            getCategoryColor={getCategoryColor}
            formatDate={formatDate}
          />
          
          {/* Infinite scroll loading indicator for mobile */}
          {isMobile && !isLoading && (
            <>
              {isLoadingMore && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 animate-fade-in">
                  {[1, 2, 3].map((i) => (
                    <BlogCardSkeleton key={i} />
                  ))}
                </div>
              )}
              
              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center mt-12 animate-fade-in">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="font-sans font-semibold"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Loading more articles...
                      </>
                    ) : (
                      `Load More Articles (${totalDisplayed} of ${filteredPosts.length})`
                    )}
                  </Button>
                </div>
              )}
              
              {!hasMore && filteredPosts.length > 9 && (
                <p className="text-center text-muted-foreground font-sans mt-12 animate-fade-in">
                  You've reached the end of the articles
                </p>
              )}
            </>
          )}
          
          {/* Pagination for desktop */}
          {!isMobile && (
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
      <ScrollToTop />
      <KeyboardShortcutsHelper />
    </div>
  );
};

export default Blog;
