import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
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

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:slug" element={<CourseDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/resources" element={<Resources />} />
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
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
