import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, Filter } from "lucide-react";
import { format } from "date-fns";
import { PageLayout } from "@/components/layouts/PageLayout";

export default function VoucherExport() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [includeUsage, setIncludeUsage] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(false);

  const { data: vouchers, isLoading } = useQuery({
    queryKey: ['vouchers-export', includeInactive],
    queryFn: async () => {
      let query = supabase
        .from('vouchers' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    }
  });

  const { data: usageData } = useQuery({
    queryKey: ['voucher-usage-export'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voucher_usage' as any)
        .select('voucher_id, used_at, user_email, course_slug, discount_amount');
      
      if (error) throw error;
      return data as any[];
    },
    enabled: includeUsage
  });

  const exportVouchers = () => {
    if (!vouchers || vouchers.length === 0) {
      toast.error('No vouchers to export');
      return;
    }

    let filteredVouchers = vouchers;

    // Apply status filter
    if (statusFilter === 'unused') {
      filteredVouchers = vouchers.filter(v => v.usage_count === 0);
    } else if (statusFilter === 'used') {
      filteredVouchers = vouchers.filter(v => v.usage_count > 0);
    } else if (statusFilter === 'expired') {
      const now = new Date();
      filteredVouchers = vouchers.filter(v => new Date(v.valid_until) < now);
    } else if (statusFilter === 'active') {
      const now = new Date();
      filteredVouchers = vouchers.filter(v => 
        v.is_active && 
        new Date(v.valid_from) <= now && 
        new Date(v.valid_until) > now
      );
    }

    // CSV Headers
    const headers = [
      'Code',
      'Name',
      'Description',
      'Discount Type',
      'Discount Value',
      'Min Purchase',
      'Max Discount',
      'Valid From',
      'Valid Until',
      'Usage Count',
      'Usage Limit',
      'Per User Limit',
      'Active',
      'Created At'
    ];

    if (includeUsage) {
      headers.push('Total Uses', 'Last Used', 'Total Revenue Impact');
    }

    // CSV Rows
    const rows = filteredVouchers.map(voucher => {
      const voucherUsage = usageData?.filter(u => u.voucher_id === voucher.id) || [];
      const totalRevenue = voucherUsage.reduce((sum, u) => sum + parseFloat(u.discount_amount), 0);
      const lastUsed = voucherUsage.length > 0 
        ? format(new Date(Math.max(...voucherUsage.map(u => new Date(u.used_at).getTime()))), 'yyyy-MM-dd HH:mm')
        : 'Never';

      const row = [
        voucher.code,
        voucher.name,
        voucher.description || '',
        voucher.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount',
        voucher.discount_type === 'percentage' 
          ? `${voucher.discount_value}%` 
          : `£${voucher.discount_value}`,
        voucher.min_purchase_amount ? `£${voucher.min_purchase_amount}` : 'None',
        voucher.max_discount_amount ? `£${voucher.max_discount_amount}` : 'None',
        format(new Date(voucher.valid_from), 'yyyy-MM-dd HH:mm'),
        format(new Date(voucher.valid_until), 'yyyy-MM-dd HH:mm'),
        voucher.usage_count,
        voucher.usage_limit || 'Unlimited',
        voucher.per_user_limit || 'Unlimited',
        voucher.is_active ? 'Yes' : 'No',
        format(new Date(voucher.created_at), 'yyyy-MM-dd HH:mm')
      ];

      if (includeUsage) {
        row.push(
          voucherUsage.length.toString(),
          lastUsed,
          `£${totalRevenue.toFixed(2)}`
        );
      }

      return row;
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
    const filename = `vouchers-export-${statusFilter}-${timestamp}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${filteredVouchers.length} vouchers to ${filename}`);
  };

  const exportDetailedUsage = () => {
    if (!usageData || usageData.length === 0) {
      toast.error('No usage data to export');
      return;
    }

    // CSV Headers
    const headers = [
      'Voucher Code',
      'User Email',
      'Course',
      'Discount Amount',
      'Used At'
    ];

    // Find voucher codes
    const voucherMap = new Map(vouchers?.map(v => [v.id, v.code]));

    // CSV Rows
    const rows = usageData.map(usage => [
      voucherMap.get(usage.voucher_id) || 'Unknown',
      usage.user_email,
      usage.course_slug,
      `£${parseFloat(usage.discount_amount).toFixed(2)}`,
      format(new Date(usage.used_at), 'yyyy-MM-dd HH:mm:ss')
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
    const filename = `voucher-usage-${timestamp}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${usageData.length} usage records to ${filename}`);
  };

  return (
    <PageLayout intensity3D="subtle" show3D={true}>
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Export Vouchers</h1>
          <p className="text-muted-foreground mt-2">Download voucher data for distribution and record-keeping</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Export Vouchers</CardTitle>
              <CardDescription>Download a CSV file with voucher details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Filter by Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vouchers</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="unused">Unused Only</SelectItem>
                    <SelectItem value="used">Used Only</SelectItem>
                    <SelectItem value="expired">Expired Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-usage"
                    checked={includeUsage}
                    onCheckedChange={(checked) => setIncludeUsage(checked as boolean)}
                  />
                  <Label htmlFor="include-usage" className="text-sm font-normal">
                    Include usage statistics
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-inactive"
                    checked={includeInactive}
                    onCheckedChange={(checked) => setIncludeInactive(checked as boolean)}
                  />
                  <Label htmlFor="include-inactive" className="text-sm font-normal">
                    Include inactive vouchers
                  </Label>
                </div>
              </div>

              <Button 
                onClick={exportVouchers} 
                disabled={isLoading || !vouchers || vouchers.length === 0}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Vouchers
              </Button>

              {vouchers && (
                <p className="text-sm text-muted-foreground text-center">
                  {vouchers.length} voucher{vouchers.length !== 1 ? 's' : ''} available
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Usage History</CardTitle>
              <CardDescription>Download detailed usage records</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Export a detailed log of all voucher redemptions including user information and timestamps
                </p>
              </div>

              <Button 
                onClick={exportDetailedUsage} 
                disabled={!usageData || usageData.length === 0}
                className="w-full"
                variant="secondary"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Usage History
              </Button>

              {usageData && (
                <p className="text-sm text-muted-foreground text-center">
                  {usageData.length} usage record{usageData.length !== 1 ? 's' : ''} available
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Export Information</CardTitle>
            <CardDescription>What's included in the exports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Voucher Export Includes:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Voucher code and campaign name</li>
                  <li>• Discount type and value</li>
                  <li>• Validity period and usage limits</li>
                  <li>• Current usage count and status</li>
                  <li>• Creation date and active status</li>
                  <li>• Optional: Total uses and revenue impact</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Usage History Includes:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Voucher code used</li>
                  <li>• User email address</li>
                  <li>• Course purchased</li>
                  <li>• Discount amount applied</li>
                  <li>• Exact timestamp of redemption</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </PageLayout>
  );
}
