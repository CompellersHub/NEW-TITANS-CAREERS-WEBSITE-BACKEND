import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlogCardSkeleton } from "./BlogCardSkeleton";
import { BlogPost } from "@/data/blogPosts";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface BlogGridProps {
  posts: BlogPost[];
  loading?: boolean;
  getCategoryColor: (category: string) => string;
  formatDate: (dateString: string) => string;
}

export function BlogGrid({ posts, loading, getCategoryColor, formatDate }: BlogGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <BlogCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-sans text-xl text-muted-foreground">No articles found in this category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <Card key={post.slug} className="group overflow-hidden hover:shadow-lg transition-shadow border-border">
          {post.featuredImage && (
            <div className="overflow-hidden">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Badge className={`${getCategoryColor(post.category)} font-sans text-xs`}>
                {post.category.replace("-", " ")}
              </Badge>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-sans">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            </div>
            
            <h3 className="font-kanit text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            
            <p className="font-sans text-muted-foreground line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-sans">
                <Clock className="w-3.5 h-3.5" />
                <span>{post.readTime} min read</span>
              </div>
              <Link to={`/blog/${post.slug}`}>
                <Button variant="ghost" size="sm" className="group/btn font-sans">
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="pt-2">
              <p className="font-sans text-sm font-semibold text-primary">
                {post.author.name}
              </p>
              <p className="font-sans text-xs text-muted-foreground">
                {post.author.role}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
