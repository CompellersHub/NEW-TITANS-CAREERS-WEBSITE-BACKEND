import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/AdminLayout";
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

  const sections = [
    {
      title: "Email Marketing & Campaigns",
      description: "Manage newsletters, campaigns, and email automation",
      icon: Mail,
      links: [
        { to: "/admin/campaign-manager", label: "Campaign Manager", icon: Send },
        { to: "/admin/template-library", label: "Template Library", icon: FileText },
        { to: "/admin/segment-manager", label: "Segment Manager", icon: Target },
        { to: "/admin/ab-test-manager", label: "A/B Test Manager", icon: TestTube },
        { to: "/admin/email-ab-test-dashboard", label: "Email A/B Tests", icon: TestTube },
        { to: "/admin/ab-test-dashboard", label: "A/B Test Results", icon: BarChart3 },
        { to: "/admin/ab-test-winner-history", label: "A/B Test Winner History", icon: Award },
        { to: "/admin/send-time-optimization", label: "Send Time Optimization", icon: Clock },
        { to: "/admin/lead-nurture-manager", label: "Lead Nurture Manager", icon: TrendingUp },
        { to: "/admin/template-editor", label: "Template Editor", icon: FileText },
        { to: "/admin/scheduled-campaigns", label: "Scheduled Campaigns", icon: Calendar },
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
        { to: "/admin/form-submission-analytics", label: "Form Submission Analytics", icon: FileText },
        { to: "/admin/predictive-analytics", label: "Predictive Analytics", icon: Brain },
        { to: "/admin/prediction-accuracy", label: "Prediction Accuracy", icon: Target },
      ]
    },
    {
      title: "Customer Support & Forms",
      description: "Manage inquiries, submissions, and templates",
      icon: MessageCircle,
      links: [
        { to: "/admin/form-submissions", label: "Form Submissions", icon: FileText },
        { to: "/admin/templates", label: "Response Templates", icon: FileText },
        { to: "/admin/sla-alert-history", label: "SLA Alert History", icon: Clock },
        { to: "/admin/campaign-approval-queue", label: "Campaign Approval Queue", icon: CheckCircle },
      ]
    },
    {
      title: "Payment & Revenue",
      description: "Manage payments, vouchers, and transactions",
      icon: CreditCard,
      links: [
        { to: "/admin/payment-management", label: "Payment Management", icon: CreditCard },
        { to: "/admin/bank-transfer-verification", label: "Bank Transfer Verification", icon: DollarSign },
        { to: "/admin/payment-analytics", label: "Payment Analytics", icon: BarChart3 },
        { to: "/admin/voucher-manager", label: "Voucher Manager", icon: Ticket },
        { to: "/admin/voucher-analytics", label: "Voucher Analytics", icon: TrendingUp },
        { to: "/admin/voucher-export", label: "Voucher Export", icon: FileText },
      ]
    },
    {
      title: "Automation & AI",
      description: "Intelligent campaign optimization",
      icon: Brain,
      links: [
        { to: "/admin/ab-test-manager", label: "A/B Test Manager", icon: Zap },
        { to: "/admin/segment-manager", label: "Segment Manager", icon: Users },
      ]
    },
    {
      title: "Settings & Notifications",
      description: "Configure alerts and preferences",
      icon: Settings,
      links: [
        { to: "/admin/notification-settings", label: "Notification Settings", icon: Bell },
        { to: "/admin/form-alert-settings", label: "Form Alert Settings", icon: AlertTriangle },
        { to: "/admin/recovery-alert-settings", label: "Recovery Alert Settings", icon: AlertTriangle },
      ]
    }
  ];

  return (
    <AdminLayout
      title="Admin Dashboard"
      description="Central hub for managing Titans Training Group's platform"
    >
      {/* Admin Sections Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {sections.map((section, index) => {
          const IconComponent = section.icon;
          return (
            <Card key={index} className="border-border/50 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <IconComponent className="w-5 h-5 text-primary" />
                      {section.title}
                    </CardTitle>
                    <CardDescription className="mt-2">{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.links.map((link, linkIndex) => {
                    const LinkIcon = link.icon;
                    return (
                      <Link
                        key={linkIndex}
                        to={link.to}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors text-sm group"
                      >
                        <LinkIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-foreground/80 group-hover:text-foreground transition-colors">
                          {link.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
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
    </AdminLayout>
  );
};

export default AdminDashboard;
