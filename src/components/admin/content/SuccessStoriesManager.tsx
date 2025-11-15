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
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const SuccessStoriesManager = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<any>(null);

  const { data: stories, isLoading } = useQuery({
    queryKey: ['success-stories-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('success_stories_content' as any)
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as any[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase.from('success_stories_content' as any).insert([values]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['success-stories-content'] });
      toast.success('Success story created');
      setIsDialogOpen(false);
      setEditingStory(null);
    },
    onError: () => toast.error('Failed to create success story'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: any) => {
      const { error } = await supabase
        .from('success_stories_content' as any)
        .update(values)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['success-stories-content'] });
      toast.success('Success story updated');
      setIsDialogOpen(false);
      setEditingStory(null);
    },
    onError: () => toast.error('Failed to update success story'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('success_stories_content' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['success-stories-content'] });
      toast.success('Success story deleted');
    },
    onError: () => toast.error('Failed to delete success story'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = {
      name: formData.get('name'),
      role: formData.get('role'),
      company: formData.get('company'),
      story: formData.get('story'),
      image_url: formData.get('image_url'),
      previous_role: formData.get('previous_role'),
      salary: formData.get('salary'),
      display_order: parseInt(formData.get('display_order') as string) || 0,
      is_active: formData.get('is_active') === 'on',
    };

    if (editingStory) {
      updateMutation.mutate({ id: editingStory.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Success Stories</h3>
          <p className="text-sm text-muted-foreground">Manage student success stories and transformations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingStory(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Story
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStory ? 'Edit Success Story' : 'Add Success Story'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingStory?.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Current Role *</Label>
                  <Input
                    id="role"
                    name="role"
                    defaultValue={editingStory?.role}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    name="company"
                    defaultValue={editingStory?.company}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previous_role">Previous Role</Label>
                  <Input
                    id="previous_role"
                    name="previous_role"
                    defaultValue={editingStory?.previous_role}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="story">Success Story *</Label>
                <Textarea
                  id="story"
                  name="story"
                  defaultValue={editingStory?.story}
                  required
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    name="salary"
                    defaultValue={editingStory?.salary}
                    placeholder="£50,000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    defaultValue={editingStory?.image_url}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order">Order</Label>
                  <Input
                    id="display_order"
                    name="display_order"
                    type="number"
                    defaultValue={editingStory?.display_order || 0}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  name="is_active"
                  defaultChecked={editingStory?.is_active ?? true}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingStory ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading success stories...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {stories?.map((story) => (
            <Card key={story.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{story.name}</CardTitle>
                    <CardDescription>
                      {story.role} at {story.company}
                    </CardDescription>
                  </div>
                  <Badge variant={story.is_active ? "default" : "secondary"}>
                    {story.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {story.story}
                </p>
                {story.previous_role && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Previously: {story.previous_role}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingStory(story);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Delete this success story?')) {
                        deleteMutation.mutate(story.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
