import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const CourseCardSkeleton = () => {
  return (
    <Card className="overflow-hidden transition-all">
      <CardContent className="p-8 space-y-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24 bg-muted" />
          <Skeleton className="h-6 w-full bg-muted" />
          <Skeleton className="h-4 w-3/4 bg-muted" />
        </div>
        <Skeleton className="h-20 w-full bg-muted" />
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <Skeleton className="h-10 w-20 bg-muted" />
          <Skeleton className="h-10 w-32 bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
};
