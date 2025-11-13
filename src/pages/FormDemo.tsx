import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { MultiStepForm } from "@/components/forms/MultiStepForm";
import { CircularProgress } from "@/components/forms/CircularProgress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function FormDemo() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    experience: "",
    motivation: ""
  });

  const steps = [
    {
      id: 1,
      title: "Personal Info",
      description: "Tell us about yourself",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+44 7700 900000"
            />
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Course Selection",
      description: "Choose your path",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="course">Preferred Course</Label>
            <Input
              id="course"
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              placeholder="e.g., Data Analytics, AML Compliance"
            />
          </div>
          <div>
            <Label htmlFor="experience">Current Experience Level</Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="Tell us about your current skills and experience..."
              rows={4}
            />
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Motivation",
      description: "Why this course?",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="motivation">What motivates you?</Label>
            <Textarea
              id="motivation"
              value={formData.motivation}
              onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
              placeholder="What are your career goals? Why is this course important to you?"
              rows={6}
            />
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Review",
      description: "Confirm your details",
      content: (
        <div className="space-y-6">
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold">Personal Information</h3>
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Name:</span> {formData.name || "Not provided"}</p>
              <p><span className="text-muted-foreground">Email:</span> {formData.email || "Not provided"}</p>
              <p><span className="text-muted-foreground">Phone:</span> {formData.phone || "Not provided"}</p>
            </div>
          </div>
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold">Course Details</h3>
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Course:</span> {formData.course || "Not selected"}</p>
              <p><span className="text-muted-foreground">Experience:</span> {formData.experience || "Not provided"}</p>
            </div>
          </div>
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold">Motivation</h3>
            <p className="text-sm">{formData.motivation || "Not provided"}</p>
          </div>
        </div>
      )
    }
  ];

  const handleComplete = () => {
    toast.success("Application submitted successfully!");
    console.log("Form data:", formData);
  };

  return (
    <PageTransition variant="default">
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto py-16 px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-kanit font-bold text-primary">
                Course Application Form
              </h1>
              <p className="text-lg text-muted-foreground">
                Complete the steps below to apply for your chosen course
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Application Progress</CardTitle>
                <CardDescription>
                  Fill out each section carefully
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MultiStepForm 
                  steps={steps}
                  onComplete={handleComplete}
                  showProgress={true}
                />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Compact Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <MultiStepForm 
                    steps={steps}
                    onComplete={handleComplete}
                    showProgress={false}
                    variant="compact"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Circular Progress</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <CircularProgress value={75} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Vertical Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <MultiStepForm 
                    steps={steps.slice(0, 3)}
                    onComplete={handleComplete}
                    showProgress={false}
                    variant="vertical"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
