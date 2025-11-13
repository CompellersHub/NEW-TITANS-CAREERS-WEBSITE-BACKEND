import { Skeleton } from "@/components/ui/loading-skeleton";

export const HomePageSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar Skeleton */}
      <div className="border-b bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-40" />
            <div className="hidden md:flex gap-6">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <div className="bg-primary min-h-[90vh] flex items-center">
        <div className="container px-4 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-20 w-3/4" />
              <div className="flex gap-4">
                <Skeleton className="h-12 w-48" />
                <Skeleton className="h-12 w-36" />
              </div>
            </div>
            <div className="hidden md:block">
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Courses Skeleton */}
      <div className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4">
            <Skeleton className="h-10 w-48 mx-auto" />
            <Skeleton className="h-16 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border bg-card p-6 space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-2 pt-4">
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Skeleton */}
      <div className="py-20 px-4 bg-secondary">
        <div className="container mx-auto">
          <Skeleton className="h-12 w-64 mx-auto mb-16" />
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center space-y-4">
                <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Stories Skeleton */}
      <div className="py-20 px-4">
        <div className="container mx-auto">
          <Skeleton className="h-12 w-64 mx-auto mb-16" />
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-lg border bg-card p-8 space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Skeleton */}
      <div className="py-20 px-4 bg-secondary">
        <div className="container mx-auto max-w-3xl">
          <Skeleton className="h-12 w-64 mx-auto mb-16" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="border-t bg-card py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
