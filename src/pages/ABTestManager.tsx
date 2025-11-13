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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ArrowLeft, Plus, Send, Trophy, Eye, Trash2, FileText, Save } from "lucide-react";

interface ABTest {
  id: string;
  name: string;
  campaign_type: string;
  test_percentage: number;
  status: string;
  winner_variant_id: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

interface Variant {
  id: string;
  ab_test_id: string;
  variant_name: string;
  subject: string;
  html_content: string;
  preview_text: string | null;
}

interface TestResult {
  id: string;
  variant_id: string;
  sent_count: number;
  open_count: number;
  click_count: number;
  unsubscribe_count: number;
  open_rate: number;
  click_rate: number;
  ab_test_variants: Variant;
}

const ABTestManager = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [previewContent, setPreviewContent] = useState("");
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedVariantForTemplate, setSelectedVariantForTemplate] = useState<number | null>(null);
  
  // Form state for new test
  const [testName, setTestName] = useState("");
  const [campaignType, setCampaignType] = useState("");
  const [testPercentage, setTestPercentage] = useState(20);
  const [variants, setVariants] = useState([
    { name: "A", subject: "", htmlContent: "", previewText: "" },
    { name: "B", subject: "", htmlContent: "", previewText: "" },
  ]);

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

  // Fetch all A/B tests
  const { data: tests = [], isLoading: testsLoading } = useQuery({
    queryKey: ["abTests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ab_tests")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as ABTest[];
    },
    enabled: isAdmin,
  });

  // Fetch results for selected test
  const { data: testResults = [] } = useQuery({
    queryKey: ["abTestResults", selectedTest?.id],
    queryFn: async () => {
      if (!selectedTest?.id) return [];
      
      const { data, error } = await supabase
        .from("ab_test_results")
        .select(`
          *,
          ab_test_variants (*)
        `)
        .eq("ab_test_id", selectedTest.id);
      
      if (error) throw error;
      return data as TestResult[];
    },
    enabled: !!selectedTest?.id && selectedTest.status !== "draft",
  });

  // Fetch templates
  const { data: templates = [] } = useQuery({
    queryKey: ["emailTemplates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const loadTemplate = (template: any, variantIndex: number) => {
    const newVariants = [...variants];
    newVariants[variantIndex] = {
      ...newVariants[variantIndex],
      subject: template.subject,
      htmlContent: template.html_content,
      previewText: template.preview_text || "",
    };
    setVariants(newVariants);
    setShowTemplateDialog(false);
    setSelectedVariantForTemplate(null);
    toast.success("Template loaded into variant");
  };

  // Create A/B test mutation
  const createTestMutation = useMutation({
    mutationFn: async () => {
      // Create test
      const { data: test, error: testError } = await supabase
        .from("ab_tests")
        .insert({
          name: testName,
          campaign_type: campaignType,
          test_percentage: testPercentage,
          status: "draft",
        })
        .select()
        .single();

      if (testError) throw testError;

      // Create variants
      const variantsData = variants.map(v => ({
        ab_test_id: test.id,
        variant_name: v.name,
        subject: v.subject,
        html_content: v.htmlContent,
        preview_text: v.previewText || null,
      }));

      const { error: variantsError } = await supabase
        .from("ab_test_variants")
        .insert(variantsData);

      if (variantsError) throw variantsError;

      return test;
    },
    onSuccess: () => {
      toast.success("A/B test created successfully");
      queryClient.invalidateQueries({ queryKey: ["abTests"] });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create test: ${error.message}`);
    },
  });

  // Send test mutation
  const sendTestMutation = useMutation({
    mutationFn: async (testId: string) => {
      const { data, error } = await supabase.functions.invoke("send-ab-test", {
        body: { testId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("A/B test sent successfully");
      queryClient.invalidateQueries({ queryKey: ["abTests"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send test: ${error.message}`);
    },
  });

  // Select winner mutation
  const selectWinnerMutation = useMutation({
    mutationFn: async (testId: string) => {
      const { data, error } = await supabase.functions.invoke("select-ab-winner", {
        body: { testId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Winner selected successfully");
      queryClient.invalidateQueries({ queryKey: ["abTests"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to select winner: ${error.message}`);
    },
  });

  // Send winner mutation
  const sendWinnerMutation = useMutation({
    mutationFn: async (testId: string) => {
      const { data, error } = await supabase.functions.invoke("send-ab-winner", {
        body: { testId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Winner sent to all subscribers");
      queryClient.invalidateQueries({ queryKey: ["abTests"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send winner: ${error.message}`);
    },
  });

  // Delete test mutation
  const deleteTestMutation = useMutation({
    mutationFn: async (testId: string) => {
      const { error } = await supabase
        .from("ab_tests")
        .delete()
        .eq("id", testId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Test deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["abTests"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete test: ${error.message}`);
    },
  });

  const resetForm = () => {
    setTestName("");
    setCampaignType("");
    setTestPercentage(20);
    setVariants([
      { name: "A", subject: "", htmlContent: "", previewText: "" },
      { name: "B", subject: "", htmlContent: "", previewText: "" },
    ]);
  };

  const addVariant = () => {
    const nextLetter = String.fromCharCode(65 + variants.length);
    setVariants([...variants, { name: nextLetter, subject: "", htmlContent: "", previewText: "" }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 2) {
      toast.error("Must have at least 2 variants");
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      draft: "secondary",
      running: "default",
      completed: "outline",
      sent: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
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
              <h1 className="text-4xl font-bold text-foreground">A/B Test Manager</h1>
              <p className="text-muted-foreground mt-2">Create and manage email A/B tests</p>
            </div>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create A/B Test
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New A/B Test</DialogTitle>
                <DialogDescription>
                  Create multiple variants to test different subject lines and content
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="testName">Test Name</Label>
                  <Input
                    id="testName"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="e.g., Career Tips Subject Line Test"
                  />
                </div>
                <div>
                  <Label htmlFor="campaignType">Campaign Type</Label>
                  <Select value={campaignType} onValueChange={setCampaignType}>
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
                  <Label htmlFor="testPercentage">Test Percentage (1-50%)</Label>
                  <Input
                    id="testPercentage"
                    type="number"
                    min="1"
                    max="50"
                    value={testPercentage}
                    onChange={(e) => setTestPercentage(Number(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Percentage of subscribers to include in the test
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Variants</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Variant
                    </Button>
                  </div>
                  {variants.map((variant, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Variant {variant.name}</CardTitle>
                          {variants.length > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariant(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Subject</Label>
                          <Input
                            value={variant.subject}
                            onChange={(e) => {
                              const newVariants = [...variants];
                              newVariants[index].subject = e.target.value;
                              setVariants(newVariants);
                            }}
                            placeholder="Email subject line"
                          />
                        </div>
                        <div>
                          <Label>Preview Text</Label>
                          <Input
                            value={variant.previewText}
                            onChange={(e) => {
                              const newVariants = [...variants];
                              newVariants[index].previewText = e.target.value;
                              setVariants(newVariants);
                            }}
                            placeholder="Preview text (optional)"
                          />
                        </div>
                        <div>
                          <Label>HTML Content</Label>
                          <div className="flex gap-2 mb-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedVariantForTemplate(index);
                                setShowTemplateDialog(true);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Load from Template
                            </Button>
                          </div>
                          <Textarea
                            value={variant.htmlContent}
                            onChange={(e) => {
                              const newVariants = [...variants];
                              newVariants[index].htmlContent = e.target.value;
                              setVariants(newVariants);
                            }}
                            placeholder="Email HTML content"
                            rows={6}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createTestMutation.mutate()}
                    disabled={!testName || !campaignType || variants.some(v => !v.subject || !v.htmlContent)}
                  >
                    Create Test
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="tests">
          <TabsList>
            <TabsTrigger value="tests">All Tests</TabsTrigger>
            <TabsTrigger value="results">Results & Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="tests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>A/B Tests</CardTitle>
                <CardDescription>Manage your email A/B tests</CardDescription>
              </CardHeader>
              <CardContent>
                {testsLoading ? (
                  <p>Loading tests...</p>
                ) : tests.length === 0 ? (
                  <p className="text-muted-foreground">No tests created yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Test %</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tests.map((test) => (
                        <TableRow key={test.id}>
                          <TableCell className="font-medium">{test.name}</TableCell>
                          <TableCell>{test.campaign_type}</TableCell>
                          <TableCell>{getStatusBadge(test.status)}</TableCell>
                          <TableCell>{test.test_percentage}%</TableCell>
                          <TableCell>{new Date(test.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {test.status === "draft" && (
                                <Button
                                  size="sm"
                                  onClick={() => sendTestMutation.mutate(test.id)}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Test
                                </Button>
                              )}
                              {test.status === "running" && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTest(test);
                                    selectWinnerMutation.mutate(test.id);
                                  }}
                                >
                                  <Trophy className="h-4 w-4 mr-2" />
                                  Select Winner
                                </Button>
                              )}
                              {test.status === "completed" && (
                                <Button
                                  size="sm"
                                  onClick={() => sendWinnerMutation.mutate(test.id)}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Winner
                                </Button>
                              )}
                              {test.status !== "draft" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedTest(test)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Results
                                </Button>
                              )}
                              {test.status === "draft" && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Test?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete this A/B test and all its variants.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteTestMutation.mutate(test.id)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {selectedTest ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedTest.name} - Results</CardTitle>
                  <CardDescription>
                    Performance metrics for each variant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {testResults.length === 0 ? (
                    <p className="text-muted-foreground">No results available yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Variant</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Sent</TableHead>
                          <TableHead>Opens</TableHead>
                          <TableHead>Open Rate</TableHead>
                          <TableHead>Clicks</TableHead>
                          <TableHead>Click Rate</TableHead>
                          <TableHead>Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {testResults.map((result) => {
                          const score = (result.open_rate * 0.6) + (result.click_rate * 0.4);
                          const isWinner = result.variant_id === selectedTest.winner_variant_id;
                          return (
                            <TableRow key={result.id} className={isWinner ? "bg-accent" : ""}>
                              <TableCell className="font-medium">
                                {result.ab_test_variants.variant_name}
                                {isWinner && <Trophy className="inline h-4 w-4 ml-2 text-yellow-500" />}
                              </TableCell>
                              <TableCell>{result.ab_test_variants.subject}</TableCell>
                              <TableCell>{result.sent_count}</TableCell>
                              <TableCell>{result.open_count}</TableCell>
                              <TableCell>{result.open_rate.toFixed(2)}%</TableCell>
                              <TableCell>{result.click_count}</TableCell>
                              <TableCell>{result.click_rate.toFixed(2)}%</TableCell>
                              <TableCell className="font-bold">{score.toFixed(2)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">Select a test to view results</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

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

      {/* Load Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Load from Template</DialogTitle>
            <DialogDescription>
              Select a template to load into Variant {selectedVariantForTemplate !== null ? variants[selectedVariantForTemplate]?.name : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {templates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No templates available. Create templates from the Template Library.
              </p>
            ) : (
              templates.map((template: any) => (
                <Card 
                  key={template.id} 
                  className="cursor-pointer hover:border-primary transition-colors" 
                  onClick={() => selectedVariantForTemplate !== null && loadTemplate(template, selectedVariantForTemplate)}
                >
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
    </div>
  );
};

export default ABTestManager;
