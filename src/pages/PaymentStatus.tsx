import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/layouts/PageLayout';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Clock, AlertCircle, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PaymentProofUploader } from '@/components/payment/PaymentProofUploader';

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('ref');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (reference) {
      fetchOrderStatus();
    }
  }, [reference]);

  const fetchOrderStatus = async () => {
    // Try bank_transfer_orders first
    let { data, error }: { data: any; error: any } = await supabase
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
      setOrder(data);
    }
    setLoading(false);
  };


  const handleResendInstructions = async () => {
    if (!order) return;

    try {
      const { error } = await supabase.functions.invoke('send-bank-transfer-instructions', {
        body: {
          customerEmail: order.customer_email,
          customerName: order.customer_name || 'Student',
          courseTitle: order.course_title,
          amount: order.amount || order.final_price,
          paymentReference: order.payment_reference || reference,
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
    <PageLayout intensity3D="subtle" show3D={true}>
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
                  <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Bank Transfer Details</h3>
                          <p className="text-xs text-muted-foreground">Complete your payment using these details</p>
                        </div>
                      </div>

                      <div className="bg-background rounded-lg p-4 space-y-3">
                        <div className="flex justify-between py-2">
                          <span className="text-sm text-muted-foreground">Account Name:</span>
                          <span className="font-semibold">Titans Careers Ltd</span>
                        </div>
                        <div className="flex justify-between py-2 border-t">
                          <span className="text-sm text-muted-foreground">Sort Code:</span>
                          <span className="font-mono font-semibold">12-34-56</span>
                        </div>
                        <div className="flex justify-between py-2 border-t">
                          <span className="text-sm text-muted-foreground">Account Number:</span>
                          <span className="font-mono font-semibold">12345678</span>
                        </div>
                        <div className="flex justify-between py-3 border-t bg-primary/5 -mx-4 px-4 rounded-b-lg">
                          <span className="text-sm font-medium">Amount to Transfer:</span>
                          <span className="font-bold text-xl text-primary">£{(order.amount || order.final_price || 0).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                        <p className="text-sm font-medium mb-1">⚠️ Important:</p>
                        <p className="text-sm text-muted-foreground">
                          Use reference <span className="font-mono font-bold text-foreground">{reference}</span> when making your transfer. We'll verify your payment within 1-2 business days.
                        </p>
                      </div>

                      <Button 
                        onClick={handleResendInstructions}
                        variant="outline"
                        className="w-full"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Resend Bank Details to Email
                      </Button>
                    </div>
                  </Card>

                  <PaymentProofUploader
                    reference={reference}
                    existingProofs={order.payment_proof_urls || (order.payment_proof_url ? [order.payment_proof_url] : [])}
                    onUploadComplete={fetchOrderStatus}
                  />
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
    </PageLayout>
  );
}