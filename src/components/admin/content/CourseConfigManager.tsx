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

export const CourseConfigManager = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['course-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_configurations' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase.from('course_configurations' as any).insert([values]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-configs'] });
      toast.success('Course created successfully');
      setIsDialogOpen(false);
      setEditingCourse(null);
    },
    onError: () => toast.error('Failed to create course'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: any) => {
      const { error } = await supabase
        .from('course_configurations' as any)
        .update(values)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-configs'] });
      toast.success('Course updated successfully');
      setIsDialogOpen(false);
      setEditingCourse(null);
    },
    onError: () => toast.error('Failed to update course'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('course_configurations' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-configs'] });
      toast.success('Course deleted successfully');
    },
    onError: () => toast.error('Failed to delete course'),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = {
      course_slug: formData.get('course_slug'),
      course_title: formData.get('course_title'),
      price: parseFloat(formData.get('price') as string),
      start_date: formData.get('start_date') || null,
      end_date: formData.get('end_date') || null,
      max_students: parseInt(formData.get('max_students') as string) || null,
      description: formData.get('description'),
      is_active: formData.get('is_active') === 'on',
    };

    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Course Configurations</h3>
          <p className="text-sm text-muted-foreground">Manage course prices, dates, and availability</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCourse(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCourse ? 'Edit Course' : 'Add Course'}</DialogTitle>
              <DialogDescription>
                Configure course details, pricing, and availability
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course_slug">Course Slug *</Label>
                  <Input
                    id="course_slug"
                    name="course_slug"
                    defaultValue={editingCourse?.course_slug}
                    required
                    placeholder="data-analysis"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course_title">Course Title *</Label>
                  <Input
                    id="course_title"
                    name="course_title"
                    defaultValue={editingCourse?.course_title}
                    required
                    placeholder="Data Analysis Masterclass"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (£) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={editingCourse?.price}
                    required
                    placeholder="299.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_students">Max Students</Label>
                  <Input
                    id="max_students"
                    name="max_students"
                    type="number"
                    defaultValue={editingCourse?.max_students}
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    defaultValue={editingCourse?.start_date}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    defaultValue={editingCourse?.end_date}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingCourse?.description}
                  placeholder="Course description..."
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  name="is_active"
                  defaultChecked={editingCourse?.is_active ?? true}
                />
                <Label htmlFor="is_active">Active (visible to users)</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingCourse ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading courses...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses?.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{course.course_title}</CardTitle>
                    <CardDescription className="mt-1">{course.course_slug}</CardDescription>
                  </div>
                  <Badge variant={course.is_active ? "default" : "secondary"}>
                    {course.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-semibold">£{course.price}</span>
                  </div>
                  {course.start_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span>{new Date(course.start_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {course.max_students && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Students:</span>
                      <span>{course.max_students}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingCourse(course);
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
                      if (confirm('Are you sure you want to delete this course?')) {
                        deleteMutation.mutate(course.id);
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
