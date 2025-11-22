import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layouts/PageLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ProfileSkeleton } from "@/components/skeletons/ProfileSkeleton";
import { DataFetchError } from "@/components/error/DataFetchError";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { 
  ExternalLink, 
  ShoppingBag, 
  Activity,
  Bell,
  LogOut,
  Settings,
  GraduationCap
} from "lucide-react";
import { OrderHistoryTable } from "@/components/profile/OrderHistoryTable";
import { ActivityLogViewer } from "@/components/profile/ActivityLogViewer";
import { AccountPreferences } from "@/components/profile/AccountPreferences";
import { MFAManagement } from "@/components/profile/MFAManagement";
import { createSecureAcademySSOLink } from "@/lib/academy-integration";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
}

interface OrderSummary {
  total_courses: number;
  pending_payments: number;
  last_lms_access: string | null;
}

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    total_courses: 0,
    pending_payments: 0,
    last_lms_access: null
  });
  const [accessingLMS, setAccessingLMS] = useState(false);

  useEffect(() => {
    checkUserAndLoadData();
  }, []);

  const checkUserAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      await loadProfileData(user.id, user.email!);
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Failed to load profile data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadProfileData = async (userId: string, email: string) => {
    // Load profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      throw profileError;
    }

    if (!profileData) {
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({ id: userId, full_name: email.split("@")[0] })
        .select()
        .single();

      if (createError) throw createError;
      setProfile(newProfile);
    } else {
      setProfile(profileData);
    }

    // Load order summary
    const { data: orders } = await supabase
      .from("user_order_history")
      .select("*")
      .eq("customer_email", email);

    if (orders) {
      const totalCourses = orders.filter(o => o.display_status === 'completed').length;
      const pendingPayments = orders.filter(o => 
        ['pending', 'pending_proof', 'under_review'].includes(o.display_status)
      ).length;

      setOrderSummary({
        total_courses: totalCourses,
        pending_payments: pendingPayments,
        last_lms_access: null
      });
    }

    // Load last LMS access from activity log
    const { data: lastAccess } = await supabase
      .from("user_activity_log")
      .select("created_at")
      .eq("user_id", userId)
      .eq("activity_type", "lms_access")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (lastAccess) {
      setOrderSummary(prev => ({
        ...prev,
        last_lms_access: lastAccess.created_at
      }));
    }
  };

  const handleAccessLMS = async () => {
    setAccessingLMS(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("No user found");

      const ssoLink = await createSecureAcademySSOLink(user.id, user.email);
      
      toast.success("Redirecting to Learning Platform...");
      window.open(ssoLink, "_blank");
    } catch (error) {
      console.error("Error accessing LMS:", error);
      toast.error("Failed to access learning platform. Please try again.");
    } finally {
      setAccessingLMS(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    checkUserAndLoadData();
  };

  if (loading) return <ProfileSkeleton />;
  if (error) return <DataFetchError error={error} onRetry={handleRetry} />;

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  return (
    <ErrorBoundary>
      <PageLayout intensity3D="subtle" show3D={true}>
        <SEO 
          title="My Account"
          description="Manage your account, view orders, and access your courses"
        />
        <div className="bg-gradient-to-b from-background to-secondary/20 flex flex-col">
        
        <div className="flex-1 py-12 px-4">
          <div className="container max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Welcome back, {profile?.full_name || 'Student'}</h1>
              <p className="text-muted-foreground">Manage your account and access your learning platform</p>
            </div>

            {/* Hero LMS Access Card */}
            <Card className="mb-8 bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <GraduationCap className="w-6 h-6" />
                  Ready to Learn?
                </CardTitle>
                <CardDescription className="text-primary-foreground/90">
                  Access all your courses on our learning platform with one click
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={handleAccessLMS}
                  disabled={accessingLMS}
                  className="w-full sm:w-auto font-bold"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  {accessingLMS ? "Connecting..." : "Access Learning Platform"}
                </Button>
                <p className="text-sm mt-3 text-primary-foreground/80">
                  Single sign-on enabled - no need to log in again
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{orderSummary.total_courses}</div>
                  <p className="text-sm text-muted-foreground mt-1">Enrolled & Active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{orderSummary.pending_payments}</div>
                  <p className="text-sm text-muted-foreground mt-1">Awaiting Completion</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Last LMS Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatDate(orderSummary.last_lms_access)}</div>
                  <p className="text-sm text-muted-foreground mt-1">Learning Activity</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">Orders</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Activity</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Preferences</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders">
                <OrderHistoryTable />
              </TabsContent>

              <TabsContent value="activity">
                <ActivityLogViewer />
              </TabsContent>

              <TabsContent value="preferences">
                <AccountPreferences />
              </TabsContent>

              <TabsContent value="settings">
                <div className="space-y-6">
                  <MFAManagement />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>Your personal account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Full Name</label>
                          <p className="text-lg mt-1">{profile?.full_name || "Not set"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Phone</label>
                          <p className="text-lg mt-1">{profile?.phone || "Not set"}</p>
                        </div>
                      </div>

                      <div className="pt-6 border-t">
                        <Button
                          variant="destructive"
                          onClick={handleSignOut}
                          className="w-full sm:w-auto"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        </div>
      </PageLayout>
    </ErrorBoundary>
  );
}
