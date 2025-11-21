import { CourseGrid } from "@/components/courses/CourseGrid";
import { CourseCardSkeleton } from "@/components/courses/CourseCardSkeleton";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PullToRefreshIndicator } from "@/components/contact/PullToRefreshIndicator";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { KeyboardShortcutsHelper } from "@/components/ui/keyboard-shortcuts-helper";
import { courses } from "@/data/courses";
import { PageTransition } from "@/components/PageTransition";
import { PageLayout } from "@/components/layouts/PageLayout";
import { SEO } from "@/components/SEO";
import { usePagination } from "@/hooks/usePagination";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useNavigationShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Courses() {
  const coursesArray = Object.values(courses);
  console.log("📚 Total courses loaded:", coursesArray.length);
  const isMobile = useIsMobile();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Enable keyboard shortcuts
  useNavigationShortcuts();
  
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
  } = usePagination({ items: coursesArray, itemsPerPage: 12 });

  // Infinite scroll for mobile
  const {
    displayedItems: infiniteScrollItems,
    hasMore,
    isLoadingMore,
    loadMore,
    totalDisplayed,
    reset: resetInfiniteScroll,
  } = useInfiniteScroll({ items: coursesArray, itemsPerPage: 12, enabled: isMobile });

  // Pull to refresh functionality
  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    resetInfiniteScroll();
    toast({
      title: "Courses refreshed",
      description: "The course list has been updated.",
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

  // Remove artificial loading delay - courses are available immediately

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
  console.log("📱 Display mode:", isMobile ? "mobile" : "desktop");
  console.log("🎯 Display items count:", displayItems.length);
  
  return (
    <PageTransition variant="slide">
      <SEO 
        title="Professional Training Courses - Transform Your Career"
        description="Browse our complete catalog of professional training courses including AML/KYC, Data Analysis, Cybersecurity, Business Analysis, and more. Industry-leading programs with 85% job placement rate."
        keywords="training courses catalog, professional courses, AML certification, data analysis training, cybersecurity courses, business analyst training, compliance courses"
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
      
      <PageLayout intensity3D="subtle" show3D={true}>
        <div className="container max-w-7xl mx-auto py-24 md:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16 md:mb-20 animate-fade-in">
            <h1 className="font-kanit text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-tc-navy leading-tight">
              Professional Courses
            </h1>
            <p className="font-sans text-lg md:text-xl text-tc-grey leading-relaxed">
              Transform your career with industry-leading training programs designed by experts
            </p>
          </div>
          
          <CourseGrid courses={displayItems} loading={false} />
          
          {/* Infinite scroll loading indicator for mobile */}
          {isMobile && (
            <>
              {isLoadingMore && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {[1, 2, 3].map((i) => (
                    <CourseCardSkeleton key={i} />
                  ))}
                </div>
              )}
              
              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center mt-12">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="font-sans"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading more courses...
                      </>
                    ) : (
                      `Load More (${totalDisplayed} of ${totalItems})`
                    )}
                  </Button>
                </div>
              )}
              
              {!hasMore && coursesArray.length > 12 && (
                <p className="text-center text-muted-foreground font-sans mt-12">
                  You've reached the end of our courses
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
        <ScrollToTop />
        <KeyboardShortcutsHelper />
      </PageLayout>
    </PageTransition>
  );
}
