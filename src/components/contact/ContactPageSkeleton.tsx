import { Skeleton } from "@/components/ui/loading-skeleton";

export const ContactPageSkeleton = () => {
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
      <div className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Skeleton className="h-12 w-64 mx-auto mb-6 bg-primary-foreground/20" />
          <Skeleton className="h-24 w-full max-w-2xl mx-auto mb-8 bg-primary-foreground/20" />
          <div className="flex gap-4 justify-center">
            <Skeleton className="h-12 w-48 bg-primary-foreground/20" />
            <Skeleton className="h-12 w-36 bg-primary-foreground/20" />
          </div>
        </div>
      </div>

      {/* Contact Methods Grid Skeleton */}
      <div className="container mx-auto px-4 -mt-12">
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border bg-card p-6">
              <Skeleton className="h-12 w-12 rounded-full mb-4" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {/* Contact Form Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>

          {/* Info Section Skeleton */}
          <div className="space-y-8">
            <div className="rounded-lg border bg-card p-6 space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 mt-1" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 mt-1" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 mt-1" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>

        {/* Process Steps Skeleton */}
        <div className="mb-20">
          <Skeleton className="h-10 w-64 mx-auto mb-12" />
          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center space-y-4">
                <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Map Skeleton */}
        <div className="mb-20">
          <Skeleton className="h-96 w-full rounded-lg" />
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
