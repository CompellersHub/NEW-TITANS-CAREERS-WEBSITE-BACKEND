import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const SiteSettingsManager = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<any>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings' as any)
        .select('*')
        .order('category', { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: any) => {
      const { error } = await supabase
        .from('site_settings' as any)
        .update(values)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Setting updated');
      setIsDialogOpen(false);
      setEditingSetting(null);
    },
    onError: () => toast.error('Failed to update setting'),
  });

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase.from('site_settings' as any).insert([values]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Setting created');
      setIsDialogOpen(false);
      setEditingSetting(null);
    },
    onError: () => toast.error('Failed to create setting'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let settingValue;
    try {
      settingValue = JSON.parse(formData.get('setting_value') as string);
    } catch {
      settingValue = formData.get('setting_value');
    }

    const values = {
      setting_key: formData.get('setting_key'),
      setting_value: settingValue,
      description: formData.get('description'),
      category: formData.get('category'),
    };

    if (editingSetting) {
      updateMutation.mutate({ id: editingSetting.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Site Settings</h3>
          <p className="text-sm text-muted-foreground">Manage global site settings and configurations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSetting(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Setting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSetting ? 'Edit Setting' : 'Add Setting'}</DialogTitle>
              <DialogDescription>
                Configure site-wide settings (use JSON for complex values)
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="setting_key">Key *</Label>
                  <Input
                    id="setting_key"
                    name="setting_key"
                    defaultValue={editingSetting?.setting_key}
                    required
                    disabled={!!editingSetting}
                    placeholder="site_name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    defaultValue={editingSetting?.category || 'general'}
                    placeholder="general"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="setting_value">Value (JSON) *</Label>
                <Textarea
                  id="setting_value"
                  name="setting_value"
                  defaultValue={
                    typeof editingSetting?.setting_value === 'string'
                      ? editingSetting.setting_value
                      : JSON.stringify(editingSetting?.setting_value, null, 2)
                  }
                  required
                  placeholder='{"value": "example"}'
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingSetting?.description}
                  placeholder="What this setting controls..."
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingSetting ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading settings...</div>
      ) : (
        <div className="grid gap-4">
          {settings?.map((setting) => (
            <Card key={setting.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-mono">{setting.setting_key}</CardTitle>
                    {setting.description && (
                      <CardDescription className="mt-1">{setting.description}</CardDescription>
                    )}
                  </div>
                  <Badge variant="outline">{setting.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto mb-4">
                  {JSON.stringify(setting.setting_value, null, 2)}
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingSetting(setting);
                    setIsDialogOpen(true);
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
