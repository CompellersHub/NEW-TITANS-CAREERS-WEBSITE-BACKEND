import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const BlogCardSkeleton = () => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-16 w-full" />
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  );
};
