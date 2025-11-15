import { useEffect, ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdminSidebar } from "./AdminSidebar";
import { AdminCommandPalette } from "./AdminCommandPalette";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Home, Search } from "lucide-react";

interface AdminLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

// Route name mapping for breadcrumbs
const routeNames: Record<string, string> = {
  '/admin': 'Admin Dashboard',
  '/admin/campaign-manager': 'Campaign Manager',
  '/admin/campaign-analytics': 'Campaign Analytics',
  '/admin/scheduled-campaigns': 'Scheduled Campaigns',
  '/admin/template-library': 'Template Library',
  '/admin/template-editor': 'Template Editor',
  '/admin/lead-nurture-manager': 'Lead Nurture Manager',
  '/admin/send-time-optimization': 'Send Time Optimization',
  '/admin/engagement-analytics': 'Engagement Analytics',
  '/admin/email-analytics': 'Email Analytics',
  '/admin/email-engagement': 'Email Engagement Dashboard',
  '/admin/form-analytics': 'Form Analytics',
  '/admin/form-submission-analytics': 'Form Submission Analytics',
  '/admin/recovery-analytics': 'Recovery Analytics',
  '/admin/alert-analytics': 'Alert Analytics',
  '/admin/predictive-analytics': 'Predictive Analytics',
  '/admin/prediction-accuracy': 'Prediction Accuracy',
  '/admin/ab-test-dashboard': 'A/B Test Dashboard',
  '/admin/email-ab-test-dashboard': 'Email A/B Test Dashboard',
  '/admin/ab-test-winner-history': 'A/B Test Winner History',
  '/admin/form-submissions': 'Form Submissions',
  '/admin/templates': 'Response Templates',
  '/admin/campaign-approval-queue': 'Campaign Approval Queue',
  '/admin/sla-alert-history': 'SLA Alert History',
  '/admin/payment-management': 'Payment Management',
  '/admin/bank-transfer-verification': 'Bank Transfer Verification',
  '/admin/payment-analytics': 'Payment Analytics',
  '/admin/voucher-manager': 'Voucher Manager',
  '/admin/voucher-analytics': 'Voucher Analytics',
  '/admin/voucher-export': 'Voucher Export',
  '/admin/ab-test-manager': 'A/B Test Manager',
  '/admin/segment-manager': 'Segment Manager',
  '/admin/notification-settings': 'Notification Settings',
  '/admin/form-alert-settings': 'Form Alert Settings',
  '/admin/recovery-alert-settings': 'Recovery Alert Settings',
};

export function AdminLayout({ title, description, children }: AdminLayoutProps) {
  const { isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const currentRouteName = routeNames[location.pathname] || title;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <AdminCommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
      
      <SidebarProvider defaultOpen>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />
          
          <main className="flex-1 flex flex-col">
            {/* Header with Breadcrumb and Toggle */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
              <div className="flex h-14 items-center gap-4 px-6">
                <SidebarTrigger className="-ml-1" />
                
                <Breadcrumb className="flex-1">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/admin" className="flex items-center gap-1">
                        <Home className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only">Admin Dashboard</span>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {location.pathname !== '/admin' && (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage>{currentRouteName}</BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    )}
                  </BreadcrumbList>
                </Breadcrumb>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCommandPaletteOpen(true)}
                  className="gap-2"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Search</span>
                  <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
              </div>
            </div>

            {/* Page Content */}
            <div className="flex-1 space-y-4 p-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                {description && (
                  <p className="text-muted-foreground">{description}</p>
                )}
              </div>
              
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>

      <Footer />
    </div>
  );
}
