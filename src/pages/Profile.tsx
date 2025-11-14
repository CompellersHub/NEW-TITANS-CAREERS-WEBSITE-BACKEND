import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, User, GraduationCap, Settings, Save, Award, BookOpen, Trophy } from "lucide-react";
import { SEO } from "@/components/SEO";
import { CertificateView } from "@/components/course/CertificateView";
import { NotificationPreferences } from "@/components/notifications/NotificationPreferences";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { DataFetchError } from "@/components/error/DataFetchError";
import { ProfileSkeleton } from "@/components/skeletons/ProfileSkeleton";
import { EmptyState } from "@/components/error/EmptyState";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface Enrollment {
  id: string;
  course_slug: string;
  course_title: string;
  price: number;
  created_at: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    loadProfileData();
    
    // Handle URL parameters from email links
    const params = new URLSearchParams(window.location.search);
    const action = params.get("action");
    
    if (action === "unsubscribe_digest") {
      toast.success("You've been unsubscribed from digest emails", {
        description: "You'll still receive instant notifications for important activity.",
      });
    } else if (action === "unsubscribe_all") {
      toast.success("You've been unsubscribed from all email notifications", {
        description: "You can re-enable notifications anytime from this page.",
      });
    } else if (action === "preferences") {
      toast.info("Manage your notification preferences below");
    }
  }, [user, navigate]);

  const loadProfileData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError;
      }

      // Create profile if it doesn't exist
      if (!profileData) {
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([{ id: user.id, full_name: user.email }])
          .select()
          .single();
        
        if (insertError) throw insertError;
        setProfile(newProfile);
        setFullName(newProfile.full_name || "");
        setPhone(newProfile.phone || "");
      } else {
        setProfile(profileData);
        setFullName(profileData.full_name || "");
        setPhone(profileData.phone || "");
      }

      // Load enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select("*")
        .eq("customer_email", user.email)
        .order("created_at", { ascending: false });

      if (enrollmentsError) throw enrollmentsError;
      setEnrollments(enrollmentsData || []);

      // Load certificates
      const { data: certificatesData, error: certificatesError } = await supabase
        .from("course_certificates")
        .select("*")
        .eq("user_id", user.id)
        .order("completion_date", { ascending: false });

      if (certificatesError) throw certificatesError;
      setCertificates(certificatesData || []);
    } catch (error: any) {
      console.error("Error loading profile:", error);
      setError(error);
      if (!retrying) {
        toast.error("Error loading profile", {
          description: error.message,
        });
      }
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    await loadProfileData();
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      setProfile({ ...profile, full_name: fullName, phone: phone });
    } catch (error: any) {
      toast.error("Error updating profile", {
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error && !loading) {
    return (
      <ErrorBoundary onReset={handleRetry}>
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <DataFetchError
              title="Failed to Load Profile"
              description="We couldn't load your profile data. This might be a temporary connection issue."
              error={error}
              onRetry={handleRetry}
              retrying={retrying}
            />
          </div>
          <Footer />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary onReset={loadProfileData}>
      <>
        <SEO
        title="My Profile"
        description="Manage your profile, view purchased courses, and update account settings"
      />
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col animate-fade-in">
        <Navbar />
        
        <div className="flex-1 py-12 px-4">
          <div className="container max-w-4xl mx-auto">
            <div className="mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <h1 className="text-4xl font-bold text-foreground mb-2">My Profile</h1>
              <p className="text-muted-foreground">Manage your account and view your courses</p>
            </div>

            <Tabs defaultValue="profile" className="w-full animate-fade-in" style={{ animationDelay: '200ms' }}>
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="courses" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  My Courses
                </TabsTrigger>
                <TabsTrigger value="certificates" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Certificates
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={saving}
                      className="w-full sm:w-auto"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="courses">
                <Card>
                  <CardHeader>
                    <CardTitle>My Courses</CardTitle>
                    <CardDescription>
                      Courses you've purchased ({enrollments.length})
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {enrollments.length === 0 ? (
                      <EmptyState
                        icon={BookOpen}
                        title="No Courses Yet"
                        description="You haven't enrolled in any courses. Browse our catalog to start learning new skills today."
                        action={{
                          label: "Browse Courses",
                          onClick: () => navigate("/courses"),
                          variant: "default"
                        }}
                      />
                    ) : (
                      <div className="space-y-4">
                        {enrollments.map((enrollment) => (
                          <div key={enrollment.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">{enrollment.course_title}</h3>
                              <span className="text-sm text-muted-foreground">
                                £{enrollment.price}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              Purchased: {new Date(enrollment.created_at).toLocaleDateString()}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/courses/${enrollment.course_slug}`)}
                            >
                              View Course
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="certificates">
                <Card>
                  <CardHeader>
                    <CardTitle>My Certificates</CardTitle>
                    <CardDescription>
                      Certificates earned from completed courses ({certificates.length})
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {certificates.length === 0 ? (
                      <EmptyState
                        icon={Trophy}
                        title="No Certificates Yet"
                        description="Complete courses to earn certificates and showcase your achievements."
                        action={{
                          label: "View My Courses",
                          onClick: () => {
                            const coursesTab = document.querySelector('[value="courses"]') as HTMLElement;
                            coursesTab?.click();
                          },
                          variant: "default"
                        }}
                      >
                        <div className="text-sm text-muted-foreground space-y-2 text-left">
                          <p className="font-semibold">Earn certificates by:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Completing all course modules</li>
                            <li>Passing final assessments</li>
                            <li>Meeting course requirements</li>
                          </ul>
                        </div>
                      </EmptyState>
                    ) : (
                      <div className="space-y-6">
                        {certificates.map((cert) => (
                          <CertificateView key={cert.id} certificate={cert} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <NotificationPreferences />
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Account Status</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Your account is active and in good standing
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold mb-2 text-destructive">Danger Zone</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Sign out of your account
                      </p>
                      <Button variant="destructive" onClick={handleSignOut}>
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Footer />
      </div>
    </>
    </ErrorBoundary>
  );
};

export default Profile;
