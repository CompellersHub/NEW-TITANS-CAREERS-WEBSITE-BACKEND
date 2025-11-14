import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Circle, Clock, Lock, Play } from "lucide-react";
import { toast } from "sonner";

interface Lesson {
  id: string;
  module_number: number;
  lesson_number: number;
  title: string;
  description: string;
  duration_minutes: number;
  is_free_preview: boolean;
  completed?: boolean;
}

interface LessonListProps {
  courseSlug: string;
  isEnrolled: boolean;
}

export const LessonList = ({ courseSlug, isEnrolled }: LessonListProps) => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessons();
  }, [courseSlug, user]);

  const loadLessons = async () => {
    setLoading(true);
    try {
      // Load lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_slug", courseSlug)
        .order("module_number")
        .order("lesson_number");

      if (lessonsError) throw lessonsError;

      // Load user progress if logged in
      if (user) {
        const lessonIds = lessonsData?.map(l => l.id) || [];
        const { data: progressData, error: progressError } = await supabase
          .from("user_lesson_progress")
          .select("lesson_id, completed")
          .eq("user_id", user.id)
          .in("lesson_id", lessonIds);

        if (progressError) throw progressError;

        const progressMap: Record<string, boolean> = {};
        progressData?.forEach(p => {
          progressMap[p.lesson_id] = p.completed;
        });
        setProgress(progressMap);
      }

      setLessons(lessonsData || []);
    } catch (error: any) {
      toast.error("Error loading lessons", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLessonComplete = async (lessonId: string, currentStatus: boolean) => {
    if (!user) {
      toast.error("Please sign in to track progress");
      return;
    }

    if (!isEnrolled) {
      toast.error("Please enroll in the course to track progress");
      return;
    }

    try {
      const newStatus = !currentStatus;
      
      // Check if progress record exists
      const { data: existing } = await supabase
        .from("user_lesson_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single();

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from("user_lesson_progress")
          .update({
            completed: newStatus,
            completed_at: newStatus ? new Date().toISOString() : null,
            last_accessed_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from("user_lesson_progress")
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            completed: newStatus,
            completed_at: newStatus ? new Date().toISOString() : null,
          });

        if (error) throw error;
      }

      setProgress(prev => ({ ...prev, [lessonId]: newStatus }));
      toast.success(newStatus ? "Lesson marked as complete" : "Progress updated");

      // Check if all lessons are now complete
      const allLessons = lessons.length;
      const completedCount = Object.values({ ...progress, [lessonId]: newStatus }).filter(Boolean).length;
      
      if (completedCount === allLessons && newStatus) {
        checkAndGenerateCertificate();
      }
    } catch (error: any) {
      toast.error("Error updating progress", {
        description: error.message,
      });
    }
  };

  const checkAndGenerateCertificate = async () => {
    if (!user) return;

    try {
      // Check if certificate already exists
      const { data: existingCert } = await supabase
        .from("course_certificates")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_slug", courseSlug)
        .single();

      if (existingCert) return;

      // Get user profile for certificate
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      // Get course title from course slug
      const courseTitle = courseSlug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');

      // Generate certificate
      const { data: certData, error: certError } = await supabase
        .rpc("generate_certificate_number");

      if (certError) throw certError;

      const { error: insertError } = await supabase
        .from("course_certificates")
        .insert({
          user_id: user.id,
          course_slug: courseSlug,
          course_title: courseTitle || "Course",
          certificate_number: certData,
          user_name: profile?.full_name || user.email || "Student",
        });

      if (insertError) throw insertError;

      toast.success("Congratulations! 🎉", {
        description: "You've completed the course and earned your certificate!",
      });
    } catch (error: any) {
      console.error("Certificate generation error:", error);
    }
  };

  // Group lessons by module
  const moduleGroups = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.module_number]) {
      acc[lesson.module_number] = [];
    }
    acc[lesson.module_number].push(lesson);
    return acc;
  }, {} as Record<number, Lesson[]>);

  const totalLessons = lessons.length;
  const completedLessons = Object.values(progress).filter(Boolean).length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading course content...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Course Progress</span>
            <Badge variant="secondary">
              {completedLessons} / {totalLessons} Lessons
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {progressPercentage.toFixed(0)}% Complete
          </p>
        </CardContent>
      </Card>

      {/* Lesson Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(moduleGroups).map(([moduleNum, moduleLessons]) => (
              <AccordionItem key={moduleNum} value={`module-${moduleNum}`}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Module {moduleNum}</Badge>
                    <span className="font-semibold">
                      {moduleLessons.length} Lessons
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    {moduleLessons.map((lesson) => {
                      const isCompleted = progress[lesson.id] || false;
                      const canAccess = isEnrolled || lesson.is_free_preview;

                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                            canAccess ? "hover:bg-accent/5" : "opacity-60"
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-auto"
                              onClick={() => toggleLessonComplete(lesson.id, isCompleted)}
                              disabled={!canAccess}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground" />
                              )}
                            </Button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">
                                  {lesson.lesson_number}. {lesson.title}
                                </h4>
                                {lesson.is_free_preview && (
                                  <Badge variant="secondary" className="text-xs">
                                    Free Preview
                                  </Badge>
                                )}
                                {!canAccess && (
                                  <Lock className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {lesson.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{lesson.duration_minutes} min</span>
                              </div>
                            </div>
                          </div>
                          {canAccess && (
                            <Button variant="ghost" size="sm">
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
