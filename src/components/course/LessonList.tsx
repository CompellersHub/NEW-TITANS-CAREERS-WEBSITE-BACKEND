import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Circle, Clock, Lock, Play, Award } from "lucide-react";
import { toast } from "sonner";
import { VideoPlayer } from "./VideoPlayer";
import { ModuleQuiz } from "./ModuleQuiz";

interface Lesson {
  id: string;
  module_number: number;
  lesson_number: number;
  title: string;
  description: string;
  duration_minutes: number;
  is_free_preview: boolean;
  completed?: boolean;
  video_url: string | null;
  video_duration_seconds: number | null;
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
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [quizResults, setQuizResults] = useState<Record<number, boolean>>({});
  const [showQuiz, setShowQuiz] = useState<number | null>(null);

  useEffect(() => {
    loadLessons();
    loadQuizResults();
  }, [courseSlug, user]);

  const loadQuizResults = async () => {
    if (!user) return;

    try {
      const { data: quizData } = await supabase
        .from("module_quizzes")
        .select("id, module_number")
        .eq("course_slug", courseSlug);

      if (!quizData) return;

      const results: Record<number, boolean> = {};
      
      for (const quiz of quizData) {
        const { data: attemptData } = await supabase
          .from("quiz_attempts")
          .select("passed")
          .eq("user_id", user.id)
          .eq("quiz_id", quiz.id)
          .order("completed_at", { ascending: false })
          .limit(1)
          .single();

        if (attemptData) {
          results[quiz.module_number] = attemptData.passed;
        }
      }

      setQuizResults(results);
    } catch (error) {
      console.error("Error loading quiz results:", error);
    }
  };

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

  const isModuleUnlocked = (moduleNumber: number) => {
    if (moduleNumber === 1) return true;
    // Check if previous module quiz is passed
    return quizResults[moduleNumber - 1] === true;
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
            {Object.entries(moduleGroups).map(([moduleNum, moduleLessons]) => {
              const moduleNumber = parseInt(moduleNum);
              const moduleUnlocked = isModuleUnlocked(moduleNumber);
              const quizPassed = quizResults[moduleNumber];
              
              return (
                <AccordionItem key={moduleNum} value={`module-${moduleNum}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">Module {moduleNum}</Badge>
                      <span className="font-semibold">
                        {moduleLessons.length} Lessons
                      </span>
                      {!moduleUnlocked && (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      )}
                      {quizPassed && (
                        <Badge variant="default" className="ml-auto">
                          <Award className="w-3 h-3 mr-1" />
                          Quiz Passed
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {!moduleUnlocked && (
                      <div className="mb-4 p-4 bg-muted rounded-lg border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Lock className="w-4 h-4" />
                          <span>Complete and pass Module {moduleNumber - 1} quiz to unlock this module</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2 pt-2">
                      {moduleLessons.map((lesson) => {
                        const isCompleted = progress[lesson.id] || false;
                        const canAccess = (isEnrolled || lesson.is_free_preview) && moduleUnlocked;

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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (lesson.video_url) {
                                  setSelectedLesson(lesson);
                                  setIsVideoOpen(true);
                                }
                              }}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Module Quiz Section */}
                    {isEnrolled && moduleUnlocked && (
                      <div className="mt-4 pt-4 border-t">
                        {showQuiz === moduleNumber ? (
                          <ModuleQuiz
                            courseSlug={courseSlug}
                            moduleNumber={moduleNumber}
                            onComplete={() => {
                              loadQuizResults();
                              setShowQuiz(null);
                            }}
                          />
                        ) : (
                          <Button
                            onClick={() => setShowQuiz(moduleNumber)}
                            variant={quizPassed ? "outline" : "default"}
                            className="w-full"
                          >
                            <Award className="w-4 h-4 mr-2" />
                            {quizPassed ? "Review Quiz" : "Take Module Quiz"}
                          </Button>
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Video Player Modal */}
      {selectedLesson && selectedLesson.video_url && (
        <VideoPlayer
          lessonId={selectedLesson.id}
          lessonTitle={selectedLesson.title}
          videoUrl={selectedLesson.video_url}
          isOpen={isVideoOpen}
          onClose={() => {
            setIsVideoOpen(false);
            setSelectedLesson(null);
          }}
          onComplete={() => toggleLessonComplete(selectedLesson.id, false)}
          userId={user?.id}
        />
      )}
    </div>
  );
};
