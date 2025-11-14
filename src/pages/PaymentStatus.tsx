import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Clock, AlertCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('ref');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (reference) {
      fetchOrderStatus();
    }
  }, [reference]);

  const fetchOrderStatus = async () => {
    const { data, error } = await supabase
      .from('bank_transfer_orders')
      .select('*')
      .eq('payment_reference', reference)
      .single();

    if (!error && data) {
      setOrder(data);
    }
    setLoading(false);
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
                  <span className="font-bold text-lg">£{order.amount.toFixed(2)}</span>
                </div>
              </div>

              {order.status === 'awaiting_payment' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm">
                    <strong>Next Steps:</strong> Transfer £{order.amount.toFixed(2)} to our bank account using reference <strong>{reference}</strong>. We'll verify your payment within 1-2 business days.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg">Payment reference not found</p>
            </div>
          )}
        </Card>
      </main>
      <Footer />
    </>
  );
}