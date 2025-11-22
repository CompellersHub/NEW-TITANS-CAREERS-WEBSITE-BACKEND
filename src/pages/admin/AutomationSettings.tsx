import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, Calendar, Settings, Database } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface AutomationConfig {
  id: string;
  config_key: string;
  is_enabled: boolean;
  settings: any;
  last_run_at: string | null;
}

interface EventTemplate {
  id: string;
  template_name: string;
  event_type: string;
  course_slug: string;
  day_of_week: number;
  time: string;
  duration_minutes: number;
  is_active: boolean;
  recurrence_pattern: string;
}

const AutomationSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);

  const { data: configs, isLoading: configsLoading } = useQuery({
    queryKey: ["automation-configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automation_config")
        .select("*")
        .order("config_key");
      if (error) throw error;
      return data as AutomationConfig[];
    },
  });

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["event-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_templates")
        .select("*")
        .order("course_slug", { ascending: true });
      if (error) throw error;
      return data as EventTemplate[];
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AutomationConfig> }) => {
      const { error } = await supabase
        .from("automation_config")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automation-configs"] });
      toast({ title: "Configuration updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update configuration", description: error.message, variant: "destructive" });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("event_templates")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-templates"] });
      toast({ title: "Template updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update template", description: error.message, variant: "destructive" });
    },
  });

  const manualTriggerMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("maintain-event-lifecycle");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["automation-configs"] });
      toast({ 
        title: "Automation run completed", 
        description: `Created ${data?.counts?.cohortsCreated || 0} cohorts, ${data?.counts?.weeklyEventsCreated || 0} weekly events` 
      });
      setIsRunning(false);
    },
    onError: (error: Error) => {
      toast({ title: "Automation run failed", description: error.message, variant: "destructive" });
      setIsRunning(false);
    },
  });

  const cohortConfig = configs?.find(c => c.config_key === "cohort_automation");
  const weeklyConfig = configs?.find(c => c.config_key === "weekly_events_automation");

  const getDayName = (day: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[day];
  };

  if (configsLoading || templatesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Event Automation Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure automated event generation and maintenance
          </p>
        </div>
        <Button
          onClick={() => {
            setIsRunning(true);
            manualTriggerMutation.mutate();
          }}
          disabled={isRunning}
          size="lg"
        >
          {isRunning ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running...</>
          ) : (
            <><Play className="mr-2 h-4 w-4" /> Run Now</>
          )}
        </Button>
      </div>

      <Tabs defaultValue="cohorts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cohorts" className="gap-2">
            <Calendar className="h-4 w-4" />
            Cohort Automation
          </TabsTrigger>
          <TabsTrigger value="weekly" className="gap-2">
            <Database className="h-4 w-4" />
            Weekly Events
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Global Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cohorts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cohort Generation</CardTitle>
                  <CardDescription>
                    Automatically maintain {cohortConfig?.settings?.cohorts_to_maintain || 2} upcoming cohorts per course
                  </CardDescription>
                </div>
                <Switch
                  checked={cohortConfig?.is_enabled || false}
                  onCheckedChange={(checked) => {
                    if (cohortConfig) {
                      updateConfigMutation.mutate({ id: cohortConfig.id, updates: { is_enabled: checked } });
                    }
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cohorts to Maintain</Label>
                  <Input
                    type="number"
                    value={cohortConfig?.settings?.cohorts_to_maintain || 2}
                    onChange={(e) => {
                      if (cohortConfig) {
                        updateConfigMutation.mutate({
                          id: cohortConfig.id,
                          updates: {
                            settings: {
                              ...cohortConfig.settings,
                              cohorts_to_maintain: parseInt(e.target.value),
                            },
                          },
                        });
                      }
                    }}
                  />
                </div>
                <div>
                  <Label>Gap Between Cohorts (weeks)</Label>
                  <Input
                    type="number"
                    value={cohortConfig?.settings?.gap_weeks_between_cohorts || 6}
                    onChange={(e) => {
                      if (cohortConfig) {
                        updateConfigMutation.mutate({
                          id: cohortConfig.id,
                          updates: {
                            settings: {
                              ...cohortConfig.settings,
                              gap_weeks_between_cohorts: parseInt(e.target.value),
                            },
                          },
                        });
                      }
                    }}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base">Holiday Exclusions</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Cohorts will not be scheduled during these date ranges
                </p>
                <div className="space-y-2">
                  {cohortConfig?.settings?.excluded_date_ranges?.map((range: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{range.reason}</p>
                        <p className="text-sm text-muted-foreground">
                          {range.start} to {range.end}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {cohortConfig?.last_run_at && (
                <div className="text-sm text-muted-foreground">
                  Last run: {new Date(cohortConfig.last_run_at).toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Weekly Events Automation</CardTitle>
                  <CardDescription>
                    Automatically generate Q&A sessions and workshops
                  </CardDescription>
                </div>
                <Switch
                  checked={weeklyConfig?.is_enabled || false}
                  onCheckedChange={(checked) => {
                    if (weeklyConfig) {
                      updateConfigMutation.mutate({ id: weeklyConfig.id, updates: { is_enabled: checked } });
                    }
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Generate Weeks Ahead</Label>
                  <Input
                    type="number"
                    value={weeklyConfig?.settings?.generate_weeks_ahead || 8}
                    onChange={(e) => {
                      if (weeklyConfig) {
                        updateConfigMutation.mutate({
                          id: weeklyConfig.id,
                          updates: {
                            settings: {
                              ...weeklyConfig.settings,
                              generate_weeks_ahead: parseInt(e.target.value),
                            },
                          },
                        });
                      }
                    }}
                  />
                </div>
                <div>
                  <Label>Cleanup Weeks Past</Label>
                  <Input
                    type="number"
                    value={weeklyConfig?.settings?.cleanup_weeks_past || 4}
                    onChange={(e) => {
                      if (weeklyConfig) {
                        updateConfigMutation.mutate({
                          id: weeklyConfig.id,
                          updates: {
                            settings: {
                              ...weeklyConfig.settings,
                              cleanup_weeks_past: parseInt(e.target.value),
                            },
                          },
                        });
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Templates</CardTitle>
              <CardDescription>
                Manage recurring event templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {templates?.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{template.template_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {getDayName(template.day_of_week)} at {template.time} • {template.duration_minutes} minutes • {template.recurrence_pattern}
                      </p>
                    </div>
                    <Switch
                      checked={template.is_active}
                      onCheckedChange={(checked) => {
                        updateTemplateMutation.mutate({ id: template.id, is_active: checked });
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Automation system health and logs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Cohort Automation</span>
                  <span className={cohortConfig?.is_enabled ? "text-green-600" : "text-muted-foreground"}>
                    {cohortConfig?.is_enabled ? "Active" : "Disabled"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Weekly Events Automation</span>
                  <span className={weeklyConfig?.is_enabled ? "text-green-600" : "text-muted-foreground"}>
                    {weeklyConfig?.is_enabled ? "Active" : "Disabled"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Cron Schedule</span>
                  <span className="text-muted-foreground">Daily at midnight</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationSettings;
