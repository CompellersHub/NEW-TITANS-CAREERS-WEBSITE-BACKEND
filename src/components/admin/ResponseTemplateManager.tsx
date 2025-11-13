import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit2, Trash2, Plus, Save, X } from "lucide-react";

interface ResponseTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

const CATEGORIES = ["General", "Support", "Sales", "Follow-up", "Thank You", "Other"];

export const ResponseTemplateManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<ResponseTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
    category: "",
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      // @ts-ignore - Types will be regenerated
      const { data, error } = await supabase
        // @ts-ignore - Types will be regenerated
        .from("response_templates")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false }) as any;

      if (error) throw error;
      setTemplates((data || []) as any);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.subject || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // @ts-ignore - Types will be regenerated
      const { error } = await supabase
        // @ts-ignore - Types will be regenerated
        .from("response_templates")
        .insert([{
          name: formData.name,
          subject: formData.subject,
          content: formData.content,
          category: formData.category || null,
          created_by: user?.id,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template created successfully",
      });

      setFormData({ name: "", subject: "", content: "", category: "" });
      setIsCreating(false);
      fetchTemplates();
    } catch (error: any) {
      console.error("Error creating template:", error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingTemplate) return;

    try {
      // @ts-ignore - Types will be regenerated
      const { error } = await supabase
        // @ts-ignore - Types will be regenerated
        .from("response_templates")
        .update({
          name: formData.name,
          subject: formData.subject,
          content: formData.content,
          category: formData.category || null,
        })
        .eq("id", editingTemplate.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template updated successfully",
      });

      setEditingTemplate(null);
      setFormData({ name: "", subject: "", content: "", category: "" });
      fetchTemplates();
    } catch (error: any) {
      console.error("Error updating template:", error);
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      // @ts-ignore - Types will be regenerated
      const { error } = await supabase
        // @ts-ignore - Types will be regenerated
        .from("response_templates")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      fetchTemplates();
    } catch (error: any) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const startEdit = (template: ResponseTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category || "",
    });
  };

  const cancelEdit = () => {
    setEditingTemplate(null);
    setIsCreating(false);
    setFormData({ name: "", subject: "", content: "", category: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Response Templates</h2>
          <p className="text-muted-foreground">Manage canned responses for common inquiries</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {(isCreating || editingTemplate) && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>{editingTemplate ? "Edit Template" : "Create New Template"}</CardTitle>
            <CardDescription>
              {editingTemplate ? "Update your response template" : "Create a reusable response template"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Template Name *</label>
                <Input
                  placeholder="e.g., Thank You for Inquiry"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Subject *</label>
              <Input
                placeholder="e.g., Re: Your Inquiry"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message Content *</label>
              <Textarea
                placeholder="Enter your response template... You can use {name} and {email} as placeholders"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Tip: Use {"{name}"} and {"{email}"} as placeholders that will be replaced with actual values
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={editingTemplate ? handleUpdate : handleCreate}>
                <Save className="h-4 w-4 mr-2" />
                {editingTemplate ? "Update Template" : "Create Template"}
              </Button>
              <Button variant="outline" onClick={cancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.subject}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(template)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {template.category && (
                <Badge variant="secondary" className="w-fit mt-2">
                  {template.category}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground line-clamp-3">
                {template.content}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && templates.length === 0 && !isCreating && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No templates created yet</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
