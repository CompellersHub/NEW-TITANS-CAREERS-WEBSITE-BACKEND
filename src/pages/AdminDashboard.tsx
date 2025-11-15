import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  MessageCircle, 
  Bell,
  BarChart3,
  Settings,
  Users,
  FileText,
  TestTube,
  Target,
  TrendingUp,
  CreditCard,
  Zap,
  ShieldCheck,
  Package,
  AlertTriangle,
  Calendar,
  Brain,
  DollarSign,
  Send,
  PieChart,
  Award,
  Ticket,
  CheckCircle,
  Clock,
  Megaphone
} from "lucide-react";

const AdminDashboard = () => {
  const { isAdmin, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && user && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, authLoading, user, navigate, toast]);

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const sections = [
    {
      title: "Email Marketing & Campaigns",
      description: "Manage newsletters, campaigns, and email automation",
      icon: Mail,
      links: [
        { to: "/admin/campaigns", label: "Campaign Manager", icon: Send },
        { to: "/admin/templates", label: "Template Library", icon: FileText },
        { to: "/admin/segments", label: "Segment Manager", icon: Target },
        { to: "/admin/ab-tests", label: "A/B Tests", icon: TestTube },
        { to: "/admin/email-ab-tests", label: "Email A/B Tests", icon: TestTube },
        { to: "/admin/ab-test-results", label: "A/B Test Results", icon: BarChart3 },
        { to: "/admin/ab-test-history", label: "A/B Test Winner History", icon: Award },
        { to: "/admin/send-time-optimization", label: "Send Time Optimization", icon: Clock },
        { to: "/admin/lead-nurture", label: "Lead Nurture Manager", icon: TrendingUp },
        { to: "/admin/template-editor", label: "Template Editor", icon: FileText },
      ]
    },
    {
      title: "Analytics & Insights",
      description: "Track performance, engagement, and conversions",
      icon: BarChart3,
      links: [
        { to: "/admin/email-analytics", label: "Email Analytics Dashboard", icon: PieChart },
        { to: "/admin/engagement-analytics", label: "Engagement Analytics", icon: TrendingUp },
        { to: "/admin/email-engagement", label: "Email Engagement Dashboard", icon: MessageCircle },
        { to: "/admin/campaign-analytics", label: "Campaign Analytics", icon: Megaphone },
        { to: "/admin/recovery-analytics", label: "Recovery Analytics", icon: DollarSign },
        { to: "/admin/alert-analytics", label: "Alert Analytics", icon: AlertTriangle },
        { to: "/admin/form-analytics", label: "Form Analytics", icon: BarChart3 },
      ]
    },
    {
      title: "Customer Support & Forms",
      description: "Manage inquiries, submissions, and templates",
      icon: MessageCircle,
      links: [
        { to: "/admin/form-submissions", label: "Form Submissions", icon: FileText },
        { to: "/admin/response-templates", label: "Response Templates", icon: FileText },
        { to: "/admin/sla-alert-history", label: "SLA Alert History", icon: Clock },
      ]
    },
    {
      title: "Payment & Revenue",
      description: "Manage payments, vouchers, and transactions",
      icon: CreditCard,
      links: [
        { to: "/admin/payment-management", label: "Payment Management", icon: DollarSign },
        { to: "/admin/payment-analytics", label: "Payment Analytics", icon: PieChart },
        { to: "/admin/bank-transfers", label: "Bank Transfer Verification", icon: CheckCircle },
        { to: "/admin/vouchers", label: "Voucher Manager", icon: Ticket },
        { to: "/admin/vouchers/analytics", label: "Voucher Analytics", icon: BarChart3 },
        { to: "/admin/vouchers/export", label: "Voucher Export", icon: Package },
        { to: "/admin/vouchers/scheduled", label: "Scheduled Campaigns", icon: Calendar },
      ]
    },
    {
      title: "Automation & AI",
      description: "Predictive analytics, alerts, and smart automation",
      icon: Brain,
      links: [
        { to: "/admin/predictive-analytics", label: "Predictive Analytics", icon: Brain },
        { to: "/admin/prediction-accuracy", label: "Prediction Accuracy", icon: Target },
        { to: "/admin/recovery-alert-settings", label: "Recovery Alert Settings", icon: AlertTriangle },
        { to: "/form-alert-settings", label: "Form Alert Settings", icon: Bell },
      ]
    },
    {
      title: "Settings & Notifications",
      description: "Configure admin preferences and alerts",
      icon: Settings,
      links: [
        { to: "/admin/notification-settings", label: "Notification Settings", icon: Bell },
        { to: "/admin/campaign-approval", label: "Campaign Approval Queue", icon: CheckCircle },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Central hub for managing Titans Training Group's platform
          </p>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid gap-8">
          {sections.map((section) => (
            <Card key={section.title} className="border-border/50 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="border-b border-border/50 bg-muted/5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <section.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{section.title}</CardTitle>
                    <CardDescription className="text-base mt-1">{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {section.links.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="group flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-primary hover:bg-primary/5 transition-all hover:shadow-md"
                    >
                      <link.icon className="w-5 h-5 text-accent group-hover:text-primary transition-colors" />
                      <span className="font-medium text-sm group-hover:text-primary transition-colors">
                        {link.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Admin Pages</CardTitle>
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">30+</div>
              <p className="text-xs text-muted-foreground mt-1">Accessible features</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Quick Access</CardTitle>
                <Zap className="w-4 h-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">6</div>
              <p className="text-xs text-muted-foreground mt-1">Categories</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Automation</CardTitle>
                <Brain className="w-4 h-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500">AI</div>
              <p className="text-xs text-muted-foreground mt-1">Powered features</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Security</CardTitle>
                <ShieldCheck className="w-4 h-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">RLS</div>
              <p className="text-xs text-muted-foreground mt-1">Protected access</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
