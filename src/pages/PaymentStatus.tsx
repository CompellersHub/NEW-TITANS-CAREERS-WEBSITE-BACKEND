import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Clock, AlertCircle, Copy, Upload, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentOrder {
  id: string;
  course_title: string;
  status: string;
  amount?: number;
  final_price?: number;
  payment_reference?: string;
  customer_email?: string;
  customer_name?: string;
  payment_proof_url?: string;
  _type?: string;
}

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('ref');
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (reference) {
      fetchOrderStatus();
    }
  }, [reference]);

  const fetchOrderStatus = async () => {
    // Try bank_transfer_orders first
    let { data, error } = await supabase
      .from('bank_transfer_orders')
      .select('*')
      .eq('payment_reference', reference)
      .maybeSingle();

    let orderType = 'bank_transfer';

    // If not found, try payment_intents
    if (!data) {
      const { data: intentData, error: intentError } = await supabase
        .from('payment_intents')
        .select('*')
        .eq('payment_reference', reference)
        .maybeSingle();
      
      data = intentData;
      error = intentError;
      orderType = 'payment_intent';
    }

    if (!error && data) {
      setOrder({ ...data, _type: orderType });
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Maximum file size is 5MB', variant: 'destructive' });
        return;
      }
      setProofFile(file);
    }
  };

  const handleUploadProof = async () => {
    if (!proofFile || !reference) return;

    setUploading(true);
    try {
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${reference}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, proofFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('bank_transfer_orders')
        .update({ payment_proof_url: publicUrl })
        .eq('payment_reference', reference);

      if (updateError) throw updateError;

      toast({ title: 'Proof uploaded successfully', description: 'We\'ll verify your payment soon' });
      fetchOrderStatus();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      setProofFile(null);
    }
  };

  const handleResendInstructions = async () => {
    if (!order) return;

    try {
      const { error } = await supabase.functions.invoke('send-bank-transfer-instructions', {
        body: {
          customerEmail: order.customer_email,
          customerName: order.customer_name || 'Student',
          courseTitle: order.course_title,
          amount: order.amount,
          paymentReference: order.payment_reference,
          expiresAt: order.expires_at,
        },
      });

      if (error) throw error;

      toast({ title: 'Instructions sent', description: 'Check your email for bank details' });
    } catch (error: any) {
      toast({ title: 'Failed to resend', description: error.message, variant: 'destructive' });
    }
  };

  const copyReference = () => {
    navigator.clipboard.writeText(reference || '');
    toast({ title: 'Reference copied to clipboard' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container py-20">
        <Card className="max-w-2xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-6">Payment Status</h1>
          
          {order ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg">
                {order.status === 'verified' ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-semibold">Payment Verified</p>
                      <p className="text-sm text-muted-foreground">Your course access is now active</p>
                    </div>
                  </>
                ) : order.status === 'expired' ? (
                  <>
                    <AlertCircle className="w-8 h-8 text-red-600" />
                    <div>
                      <p className="font-semibold">Payment Expired</p>
                      <p className="text-sm text-muted-foreground">Please enroll again</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Clock className="w-8 h-8 text-amber-600" />
                    <div>
                      <p className="font-semibold">Awaiting Payment</p>
                      <p className="text-sm text-muted-foreground">We're waiting for your bank transfer</p>
                    </div>
                  </>
                )}
              </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold">{reference}</span>
                      <Button variant="ghost" size="sm" onClick={copyReference}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Course:</span>
                    <span className="font-medium">{order.course_title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-bold text-lg">£{(order.amount || order.final_price || 0).toFixed(2)}</span>
                  </div>
                </div>

              {order.status === 'pending' || order.status === 'awaiting_payment' ? (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                    <p className="text-sm">
                      <strong>Next Steps:</strong> Transfer £{(order.amount || order.final_price || 0).toFixed(2)} to our bank account using reference <strong>{reference}</strong>. We'll verify your payment within 1-2 business days.
                    </p>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleResendInstructions}
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend Bank Details
                    </Button>
                  </div>

                  {order._type === 'bank_transfer' && !order.payment_proof_url && (
                    <div className="border border-border rounded-lg p-4 space-y-4">
                      <h3 className="font-semibold">Upload Payment Proof</h3>
                      <p className="text-sm text-muted-foreground">
                        Speed up verification by uploading your payment receipt or bank statement.
                      </p>
                      
                      <div className="space-y-2">
                        <Label htmlFor="proof">Payment Receipt (Max 5MB)</Label>
                        <Input
                          id="proof"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          disabled={uploading}
                        />
                      </div>

                      {proofFile && (
                        <Button 
                          onClick={handleUploadProof}
                          disabled={uploading}
                          className="w-full"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading ? 'Uploading...' : 'Upload Proof'}
                        </Button>
                      )}
                    </div>
                  )}

                  {order.payment_proof_url && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        ✓ Payment proof uploaded. We're reviewing your submission.
                      </p>
                    </div>
                  )}
                </>
              ) : null}

              {order.status === 'verified' && (
                <div className="space-y-4">
                  <Link to="/courses">
                    <Button className="w-full">Browse More Courses</Button>
                  </Link>
                </div>
              )}

              {order.status === 'expired' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Your payment window has expired. Please register again to enroll.
                  </p>
                  <Link to="/courses">
                    <Button className="w-full">Browse Courses</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Payment Reference Not Found</p>
              <p className="text-sm text-muted-foreground mb-4">
                We couldn't find a payment with this reference. Please check your email for the correct link.
              </p>
              <Link to="/courses">
                <Button variant="outline">Browse Courses</Button>
              </Link>
            </div>
          )}
        </Card>
      </main>
      <Footer />
    </>
  );
}