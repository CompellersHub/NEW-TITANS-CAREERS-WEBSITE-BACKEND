import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit, Trash2, Users, Tag, TrendingUp } from "lucide-react";
import { z } from "zod";
import { SegmentManagerSkeleton } from "@/components/admin/SegmentManagerSkeleton";

const segmentSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(100, "Name must be less than 100 characters"),
  description: z.string().trim().max(500, "Description must be less than 500 characters").optional(),
  tagsInclude: z.string().trim().max(500, "Tags must be less than 500 characters"),
  tagsExclude: z.string().trim().max(500, "Tags must be less than 500 characters"),
  minEngagement: z.number().min(0).max(100),
  maxEngagement: z.number().min(0).max(100),
});

interface Segment {
  id: string;
  name: string;
  description: string | null;
  tags_include: string[];
  tags_exclude: string[];
  min_engagement_score: number;
  max_engagement_score: number;
  subscriber_count: number;
  created_at: string;
}

const SegmentManager = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tagsInclude: "",
    tagsExclude: "",
    minEngagement: 0,
    maxEngagement: 100,
  });

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ["userRole", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!user?.id,
  });

  // Fetch segments
  const { data: segments = [], isLoading } = useQuery({
    queryKey: ["subscriberSegments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriber_segments")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Calculate subscriber counts for each segment
      const segmentsWithCounts = await Promise.all(
        data.map(async (segment) => {
          const { data: countData } = await supabase.rpc("get_segment_count", {
            segment_id: segment.id,
          });
          return { ...segment, subscriber_count: countData || 0 };
        })
      );
      
      return segmentsWithCounts as Segment[];
    },
    enabled: isAdmin,
  });

  // Get all unique tags from subscribers
  const { data: allTags = [] } = useQuery({
    queryKey: ["subscriberTags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("tags");
      
      if (error) throw error;
      
      const tagsSet = new Set<string>();
      data.forEach((sub: any) => {
        if (sub.tags) {
          sub.tags.forEach((tag: string) => tagsSet.add(tag));
        }
      });
      
      return Array.from(tagsSet).sort();
    },
    enabled: isAdmin,
  });

  // Create segment mutation
  const createSegmentMutation = useMutation({
    mutationFn: async () => {
      const validation = segmentSchema.safeParse(formData);
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      const { data, error } = await supabase
        .from("subscriber_segments")
        .insert({
          name: formData.name,
          description: formData.description || null,
          tags_include: formData.tagsInclude ? formData.tagsInclude.split(",").map(t => t.trim()) : [],
          tags_exclude: formData.tagsExclude ? formData.tagsExclude.split(",").map(t => t.trim()) : [],
          min_engagement_score: formData.minEngagement,
          max_engagement_score: formData.maxEngagement,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Segment created successfully");
      queryClient.invalidateQueries({ queryKey: ["subscriberSegments"] });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create segment: ${error.message}`);
    },
  });

  // Update segment mutation
  const updateSegmentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSegment) return;
      
      const validation = segmentSchema.safeParse(formData);
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      const { data, error } = await supabase
        .from("subscriber_segments")
        .update({
          name: formData.name,
          description: formData.description || null,
          tags_include: formData.tagsInclude ? formData.tagsInclude.split(",").map(t => t.trim()) : [],
          tags_exclude: formData.tagsExclude ? formData.tagsExclude.split(",").map(t => t.trim()) : [],
          min_engagement_score: formData.minEngagement,
          max_engagement_score: formData.maxEngagement,
        })
        .eq("id", selectedSegment.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Segment updated successfully");
      queryClient.invalidateQueries({ queryKey: ["subscriberSegments"] });
      setShowEditDialog(false);
      setSelectedSegment(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update segment: ${error.message}`);
    },
  });

  // Delete segment mutation
  const deleteSegmentMutation = useMutation({
    mutationFn: async (segmentId: string) => {
      const { error } = await supabase
        .from("subscriber_segments")
        .delete()
        .eq("id", segmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Segment deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["subscriberSegments"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete segment: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      tagsInclude: "",
      tagsExclude: "",
      minEngagement: 0,
      maxEngagement: 100,
    });
  };

  const openEditDialog = (segment: Segment) => {
    setSelectedSegment(segment);
    setFormData({
      name: segment.name,
      description: segment.description || "",
      tagsInclude: segment.tags_include.join(", "),
      tagsExclude: segment.tags_exclude.join(", "),
      minEngagement: segment.min_engagement_score,
      maxEngagement: segment.max_engagement_score,
    });
    setShowEditDialog(true);
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You must be an admin to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <SegmentManagerSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Segment Manager</h1>
              <p className="text-muted-foreground mt-2">Create and manage subscriber segments</p>
            </div>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Segment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Segment</DialogTitle>
                <DialogDescription>
                  Define criteria to group subscribers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Segment Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Highly Engaged Subscribers"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this segment"
                    rows={2}
                    maxLength={500}
                  />
                </div>
                <div className="border-t pt-4">
                  <Label className="text-base font-semibold">Tag Filters</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Available tags: {allTags.length > 0 ? allTags.join(", ") : "No tags yet"}
                  </p>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="tagsInclude">Include Tags (comma separated)</Label>
                      <Input
                        id="tagsInclude"
                        value={formData.tagsInclude}
                        onChange={(e) => setFormData({ ...formData, tagsInclude: e.target.value })}
                        placeholder="e.g., premium, newsletter"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Subscribers must have at least one of these tags
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="tagsExclude">Exclude Tags (comma separated)</Label>
                      <Input
                        id="tagsExclude"
                        value={formData.tagsExclude}
                        onChange={(e) => setFormData({ ...formData, tagsExclude: e.target.value })}
                        placeholder="e.g., unsubscribed, inactive"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Subscribers with these tags will be excluded
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <Label className="text-base font-semibold">Engagement Score Range</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Filter by engagement score (0-100)
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minEngagement">Minimum Score</Label>
                      <Input
                        id="minEngagement"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.minEngagement}
                        onChange={(e) => setFormData({ ...formData, minEngagement: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxEngagement">Maximum Score</Label>
                      <Input
                        id="maxEngagement"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.maxEngagement}
                        onChange={(e) => setFormData({ ...formData, maxEngagement: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createSegmentMutation.mutate()}
                    disabled={!formData.name}
                  >
                    Create Segment
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Segments Grid */}
        {isLoading ? (
          <p>Loading segments...</p>
        ) : segments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No segments created yet. Create your first segment!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {segments.map((segment) => (
              <Card key={segment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{segment.name}</CardTitle>
                      <CardDescription className="mt-1">{segment.description || "No description"}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subscribers</span>
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {segment.subscriber_count}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Engagement</span>
                      <Badge variant="outline">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {segment.min_engagement_score}-{segment.max_engagement_score}
                      </Badge>
                    </div>
                    {segment.tags_include.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Includes tags:</p>
                        <div className="flex flex-wrap gap-1">
                          {segment.tags_include.map((tag, i) => (
                            <Badge key={i} variant="default" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {segment.tags_exclude.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Excludes tags:</p>
                        <div className="flex flex-wrap gap-1">
                          {segment.tags_exclude.map((tag, i) => (
                            <Badge key={i} variant="destructive" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(segment)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Segment?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this segment. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteSegmentMutation.mutate(segment.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Segment</DialogTitle>
            <DialogDescription>Update segment criteria</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Segment Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                maxLength={500}
              />
            </div>
            <div className="border-t pt-4">
              <Label className="text-base font-semibold">Tag Filters</Label>
              <div className="space-y-3 mt-3">
                <div>
                  <Label htmlFor="edit-tagsInclude">Include Tags</Label>
                  <Input
                    id="edit-tagsInclude"
                    value={formData.tagsInclude}
                    onChange={(e) => setFormData({ ...formData, tagsInclude: e.target.value })}
                    maxLength={500}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tagsExclude">Exclude Tags</Label>
                  <Input
                    id="edit-tagsExclude"
                    value={formData.tagsExclude}
                    onChange={(e) => setFormData({ ...formData, tagsExclude: e.target.value })}
                    maxLength={500}
                  />
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <Label className="text-base font-semibold">Engagement Score Range</Label>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <Label htmlFor="edit-minEngagement">Minimum Score</Label>
                  <Input
                    id="edit-minEngagement"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.minEngagement}
                    onChange={(e) => setFormData({ ...formData, minEngagement: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-maxEngagement">Maximum Score</Label>
                  <Input
                    id="edit-maxEngagement"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.maxEngagement}
                    onChange={(e) => setFormData({ ...formData, maxEngagement: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => updateSegmentMutation.mutate()}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SegmentManager;
