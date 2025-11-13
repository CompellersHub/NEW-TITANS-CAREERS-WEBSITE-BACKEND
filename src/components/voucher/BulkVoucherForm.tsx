import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, CheckCircle2, Download, Mail } from "lucide-react";
import { EmailDistributionDialog } from "./EmailDistributionDialog";

interface BulkVoucherFormProps {
  onSuccess: () => void;
}

interface GeneratedVoucher {
  code: string;
  id?: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export function BulkVoucherForm({ onSuccess }: BulkVoucherFormProps) {
  const [formData, setFormData] = useState({
    base_code: '',
    count: 10,
    name: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed_amount',
    discount_value: 0,
    min_purchase_amount: '',
    max_discount_amount: '',
    valid_from: '',
    valid_until: '',
    usage_limit: '',
    per_user_limit: '',
    is_active: true,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVouchers, setGeneratedVouchers] = useState<GeneratedVoucher[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedVoucherForEmail, setSelectedVoucherForEmail] = useState<string | null>(null);

  const generateVouchers = async () => {
    if (!formData.base_code.trim()) {
      toast.error('Please enter a base code');
      return;
    }

    if (formData.count < 1 || formData.count > 1000) {
      toast.error('Count must be between 1 and 1000');
      return;
    }

    if (!formData.name || !formData.valid_from || !formData.valid_until) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setShowResults(true);

    const baseCode = formData.base_code.toUpperCase().trim();
    const paddingLength = Math.max(3, formData.count.toString().length);
    
    // Generate all voucher codes
    const vouchers: GeneratedVoucher[] = [];
    for (let i = 1; i <= formData.count; i++) {
      const code = `${baseCode}-${i.toString().padStart(paddingLength, '0')}`;
      vouchers.push({ code, status: 'pending' });
    }
    setGeneratedVouchers(vouchers);

    // Prepare base voucher data
    const baseVoucherData = {
      name: formData.name,
      description: formData.description || null,
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value.toString()),
      min_purchase_amount: formData.min_purchase_amount ? parseFloat(formData.min_purchase_amount.toString()) : null,
      max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount.toString()) : null,
      valid_from: new Date(formData.valid_from).toISOString(),
      valid_until: new Date(formData.valid_until).toISOString(),
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit.toString()) : null,
      per_user_limit: formData.per_user_limit ? parseInt(formData.per_user_limit.toString()) : null,
      is_active: formData.is_active,
    };

