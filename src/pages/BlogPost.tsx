import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { blogPosts } from "@/data/blogPosts";
import { Calendar, Clock, ArrowLeft, Share2, BookOpen } from "lucide-react";
import { Link, useParams, Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  
  const post = blogPosts.find(p => p.slug === slug);
  
  // If post not found, redirect to blog
  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Update page title for SEO
  useEffect(() => {
    document.title = `${post.title} | Titans Careers Blog`;
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', post.excerpt);
    }
    
    return () => {
      document.title = 'Titans Careers';
    };
  }, [post]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: url
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied!",
          description: "Article link copied to clipboard.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not copy link. Please copy manually from the address bar.",
          variant: "destructive"
        });
      }
    }
  };

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

  // Get related posts (same category, excluding current)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Article Header */}
      <article>
        <header className="bg-tc-navy text-white py-16 md:py-24">
          <div className="container max-w-4xl">
            <Link to="/blog">
              <Button 
                variant="ghost" 
                className="text-white hover:text-tc-amber mb-8 -ml-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
            
            <div className="space-y-6">
              <Badge 
                variant="outline" 
                className={getCategoryColor(post.category)}
              >
                {post.category.replace('-', ' ').toUpperCase()}
              </Badge>
              
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                {post.title}
              </h1>
              
              <p className="text-xl text-white/80 leading-relaxed">
                {post.excerpt}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm pt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-tc-amber" />
                  <time dateTime={post.publishedAt} className="text-white/80">
                    {formatDate(post.publishedAt)}
                  </time>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-tc-amber" />
                  <span className="text-white/80">{post.readTime} min read</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-white hover:text-tc-amber hover:bg-white/10"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
              
              <div className="pt-4 border-t border-white/20">
                <p className="font-semibold text-white">{post.author.name}</p>
                <p className="text-sm text-white/70">{post.author.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <section className="py-16 bg-white">
          <div className="container max-w-3xl">
            <div 
              className="prose prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-tc-navy
                prose-h1:text-4xl prose-h1:mb-6
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-tc-amber
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                prose-strong:text-tc-navy prose-strong:font-bold
                prose-ul:my-6 prose-ul:space-y-2
                prose-li:text-muted-foreground
                prose-a:text-tc-amber prose-a:font-semibold prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-tc-navy to-tc-blue text-white">
          <div className="container max-w-3xl">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-8 text-center space-y-6">
                <BookOpen className="w-12 h-12 text-tc-amber mx-auto" />
                
                <h2 className="text-2xl md:text-3xl font-bold">
                  Ready to Take Action?
                </h2>
                
                <p className="text-white/80 text-lg">
                  Join our free Q&A session to learn how our courses can help you 
                  break into {post.category === 'aml' ? 'AML compliance' : 
                  post.category === 'data' ? 'data analysis' : 'your dream career'}.
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
                      View Courses
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-20 bg-secondary/30">
            <div className="container max-w-7xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-tc-navy mb-4">
                  More Articles You Might Like
                </h2>
                <p className="text-muted-foreground">
                  Continue exploring career insights and industry tips
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Card 
                    key={relatedPost.id}
                    className="border-2 hover:border-tc-amber/50 transition-all hover:shadow-xl"
                  >
                    <CardContent className="p-6 space-y-4">
                      <Badge 
                        variant="outline" 
                        className={getCategoryColor(relatedPost.category)}
                      >
                        {relatedPost.category.replace('-', ' ').toUpperCase()}
                      </Badge>
                      
                      <h3 className="text-lg font-bold text-tc-navy leading-tight">
                        {relatedPost.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {relatedPost.excerpt}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{relatedPost.readTime} min</span>
                      </div>
                      
                      <Link to={`/blog/${relatedPost.slug}`}>
                        <Button 
                          variant="ghost" 
                          className="w-full text-tc-amber font-bold"
                        >
                          Read Article
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost;
