import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout } from '@/components/layouts/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CheckCircle, Clock, XCircle, Mail, Search, Download } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';

export default function BankTransferVerification() {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['bank-transfer-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_transfer_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('bank_transfer_orders')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;

      // Also update payment intent
      const { data: order } = await supabase
        .from('bank_transfer_orders')
        .select('payment_intent_id')
        .eq('id', orderId)
        .single();

      if (order?.payment_intent_id) {
        await supabase
          .from('payment_intents')
          .update({
            payment_status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', order.payment_intent_id);

        // Create enrollment
        const { data: intent } = await supabase
          .from('payment_intents')
          .select('*')
          .eq('id', order.payment_intent_id)
          .single();

        if (intent) {
          await supabase.from('enrollments').insert({
            customer_email: intent.customer_email,
            course_slug: intent.course_slug,
            course_title: intent.course_title,
            price: intent.final_price,
            payment_method: 'bank_transfer',
            payment_status: 'completed',
            payment_provider_reference: orderId,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-transfer-orders'] });
      toast.success('Payment verified successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to verify payment: ' + error.message);
    },
  });

  const filteredOrders = orders?.filter(order =>
    order.payment_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.course_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string, expiresAt: string) => {
    const expired = isPast(new Date(expiresAt));
    
    if (status === 'verified') {
      return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Verified</Badge>;
    }
    if (expired || status === 'expired') {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Expired</Badge>;
    }
    return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Awaiting Payment</Badge>;
  };

  const exportToCSV = () => {
    if (!orders) return;

    const headers = ['Reference', 'Customer Email', 'Course', 'Amount', 'Status', 'Created', 'Expires'];
    const rows = orders.map(order => [
      order.payment_reference,
      order.customer_email,
      order.course_title,
      `£${order.amount}`,
      order.status,
      format(new Date(order.created_at), 'dd/MM/yyyy HH:mm'),
      format(new Date(order.expires_at), 'dd/MM/yyyy HH:mm'),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bank-transfers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('CSV exported successfully');
  };

  return (
    <PageLayout intensity3D="subtle" show3D={true}>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Bank Transfer Verification</h1>
              <p className="text-muted-foreground">Manually verify bank transfer payments</p>
            </div>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search Orders</CardTitle>
              <CardDescription>Filter by reference, email, or course name</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Loading orders...
              </CardContent>
            </Card>
          ) : filteredOrders && filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const expired = isPast(new Date(order.expires_at));
                const timeUntilExpiry = formatDistanceToNow(new Date(order.expires_at), { addSuffix: true });

                return (
                  <Card key={order.id} className={expired ? 'border-destructive/50' : ''}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <code className="text-lg font-mono bg-muted px-3 py-1 rounded">
                              {order.payment_reference}
                            </code>
                            {getStatusBadge(order.status, order.expires_at)}
                          </div>

                          <div className="grid md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Customer:</span>{' '}
                              <span className="font-medium">{order.customer_email}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Course:</span>{' '}
                              <span className="font-medium">{order.course_title}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Amount:</span>{' '}
                              <span className="font-semibold text-lg">£{order.amount}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Created:</span>{' '}
                              {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}
                            </div>
                          </div>

                          {order.status === 'awaiting_payment' && !expired && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Expires:</span>{' '}
                              <span className={isPast(new Date(order.expires_at)) ? 'text-destructive font-medium' : ''}>
                                {timeUntilExpiry}
                              </span>
                            </div>
                          )}

                          {order.verified_at && (
                            <div className="text-sm text-green-600">
                              Verified {format(new Date(order.verified_at), 'dd/MM/yyyy HH:mm')}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          {order.status === 'awaiting_payment' && !expired && (
                            <>
                              <Button
                                onClick={() => verifyPaymentMutation.mutate(order.id)}
                                disabled={verifyPaymentMutation.isPending}
                                className="w-full md:w-auto"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Verify Payment
                              </Button>
                              <Button variant="outline" className="w-full md:w-auto">
                                <Mail className="w-4 h-4 mr-2" />
                                Resend Instructions
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {searchTerm ? 'No orders match your search' : 'No bank transfer orders yet'}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </PageLayout>
  );
}
