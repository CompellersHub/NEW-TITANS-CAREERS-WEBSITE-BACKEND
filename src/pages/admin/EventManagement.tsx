import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar, RefreshCw, Archive, Play, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { getCourseConfig } from "@/lib/course-config";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EventManagement() {
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const courses = [
    "aml-kyc",
    "crypto-compliance",
    "data-privacy",
    "data-analysis",
    "cybersecurity",
    "business-analysis",
    "digital-marketing",
  ];

  // Fetch cohort pipeline status for all courses
  const { data: pipelineStatus, isLoading } = useQuery({
    queryKey: ["cohort-pipeline"],
    queryFn: async () => {
      const results = await Promise.all(
        courses.map(async (courseSlug) => {
          const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("course_slug", courseSlug)
            .eq("event_type", "cohort")
            .in("status", ["upcoming", "ongoing"])
            .order("start_date", { ascending: true })
            .limit(2);

          if (error) throw error;

          return {
            courseSlug,
            upcomingCohorts: data || [],
            count: data?.length || 0,
          };
        })
      );
      return results;
    },
  });

  // Force status update mutation
  const forceStatusUpdate = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("update_event_status");
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Event statuses updated successfully");
      queryClient.invalidateQueries({ queryKey: ["cohort-pipeline"] });
    },
    onError: (error) => {
      toast.error("Failed to update statuses: " + error.message);
    },
  });

  // Archive expired events mutation
  const archiveExpired = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("archive_expired_events");
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Expired events archived successfully");
      queryClient.invalidateQueries({ queryKey: ["cohort-pipeline"] });
      setShowArchiveDialog(false);
    },
    onError: (error) => {
      toast.error("Failed to archive events: " + error.message);
    },
  });

  // Regenerate cohorts mutation
  const regenerateCohorts = useMutation({
    mutationFn: async (courseSlug: string) => {
      const { error } = await supabase.rpc("refresh_course_cohorts", {
        p_course_slug: courseSlug,
        p_months_ahead: 6,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cohorts regenerated successfully");
      queryClient.invalidateQueries({ queryKey: ["cohort-pipeline"] });
      setSelectedCourse(null);
    },
    onError: (error) => {
      toast.error("Failed to regenerate cohorts: " + error.message);
    },
  });

  // Maintain pipeline mutation
  const maintainPipeline = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("maintain_cohort_pipeline");
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cohort pipeline maintained successfully");
      queryClient.invalidateQueries({ queryKey: ["cohort-pipeline"] });
    },
    onError: (error) => {
      toast.error("Failed to maintain pipeline: " + error.message);
    },
  });

  // Trigger lifecycle maintenance edge function
  const triggerMaintenance = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke("maintain-event-lifecycle");
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Event lifecycle maintenance triggered");
      queryClient.invalidateQueries({ queryKey: ["cohort-pipeline"] });
    },
    onError: (error) => {
      toast.error("Failed to trigger maintenance: " + error.message);
    },
  });

  const getStatusBadge = (count: number) => {
    if (count >= 2) return <Badge variant="default">Healthy</Badge>;
    if (count === 1) return <Badge variant="secondary">Low</Badge>;
    return <Badge variant="destructive">Critical</Badge>;
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Event Lifecycle Management</h1>
        <p className="text-muted-foreground">
          Manage automated cohort generation and event lifecycle
        </p>
      </div>

      {/* Global Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Actions</CardTitle>
          <CardDescription>
            Manually trigger automated maintenance tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => triggerMaintenance.mutate()}
              disabled={triggerMaintenance.isPending}
              className="w-full"
            >
              <Play className="mr-2 h-4 w-4" />
              Run Full Maintenance Cycle
            </Button>
            <Button
              onClick={() => forceStatusUpdate.mutate()}
              disabled={forceStatusUpdate.isPending}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Update Event Statuses
            </Button>
            <Button
              onClick={() => maintainPipeline.mutate()}
              disabled={maintainPipeline.isPending}
              variant="outline"
              className="w-full"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Maintain Cohort Pipeline
            </Button>
            <Button
              onClick={() => setShowArchiveDialog(true)}
              variant="outline"
              className="w-full"
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive Expired Events
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cohort Pipeline Status */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Cohort Pipeline Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              Loading pipeline status...
            </div>
          ) : (
            pipelineStatus?.map((course) => {
              const config = getCourseConfig(course.courseSlug);
              return (
                <Card key={course.courseSlug}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {config?.displayName || course.courseSlug}
                        </CardTitle>
                        <CardDescription>
                          {course.count} upcoming cohort{course.count !== 1 ? "s" : ""}
                        </CardDescription>
                      </div>
                      {getStatusBadge(course.count)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {course.count === 0 && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        No upcoming cohorts
                      </div>
                    )}
                    {course.upcomingCohorts.map((cohort) => (
                      <div
                        key={cohort.id}
                        className="p-3 bg-muted rounded-lg space-y-1"
                      >
                        <div className="font-medium">{cohort.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Starts: {format(new Date(cohort.start_date), "MMM d, yyyy")}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {cohort.status}
                        </Badge>
                      </div>
                    ))}
                    <Button
                      onClick={() => regenerateCohorts.mutate(course.courseSlug)}
                      disabled={regenerateCohorts.isPending}
                      variant="outline"
                      className="w-full mt-2"
                      size="sm"
                    >
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Regenerate Cohorts
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Expired Events</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive all completed events that ended more than 24 hours ago.
              Archived events will no longer appear in public listings. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => archiveExpired.mutate()}
              disabled={archiveExpired.isPending}
            >
              Archive Events
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
