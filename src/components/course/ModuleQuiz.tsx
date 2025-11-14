import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Trophy, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Quiz {
  id: string;
  title: string;
  description: string;
  passing_score: number;
  time_limit_minutes: number | null;
}

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  order_number: number;
}

interface QuizAttempt {
  id: string;
  score: number;
  passed: boolean;
  correct_answers: number;
  total_questions: number;
  completed_at: string;
}

interface ModuleQuizProps {
  courseSlug: string;
  moduleNumber: number;
  onComplete: () => void;
}

export const ModuleQuiz = ({ courseSlug, moduleNumber, onComplete }: ModuleQuizProps) => {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuiz();
  }, [courseSlug, moduleNumber]);

  const loadQuiz = async () => {
    try {
      // Load quiz
      const { data: quizData, error: quizError } = await supabase
        .from("module_quizzes")
        .select("*")
        .eq("course_slug", courseSlug)
        .eq("module_number", moduleNumber)
        .single();

      if (quizError) throw quizError;
      if (!quizData) {
        toast.error("Quiz not found");
        return;
      }

      setQuiz(quizData);

      // Load questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizData.id)
        .order("order_number");

      if (questionsError) throw questionsError;
      
      // Parse JSONB options field to string array
      const parsedQuestions = questionsData?.map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options as string[] : JSON.parse(q.options as string)
      })) || [];
      
      setQuestions(parsedQuestions);

      // Load last attempt
      if (user) {
        const { data: attemptData } = await supabase
          .from("quiz_attempts")
          .select("*")
          .eq("user_id", user.id)
          .eq("quiz_id", quizData.id)
          .order("completed_at", { ascending: false })
          .limit(1)
          .single();

        if (attemptData) {
          setLastAttempt(attemptData);
        }
      }
    } catch (error: any) {
      console.error("Error loading quiz:", error);
      toast.error("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStartTime(new Date());
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const submitQuiz = async () => {
    if (!user || !quiz) {
      toast.error("Please sign in to submit quiz");
      return;
    }

    // Calculate score
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        correctCount++;
      }
    });

    const score = (correctCount / questions.length) * 100;
    const passed = score >= quiz.passing_score;
    const timeTaken = quizStartTime
      ? Math.floor((new Date().getTime() - quizStartTime.getTime()) / 1000)
      : 0;

    try {
      const { error } = await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        quiz_id: quiz.id,
        score,
        total_questions: questions.length,
        correct_answers: correctCount,
        passed,
        time_taken_seconds: timeTaken,
        answers,
      });

      if (error) throw error;

      setShowResults(true);

      if (passed) {
        toast.success("Congratulations! 🎉", {
          description: `You passed with ${score.toFixed(0)}%!`,
        });
        onComplete();
      } else {
        toast.error("Quiz not passed", {
          description: `You scored ${score.toFixed(0)}%. You need ${quiz.passing_score}% to pass.`,
        });
      }

      // Reload to get latest attempt
      loadQuiz();
    } catch (error: any) {
      toast.error("Failed to submit quiz", {
        description: error.message,
      });
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading quiz...</div>
        </CardContent>
      </Card>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">No quiz available for this module</div>
        </CardContent>
      </Card>
    );
  }

  // Show start screen
  if (!quizStartTime) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{quiz.title}</CardTitle>
              <CardDescription>{quiz.description}</CardDescription>
            </div>
            {lastAttempt && (
              <Badge variant={lastAttempt.passed ? "default" : "secondary"}>
                Last Score: {lastAttempt.score.toFixed(0)}%
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="w-4 h-4 text-primary" />
              <span>Passing Score: {quiz.passing_score}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>{questions.length} Questions</span>
            </div>
            {quiz.time_limit_minutes && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span>Time Limit: {quiz.time_limit_minutes} minutes</span>
              </div>
            )}
          </div>

          {lastAttempt && lastAttempt.passed && (
            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Module Unlocked!</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                You've passed this quiz. You can retake it to improve your score.
              </p>
            </div>
          )}

          <Button onClick={startQuiz} className="w-full" size="lg">
            {lastAttempt ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retake Quiz
              </>
            ) : (
              "Start Quiz"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show results screen
  if (showResults) {
    const score = (questions.filter(q => answers[q.id] === q.correct_answer).length / questions.length) * 100;
    const passed = score >= quiz.passing_score;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {passed ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                Quiz Passed!
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-destructive" />
                Quiz Not Passed
              </>
            )}
          </CardTitle>
          <CardDescription>
            You scored {score.toFixed(0)}% - {passed ? "Great job!" : `You need ${quiz.passing_score}% to pass`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correct_answer;

            return (
              <div
                key={question.id}
                className={`p-4 border rounded-lg ${
                  isCorrect
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                    : "border-destructive/20 bg-destructive/5"
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">
                      Question {index + 1}: {question.question_text}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your answer: <span className="font-medium">{userAnswer || "Not answered"}</span>
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Correct answer: <span className="font-medium">{question.correct_answer}</span>
                      </p>
                    )}
                    {question.explanation && (
                      <p className="text-sm text-muted-foreground mt-2 italic">{question.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <Button onClick={startQuiz} className="w-full" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show quiz question
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
          {quiz.time_limit_minutes && quizStartTime && (
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />
              Time: {Math.max(0, quiz.time_limit_minutes - Math.floor((new Date().getTime() - quizStartTime.getTime()) / 60000))} min
            </Badge>
          )}
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <h3 className="text-lg font-medium">{currentQuestion.question_text}</h3>

        <RadioGroup
          value={answers[currentQuestion.id] || ""}
          onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
        >
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex gap-2">
          {currentQuestionIndex > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            >
              Previous
            </Button>
          )}
          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              disabled={!answers[currentQuestion.id]}
              className="ml-auto"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={submitQuiz}
              disabled={Object.keys(answers).length < questions.length}
              className="ml-auto"
            >
              Submit Quiz
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
