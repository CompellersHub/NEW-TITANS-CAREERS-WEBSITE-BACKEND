import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout } from '@/components/layouts/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CreditCard, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import { format, subDays } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function PaymentAnalytics() {
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

  // Calculate metrics
  const totalRevenue = enrollments?.reduce((sum, e) => sum + e.price, 0) || 0;
  const thisMonthRevenue = enrollments?.filter(e => 
    new Date(e.created_at).getMonth() === new Date().getMonth()
  ).reduce((sum, e) => sum + e.price, 0) || 0;

  const avgTransactionValue = enrollments?.length ? totalRevenue / enrollments.length : 0;

  const pendingPayments = paymentIntents?.filter(p => p.payment_status === 'pending') || [];
  const pendingValue = pendingPayments.reduce((sum, p) => sum + p.final_price, 0);

  const failedPayments = paymentIntents?.filter(p => p.payment_status === 'failed') || [];
  const failedRate = paymentIntents?.length ? (failedPayments.length / paymentIntents.length) * 100 : 0;

  // Revenue by payment method
  const methodData = enrollments?.reduce((acc: any[], e) => {
    const method = e.payment_method || 'stripe';
    const existing = acc.find(item => item.name === method);
    if (existing) {
      existing.value += e.price;
      existing.count += 1;
    } else {
      acc.push({
        name: method.charAt(0).toUpperCase() + method.slice(1),
        value: e.price,
        count: 1
      });
    }
    return acc;
  }, []);

  // Daily revenue trend (last 30 days)
  const dailyRevenue = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEnrollments = enrollments?.filter(e => 
      format(new Date(e.created_at), 'yyyy-MM-dd') === dateStr
    ) || [];
    
    return {
      date: format(date, 'MMM dd'),
      revenue: dayEnrollments.reduce((sum, e) => sum + e.price, 0),
      count: dayEnrollments.length
    };
  });

  // Conversion rate by method
  const conversionData = methodData?.map(method => {
    const methodName = method.name.toLowerCase();
    const attempts = paymentIntents?.filter(p => p.payment_method === methodName).length || 0;
    const completed = enrollments?.filter(e => e.payment_method === methodName).length || 0;
    return {
      name: method.name,
      conversion: attempts > 0 ? (completed / attempts) * 100 : 0
    };
  });

  return (
    <PageLayout intensity3D="subtle" show3D={true}>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Payment Analytics</h1>
            <p className="text-muted-foreground">Comprehensive revenue and transaction insights</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">£{totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">£{thisMonthRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">{enrollments?.filter(e => 
                  new Date(e.created_at).getMonth() === new Date().getMonth()
                ).length} transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">£{avgTransactionValue.toFixed(0)}</div>
                <p className="text-xs text-muted-foreground mt-1">{enrollments?.length || 0} total sales</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">£{pendingValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">{pendingPayments.length} awaiting</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend (30 Days)</CardTitle>
                <CardDescription>Daily revenue and transaction count</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue (£)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Payment Method</CardTitle>
                <CardDescription>Distribution across payment types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={methodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {methodData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `£${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rate by Method</CardTitle>
                <CardDescription>Payment success rate comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={conversionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    <Legend />
                    <Bar dataKey="conversion" fill="#10b981" name="Conversion Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method Stats</CardTitle>
                <CardDescription>Transaction counts and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {methodData?.map((method, index) => (
                    <div key={method.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{method.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">£{method.value.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{method.count} transactions</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {paymentIntents?.filter(p => p.payment_status === 'completed').length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {pendingPayments.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {failedPayments.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {failedRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Failure Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </PageLayout>
  );
}
