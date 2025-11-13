import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Save, Eye, Trash2, Copy } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Template {
  id: string;
  name: string;
  description: string | null;
  campaign_type: string;
  subject: string;
  html_content: string;
  preview_text: string | null;
  tags: string[];
  usage_count: number;
}

const VARIABLES = [
  { key: "{{name}}", label: "Name", example: "John Doe" },
  { key: "{{email}}", label: "Email", example: "john@example.com" },
  { key: "{{score}}", label: "Lead Score", example: "75" },
  { key: "{{status}}", label: "Lead Status", example: "warm" },
  { key: "{{company}}", label: "Company Name", example: "Titans Academy" },
];

const CAMPAIGN_TYPES = [
  { value: "nurture", label: "Lead Nurture" },
  { value: "newsletter", label: "Newsletter" },
  { value: "welcome", label: "Welcome Series" },
  { value: "promotion", label: "Promotional" },
];

export default function TemplateEditor() {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [campaignType, setCampaignType] = useState("nurture");
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [tags, setTags] = useState("");

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Template[];
    },
  });

  // Create template mutation
  const createMutation = useMutation({
    mutationFn: async (template: Partial<Template>) => {
      const { data, error } = await supabase
        .from("email_templates")
        .insert({
          name: template.name,
          description: template.description,
          campaign_type: template.campaign_type,
          subject: template.subject,
          html_content: template.html_content,
          preview_text: template.preview_text,
          tags: template.tags || [],
          source_type: "custom",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Template created successfully");
      resetForm();
    },
    onError: () => toast.error("Failed to create template"),
  });

  // Update template mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...template }: Partial<Template> & { id: string }) => {
      const { data, error } = await supabase
        .from("email_templates")
        .update({
          name: template.name,
          description: template.description,
          campaign_type: template.campaign_type,
          subject: template.subject,
          html_content: template.html_content,
          preview_text: template.preview_text,
          tags: template.tags,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Template updated successfully");
    },
    onError: () => toast.error("Failed to update template"),
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("email_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Template deleted successfully");
      resetForm();
    },
    onError: () => toast.error("Failed to delete template"),
  });

  const loadTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsCreating(false);
    setName(template.name);
    setDescription(template.description || "");
    setCampaignType(template.campaign_type);
    setSubject(template.subject);
    setPreviewText(template.preview_text || "");
    setHtmlContent(template.html_content);
    setTags(template.tags?.join(", ") || "");
    setPreviewMode(false);
  };

  const startNewTemplate = () => {
    resetForm();
    setIsCreating(true);
    setSelectedTemplate(null);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCampaignType("nurture");
    setSubject("");
    setPreviewText("");
    setHtmlContent("");
    setTags("");
    setIsCreating(false);
    setSelectedTemplate(null);
    setPreviewMode(false);
  };

  const handleSave = () => {
    const templateData = {
      name,
      description,
      campaign_type: campaignType,
      subject,
      html_content: htmlContent,
      preview_text: previewText,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    if (selectedTemplate) {
      updateMutation.mutate({ id: selectedTemplate.id, ...templateData });
    } else {
      createMutation.mutate(templateData);
    }
  };

  const insertVariable = (variable: string) => {
    setHtmlContent((prev) => prev + variable);
  };

  const duplicateTemplate = (template: Template) => {
    setName(`${template.name} (Copy)`);
    setDescription(template.description || "");
    setCampaignType(template.campaign_type);
    setSubject(template.subject);
    setPreviewText(template.preview_text || "");
    setHtmlContent(template.html_content);
    setTags(template.tags?.join(", ") || "");
    setIsCreating(true);
    setSelectedTemplate(null);
  };

  const renderPreview = () => {
    let content = htmlContent;
    VARIABLES.forEach(({ key, example }) => {
      content = content.split(key).join(example);
    });
    return content;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Email Template Editor</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage email templates with dynamic variables
            </p>
          </div>
          <Button onClick={startNewTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>Select a template to edit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading templates...</p>
              ) : templates && templates.length > 0 ? (
                templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => loadTemplate(template)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {template.campaign_type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.description || "No description"}
                    </p>
                    <div className="flex gap-1 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateTemplate(template);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this template?")) {
                            deleteMutation.mutate(template.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No templates yet</p>
              )}
            </CardContent>
          </Card>

          {/* Editor */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {selectedTemplate
                    ? `Editing: ${selectedTemplate.name}`
                    : isCreating
                    ? "New Template"
                    : "Select or create a template"}
                </CardTitle>
                {(selectedTemplate || isCreating) && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {previewMode ? "Edit" : "Preview"}
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {(selectedTemplate || isCreating) && !previewMode ? (
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="variables">Variables</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div>
                      <Label htmlFor="name">Template Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="My Template"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Template description"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="campaignType">Campaign Type</Label>
                      <Select value={campaignType} onValueChange={setCampaignType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CAMPAIGN_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="nurture, hot-leads"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4">
                    <div>
                      <Label htmlFor="subject">Subject Line</Label>
                      <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Hi {{name}}, here's something for you..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="previewText">Preview Text</Label>
                      <Input
                        id="previewText"
                        value={previewText}
                        onChange={(e) => setPreviewText(e.target.value)}
                        placeholder="This appears in the email preview"
                      />
                    </div>
                    <div>
                      <Label htmlFor="htmlContent">HTML Content</Label>
                      <Textarea
                        id="htmlContent"
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        placeholder="<h2>Hello {{name}}</h2><p>Your content here...</p>"
                        rows={15}
                        className="font-mono text-sm"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="variables" className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Click to insert variables into your template
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {VARIABLES.map(({ key, label, example }) => (
                        <Card key={key} className="cursor-pointer hover:border-primary" onClick={() => insertVariable(key)}>
                          <CardContent className="p-4">
                            <div className="font-mono text-sm font-semibold">{key}</div>
                            <div className="text-xs text-muted-foreground mt-1">{label}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Example: {example}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (selectedTemplate || isCreating) && previewMode ? (
                <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <div className="text-sm font-medium mb-2">Subject:</div>
                      <div className="text-lg">{subject.split("{{name}}").join("John Doe")}</div>
                    </div>
                  {previewText && (
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <div className="text-sm font-medium mb-2">Preview Text:</div>
                      <div className="text-sm text-muted-foreground">{previewText}</div>
                    </div>
                  )}
                  <div className="border rounded-lg p-6 bg-background">
                    <div className="text-lg font-medium mb-2">Subject:</div>
                    <div className="mb-4">{subject.split("{{name}}").join("John Doe")}</div>
                    <div dangerouslySetInnerHTML={{ __html: renderPreview() }} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Select a template from the list or create a new one</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
