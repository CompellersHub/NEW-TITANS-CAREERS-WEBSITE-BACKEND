import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { trackPageView } from "./lib/analytics";
import { TimedCallToAction } from "./components/TimedCallToAction";
import { Academic3DBackground } from "./components/background/Academic3DBackground";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Testimonials from "./pages/Testimonials";
import ThankYou from "./pages/ThankYou";
import Resources from "./pages/Resources";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import CampaignManager from "./pages/CampaignManager";
import ABTestManager from "./pages/ABTestManager";
import SendTimeOptimization from "./pages/SendTimeOptimization";
import EmailAnalyticsDashboard from "./pages/EmailAnalyticsDashboard";
import TemplateLibrary from "./pages/TemplateLibrary";
import SegmentManager from "./pages/SegmentManager";
import EmailABTestDashboard from "./pages/EmailABTestDashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import TermsConditions from "./pages/TermsConditions";
import NotFound from "./pages/NotFound";
import FormDemo from "./pages/FormDemo";
import Profile from "./pages/Profile";
import FormAnalytics from "./pages/FormAnalytics";
import FormAlertSettings from "./pages/FormAlertSettings";
import ABTestDashboard from "./pages/ABTestDashboard";
import EngagementAnalytics from "./pages/EngagementAnalytics";
import LeadNurtureManager from "./pages/LeadNurtureManager";
import TemplateEditor from "./pages/TemplateEditor";
import ABTestWinnerHistory from "./pages/ABTestWinnerHistory";
import FormSubmissionsAdmin from "./pages/FormSubmissionsAdmin";
import FormSubmissionAnalytics from "./pages/FormSubmissionAnalytics";
import SLAAlertHistory from "./pages/SLAAlertHistory";
import AdminNotificationSettings from "./pages/AdminNotificationSettings";
import AdminTemplates from "./pages/AdminTemplates";
import VoucherManager from "./pages/VoucherManager";
import VoucherAnalytics from "./pages/VoucherAnalytics";
import VoucherExport from "./pages/VoucherExport";
import ScheduledCampaigns from "./pages/ScheduledCampaigns";
import PaymentStatus from "./pages/PaymentStatus";
import CampaignApprovalQueue from "./pages/CampaignApprovalQueue";
import CampaignAnalytics from "./pages/CampaignAnalytics";
import RecoveryAnalytics from "./pages/RecoveryAnalytics";
import RecoveryAlertSettings from "./pages/RecoveryAlertSettings";
import AlertAnalytics from "./pages/AlertAnalytics";
import PredictiveAnalytics from "./pages/PredictiveAnalytics";
import PredictionAccuracy from "./pages/PredictionAccuracy";
import EmailEngagementDashboard from "./pages/EmailEngagementDashboard";
import BankTransferVerification from "./pages/admin/BankTransferVerification";
import PaymentAnalytics from "./pages/admin/PaymentAnalytics";
import PaymentManagement from "./pages/admin/PaymentManagement";
import CourseInquiries from "./pages/admin/CourseInquiries";
import PayL8rInfo from "./pages/PayL8rInfo";
import RoleManagement from "./pages/RoleManagement";
import ContentManager from "./pages/admin/ContentManager";
import Events from "./pages/Events";
import EventManagement from "./pages/admin/EventManagement";
import AutomationSettings from "./pages/admin/AutomationSettings";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
  // Track page views on route change
  useEffect(() => {
    const title = document.title || 'Titans Training Group';
    trackPageView(location.pathname, title);
  }, [location]);

  // Handle hash scrolling
  useEffect(() => {
    if (location.hash) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // Scroll to top if no hash
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:slug" element={<CourseDetail />} />
        <Route path="/payment-status" element={<PaymentStatus />} />
        <Route path="/payl8r-info" element={<PayL8rInfo />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/events" element={<Events />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/campaigns" element={<CampaignManager />} />
        <Route path="/admin/ab-tests" element={<ABTestManager />} />
        <Route path="/admin/send-time-optimization" element={<SendTimeOptimization />} />
        <Route path="/admin/email-analytics" element={<EmailAnalyticsDashboard />} />
        <Route path="/admin/templates" element={<TemplateLibrary />} />
        <Route path="/admin/segments" element={<SegmentManager />} />
        <Route path="/admin/email-ab-tests" element={<EmailABTestDashboard />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/form-demo" element={<FormDemo />} />
        <Route path="/form-analytics" element={<FormAnalytics />} />
        <Route path="/form-alert-settings" element={<FormAlertSettings />} />
        <Route path="/admin/engagement-analytics" element={<EngagementAnalytics />} />
        <Route path="/admin/ab-test-results" element={<ABTestDashboard />} />
        <Route path="/admin/ab-test-history" element={<ABTestWinnerHistory />} />
        <Route path="/admin/lead-nurture" element={<LeadNurtureManager />} />
        <Route path="/admin/template-editor" element={<TemplateEditor />} />
            <Route path="/admin/form-submissions" element={<FormSubmissionsAdmin />} />
            <Route path="/admin/form-analytics" element={<FormSubmissionAnalytics />} />
            <Route path="/admin/sla-alert-history" element={<SLAAlertHistory />} />
              <Route path="/admin/notification-settings" element={<AdminNotificationSettings />} />
              <Route path="/admin/response-templates" element={<AdminTemplates />} />
              <Route path="/admin/vouchers" element={<VoucherManager />} />
          <Route path="/admin/vouchers/analytics" element={<VoucherAnalytics />} />
          <Route path="/admin/vouchers/export" element={<VoucherExport />} />
          <Route path="/admin/vouchers/scheduled" element={<ScheduledCampaigns />} />
          <Route path="/admin/scheduled-campaigns" element={<ScheduledCampaigns />} />
          <Route path="/admin/vouchers/campaign-analytics" element={<CampaignAnalytics />} />
          <Route path="/admin/campaign-analytics" element={<CampaignAnalytics />} />
          <Route path="/admin/campaign-approval" element={<CampaignApprovalQueue />} />
          <Route path="/admin/role-management" element={<RoleManagement />} />
          <Route path="/admin/content-manager" element={<ContentManager />} />
          <Route path="/admin/recovery-analytics" element={<RecoveryAnalytics />} />
          <Route path="/admin/recovery-alert-settings" element={<RecoveryAlertSettings />} />
          <Route path="/admin/alert-analytics" element={<AlertAnalytics />} />
          <Route path="/admin/predictive-analytics" element={<PredictiveAnalytics />} />
          <Route path="/admin/prediction-accuracy" element={<PredictionAccuracy />} />
          <Route path="/admin/email-engagement" element={<EmailEngagementDashboard />} />
          <Route path="/admin/bank-transfers" element={<BankTransferVerification />} />
          <Route path="/admin/payment-analytics" element={<PaymentAnalytics />} />
          <Route path="/admin/payment-management" element={<PaymentManagement />} />
          <Route path="/admin/event-management" element={<EventManagement />} />
          <Route path="/admin/automation-settings" element={<AutomationSettings />} />
          <Route path="/admin/course-inquiries" element={<CourseInquiries />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/payment-status" element={<PaymentStatus />} />
          <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* 3D Academic Background Layer */}
          <Academic3DBackground intensity="subtle" />
          
          {/* Content Layer */}
          <div className="relative z-10">
            <TimedCallToAction />
            <AnimatedRoutes />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
