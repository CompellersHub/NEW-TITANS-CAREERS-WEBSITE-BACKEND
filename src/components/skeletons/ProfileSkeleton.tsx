import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

export function ProfileSkeleton() {
  return (
    <>
      <SEO 
        title="My Profile"
        description="Manage your profile, view purchased courses, and update account settings"
      />
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col animate-fade-in">
        <Navbar />
        
        <div className="flex-1 py-12 px-4">
          <div className="container max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-5 w-80" />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-center gap-2 px-3 py-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </TabsList>

              {/* Profile Tab Content */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Form Fields */}
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                  
                  <Skeleton className="h-px w-full my-6" />
                  
                  {/* Button */}
                  <Skeleton className="h-10 w-32" />
                </CardContent>
              </Card>

              {/* Courses Tab Preview */}
              <div className="mt-8 space-y-4">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-80" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-64" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          <Skeleton className="h-9 w-24" />
                        </div>
                        <Skeleton className="h-4 w-40" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </Tabs>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
