import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layouts/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Zap, CheckCircle2, AlertCircle, Info, Settings } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export default function LeadNurtureManager() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{ sent_count?: number; errors?: string[] } | null>(null);

  // Fetch templates
  const { data: templates } = useQuery({
    queryKey: ["nurture-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("campaign_type", "nurture")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getTemplatesByTag = (tag: string) => {
    return templates?.filter((t) => t.tags?.includes(tag)) || [];
  };

  const runNurtureAutomation = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("lead-nurture", {
        body: {},
      });

      if (error) throw error;

      setResult(data);
      toast.success(`Nurture automation complete! Sent ${data.sent_count} emails`);
    } catch (error) {
      console.error("Error running nurture automation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to run automation");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <PageLayout intensity3D="subtle" show3D={true}>
      <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Lead Nurture Automation</h1>
        <p className="text-muted-foreground">
          Automatically send targeted emails to leads based on their engagement scores
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>How It Works</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Analyzes Lead Scores</p>
                <p className="text-sm text-muted-foreground">
                  Reviews all leads with engagement scores 25+
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Personalizes Content</p>
                <p className="text-sm text-muted-foreground">
                  Hot leads get strong CTAs, warm leads get value props, cold leads get education
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Sends via Brevo</p>
                <p className="text-sm text-muted-foreground">
                  Delivers emails and tracks engagement automatically
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                4
              </div>
              <div>
                <p className="font-medium">Prevents Over-Emailing</p>
                <p className="text-sm text-muted-foreground">
                  Skips leads who received emails in the last 3 days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Run Automation</CardTitle>
            </div>
            <CardDescription>
              Trigger the nurture automation manually or schedule it to run automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={runNurtureAutomation}
              disabled={isRunning}
              className="w-full"
              size="lg"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Running Automation...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run Now
                </>
              )}
            </Button>

            {result && (
              <Alert className={result.errors && result.errors.length > 0 ? "border-orange-500" : "border-green-500"}>
                {result.errors && result.errors.length > 0 ? (
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                <AlertDescription>
                  <div className="font-medium mb-2">
                    Successfully sent {result.sent_count} nurture emails
                  </div>
                  {result.errors && result.errors.length > 0 && (
                    <div className="text-sm space-y-1">
                      <p className="font-medium">Errors encountered:</p>
                      {result.errors.slice(0, 5).map((error, i) => (
                        <p key={i} className="text-muted-foreground">
                          • {error}
                        </p>
                      ))}
                      {result.errors.length > 5 && (
                        <p className="text-muted-foreground">
                          ... and {result.errors.length - 5} more
                        </p>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <CardTitle>Email Webhook Setup</CardTitle>
          </div>
          <CardDescription>
            Configure Brevo to send real-time notifications when emails are opened or clicked
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Webhook URL:</h3>
            <code className="block bg-muted p-3 rounded text-sm break-all">
              {import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-webhook
            </code>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Setup Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Log in to your Brevo account</li>
              <li>Go to Transactional → Settings → Webhooks</li>
              <li>Click "Add a new webhook"</li>
              <li>Paste the webhook URL above</li>
              <li>
                Select events to track:
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li><strong>opened</strong> - Email opens</li>
                  <li><strong>clicked</strong> - Link clicks</li>
                </ul>
              </li>
              <li>Save the webhook configuration</li>
            </ol>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Once configured, all email opens and clicks will be automatically tracked in real-time,
              updating engagement scores and analytics data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <CardTitle>Template Configuration</CardTitle>
          </div>
          <CardDescription>
            Configure which email templates are used for each lead status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-4">
              <Badge variant="destructive" className="mb-3">HOT (75+ score)</Badge>
              <p className="text-sm text-muted-foreground mb-3">
                High-intent leads ready to convert
              </p>
              {getTemplatesByTag("hot").length > 0 ? (
                <div className="space-y-2">
                  {getTemplatesByTag("hot").map((template: any) => (
                    <div key={template.id} className="text-sm p-2 bg-muted rounded">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground">{template.subject}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    No templates with hot tag. Add one in the Template Editor.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <Badge variant="default" className="mb-3">WARM (50-74 score)</Badge>
              <p className="text-sm text-muted-foreground mb-3">
                Engaged leads needing value props
              </p>
              {getTemplatesByTag("warm").length > 0 ? (
                <div className="space-y-2">
                  {getTemplatesByTag("warm").map((template: any) => (
                    <div key={template.id} className="text-sm p-2 bg-muted rounded">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground">{template.subject}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    No templates with warm tag. Add one in the Template Editor.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <Badge variant="secondary" className="mb-3">COLD (25-49 score)</Badge>
              <p className="text-sm text-muted-foreground mb-3">
                New leads needing education
              </p>
              {getTemplatesByTag("cold").length > 0 ? (
                <div className="space-y-2">
                  {getTemplatesByTag("cold").map((template: any) => (
                    <div key={template.id} className="text-sm p-2 bg-muted rounded">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground">{template.subject}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    No templates with cold tag. Add one in the Template Editor.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>How to set up:</strong> Go to the Template Editor and tag your nurture templates
              with hot, warm, or cold to assign them to lead statuses. Templates support variables
              like name, email, and score. If no templates are found, default content will be used.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="/admin/template-editor">Open Template Editor</a>
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </PageLayout>
  );
}
