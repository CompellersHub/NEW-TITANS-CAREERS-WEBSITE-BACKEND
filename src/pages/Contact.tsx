import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MessageCircle, MapPin, Clock, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const contactFormSchema = z.object({
  name: z.string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z.string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  phone: z.string()
    .trim()
    .min(10, { message: "Please enter a valid phone number" })
    .max(20, { message: "Phone number must be less than 20 characters" })
    .optional()
    .or(z.literal("")),
  subject: z.string()
    .trim()
    .min(3, { message: "Subject must be at least 3 characters" })
    .max(200, { message: "Subject must be less than 200 characters" }),
  message: z.string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(1000, { message: "Message must be less than 1000 characters" })
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema)
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Sanitize and encode data for WhatsApp
      const message = encodeURIComponent(
        `*New Contact Form Submission*\n\n` +
        `*Name:* ${data.name}\n` +
        `*Email:* ${data.email}\n` +
        `*Phone:* ${data.phone || 'Not provided'}\n` +
        `*Subject:* ${data.subject}\n\n` +
        `*Message:*\n${data.message}`
      );
      
      // Open WhatsApp with the message
      window.open(`https://wa.me/447539434403?text=${message}`, '_blank');
      
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
      
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again or contact us directly.",
        variant: "destructive"
      });
    }
  };

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: "+44 7539 434403",
      description: "Fastest response time",
      action: "Message Us",
      link: "https://wa.me/447539434403"
    },
    {
      icon: Mail,
      title: "Email",
      value: "info@titanscareers.com",
      description: "We respond within 24 hours",
      action: "Send Email",
      link: "mailto:info@titanscareers.com"
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+44 7539 434403",
      description: "Mon-Fri, 9am-6pm GMT",
      action: "Call Now",
      link: "tel:+447539434403"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 md:py-28">
        <div className="container max-w-7xl">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge className="bg-accent/20 text-accent border-accent/30">
              <MessageCircle className="w-3 h-3 mr-2" />
              GET IN TOUCH
            </Badge>
            
            <h1 className="font-kanit text-4xl md:text-6xl font-bold">
              Let's Talk About <span className="text-accent">Your Future</span>
            </h1>
            
            <p className="font-sans text-xl text-primary-foreground/80 leading-relaxed">
              Questions about our courses? Want to discuss your career goals? 
              We're here to help you make the right decision.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-secondary/30">
        <div className="container max-w-7xl">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <Card key={index} className="border-2 hover:border-accent/50 transition-all hover:shadow-xl">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                    <method.icon className="w-8 h-8 text-accent" />
                  </div>
                  
                  <div>
                    <h3 className="font-kanit text-xl font-bold text-primary mb-2">{method.title}</h3>
                    <p className="font-sans text-lg font-semibold text-foreground mb-1">{method.value}</p>
                    <p className="font-sans text-sm text-muted-foreground">{method.description}</p>
                  </div>
                  
                  <a href={method.link} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
                      {method.action}
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-background">
        <div className="container max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="mb-8">
                <Badge className="bg-accent/10 text-primary border-accent/30 mb-4">
                  <Send className="w-3 h-3 mr-2" />
                  SEND A MESSAGE
                </Badge>
                
                <h2 className="font-kanit text-3xl md:text-4xl font-bold text-primary mb-4">
                  Drop Us a Line
                </h2>
                
                <p className="font-sans text-lg text-muted-foreground">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-sans text-foreground font-semibold">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="John Smith"
                    className="border-2 focus:border-accent"
                  />
                  {errors.name && (
                    <p className="font-sans text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-sans text-foreground font-semibold">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="john@example.com"
                    className="border-2 focus:border-accent"
                  />
                  {errors.email && (
                    <p className="font-sans text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-sans text-foreground font-semibold">
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    placeholder="+44 7XXX XXXXXX"
                    className="border-2 focus:border-accent"
                  />
                  {errors.phone && (
                    <p className="font-sans text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="font-sans text-foreground font-semibold">
                    Subject *
                  </Label>
                  <Input
                    id="subject"
                    {...register("subject")}
                    placeholder="Course enquiry, career advice, etc."
                    className="border-2 focus:border-accent"
                  />
                  {errors.subject && (
                    <p className="font-sans text-sm text-destructive">{errors.subject.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="font-sans text-foreground font-semibold">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    {...register("message")}
                    placeholder="Tell us about your career goals and how we can help..."
                    rows={6}
                    className="border-2 focus:border-accent resize-none"
                  />
                  {errors.message && (
                    <p className="font-sans text-sm text-destructive">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>

                <p className="font-sans text-sm text-muted-foreground text-center">
                  By submitting this form, you agree to our privacy policy and terms of service.
                </p>
              </form>
            </div>

            {/* Office Info & Hours */}
            <div className="space-y-6">
              <Card className="border-2">
                <CardHeader className="bg-primary text-primary-foreground rounded-t-xl">
                  <CardTitle className="font-kanit flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent" />
                    Office Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-kanit font-bold text-primary mb-2">Titans Careers UK</h3>
                    <p className="font-sans text-muted-foreground leading-relaxed">
                      London, United Kingdom<br />
                      (Remote-first training with UK support)
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-accent mt-1" />
                      <div>
                        <h4 className="font-kanit font-bold text-primary mb-2">Operating Hours</h4>
                        <div className="space-y-1 font-sans text-muted-foreground">
                          <p><span className="font-semibold">Monday - Friday:</span> 9:00 AM - 6:00 PM GMT</p>
                          <p><span className="font-semibold">Saturday:</span> 10:00 AM - 4:00 PM GMT</p>
                          <p><span className="font-semibold">Sunday:</span> Closed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary text-primary-foreground border-2 border-primary">
                <CardContent className="p-8 space-y-4">
                  <h3 className="font-kanit text-2xl font-bold">
                    Prefer to Talk? <span className="text-accent">Let's Chat!</span>
                  </h3>
                  
                  <p className="font-sans text-primary-foreground/80 leading-relaxed">
                    WhatsApp is our fastest way to connect. Send us a message and we'll 
                    respond within minutes during business hours.
                  </p>
                  
                  <a 
                    href="https://wa.me/447539434403" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button 
                      size="lg" 
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Chat on WhatsApp
                    </Button>
                  </a>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-gold/10 border-2 border-accent/30">
                <CardContent className="p-6 space-y-3">
                  <h4 className="font-kanit font-bold text-primary text-lg">Quick Response Guarantee</h4>
                  <ul className="space-y-2 font-sans text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">✓</span>
                      <span>WhatsApp messages: Within 1 hour (business hours)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">✓</span>
                      <span>Email enquiries: Within 24 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">✓</span>
                      <span>Phone calls: Answered during operating hours</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-20 bg-secondary/30">
        <div className="container max-w-4xl text-center space-y-8">
          <div>
            <h2 className="font-kanit text-3xl md:text-4xl font-bold text-primary mb-4">
              Have Questions Before Reaching Out?
            </h2>
            <p className="font-sans text-lg text-muted-foreground">
              Check our FAQ section for instant answers to common questions.
            </p>
          </div>
          
          <a href="/#faqs">
            <Button size="lg" variant="outline" className="border-primary text-primary font-bold">
              View FAQs
            </Button>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
