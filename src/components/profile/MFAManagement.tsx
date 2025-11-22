import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { MFAEnrollment } from "@/components/auth/MFAEnrollment";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const MFAManagement = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [mfaFactors, setMfaFactors] = useState<any[]>([]);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMFAFactors();
  }, []);

  const loadMFAFactors = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) throw error;
      
      setMfaFactors(data?.totp || []);
    } catch (error: any) {
      console.error("Error loading MFA factors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnenroll = async (factorId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId,
      });

      if (error) throw error;

      toast({
        title: "MFA Disabled",
        description: "Two-factor authentication has been disabled for your account",
      });

      await loadMFAFactors();
    } catch (error: any) {
      toast({
        title: "Failed to Disable MFA",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollmentComplete = async () => {
    setShowEnrollment(false);
    await loadMFAFactors();
  };

  const hasMFA = mfaFactors.length > 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (showEnrollment) {
    return <MFAEnrollment onEnrollmentComplete={handleEnrollmentComplete} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Manage your account's two-factor authentication settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {hasMFA ? (
              <ShieldCheck className="w-5 h-5 text-green-600" />
            ) : (
              <ShieldOff className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                {hasMFA ? "2FA Enabled" : "2FA Disabled"}
              </p>
              <p className="text-sm text-muted-foreground">
                {hasMFA 
                  ? "Your account is protected with two-factor authentication" 
                  : "Add an extra layer of security to your account"
                }
              </p>
            </div>
          </div>
          
          {hasMFA ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  Disable 2FA
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the extra layer of security from your account. You can re-enable it at any time.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleUnenroll(mfaFactors[0].id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Disable 2FA
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button onClick={() => setShowEnrollment(true)}>
              Enable 2FA
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
