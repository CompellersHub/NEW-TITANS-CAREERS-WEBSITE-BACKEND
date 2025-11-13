import { z } from "zod";

// Personal information schema
export const personalInfoSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase(),
  
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s+()-]+$/, "Phone number can only contain digits, spaces, and + - ( )")
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must be less than 20 characters")
});

// Course selection schema
export const courseSelectionSchema = z.object({
  course: z
    .string()
    .trim()
    .min(3, "Please select or enter a course name")
    .max(100, "Course name must be less than 100 characters"),
  
  experience: z
    .string()
    .trim()
    .min(10, "Please provide at least 10 characters about your experience")
    .max(1000, "Experience description must be less than 1000 characters")
});

// Motivation schema
export const motivationSchema = z.object({
  motivation: z
    .string()
    .trim()
    .min(20, "Please provide at least 20 characters about your motivation")
    .max(2000, "Motivation must be less than 2000 characters")
});

// Contact form schema
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  
  subject: z
    .string()
    .trim()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject must be less than 200 characters"),
  
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters")
});

// Password validation schema
export const passwordSchema = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character");

// Newsletter subscription schema
export const newsletterSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional()
});

// Helper function to validate data against schema
export const validateWithSchema = <T extends z.ZodType>(
  schema: T,
  data: unknown
): { isValid: boolean; errors: Record<string, string>; data?: z.infer<T> } => {
  try {
    const validatedData = schema.parse(data);
    return { isValid: true, errors: {}, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: "Validation failed" } };
  }
};
