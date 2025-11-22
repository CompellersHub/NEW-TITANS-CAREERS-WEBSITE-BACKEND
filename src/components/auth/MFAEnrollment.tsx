import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Smartphone, Copy, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MFAEnrollmentProps {
  onEnrollmentComplete?: () => void;
}

export const MFAEnrollment = ({ onEnrollmentComplete }: MFAEnrollmentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [verifyCode, setVerifyCode] = useState("");
  const [factorId, setFactorId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleEnroll = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) throw error;

      if (data) {
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setFactorId(data.id);
      }
    } catch (error: any) {
      toast({
        title: "Enrollment Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verifyCode || verifyCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit code from your authenticator app",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verifyCode,
      });

      if (error) throw error;

      toast({
        title: "MFA Enabled",
        description: "Two-factor authentication has been successfully enabled for your account",
      });

      onEnrollmentComplete?.();
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied",
      description: "Secret key copied to clipboard",
    });
  };

  if (!qrCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Enable Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Two-factor authentication (2FA) adds an additional layer of security to your account by requiring a second form of verification.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={handleEnroll} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              "Set Up Two-Factor Authentication"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan QR Code</CardTitle>
        <CardDescription>
          Use your authenticator app to scan the QR code
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-lg">
            <img src={qrCode} alt="MFA QR Code" className="w-64 h-64" />
          </div>
          
          <div className="w-full space-y-2">
            <Label>Or enter this code manually:</Label>
            <div className="flex gap-2">
              <Input 
                value={secret} 
                readOnly 
                className="font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copySecret}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              Download an authenticator app like Google Authenticator, Microsoft Authenticator, or Authy to scan the QR code.
            </AlertDescription>
          </Alert>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verify-code">
              Enter the 6-digit code from your authenticator app
            </Label>
            <Input
              id="verify-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="000000"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
              required
              disabled={isLoading}
              className="text-center text-2xl tracking-widest"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || verifyCode.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify and Enable"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
