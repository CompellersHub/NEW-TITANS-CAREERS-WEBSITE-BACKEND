import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Edit, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const StaticPagesManager = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);

  const { data: pages, isLoading } = useQuery({
    queryKey: ['content-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_pages' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: any) => {
      const { error } = await supabase
        .from('content_pages' as any)
        .update(values)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-pages'] });
      toast.success('Page updated successfully');
      setIsDialogOpen(false);
      setEditingPage(null);
    },
    onError: () => toast.error('Failed to update page'),
  });

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const { error} = await supabase.from('content_pages' as any).insert([values]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-pages'] });
      toast.success('Page created successfully');
      setIsDialogOpen(false);
      setEditingPage(null);
    },
    onError: () => toast.error('Failed to create page'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = {
      slug: formData.get('slug'),
      title: formData.get('title'),
      content: formData.get('content'),
      meta_title: formData.get('meta_title'),
      meta_description: formData.get('meta_description'),
      is_published: formData.get('is_published') === 'on',
    };

    if (editingPage) {
      updateMutation.mutate({ id: editingPage.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Static Pages</h3>
          <p className="text-sm text-muted-foreground">Manage About, Terms, Privacy, and other static pages</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPage(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPage ? 'Edit Page' : 'Add Page'}</DialogTitle>
              <DialogDescription>
                Update page content, meta information, and publishing status
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Page Slug *</Label>
                  <Input
                    id="slug"
                    name="slug"
                    defaultValue={editingPage?.slug}
                    required
                    placeholder="about"
                    disabled={!!editingPage}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Page Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingPage?.title}
                    required
                    placeholder="About Us"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  name="content"
                  defaultValue={editingPage?.content}
                  required
                  placeholder="Page content (supports HTML)..."
                  rows={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title (SEO)</Label>
                <Input
                  id="meta_title"
                  name="meta_title"
                  defaultValue={editingPage?.meta_title}
                  placeholder="About Us - Company Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description (SEO)</Label>
                <Textarea
                  id="meta_description"
                  name="meta_description"
                  defaultValue={editingPage?.meta_description}
                  placeholder="Learn about our company..."
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_published"
                  name="is_published"
                  defaultChecked={editingPage?.is_published ?? true}
                />
                <Label htmlFor="is_published">Published (visible to users)</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingPage ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading pages...</div>
      ) : (
        <div className="grid gap-4">
          {pages?.map((page) => (
            <Card key={page.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{page.title}</CardTitle>
                    <CardDescription className="mt-1">/{page.slug}</CardDescription>
                  </div>
                  <Badge variant={page.is_published ? "default" : "secondary"}>
                    {page.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {page.content?.substring(0, 150)}...
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingPage(page);
                    setIsDialogOpen(true);
                  }}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit Page
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
