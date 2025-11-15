import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CampaignManagerSkeleton } from "@/components/admin/CampaignManagerSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  Calendar,
  Mail,
  TrendingUp,
  TrendingDown,
  FileText,
  Save,
  Users,
} from "lucide-react";

interface CampaignContent {
  id: string;
  campaign_type: string;
  content_key: string;
  subject: string;
  preview_text: string | null;
  html_content: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

interface EmailCampaign {
  id: string;
  campaign_type: string;
  content_key: string;
  subject: string;
  sent_at: string;
  recipient_count: number;
  success_count: number;
  failure_count: number;
}

const campaignFormSchema = z.object({
  campaign_type: z.enum(["career_tips", "job_alerts", "course_updates"]),
  content_key: z.string().min(3, "Content key must be at least 3 characters"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  preview_text: z.string().optional(),
  html_content: z.string().min(50, "Content must be at least 50 characters"),
  is_active: z.boolean(),
  priority: z.number().min(0).max(100),
  segment_id: z.string().optional(),
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

const CampaignManager = () => {
  const { isAdmin, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [campaigns, setCampaigns] = useState<CampaignContent[]>([]);
  const [history, setHistory] = useState<EmailCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCampaign, setEditingCampaign] = useState<CampaignContent | null>(null);
  const [previewCampaign, setPreviewCampaign] = useState<CampaignContent | null>(null);
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateTags, setTemplateTags] = useState("");
  const [selectedSendSegment, setSelectedSendSegment] = useState<string>("all");

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      campaign_type: "career_tips",
      content_key: "",
      subject: "",
      preview_text: "",
      html_content: "",
      is_active: true,
      priority: 0,
      segment_id: "all",
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && user && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access campaign management.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, authLoading, user, navigate, toast]);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("campaign_content")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      console.error("Error fetching campaigns:", error);
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive",
      });
    }
  };

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("email_campaigns")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      console.error("Error fetching campaign history:", error);
      toast({
        title: "Error",
        description: "Failed to load campaign history",
        variant: "destructive",
      });
    }
  };

  const { data: templates = [] } = useQuery({
    queryKey: ["emailTemplates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("created_at", { ascending: false});
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!isAdmin,
  });

  const { data: segments = [] } = useQuery({
    queryKey: ["subscriberSegments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriber_segments")
        .select("id, name, description, subscriber_count")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!isAdmin,
  });

  const loadTemplate = (template: any) => {
    form.reset({
      campaign_type: template.campaign_type as "career_tips" | "job_alerts" | "course_updates",
      content_key: `${template.campaign_type}_${Date.now()}`,
      subject: template.subject,
      preview_text: template.preview_text || "",
      html_content: template.html_content,
      is_active: true,
      priority: 50,
      segment_id: "all",
    });
    setShowTemplateDialog(false);
    toast({
      title: "Template Loaded",
      description: "Template content has been loaded into the form.",
    });
  };

  const saveAsTemplate = async () => {
    try {
      const values = form.getValues();
      
      const { error } = await supabase
        .from("email_templates")
        .insert({
          name: templateName,
          description: templateDescription || null,
          campaign_type: values.campaign_type,
          subject: values.subject,
          html_content: values.html_content,
          preview_text: values.preview_text || null,
          source_type: "campaign",
          source_id: editingCampaign?.id || null,
          tags: templateTags ? templateTags.split(",").map(t => t.trim()) : [],
          created_by: user?.id,
        });

      if (error) throw error;

      toast({
        title: "Template Saved",
        description: "Campaign has been saved as a template.",
      });

      setShowSaveTemplateDialog(false);
      setTemplateName("");
      setTemplateDescription("");
      setTemplateTags("");
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isAdmin && user) {
      const loadData = async () => {
        setIsLoading(true);
        await Promise.all([fetchCampaigns(), fetchHistory()]);
        setIsLoading(false);
      };
      loadData();
    }
  }, [isAdmin, user]);

  const onSubmit = async (values: CampaignFormValues) => {
    try {
      if (editingCampaign) {
        const { error } = await supabase
          .from("campaign_content")
          .update({
            campaign_type: values.campaign_type,
            content_key: values.content_key,
            subject: values.subject,
            preview_text: values.preview_text || null,
            html_content: values.html_content,
            is_active: values.is_active,
            priority: values.priority,
            segment_id: values.segment_id && values.segment_id !== "all" ? values.segment_id : null,
          })
          .eq("id", editingCampaign.id);

        if (error) throw error;

        toast({
          title: "Campaign Updated",
          description: "Your campaign has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from("campaign_content")
          .insert([{
            campaign_type: values.campaign_type,
            content_key: values.content_key,
            subject: values.subject,
            preview_text: values.preview_text || null,
            html_content: values.html_content,
            is_active: values.is_active,
            priority: values.priority,
            segment_id: values.segment_id && values.segment_id !== "all" ? values.segment_id : null,
          }]);

        if (error) throw error;

        toast({
          title: "Campaign Created",
          description: "Your campaign has been created successfully.",
        });
      }

      form.reset();
      setEditingCampaign(null);
      fetchCampaigns();
    } catch (error: any) {
      console.error("Error saving campaign:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save campaign",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (campaign: CampaignContent) => {
    setEditingCampaign(campaign);
    form.reset({
      campaign_type: campaign.campaign_type as "career_tips" | "job_alerts" | "course_updates",
      content_key: campaign.content_key,
      subject: campaign.subject,
      preview_text: campaign.preview_text || "",
      html_content: campaign.html_content,
      is_active: campaign.is_active,
      priority: campaign.priority,
      segment_id: (campaign as any).segment_id || "all",
    });
  };

  const handleDelete = async () => {
    if (!deleteCampaignId) return;

    try {
      const { error } = await supabase
        .from("campaign_content")
        .delete()
        .eq("id", deleteCampaignId);

      if (error) throw error;

      toast({
        title: "Campaign Deleted",
        description: "The campaign has been deleted successfully.",
      });

      fetchCampaigns();
    } catch (error: any) {
      console.error("Error deleting campaign:", error);
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    } finally {
      setDeleteCampaignId(null);
    }
  };

  const handleSendCampaign = async () => {
    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-weekly-campaign", {
        body: { segmentId: selectedSendSegment && selectedSendSegment !== "all" ? selectedSendSegment : null },
      });

      if (error) throw error;

      const message = selectedSendSegment && selectedSendSegment !== "all"
        ? "Campaign is being sent to the selected segment."
        : "Campaign is being sent to all active subscribers.";

      toast({
        title: "Campaign Sent",
        description: message,
      });

      // Refresh history after a delay
      setTimeout(() => {
        fetchHistory();
      }, 2000);
    } catch (error: any) {
      console.error("Error sending campaign:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send campaign",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (authLoading || isLoading) {
    return <CampaignManagerSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  const campaignTypeLabels = {
    career_tips: "Career Tips",
    job_alerts: "Job Alerts",
    course_updates: "Course Updates",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container max-w-7xl py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-tc-navy mb-2">Campaign Manager</h1>
          <p className="text-muted-foreground">
            Create, edit, preview, and send email campaigns to your subscribers
          </p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList>
            <TabsTrigger value="create">
              <Plus className="w-4 h-4 mr-2" />
              Create/Edit
            </TabsTrigger>
            <TabsTrigger value="campaigns">
              <Mail className="w-4 h-4 mr-2" />
              All Campaigns
            </TabsTrigger>
            <TabsTrigger value="history">
              <Calendar className="w-4 h-4 mr-2" />
              Send History
            </TabsTrigger>
            <TabsTrigger value="send">
              <Send className="w-4 h-4 mr-2" />
              Send Now
            </TabsTrigger>
          </TabsList>

          {/* Create/Edit Campaign */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{editingCampaign ? "Edit Campaign" : "Create New Campaign"}</CardTitle>
                    <CardDescription>
                      {editingCampaign
                        ? "Update the campaign details below"
                        : "Fill in the details to create a new email campaign"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowTemplateDialog(true)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Load Template
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const values = form.getValues();
                        if (!values.subject || !values.html_content) {
                          toast({
                            title: "Error",
                            description: "Please fill in subject and content before saving as template",
                            variant: "destructive",
                          });
                          return;
                        }
                        setShowSaveTemplateDialog(true);
                      }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save as Template
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="campaign_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Campaign Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select campaign type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="career_tips">Career Tips</SelectItem>
                                <SelectItem value="job_alerts">Job Alerts</SelectItem>
                                <SelectItem value="course_updates">Course Updates</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The type of email campaign
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="content_key"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content Key</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., tip_001" {...field} />
                            </FormControl>
                            <FormDescription>
                              Unique identifier for this campaign
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Subject</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 5 Career Tips to Land Your Dream Job"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The subject line subscribers will see
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preview_text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preview Text (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Short preview that appears in inbox"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Text shown in email preview (recommended)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="html_content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Content (HTML)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your HTML email content here..."
                              className="min-h-[300px] font-mono"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Full HTML content of the email. Use &#123;&#123;subscriber_name&#125;&#125; for personalization.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>
                              Higher priority campaigns are sent first (0-100)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(value === "true")}
                              defaultValue={field.value ? "true" : "false"}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Only active campaigns will be sent
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="segment_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Segment (Optional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="All subscribers (no segment)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all">All subscribers (no segment)</SelectItem>
                              {segments.map((segment: any) => (
                                <SelectItem key={segment.id} value={segment.id}>
                                  {segment.name} ({segment.subscriber_count || 0} subscribers)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Target a specific subscriber segment or leave blank for all subscribers
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-4">
                      <Button type="submit" className="bg-tc-navy hover:bg-tc-blue">
                        {editingCampaign ? "Update Campaign" : "Create Campaign"}
                      </Button>
                      {editingCampaign && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingCampaign(null);
                            form.reset();
                          }}
                        >
                          Cancel Edit
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const values = form.getValues();
                          setPreviewCampaign({
                            id: "preview",
                            campaign_type: values.campaign_type,
                            content_key: values.content_key || "",
                            subject: values.subject || "",
                            preview_text: values.preview_text || null,
                            html_content: values.html_content || "",
                            is_active: values.is_active,
                            priority: values.priority,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                          });
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Campaigns */}
          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Templates</CardTitle>
                <CardDescription>
                  Manage all your campaign templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No campaigns found. Create your first campaign!
                        </TableCell>
                      </TableRow>
                    ) : (
                      campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell>
                            <Badge variant="outline">
                              {campaignTypeLabels[campaign.campaign_type as keyof typeof campaignTypeLabels]}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {campaign.content_key}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {campaign.subject}
                          </TableCell>
                          <TableCell>{campaign.priority}</TableCell>
                          <TableCell>
                            <Badge variant={campaign.is_active ? "default" : "secondary"}>
                              {campaign.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(campaign.updated_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPreviewCampaign(campaign)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(campaign)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDeleteCampaignId(campaign.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaign History */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Send History</CardTitle>
                <CardDescription>
                  View all sent email campaigns and their statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Success</TableHead>
                      <TableHead>Failed</TableHead>
                      <TableHead>Success Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No campaigns sent yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      history.map((campaign) => {
                        const successRate = campaign.recipient_count > 0
                          ? (campaign.success_count / campaign.recipient_count) * 100
                          : 0;
                        
                        return (
                          <TableRow key={campaign.id}>
                            <TableCell>
                              <Badge variant="outline">
                                {campaignTypeLabels[campaign.campaign_type as keyof typeof campaignTypeLabels]}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {campaign.subject}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(campaign.sent_at).toLocaleString()}
                            </TableCell>
                            <TableCell>{campaign.recipient_count}</TableCell>
                            <TableCell className="text-green-600 font-medium">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                {campaign.success_count}
                              </div>
                            </TableCell>
                            <TableCell className="text-red-600 font-medium">
                              <div className="flex items-center gap-1">
                                <TrendingDown className="w-4 h-4" />
                                {campaign.failure_count}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={successRate >= 90 ? "default" : "secondary"}
                              >
                                {successRate.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Send Campaign */}
          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle>Send Campaign Now</CardTitle>
                <CardDescription>
                  Manually trigger a campaign to be sent to subscribers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold">How it works:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Campaigns are automatically rotated based on type and priority</li>
                    <li>Only active campaigns will be selected</li>
                    <li>Choose a segment or send to all active subscribers</li>
                    <li>Results are tracked and shown in the Send History tab</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="send-segment">Target Segment (Optional)</Label>
                    <Select
                      value={selectedSendSegment}
                      onValueChange={setSelectedSendSegment}
                    >
                      <SelectTrigger id="send-segment" className="max-w-md">
                        <SelectValue placeholder="All active subscribers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All active subscribers</SelectItem>
                        {segments.map((segment: any) => (
                          <SelectItem key={segment.id} value={segment.id}>
                            {segment.name} ({segment.subscriber_count || 0} subscribers)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedSendSegment && selectedSendSegment !== "all"
                        ? "Campaign will be sent to subscribers in the selected segment"
                        : "Campaign will be sent to all active subscribers"}
                    </p>
                  </div>

                  <Button
                    onClick={handleSendCampaign}
                    disabled={isSending || campaigns.filter(c => c.is_active).length === 0}
                    className="bg-tc-navy hover:bg-tc-blue"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending Campaign...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Campaign Now
                      </>
                    )}
                  </Button>

                  {campaigns.filter(c => c.is_active).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No active campaigns available. Create and activate a campaign first.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewCampaign} onOpenChange={() => setPreviewCampaign(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              Preview how your email will look to subscribers
            </DialogDescription>
          </DialogHeader>
          {previewCampaign && (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="text-sm text-muted-foreground mb-1">Subject:</div>
                <div className="font-semibold">{previewCampaign.subject}</div>
                {previewCampaign.preview_text && (
                  <>
                    <div className="text-sm text-muted-foreground mt-2 mb-1">Preview:</div>
                    <div className="text-sm">{previewCampaign.preview_text}</div>
                  </>
                )}
              </div>
              <div className="border rounded-lg p-4 bg-background">
                <div
                  dangerouslySetInnerHTML={{
                    __html: previewCampaign.html_content
                      .replace(/\{\{subscriber_name\}\}/g, "John Doe")
                  }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCampaignId} onOpenChange={() => setDeleteCampaignId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the campaign template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Load Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Load from Template</DialogTitle>
            <DialogDescription>
              Select a template to load into the campaign form
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {templates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No templates available. Create templates from the Template Library.
              </p>
            ) : (
              templates.map((template: any) => (
                <Card key={template.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => loadTemplate(template)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">{template.description || "No description"}</CardDescription>
                      </div>
                      <Badge variant="outline">{template.campaign_type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-muted-foreground">Subject</p>
                    <p className="text-sm truncate">{template.subject}</p>
                    <div className="flex gap-2 mt-2">
                      {template.tags?.map((tag: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Save as Template Dialog */}
      <Dialog open={showSaveTemplateDialog} onOpenChange={setShowSaveTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save this campaign as a reusable template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., High-Converting Career Tips"
              />
            </div>
            <div>
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Brief description of this template"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="template-tags">Tags (comma separated)</Label>
              <Input
                id="template-tags"
                value={templateTags}
                onChange={(e) => setTemplateTags(e.target.value)}
                placeholder="e.g., high-converting, newsletter, promotional"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSaveTemplateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveAsTemplate} disabled={!templateName}>
                Save Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CampaignManager;
