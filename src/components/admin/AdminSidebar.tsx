import { 
  BarChart3, 
  Mail, 
  MessageSquare, 
  CreditCard, 
  Settings, 
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Zap,
  Gift,
  Bell,
  Target,
  Brain,
  Clock,
  AlertCircle,
  BookOpen,
  Share2,
  PieChart,
  DollarSign,
  Send,
  CheckCircle,
  History,
  Shield,
  HelpCircle
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

export const adminRoutes = [
  {
    category: "Help & Support",
    items: [
      { title: "FAQs", url: "/#faqs", icon: HelpCircle },
    ],
  },
  {
    category: "Email Marketing & Campaigns",
    items: [
      { title: "Campaign Manager", url: "/admin/campaign-manager", icon: Mail },
      { title: "Campaign Analytics", url: "/admin/campaign-analytics", icon: BarChart3 },
      { title: "Scheduled Campaigns", url: "/admin/scheduled-campaigns", icon: Calendar },
      { title: "Template Library", url: "/admin/template-library", icon: FileText },
      { title: "Template Editor", url: "/admin/template-editor", icon: FileText },
      { title: "Lead Nurture Manager", url: "/admin/lead-nurture-manager", icon: Target },
      { title: "Send Time Optimization", url: "/admin/send-time-optimization", icon: Clock },
    ],
  },
  {
    category: "Analytics & Insights",
    items: [
      { title: "Engagement Analytics", url: "/admin/engagement-analytics", icon: TrendingUp },
      { title: "Email Analytics", url: "/admin/email-analytics", icon: Mail },
      { title: "Email Engagement", url: "/admin/email-engagement", icon: PieChart },
      { title: "Form Analytics", url: "/admin/form-analytics", icon: BarChart3 },
      { title: "Form Submissions", url: "/admin/form-submission-analytics", icon: FileText },
      { title: "Recovery Analytics", url: "/admin/recovery-analytics", icon: TrendingUp },
      { title: "Alert Analytics", url: "/admin/alert-analytics", icon: AlertCircle },
      { title: "Predictive Analytics", url: "/admin/predictive-analytics", icon: Brain },
      { title: "Prediction Accuracy", url: "/admin/prediction-accuracy", icon: Target },
      { title: "A/B Test Dashboard", url: "/admin/ab-test-dashboard", icon: BarChart3 },
      { title: "Email A/B Testing", url: "/admin/email-ab-test-dashboard", icon: Mail },
      { title: "A/B Winner History", url: "/admin/ab-test-winner-history", icon: History },
    ],
  },
  {
    category: "Customer Support & Forms",
    items: [
      { title: "Form Submissions", url: "/admin/form-submissions", icon: MessageSquare },
      { title: "Course Inquiries", url: "/admin/course-inquiries", icon: MessageSquare },
      { title: "Response Templates", url: "/admin/templates", icon: FileText },
      { title: "Campaign Approvals", url: "/admin/campaign-approval-queue", icon: CheckCircle },
      { title: "SLA Alert History", url: "/admin/sla-alert-history", icon: AlertCircle },
    ],
  },
  {
    category: "Payment & Revenue",
    items: [
      { title: "Payment Management", url: "/admin/payment-management", icon: CreditCard },
      { title: "Bank Transfer Verification", url: "/admin/bank-transfer-verification", icon: DollarSign },
      { title: "Payment Analytics", url: "/admin/payment-analytics", icon: BarChart3 },
      { title: "Voucher Manager", url: "/admin/voucher-manager", icon: Gift },
      { title: "Voucher Analytics", url: "/admin/voucher-analytics", icon: TrendingUp },
      { title: "Voucher Export", url: "/admin/voucher-export", icon: FileText },
    ],
  },
  {
    category: "Automation & AI",
    items: [
      { title: "A/B Test Manager", url: "/admin/ab-test-manager", icon: Zap },
      { title: "Segment Manager", url: "/admin/segment-manager", icon: Users },
    ],
  },
  {
    category: "Events & Cohorts",
    items: [
      { title: "Event Management", url: "/admin/event-management", icon: Calendar },
      { title: "Automation Settings", url: "/admin/automation-settings", icon: Settings },
    ],
  },
    {
      category: "Settings & Notifications",
      items: [
        { title: "Notification Settings", url: "/admin/notification-settings", icon: Bell },
        { title: "Form Alert Settings", url: "/admin/form-alert-settings", icon: AlertCircle },
        { title: "Recovery Alert Settings", url: "/admin/recovery-alert-settings", icon: AlertCircle },
        { title: "Role Management", url: "/admin/role-management", icon: Shield },
        { title: "Content Manager", url: "/admin/content-manager", icon: FileText },
      ],
    },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className={isCollapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar">
        {adminRoutes.map((section) => {
          return (
            <SidebarGroup key={section.category}>
              <SidebarGroupLabel className={isCollapsed ? "sr-only" : "text-white/70 font-semibold"}>
                {section.category}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          className="hover:bg-sidebar-accent text-white w-full flex items-center" 
                          activeClassName="bg-sidebar-accent text-white font-semibold"
                        >
                          <item.icon className={isCollapsed ? "h-5 w-5" : "mr-3 h-5 w-5"} />
                          {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
