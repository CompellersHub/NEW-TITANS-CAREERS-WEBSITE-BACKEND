import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/components/layouts/PageLayout";
import { TrendingUp, TrendingDown, DollarSign, Ticket, Users, Target } from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

interface VoucherStats {
  id: string;
  code: string;
  name: string;
  discount_type: string;
  discount_value: number;
  usage_count: number;
  usage_limit: number | null;
  total_revenue_impact: number;
  redemption_rate: number;
  avg_discount: number;
}

interface UsageTrend {
  date: string;
  count: number;
  revenue_impact: number;
}

export default function VoucherAnalytics() {
  const { data: voucherStats, isLoading: statsLoading } = useQuery({
    queryKey: ['voucher-stats'],
    queryFn: async () => {
      const { data: vouchers, error: vouchersError } = await supabase
        .from('vouchers' as any)
        .select('*');
      
      if (vouchersError) throw vouchersError;

      const { data: usageData, error: usageError } = await supabase
        .from('voucher_usage' as any)
        .select('*');
      
      if (usageError) throw usageError;

      const stats: VoucherStats[] = (vouchers || []).map((voucher: any) => {
        const voucherUsage = (usageData || []).filter((u: any) => u.voucher_id === voucher.id);
        const totalRevenueImpact = voucherUsage.reduce((sum: number, u: any) => sum + parseFloat(u.discount_amount.toString()), 0);
        const avgDiscount = voucherUsage.length > 0 ? totalRevenueImpact / voucherUsage.length : 0;
        const redemptionRate = voucher.usage_limit 
          ? (voucher.usage_count / voucher.usage_limit) * 100 
          : 0;

        return {
          id: voucher.id,
          code: voucher.code,
          name: voucher.name,
          discount_type: voucher.discount_type,
          discount_value: voucher.discount_value,
          usage_count: voucher.usage_count,
          usage_limit: voucher.usage_limit,
          total_revenue_impact: totalRevenueImpact,
          redemption_rate: redemptionRate,
          avg_discount: avgDiscount
        };
      });

      return stats.sort((a, b) => b.total_revenue_impact - a.total_revenue_impact);
    }
  });

  const { data: usageTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['voucher-usage-trends'],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      const { data, error } = await supabase
        .from('voucher_usage' as any)
        .select('used_at, discount_amount')
        .gte('used_at', thirtyDaysAgo.toISOString())
        .order('used_at', { ascending: true });
      
      if (error) throw error;

      const trendsByDate = (data || []).reduce((acc: any, usage: any) => {
        const date = format(parseISO(usage.used_at), 'MMM dd');
        if (!acc[date]) {
          acc[date] = { date, count: 0, revenue_impact: 0 };
        }
        acc[date].count += 1;
        acc[date].revenue_impact += parseFloat(usage.discount_amount.toString());
        return acc;
      }, {} as Record<string, UsageTrend>);

      return Object.values(trendsByDate);
    }
  });

  const { data: courseBreakdown, isLoading: courseLoading } = useQuery({
    queryKey: ['voucher-course-breakdown'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voucher_usage' as any)
        .select('course_slug, discount_amount');
      
      if (error) throw error;

      const breakdown = (data || []).reduce((acc: any, usage: any) => {
        if (!acc[usage.course_slug]) {
          acc[usage.course_slug] = { name: usage.course_slug, value: 0, count: 0 };
        }
        acc[usage.course_slug].value += parseFloat(usage.discount_amount.toString());
        acc[usage.course_slug].count += 1;
        return acc;
      }, {} as Record<string, { name: string; value: number; count: number }>);

      return Object.values(breakdown);
    }
  });

  const totalDiscountsGiven = voucherStats?.reduce((sum, v) => sum + v.total_revenue_impact, 0) || 0;
  const totalRedemptions = voucherStats?.reduce((sum, v) => sum + v.usage_count, 0) || 0;
  const avgDiscountPerVoucher = totalRedemptions > 0 ? totalDiscountsGiven / totalRedemptions : 0;
  const activeVouchers = voucherStats?.filter(v => v.usage_count > 0).length || 0;

  return (
    <PageLayout intensity3D="subtle" show3D={true}>
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Voucher Analytics</h1>
          <p className="text-muted-foreground mt-2">Track performance and insights across all voucher campaigns</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Discounts Given</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-red-600">£{totalDiscountsGiven.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Revenue impact from vouchers</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{totalRedemptions}</div>
                  <p className="text-xs text-muted-foreground mt-1">Vouchers used successfully</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Discount</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">£{avgDiscountPerVoucher.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Per redemption</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vouchers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{activeVouchers}</div>
                  <p className="text-xs text-muted-foreground mt-1">With redemptions</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList>
            <TabsTrigger value="trends">Usage Trends</TabsTrigger>
            <TabsTrigger value="performance">Voucher Performance</TabsTrigger>
            <TabsTrigger value="courses">Course Breakdown</TabsTrigger>
          </TabsList>

          {/* Usage Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>30-Day Usage Trends</CardTitle>
                <CardDescription>Daily voucher redemptions and revenue impact</CardDescription>
              </CardHeader>
              <CardContent>
                {trendsLoading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : usageTrends && usageTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={usageTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value: number, name: string) => {
                          if (name === 'revenue_impact') return `£${value.toFixed(2)}`;
                          return value;
                        }}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="count" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        name="Redemptions"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="revenue_impact" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        name="Revenue Impact (£)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    No usage data available for the last 30 days
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voucher Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Vouchers</CardTitle>
                  <CardDescription>By total revenue impact</CardDescription>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-[400px] w-full" />
                  ) : voucherStats && voucherStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={voucherStats.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="code" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => `£${value.toFixed(2)}`}
                        />
                        <Bar dataKey="total_revenue_impact" fill="#8b5cf6" name="Revenue Impact" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                      No voucher data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Redemption Rates</CardTitle>
                  <CardDescription>Usage vs limits for vouchers with caps</CardDescription>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-[400px] w-full" />
                  ) : voucherStats && voucherStats.filter(v => v.usage_limit).length > 0 ? (
                    <div className="space-y-4">
                      {voucherStats
                        .filter(v => v.usage_limit)
                        .slice(0, 8)
                        .map((voucher) => (
                          <div key={voucher.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{voucher.code}</span>
                              <span className="text-sm text-muted-foreground">
                                {voucher.usage_count} / {voucher.usage_limit}
                              </span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${
                                  voucher.redemption_rate >= 80 ? 'bg-red-500' :
                                  voucher.redemption_rate >= 50 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(voucher.redemption_rate, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                      No vouchers with usage limits
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Voucher Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Voucher Statistics</CardTitle>
                <CardDescription>Comprehensive performance metrics for all vouchers</CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : voucherStats && voucherStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Code</th>
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-right py-3 px-4">Redemptions</th>
                          <th className="text-right py-3 px-4">Avg Discount</th>
                          <th className="text-right py-3 px-4">Total Impact</th>
                          <th className="text-right py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {voucherStats.map((voucher) => (
                          <tr key={voucher.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <span className="font-mono font-semibold">{voucher.code}</span>
                            </td>
                            <td className="py-3 px-4">{voucher.name}</td>
                            <td className="text-right py-3 px-4">
                              {voucher.usage_count}
                              {voucher.usage_limit && ` / ${voucher.usage_limit}`}
                            </td>
                            <td className="text-right py-3 px-4">
                              £{voucher.avg_discount.toFixed(2)}
                            </td>
                            <td className="text-right py-3 px-4 font-semibold text-red-600">
                              £{voucher.total_revenue_impact.toFixed(2)}
                            </td>
                            <td className="text-right py-3 px-4">
                              {voucher.usage_count === 0 ? (
                                <Badge variant="secondary">Unused</Badge>
                              ) : voucher.usage_limit && voucher.usage_count >= voucher.usage_limit ? (
                                <Badge variant="destructive">Full</Badge>
                              ) : (
                                <Badge className="bg-green-500">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Active
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    No voucher statistics available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Course Breakdown Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Discount Distribution by Course</CardTitle>
                  <CardDescription>Total discounts given per course</CardDescription>
                </CardHeader>
                <CardContent>
                  {courseLoading ? (
                    <Skeleton className="h-[400px] w-full" />
                  ) : courseBreakdown && courseBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={courseBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {courseBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `£${value.toFixed(2)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                      No course data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Statistics</CardTitle>
                  <CardDescription>Voucher usage breakdown by course</CardDescription>
                </CardHeader>
                <CardContent>
                  {courseLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                  ) : courseBreakdown && courseBreakdown.length > 0 ? (
                    <div className="space-y-4">
                      {courseBreakdown.map((course: any, index: number) => (
                        <div key={course.name} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <div>
                              <div className="font-medium">{course.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {course.count} redemption{course.count !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-red-600">
                              £{course.value.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              £{(course.value / course.count).toFixed(2)} avg
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                      No course statistics available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </PageLayout>
  );
}
