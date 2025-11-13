import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const sb: any = supabase;
import { useNavigate } from "react-router-dom";
import { COURSE_CONFIG } from "@/lib/course-config";

interface CourseFinderProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUIZ_QUESTIONS = [
  {
    id: "experience",
    question: "What's your current experience level?",
    options: [
      { value: "complete-beginner", label: "Complete beginner", score: { "aml-kyc": 5, "data-analysis": 5 } },
      { value: "some-experience", label: "Some experience in another field", score: { "data-analysis": 3, "cybersecurity": 3 } },
      { value: "tech-background", label: "Technical background", score: { "cybersecurity": 5, "data-analysis": 4 } },
    ],
  },
  {
    id: "interest",
    question: "What interests you most?",
    options: [
      { value: "finance", label: "Finance & Compliance", score: { "aml-kyc": 10, "crypto-compliance": 8 } },
      { value: "data", label: "Data & Analytics", score: { "data-analysis": 10, "business-analysis": 6 } },
      { value: "security", label: "Security & Privacy", score: { "cybersecurity": 10, "data-privacy": 8 } },
      { value: "business", label: "Business & Strategy", score: { "business-analysis": 10, "digital-marketing": 6 } },
    ],
  },
  {
    id: "workstyle",
    question: "Preferred work style?",
    options: [
      { value: "analytical", label: "Deep analysis & problem solving", score: { "data-analysis": 5, "cybersecurity": 4 } },
      { value: "compliance", label: "Rules, regulations & frameworks", score: { "aml-kyc": 5, "data-privacy": 4 } },
      { value: "creative", label: "Creative & strategic thinking", score: { "digital-marketing": 5, "business-analysis": 4 } },
    ],
  },
  {
    id: "goal",
    question: "What's your main goal?",
    options: [
      { value: "career-switch", label: "Complete career switch", score: { "aml-kyc": 3, "data-analysis": 3 } },
      { value: "upskill", label: "Upskill in current role", score: { "cybersecurity": 3, "data-privacy": 3 } },
      { value: "promotion", label: "Get promoted", score: { "business-analysis": 4, "digital-marketing": 3 } },
      { value: "salary-boost", label: "Increase salary", score: { "crypto-compliance": 4, "cybersecurity": 4 } },
    ],
  },
];

export function CourseFinder({ isOpen, onClose }: CourseFinderProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<string[] | null>(null);

  const currentQuestion = QUIZ_QUESTIONS[step];
  const progress = ((step + 1) / (QUIZ_QUESTIONS.length + 1)) * 100;

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleNext = () => {
    if (step < QUIZ_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setStep(QUIZ_QUESTIONS.length); // Move to contact form
    }
  };

  const calculateResults = (): string[] => {
    const scores: Record<string, number> = {};

    // Calculate scores based on answers
    QUIZ_QUESTIONS.forEach((question) => {
      const answer = answers[question.id];
      if (!answer) return;

      const option = question.options.find((opt) => opt.value === answer);
      if (!option) return;

      Object.entries(option.score).forEach(([course, points]) => {
        scores[course] = (scores[course] || 0) + points;
      });
    });

    // Sort by score and get top 3
    return Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([course]) => course);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const recommendedCourses = calculateResults();

    try {
      // Save quiz results
      await sb.from("quiz_results").insert({
        email,
        name,
        answers,
        recommended_courses: recommendedCourses,
      });

      // Update lead score
      await sb.rpc("update_lead_score", {
        p_email: email,
        p_score_change: 30,
        p_behavior: "quiz_complete",
      });

      // Track behavior
      await sb.from("user_behaviors").insert({
        email,
        behavior_type: "quiz_complete",
        score_value: 30,
        behavior_data: { answers, recommended_courses: recommendedCourses },
      });

      setResults(recommendedCourses);
      toast.success("Quiz completed! Here are your personalized recommendations.");
    } catch (error) {
      console.error("Quiz submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewCourse = (courseSlug: string) => {
    navigate(`/courses/${courseSlug}`);
    onClose();
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({});
    setEmail("");
    setName("");
    setResults(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        {!results ? (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <DialogTitle className="text-center text-2xl">
                Find Your Perfect Course
              </DialogTitle>
              <DialogDescription className="text-center">
                Answer a few questions to get personalized course recommendations
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <Progress value={progress} className="h-2" />

              {step < QUIZ_QUESTIONS.length ? (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-lg font-semibold">{currentQuestion.question}</h3>
                  <RadioGroup
                    value={answers[currentQuestion.id]}
                    onValueChange={handleAnswer}
                  >
                    {currentQuestion.options.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent/5 cursor-pointer"
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      disabled={step === 0}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!answers[currentQuestion.id]}
                    >
                      {step === QUIZ_QUESTIONS.length - 1 ? "Get Results" : "Next"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
                  <p className="text-center text-muted-foreground">
                    Enter your details to see your personalized recommendations
                  </p>
                  <div className="space-y-3">
                    <Input
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Analyzing..." : "See My Recommendations"}
                  </Button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">
                Your Perfect Courses
              </DialogTitle>
              <DialogDescription className="text-center">
                Based on your answers, here are the best courses for you
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {results.map((courseSlug, index) => {
                const config = COURSE_CONFIG[courseSlug];
                if (!config) return null;

                return (
                  <div
                    key={courseSlug}
                    className="border rounded-lg p-4 hover:bg-accent/5 cursor-pointer"
                    onClick={() => handleViewCourse(courseSlug)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm font-bold">
                            {index + 1}
                          </span>
                          <h4 className="font-semibold">{config.displayName}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {index === 0 && "Best match for your goals"}
                          {index === 1 && "Great alternative option"}
                          {index === 2 && "Also recommended for you"}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Retake Quiz
              </Button>
              <Button onClick={() => navigate("/courses")} className="flex-1">
                View All Courses
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