    // Insert vouchers in batches of 50
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < vouchers.length; i += batchSize) {
      const batch = vouchers.slice(i, i + batchSize);
      const voucherData = batch.map(v => ({
        ...baseVoucherData,
        code: v.code,
      }));

      try {
        const { data, error } = await supabase
          .from('vouchers' as any)
          .insert(voucherData)
          .select();

        if (error) throw error;

        // Update status for successful vouchers with their IDs
        batch.forEach((_, idx) => {
          const voucherIdx = i + idx;
          vouchers[voucherIdx].status = 'success';
          vouchers[voucherIdx].id = (data as any)?.[idx]?.id;
          successCount++;
        });
      } catch (error: any) {
        console.error('Batch insert error:', error);
        
        // Mark batch as failed
        batch.forEach((_, idx) => {
          const voucherIdx = i + idx;
          vouchers[voucherIdx].status = 'error';
          vouchers[voucherIdx].error = error.message || 'Failed to create';
          errorCount++;
        });
      }

      // Update progress
      setProgress(Math.round(((i + batch.length) / vouchers.length) * 100));
      setGeneratedVouchers([...vouchers]);

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < vouchers.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    setIsGenerating(false);

    if (errorCount === 0) {
      toast.success(`Successfully created ${successCount} vouchers!`);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } else if (successCount > 0) {
      toast.warning(`Created ${successCount} vouchers, ${errorCount} failed`);
    } else {
      toast.error('Failed to create vouchers. Please try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateVouchers();
  };

  const exportToCSV = () => {
    const successfulVouchers = generatedVouchers.filter(v => v.status === 'success');
    
    if (successfulVouchers.length === 0) {
      toast.error('No successful vouchers to export');
      return;
    }

    // CSV Headers
    const headers = [
      'Voucher Code',
      'Status',
      'Campaign Name',
      'Discount Type',
      'Discount Value',
      'Min Purchase',
      'Max Discount',
      'Valid From',
      'Valid Until',
      'Usage Limit',
      'Per User Limit',
      'Active'
    ];

    // CSV Rows
    const rows = successfulVouchers.map(voucher => [
      voucher.code,
      voucher.status,
      formData.name,
      formData.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount',
      formData.discount_type === 'percentage' 
        ? `${formData.discount_value}%` 
        : `£${formData.discount_value}`,
      formData.min_purchase_amount ? `£${formData.min_purchase_amount}` : 'None',
      formData.max_discount_amount ? `£${formData.max_discount_amount}` : 'None',
      formData.valid_from ? format(new Date(formData.valid_from), 'yyyy-MM-dd HH:mm') : '',
      formData.valid_until ? format(new Date(formData.valid_until), 'yyyy-MM-dd HH:mm') : '',
      formData.usage_limit || 'Unlimited',
      formData.per_user_limit || 'Unlimited',
      formData.is_active ? 'Yes' : 'No'
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
    const filename = `vouchers-${formData.base_code.toLowerCase()}-${timestamp}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${successfulVouchers.length} vouchers to ${filename}`);
  };

  const exportAllToCSV = () => {
    if (generatedVouchers.length === 0) {
      toast.error('No vouchers to export');
      return;
    }

    // CSV Headers
    const headers = [
      'Voucher Code',
      'Status',
      'Error Message',
      'Campaign Name',
      'Discount Type',
      'Discount Value',
      'Min Purchase',
      'Max Discount',
      'Valid From',
      'Valid Until',
      'Usage Limit',
      'Per User Limit',
      'Active'
    ];

    // CSV Rows (include all vouchers with their status)
    const rows = generatedVouchers.map(voucher => [
      voucher.code,
      voucher.status,
      voucher.error || '',
      formData.name,
      formData.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount',
      formData.discount_type === 'percentage' 
        ? `${formData.discount_value}%` 
        : `£${formData.discount_value}`,
      formData.min_purchase_amount ? `£${formData.min_purchase_amount}` : 'None',
      formData.max_discount_amount ? `£${formData.max_discount_amount}` : 'None',
      formData.valid_from ? format(new Date(formData.valid_from), 'yyyy-MM-dd HH:mm') : '',
      formData.valid_until ? format(new Date(formData.valid_until), 'yyyy-MM-dd HH:mm') : '',
      formData.usage_limit || 'Unlimited',
      formData.per_user_limit || 'Unlimited',
      formData.is_active ? 'Yes' : 'No'
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
    const filename = `vouchers-all-${formData.base_code.toLowerCase()}-${timestamp}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported all ${generatedVouchers.length} vouchers to ${filename}`);
  };

  if (showResults) {
    const successCount = generatedVouchers.filter(v => v.status === 'success').length;
    const errorCount = generatedVouchers.filter(v => v.status === 'error').length;
    const pendingCount = generatedVouchers.filter(v => v.status === 'pending').length;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {isGenerating ? 'Generating vouchers...' : 'Generation complete'}
            </span>
            <span className="text-sm text-muted-foreground">
              {progress}%
            </span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{successCount}</div>
                <div className="text-sm text-muted-foreground">Success</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-h-[300px] overflow-y-auto border rounded-lg p-4 space-y-2">
          {generatedVouchers.map((voucher, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="font-mono text-sm">{voucher.code}</span>
              <div className="flex items-center gap-2">
                {voucher.status === 'success' && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                {voucher.status === 'error' && (
                  <span className="text-xs text-red-600">{voucher.error}</span>
                )}
                {voucher.status === 'pending' && (
                  <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                )}
              </div>
            </div>
          ))}
        </div>

        {!isGenerating && (
          <>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={exportToCSV}
                  disabled={successCount === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Successful ({successCount})
                </Button>
                <Button 
                  variant="outline" 
                  onClick={exportAllToCSV}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All ({generatedVouchers.length})
                </Button>
                {successCount > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const firstSuccess = generatedVouchers.find(v => v.status === 'success' && v.id);
                      if (firstSuccess && firstSuccess.id) {
                        setSelectedVoucherForEmail(firstSuccess.id);
                        setEmailDialogOpen(true);
                      }
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send via Email
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setShowResults(false);
                  setGeneratedVouchers([]);
                  setProgress(0);
                }}>
                  Create More
                </Button>
                <Button onClick={onSuccess}>
                  Done
                </Button>
              </div>
            </div>
            
            {selectedVoucherForEmail && generatedVouchers.find(v => v.status === 'success' && v.code)?.code && (
              <EmailDistributionDialog
                open={emailDialogOpen}
                onOpenChange={setEmailDialogOpen}
                voucherId={selectedVoucherForEmail}
                voucherCode={generatedVouchers.find(v => v.id === selectedVoucherForEmail)?.code || ''}
              />
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="base_code">Base Code Prefix *</Label>
          <Input
            id="base_code"
            value={formData.base_code}
            onChange={(e) => setFormData({ ...formData, base_code: e.target.value })}
            placeholder="SUMMER2024"
            required
            className="uppercase"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Codes will be: {formData.base_code.toUpperCase() || 'PREFIX'}-001, {formData.base_code.toUpperCase() || 'PREFIX'}-002, etc.
          </p>
        </div>
        
        <div>
          <Label htmlFor="count">Number of Vouchers *</Label>
          <Input
            id="count"
            type="number"
            min="1"
            max="1000"
            value={formData.count}
            onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) || 1 })}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Maximum 1000 vouchers per batch
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="name">Campaign Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Summer Sale 2024"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional description for internal reference"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="discount_type">Discount Type *</Label>
          <Select
            value={formData.discount_type}
            onValueChange={(value: any) => setFormData({ ...formData, discount_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="discount_value">
            {formData.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount (£)'} *
          </Label>
          <Input
            id="discount_value"
            type="number"
            step="0.01"
            min="0"
            max={formData.discount_type === 'percentage' ? '100' : undefined}
            value={formData.discount_value}
            onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="min_purchase">Minimum Purchase (£)</Label>
          <Input
            id="min_purchase"
            type="number"
            step="0.01"
            min="0"
            value={formData.min_purchase_amount}
            onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
            placeholder="Optional"
          />
        </div>
        
        <div>
          <Label htmlFor="max_discount">Max Discount Cap (£)</Label>
          <Input
            id="max_discount"
            type="number"
            step="0.01"
            min="0"
            value={formData.max_discount_amount}
            onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="valid_from">Valid From *</Label>
          <Input
            id="valid_from"
            type="datetime-local"
            value={formData.valid_from}
            onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="valid_until">Valid Until *</Label>
          <Input
            id="valid_until"
            type="datetime-local"
            value={formData.valid_until}
            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="usage_limit">Usage Limit (Per Voucher)</Label>
          <Input
            id="usage_limit"
            type="number"
            min="1"
            value={formData.usage_limit}
            onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
            placeholder="Unlimited"
          />
        </div>
        
        <div>
          <Label htmlFor="per_user_limit">Per User Limit</Label>
          <Input
            id="per_user_limit"
            type="number"
            min="1"
            value={formData.per_user_limit}
            onChange={(e) => setFormData({ ...formData, per_user_limit: e.target.value })}
            placeholder="Unlimited"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            `Generate ${formData.count} Vouchers`
          )}
        </Button>
      </div>
    </form>
  );
}
