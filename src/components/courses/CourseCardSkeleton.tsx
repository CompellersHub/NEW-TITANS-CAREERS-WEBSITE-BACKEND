import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const CourseCardSkeleton = () => {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all group">
      <Skeleton className="h-56 w-full rounded-t-lg" />
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-full" />
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  );
};
