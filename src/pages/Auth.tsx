import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { PageLayout } from "@/components/layouts/PageLayout";
import { z } from "zod";
import { passwordSchema } from "@/lib/formSchemas";
import { PasswordStrengthIndicator } from "@/components/forms/PasswordStrengthIndicator";
import { supabase } from "@/integrations/supabase/client";
import { MFAVerification } from "@/components/auth/MFAVerification";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: passwordSchema,
});

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, signUp, user, isAdmin, mfaRequired, mfaFactorId, completeMFAVerification } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect admins to dashboard, regular users to home
      navigate(isAdmin ? "/admin" : "/");
    }
  }, [user, isAdmin, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      authSchema.parse({ email, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return;
      }
    }

    setIsLoading(true);
    const { error, mfaRequired: needsMFA } = await signIn(email, password);
    
    if (needsMFA) {
      // MFA verification will be shown automatically
      setIsLoading(false);
      return;
    }
    
    if (!error) {
      // Check if user is admin after successful login
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
        
        setIsLoading(false);
        navigate(roles ? "/admin" : "/");
      } else {
        setIsLoading(false);
        navigate("/");
      }
    } else {
      setIsLoading(false);
    }
  };

  const handleMFAComplete = async () => {
    completeMFAVerification();
    
    // Check if user is admin after successful MFA
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      
      navigate(roles ? "/admin" : "/");
    } else {
      navigate("/");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      authSchema.parse({ email, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return;
      }
    }

    setIsLoading(true);
    const { error } = await signUp(email, password);
    setIsLoading(false);

    if (!error) {
      navigate("/");
    }
  };

  // Show MFA verification if required
  if (mfaRequired && mfaFactorId) {
    return (
      <PageLayout intensity3D="subtle" show3D={true}>
        <div className="flex flex-col">
          <div className="flex-1 flex items-center justify-center py-12 px-4">
            <MFAVerification 
              factorId={mfaFactorId}
              onVerificationComplete={handleMFAComplete}
              onCancel={() => {
                completeMFAVerification();
                setEmail("");
                setPassword("");
              }}
            />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout intensity3D="subtle" show3D={true}>
      <div className="flex flex-col">
        <div className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-tc-navy">Welcome Back</CardTitle>
            <CardDescription>Sign in to access your admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-tc-navy hover:bg-tc-blue" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <PasswordStrengthIndicator password={password} />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-tc-amber hover:bg-tc-gold text-tc-navy" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Sign Up
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Auth;
