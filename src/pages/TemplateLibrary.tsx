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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ArrowLeft, Plus, Eye, Edit, Trash2, Copy, FileText } from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  description: string | null;
  campaign_type: string;
  subject: string;
  html_content: string;
  preview_text: string | null;
  source_type: string;
  source_id: string | null;
  tags: string[];
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
}

const TemplateLibrary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewContent, setPreviewContent] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    campaignType: "",
    subject: "",
    htmlContent: "",
    previewText: "",
    tags: "",
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

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["emailTemplates", filterType, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("email_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterType !== "all") {
        query = query.eq("campaign_type", filterType);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as EmailTemplate[];
    },
    enabled: isAdmin,
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .insert({
          name: formData.name,
          description: formData.description || null,
          campaign_type: formData.campaignType,
          subject: formData.subject,
          html_content: formData.htmlContent,
          preview_text: formData.previewText || null,
          source_type: "manual",
          tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Template created successfully");
      queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTemplate) return;
      
      const { data, error } = await supabase
        .from("email_templates")
        .update({
          name: formData.name,
          description: formData.description || null,
          campaign_type: formData.campaignType,
          subject: formData.subject,
          html_content: formData.htmlContent,
          preview_text: formData.previewText || null,
          tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
        })
        .eq("id", selectedTemplate.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Template updated successfully");
      queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
      setShowEditDialog(false);
      setSelectedTemplate(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from("email_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Template deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });

  // Duplicate template mutation
  const duplicateTemplateMutation = useMutation({
    mutationFn: async (template: EmailTemplate) => {
      const { data, error } = await supabase
        .from("email_templates")
        .insert({
          name: `${template.name} (Copy)`,
          description: template.description,
          campaign_type: template.campaign_type,
          subject: template.subject,
          html_content: template.html_content,
          preview_text: template.preview_text,
          source_type: "manual",
          tags: template.tags,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Template duplicated successfully");
      queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to duplicate template: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      campaignType: "",
      subject: "",
      htmlContent: "",
      previewText: "",
      tags: "",
    });
  };

  const openEditDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      campaignType: template.campaign_type,
      subject: template.subject,
      htmlContent: template.html_content,
      previewText: template.preview_text || "",
      tags: template.tags.join(", "),
    });
    setShowEditDialog(true);
  };

  const getSourceBadge = (sourceType: string) => {
    const colors: Record<string, "default" | "secondary" | "outline"> = {
      ab_test_winner: "default",
      campaign: "secondary",
      manual: "outline",
    };
    const labels: Record<string, string> = {
      ab_test_winner: "A/B Winner",
      campaign: "Campaign",
      manual: "Manual",
    };
    return <Badge variant={colors[sourceType]}>{labels[sourceType]}</Badge>;
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
              <h1 className="text-4xl font-bold text-foreground">Template Library</h1>
              <p className="text-muted-foreground mt-2">Save and reuse successful email templates</p>
            </div>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Create a reusable email template
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Career Tips Newsletter V1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this template"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="campaignType">Campaign Type</Label>
                  <Select value={formData.campaignType} onValueChange={(value) => setFormData({ ...formData, campaignType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="career_tips">Career Tips</SelectItem>
                      <SelectItem value="job_alerts">Job Alerts</SelectItem>
                      <SelectItem value="course_updates">Course Updates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Email subject"
                  />
                </div>
                <div>
                  <Label htmlFor="previewText">Preview Text</Label>
                  <Input
                    id="previewText"
                    value={formData.previewText}
                    onChange={(e) => setFormData({ ...formData, previewText: e.target.value })}
                    placeholder="Preview text (optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="htmlContent">HTML Content</Label>
                  <Textarea
                    id="htmlContent"
                    value={formData.htmlContent}
                    onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                    placeholder="Email HTML content"
                    rows={10}
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., high-converting, newsletter, promotional"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createTemplateMutation.mutate()}
                    disabled={!formData.name || !formData.campaignType || !formData.subject || !formData.htmlContent}
                  >
                    Create Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="career_tips">Career Tips</SelectItem>
              <SelectItem value="job_alerts">Job Alerts</SelectItem>
              <SelectItem value="course_updates">Course Updates</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <p>Loading templates...</p>
        ) : templates.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No templates found. Create your first template!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">{template.description || "No description"}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {getSourceBadge(template.source_type)}
                    <Badge variant="outline">{template.campaign_type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Subject</p>
                      <p className="text-sm truncate">{template.subject}</p>
                    </div>
                    {template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      <p>Used {template.usage_count} times</p>
                      <p>Created {new Date(template.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewContent(template.html_content)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(template)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => duplicateTemplateMutation.mutate(template)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicate
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this template. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteTemplateMutation.mutate(template.id)}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>Update template details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Template Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="edit-campaignType">Campaign Type</Label>
              <Select value={formData.campaignType} onValueChange={(value) => setFormData({ ...formData, campaignType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="career_tips">Career Tips</SelectItem>
                  <SelectItem value="job_alerts">Job Alerts</SelectItem>
                  <SelectItem value="course_updates">Course Updates</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-subject">Subject Line</Label>
              <Input
                id="edit-subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-previewText">Preview Text</Label>
              <Input
                id="edit-previewText"
                value={formData.previewText}
                onChange={(e) => setFormData({ ...formData, previewText: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-htmlContent">HTML Content</Label>
              <Textarea
                id="edit-htmlContent"
                value={formData.htmlContent}
                onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                rows={10}
              />
            </div>
            <div>
              <Label htmlFor="edit-tags">Tags (comma separated)</Label>
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => updateTemplateMutation.mutate()}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewContent} onOpenChange={() => setPreviewContent("")}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          <div
            className="border rounded p-4 overflow-auto"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateLibrary;
