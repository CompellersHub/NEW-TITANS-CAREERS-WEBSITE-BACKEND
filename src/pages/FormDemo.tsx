import { useState } from "react";
import { PageLayout } from "@/components/layouts/PageLayout";
import { PageTransition } from "@/components/PageTransition";
import { ValidatedMultiStepForm } from "@/components/forms/ValidatedMultiStepForm";
import { FormField } from "@/components/forms/FormField";
import { CircularProgress } from "@/components/forms/CircularProgress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  personalInfoSchema, 
  courseSelectionSchema, 
  motivationSchema,
  validateWithSchema 
} from "@/lib/formSchemas";

export default function FormDemo() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    experience: "",
    motivation: ""
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setTouchedFields({ ...touchedFields, [field]: true });
    
    // Clear error when user starts typing
    if (fieldErrors[field]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[field];
      setFieldErrors(newErrors);
    }
  };

  const handleFieldBlur = (field: string, schema: any) => {
    const result = validateWithSchema(schema, { [field]: formData[field as keyof typeof formData] });
    if (!result.isValid) {
      setFieldErrors({ ...fieldErrors, ...result.errors });
    }
  };

  const steps = [
    {
      id: 1,
      title: "Personal Info",
      description: "Tell us about yourself",
      onValidate: () => {
        return validateWithSchema(personalInfoSchema, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        });
      },
      content: (
        <div className="space-y-6">
          <FormField
            label="Full Name"
            error={fieldErrors.name}
            success={touchedFields.name && !fieldErrors.name && formData.name.length > 0}
            required
            htmlFor="name"
          >
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              onBlur={() => handleFieldBlur("name", personalInfoSchema.pick({ name: true }))}
              placeholder="John Doe"
              className={fieldErrors.name ? "border-destructive" : ""}
            />
          </FormField>

          <FormField
            label="Email Address"
            error={fieldErrors.email}
            success={touchedFields.email && !fieldErrors.email && formData.email.length > 0}
            required
            htmlFor="email"
          >
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              onBlur={() => handleFieldBlur("email", personalInfoSchema.pick({ email: true }))}
              placeholder="john@example.com"
              className={fieldErrors.email ? "border-destructive" : ""}
            />
          </FormField>

          <FormField
            label="Phone Number"
            error={fieldErrors.phone}
            success={touchedFields.phone && !fieldErrors.phone && formData.phone.length > 0}
            required
            htmlFor="phone"
          >
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              onBlur={() => handleFieldBlur("phone", personalInfoSchema.pick({ phone: true }))}
              placeholder="+44 7700 900000"
              className={fieldErrors.phone ? "border-destructive" : ""}
            />
          </FormField>
        </div>
      )
    },
    {
      id: 2,
      title: "Course Selection",
      description: "Choose your path",
      onValidate: () => {
        return validateWithSchema(courseSelectionSchema, {
          course: formData.course,
          experience: formData.experience
        });
      },
      content: (
        <div className="space-y-6">
          <FormField
            label="Preferred Course"
            error={fieldErrors.course}
            success={touchedFields.course && !fieldErrors.course && formData.course.length > 0}
            required
            htmlFor="course"
          >
            <Input
              id="course"
              value={formData.course}
              onChange={(e) => handleFieldChange("course", e.target.value)}
              onBlur={() => handleFieldBlur("course", courseSelectionSchema.pick({ course: true }))}
              placeholder="e.g., Data Analytics, AML Compliance"
              className={fieldErrors.course ? "border-destructive" : ""}
            />
          </FormField>

          <FormField
            label="Current Experience Level"
            error={fieldErrors.experience}
            success={touchedFields.experience && !fieldErrors.experience && formData.experience.length > 0}
            required
            htmlFor="experience"
          >
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => handleFieldChange("experience", e.target.value)}
              onBlur={() => handleFieldBlur("experience", courseSelectionSchema.pick({ experience: true }))}
              placeholder="Tell us about your current skills and experience..."
              rows={5}
              className={fieldErrors.experience ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.experience.length} / 1000 characters
            </p>
          </FormField>
        </div>
      )
    },
    {
      id: 3,
      title: "Motivation",
      description: "Why this course?",
      onValidate: () => {
        return validateWithSchema(motivationSchema, {
          motivation: formData.motivation
        });
      },
      content: (
        <div className="space-y-6">
          <FormField
            label="What motivates you?"
            error={fieldErrors.motivation}
            success={touchedFields.motivation && !fieldErrors.motivation && formData.motivation.length > 0}
            required
            htmlFor="motivation"
          >
            <Textarea
              id="motivation"
              value={formData.motivation}
              onChange={(e) => handleFieldChange("motivation", e.target.value)}
              onBlur={() => handleFieldBlur("motivation", motivationSchema)}
              placeholder="What are your career goals? Why is this course important to you?"
              rows={8}
              className={fieldErrors.motivation ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.motivation.length} / 2000 characters
            </p>
          </FormField>
        </div>
      )
    },
    {
      id: 4,
      title: "Review",
      description: "Confirm your details",
      content: (
        <div className="space-y-6">
          <div className="rounded-lg border p-4 space-y-3 bg-accent/5">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              Personal Information
            </h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{formData.name || "Not provided"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{formData.email || "Not provided"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{formData.phone || "Not provided"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-3 bg-accent/5">
            <h3 className="font-semibold text-lg">Course Details</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Course:</span>
                <span className="font-medium">{formData.course || "Not selected"}</span>
              </div>
              <div className="py-1">
                <span className="text-muted-foreground block mb-1">Experience:</span>
                <p className="text-sm">{formData.experience || "Not provided"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-3 bg-accent/5">
            <h3 className="font-semibold text-lg">Motivation</h3>
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
    <PageLayout intensity3D="subtle" show3D={true}>
      <PageTransition variant="default">
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
                <ValidatedMultiStepForm 
                  steps={steps}
                  onComplete={handleComplete}
                  showProgress={true}
                  formName="demo-registration-form"
                  userEmail={formData.email}
                />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Compact Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <ValidatedMultiStepForm 
                    steps={steps}
                    onComplete={handleComplete}
                    showProgress={false}
                    variant="compact"
                    formName="demo-compact-form"
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
                  <ValidatedMultiStepForm 
                    steps={steps.slice(0, 3)}
                    onComplete={handleComplete}
                    showProgress={false}
                    variant="vertical"
                    formName="demo-vertical-form"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageTransition>
    </PageLayout>
  );
}
