import { Skeleton } from "@/components/ui/loading-skeleton";

export const LegalPageSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
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

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-16">
        <div className="container px-4 max-w-4xl mx-auto">
          {/* Page Title */}
          <Skeleton className="h-12 w-96 mb-4" />
          <Skeleton className="h-4 w-48 mb-8" />

          {/* Content Sections */}
          <div className="space-y-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <section key={i}>
                <Skeleton className="h-8 w-64 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  {i % 3 === 0 && (
                    <div className="space-y-2 mt-3">
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

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
