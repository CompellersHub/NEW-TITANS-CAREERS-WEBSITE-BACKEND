import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  Mail, 
  MessageCircle, 
  Bell,
  BarChart3,
  Settings,
  FileText,
  TestTube,
  Target,
  TrendingUp,
  CreditCard,
  Zap,
  AlertTriangle,
  Calendar,
  Brain,
  DollarSign,
  Send,
  PieChart,
  Award,
  Ticket,
  CheckCircle,
  Megaphone,
  Shield,
  Activity,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  Package
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

  // Quick action cards for most used features
  const quickActions = [
    { to: "/admin/campaign-manager", label: "Create Campaign", icon: Mail, color: "text-blue-500" },
    { to: "/admin/content-manager", label: "Manage Content", icon: Package, color: "text-purple-500" },
    { to: "/admin/form-submissions", label: "View Submissions", icon: MessageCircle, color: "text-green-500" },
    { to: "/admin/payment-management", label: "Payments", icon: CreditCard, color: "text-orange-500" },
  ];

  const sections = [
    {
      title: "Content Management",
      description: "Manage website content, courses, blog posts, and pricing",
      icon: Package,
      color: "text-purple-500",
      links: [
        { to: "/admin/content-manager", label: "Content Manager Hub", icon: LayoutDashboard },
      ]
    },
    {
      title: "Email Marketing & Campaigns",
      description: "Manage newsletters, campaigns, and email automation",
      icon: Mail,
      color: "text-blue-500",
      links: [
        { to: "/admin/campaign-manager", label: "Campaign Manager", icon: Send },
        { to: "/admin/template-library", label: "Template Library", icon: FileText },
        { to: "/admin/segment-manager", label: "Segment Manager", icon: Target },
        { to: "/admin/scheduled-campaigns", label: "Scheduled Campaigns", icon: Calendar },
        { to: "/admin/lead-nurture-manager", label: "Lead Nurture Manager", icon: TrendingUp },
      ]
    },
    {
      title: "Analytics & Insights",
      description: "Track performance, engagement, and conversions",
      icon: BarChart3,
      color: "text-green-500",
      links: [
        { to: "/admin/email-analytics", label: "Email Analytics Dashboard", icon: PieChart },
        { to: "/admin/engagement-analytics", label: "Engagement Analytics", icon: TrendingUp },
        { to: "/admin/campaign-analytics", label: "Campaign Analytics", icon: Megaphone },
        { to: "/admin/form-analytics", label: "Form Analytics", icon: BarChart3 },
        { to: "/admin/predictive-analytics", label: "Predictive Analytics", icon: Brain },
      ]
    },
    {
      title: "Customer Support & Forms",
      description: "Manage inquiries, submissions, and templates",
      icon: MessageCircle,
      color: "text-cyan-500",
      links: [
        { to: "/admin/form-submissions", label: "Form Submissions", icon: FileText },
        { to: "/admin/templates", label: "Response Templates", icon: FileText },
        { to: "/admin/campaign-approval-queue", label: "Campaign Approvals", icon: CheckCircle },
      ]
    },
    {
      title: "Payment & Revenue",
      description: "Manage payments, vouchers, and transactions",
      icon: CreditCard,
      color: "text-orange-500",
      links: [
        { to: "/admin/payment-management", label: "Payment Management", icon: CreditCard },
        { to: "/admin/bank-transfer-verification", label: "Bank Transfer Verification", icon: DollarSign },
        { to: "/admin/payment-analytics", label: "Payment Analytics", icon: BarChart3 },
        { to: "/admin/voucher-manager", label: "Voucher Manager", icon: Ticket },
      ]
    },
    {
      title: "Testing & Optimization",
      description: "A/B testing and performance optimization",
      icon: TestTube,
      color: "text-pink-500",
      links: [
        { to: "/admin/ab-test-manager", label: "A/B Test Manager", icon: Zap },
        { to: "/admin/email-ab-test-dashboard", label: "Email A/B Tests", icon: Mail },
        { to: "/admin/ab-test-winner-history", label: "Winner History", icon: Award },
      ]
    },
    {
      title: "Settings & Security",
      description: "System configuration and access control",
      icon: Settings,
      color: "text-slate-500",
      links: [
        { to: "/admin/role-management", label: "Role Management", icon: Shield },
        { to: "/admin/notification-settings", label: "Notification Settings", icon: Bell },
        { to: "/admin/form-alert-settings", label: "Alert Settings", icon: AlertTriangle },
      ]
    }
  ];

  return (
    <AdminLayout
      title="Admin Dashboard"
      description="Central hub for managing Titans Training Group's platform"
    >
      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-kanit font-bold text-foreground mb-2">
              Welcome back, Admin 👋
            </h1>
            <p className="text-muted-foreground">
              Manage your platform, monitor performance, and optimize operations from one place.
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/admin/content-manager">
              <Sparkles className="w-4 h-4" />
              Quick Actions
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-kanit font-semibold mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} to={action.to}>
                <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className={`w-5 h-5 ${action.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{action.label}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Sections */}
      <div className="mb-8">
        <h2 className="text-lg font-kanit font-semibold mb-4">All Sections</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <Card key={index} className="border-border/50 hover:shadow-lg transition-all duration-200 hover:border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-muted">
                      <IconComponent className={`w-5 h-5 ${section.color}`} />
                    </div>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                  </div>
                  <CardDescription className="text-xs">{section.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    {section.links.map((link, linkIndex) => {
                      const LinkIcon = link.icon;
                      return (
                        <Link
                          key={linkIndex}
                          to={link.to}
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors text-sm group"
                        >
                          <LinkIcon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-foreground/70 group-hover:text-foreground transition-colors text-xs">
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
      </div>

      {/* Stats Overview */}
      <div className="mt-8">
        <h2 className="text-lg font-kanit font-semibold mb-4">System Overview</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Admin Sections</CardTitle>
                <LayoutDashboard className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{sections.length}</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Features</CardTitle>
                <Zap className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {sections.reduce((acc, section) => acc + section.links.length, 0)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Quick Actions</CardTitle>
                <Activity className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{quickActions.length}</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
                <Activity className="w-4 h-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-lg font-bold text-green-500">Operational</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
