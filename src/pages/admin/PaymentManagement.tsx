import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout } from '@/components/layouts/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function PaymentManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: paymentIntents } = useQuery({
    queryKey: ['all-payment-intents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_intents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: enrollments } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const pendingPayments = paymentIntents?.filter(p => p.payment_status === 'pending') || [];
  const failedPayments = paymentIntents?.filter(p => p.payment_status === 'failed') || [];
  const payl8rPayments = enrollments?.filter(e => e.payment_method === 'payl8r') || [];

  const filteredPending = pendingPayments.filter(p =>
    p.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.course_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFailed = failedPayments.filter(p =>
    p.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.course_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayl8r = payl8rPayments.filter(p =>
    p.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.course_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      completed: 'bg-green-500',
      failed: 'bg-red-500',
      processing: 'bg-blue-500',
    };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status}</Badge>;
  };

  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => row[h]).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <PageLayout intensity3D="subtle" show3D={true}>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Payment Management</h1>
            <p className="text-muted-foreground">Unified payment transaction management</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">
                Pending ({pendingPayments.length})
              </TabsTrigger>
              <TabsTrigger value="failed">
                Failed ({failedPayments.length})
              </TabsTrigger>
              <TabsTrigger value="payl8r">
                Payl8r Plans ({payl8rPayments.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All Transactions ({paymentIntents?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Pending Payments</h3>
                <Button 
                  variant="outline" 
                  onClick={() => exportCSV(filteredPending, 'pending-payments.csv')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              {filteredPending.length > 0 ? (
                <div className="space-y-3">
                  {filteredPending.map((payment) => (
                    <Card key={payment.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">{payment.course_title}</span>
                              {getStatusBadge(payment.payment_status)}
                              <Badge variant="outline">{payment.payment_method}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {payment.customer_email}
                            </div>
                            <div className="flex gap-4 text-sm">
                              <span>Amount: <strong>£{payment.final_price}</strong></span>
                              <span>Created: {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm')}</span>
                            </div>
                            {payment.expires_at && (
                              <div className="text-sm text-yellow-600">
                                Expires: {format(new Date(payment.expires_at), 'dd/MM/yyyy HH:mm')}
                              </div>
                            )}
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No pending payments
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="failed" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Failed Payments</h3>
                <Button 
                  variant="outline"
                  onClick={() => exportCSV(filteredFailed, 'failed-payments.csv')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              {filteredFailed.length > 0 ? (
                <div className="space-y-3">
                  {filteredFailed.map((payment) => (
                    <Card key={payment.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">{payment.course_title}</span>
                              {getStatusBadge(payment.payment_status)}
                              <Badge variant="outline">{payment.payment_method}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {payment.customer_email}
                            </div>
                            <div className="flex gap-4 text-sm">
                              <span>Amount: <strong>£{payment.final_price}</strong></span>
                              <span>Failed: {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm')}</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Contact Customer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No failed payments
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="payl8r" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Payl8r Installment Plans</h3>
                <Button 
                  variant="outline"
                  onClick={() => exportCSV(filteredPayl8r, 'payl8r-plans.csv')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              {filteredPayl8r.length > 0 ? (
                <div className="space-y-3">
                  {filteredPayl8r.map((enrollment) => {
                    const plan = enrollment.installment_plan as any;
                    return (
                      <Card key={enrollment.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold">{enrollment.course_title}</span>
                                <Badge className="bg-purple-500">Payl8r</Badge>
                                {getStatusBadge(enrollment.payment_status)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {enrollment.customer_email}
                              </div>
                              {plan && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-3">
                                  <div>
                                    <span className="text-muted-foreground">Monthly:</span>{' '}
                                    <strong>£{plan.monthly_amount}</strong>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Term:</span>{' '}
                                    <strong>{plan.term_months} months</strong>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">APR:</span>{' '}
                                    <strong>{plan.apr}</strong>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Total:</span>{' '}
                                    <strong>£{plan.total_amount}</strong>
                                  </div>
                                </div>
                              )}
                              <div className="text-sm text-muted-foreground">
                                Started: {format(new Date(enrollment.created_at), 'dd/MM/yyyy')}
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Plan
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No Payl8r plans yet
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">All Payment Intents</h3>
                <Button 
                  variant="outline"
                  onClick={() => exportCSV(paymentIntents || [], 'all-payments.csv')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              {paymentIntents && paymentIntents.length > 0 ? (
                <div className="space-y-3">
                  {paymentIntents.slice(0, 50).map((payment) => (
                    <Card key={payment.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">{payment.course_title}</span>
                              {getStatusBadge(payment.payment_status)}
                              <Badge variant="outline">{payment.payment_method}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {payment.customer_email}
                            </div>
                            <div className="flex gap-4 text-sm">
                              <span>Amount: <strong>£{payment.final_price}</strong></span>
                              <span>{format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm')}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No transactions yet
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </PageLayout>
  );
}
