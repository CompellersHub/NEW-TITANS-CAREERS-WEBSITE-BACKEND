import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Tag, Calendar, TrendingUp, BarChart3, Sparkles, Download, Mail, LineChart } from "lucide-react";
import { format } from "date-fns";
import { PageLayout } from "@/components/layouts/PageLayout";
import { useNavigate } from "react-router-dom";
import { BulkVoucherForm } from "@/components/voucher/BulkVoucherForm";
import { EmailDistributionDialog } from "@/components/voucher/EmailDistributionDialog";
import { ScheduledCampaignDialog } from "@/components/voucher/ScheduledCampaignDialog";

interface Voucher {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_purchase_amount: number | null;
  max_discount_amount: number | null;
  valid_from: string;
  valid_until: string;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number | null;
  applicable_courses: string[] | null;
  is_active: boolean;
  created_at: string;
}

export default function VoucherManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedVoucherForEmail, setSelectedVoucherForEmail] = useState<Voucher | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedVoucherForSchedule, setSelectedVoucherForSchedule] = useState<Voucher | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: vouchers, isLoading } = useQuery({
    queryKey: ['vouchers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vouchers' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as any as Voucher[];
    }
  });

  const { data: usageStats } = useQuery({
    queryKey: ['voucher-usage-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voucher_usage' as any)
        .select('voucher_id, discount_amount');
      
      if (error) throw error;
      
      const stats = (data as any[]).reduce((acc, usage) => {
        if (!acc[usage.voucher_id]) {
          acc[usage.voucher_id] = { count: 0, totalDiscount: 0 };
        }
        acc[usage.voucher_id].count += 1;
        acc[usage.voucher_id].totalDiscount += parseFloat(usage.discount_amount.toString());
        return acc;
      }, {} as Record<string, { count: number; totalDiscount: number }>);
      
      return stats;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vouchers' as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      toast.success('Voucher deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete voucher');
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('vouchers' as any)
        .update({ is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] });
      toast.success('Voucher status updated');
    },
    onError: () => {
      toast.error('Failed to update voucher status');
    }
  });

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this voucher?')) {
      deleteMutation.mutate(id);
    }
  };

  const isExpired = (validUntil: string) => new Date(validUntil) < new Date();
  const isUpcoming = (validFrom: string) => new Date(validFrom) > new Date();

  return (
    <PageLayout intensity3D="subtle" show3D={true}>
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Voucher Manager</h1>
            <p className="text-muted-foreground mt-2">Create and manage discount vouchers</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/scheduled-campaigns')}>
              <Calendar className="h-4 w-4 mr-2" />
              Scheduled Campaigns
            </Button>
            
            <Button variant="outline" onClick={() => navigate('/admin/voucher-export')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button variant="outline" onClick={() => navigate('/admin/vouchers/analytics')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Voucher Analytics
            </Button>
            
            <Button variant="outline" onClick={() => navigate('/admin/vouchers/campaign-analytics')}>
              <LineChart className="h-4 w-4 mr-2" />
              Campaign Analytics
            </Button>

            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Bulk Create
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Bulk Create Vouchers</DialogTitle>
                </DialogHeader>
                <BulkVoucherForm 
                  onSuccess={() => {
                    setIsBulkDialogOpen(false);
                    queryClient.invalidateQueries({ queryKey: ['vouchers'] });
                  }} 
                />
              </DialogContent>
            </Dialog>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setEditingVoucher(null);
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Voucher
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingVoucher ? 'Edit Voucher' : 'Create New Voucher'}</DialogTitle>
                </DialogHeader>
                <VoucherForm 
                  voucher={editingVoucher} 
                  onSuccess={() => {
                    setIsDialogOpen(false);
                    setEditingVoucher(null);
                    queryClient.invalidateQueries({ queryKey: ['vouchers'] });
                  }} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : vouchers && vouchers.length > 0 ? (
          <div className="grid gap-4">
            {vouchers.map((voucher) => {
              const expired = isExpired(voucher.valid_until);
              const upcoming = isUpcoming(voucher.valid_from);
              const stats = usageStats?.[voucher.id];
              
              return (
                <Card key={voucher.id} className={!voucher.is_active || expired ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-2xl font-mono">{voucher.code}</CardTitle>
                          {!voucher.is_active && <Badge variant="secondary">Inactive</Badge>}
                          {expired && <Badge variant="destructive">Expired</Badge>}
                          {upcoming && <Badge variant="secondary">Upcoming</Badge>}
                          {voucher.is_active && !expired && !upcoming && (
                            <Badge className="bg-green-500">Active</Badge>
                          )}
                        </div>
                        <CardDescription className="text-base">{voucher.name}</CardDescription>
                        {voucher.description && (
                          <p className="text-sm text-muted-foreground mt-1">{voucher.description}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedVoucherForEmail(voucher);
                            setEmailDialogOpen(true);
                          }}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedVoucherForSchedule(voucher);
                            setScheduleDialogOpen(true);
                          }}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(voucher)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(voucher.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Discount</div>
                        <div className="text-lg font-semibold text-primary">
                          {voucher.discount_type === 'percentage' 
                            ? `${voucher.discount_value}%` 
                            : `£${voucher.discount_value}`}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground">Usage</div>
                        <div className="text-lg font-semibold">
                          {voucher.usage_count}
                          {voucher.usage_limit ? ` / ${voucher.usage_limit}` : ' / ∞'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground">Valid Until</div>
                        <div className="text-sm font-medium">
                          {format(new Date(voucher.valid_until), 'dd MMM yyyy')}
                        </div>
                      </div>
                      
                      {stats && (
                        <div>
                          <div className="text-sm text-muted-foreground">Total Discounts</div>
                          <div className="text-lg font-semibold text-green-600">
                            £{stats.totalDiscount.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 pt-4 border-t">
                      <Switch
                        checked={voucher.is_active}
                        onCheckedChange={(checked) => 
                          toggleActiveMutation.mutate({ id: voucher.id, is_active: checked })
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {voucher.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No vouchers yet</h3>
              <p className="text-muted-foreground mb-4">Create your first voucher to get started</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Voucher
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
      
      {selectedVoucherForEmail && (
        <EmailDistributionDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          voucherId={selectedVoucherForEmail.id}
          voucherCode={selectedVoucherForEmail.code}
        />
      )}
      
      {selectedVoucherForSchedule && (
        <ScheduledCampaignDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          voucherId={selectedVoucherForSchedule.id}
          voucherCode={selectedVoucherForSchedule.code}
        />
      )}
    </PageLayout>
  );
}

function VoucherForm({ voucher, onSuccess }: { voucher: Voucher | null; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    code: voucher?.code || '',
    name: voucher?.name || '',
    description: voucher?.description || '',
    discount_type: voucher?.discount_type || 'percentage',
    discount_value: voucher?.discount_value || 0,
    min_purchase_amount: voucher?.min_purchase_amount || '',
    max_discount_amount: voucher?.max_discount_amount || '',
    valid_from: voucher?.valid_from ? format(new Date(voucher.valid_from), "yyyy-MM-dd'T'HH:mm") : '',
    valid_until: voucher?.valid_until ? format(new Date(voucher.valid_until), "yyyy-MM-dd'T'HH:mm") : '',
    usage_limit: voucher?.usage_limit || '',
    per_user_limit: voucher?.per_user_limit || '',
    is_active: voucher?.is_active ?? true,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        code: formData.code.toUpperCase(),
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

      if (voucher) {
        const { error } = await supabase
          .from('vouchers' as any)
          .update(data)
          .eq('id', voucher.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('vouchers' as any)
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(voucher ? 'Voucher updated successfully' : 'Voucher created successfully');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save voucher');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code">Voucher Code *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="SAVE20"
            required
            className="uppercase"
          />
        </div>
        
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Summer Sale"
            required
          />
        </div>
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
          <Label htmlFor="usage_limit">Total Usage Limit</Label>
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
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Saving...' : voucher ? 'Update Voucher' : 'Create Voucher'}
        </Button>
      </div>
    </form>
  );
}
