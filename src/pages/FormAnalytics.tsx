import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layouts/PageLayout";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const sb: any = supabase;
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, TrendingUp, TrendingDown, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AnalyticsSummary {
  form_name: string;
  step_number: number;
  step_title: string;
  field_name: string;
  total_events: number;
  unique_sessions: number;
  avg_time_spent_ms: number;
  error_count: number;
  abandon_count: number;
  complete_count: number;
}

export default function FormAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data, error } = await sb
        .from('form_analytics_summary')
        .select('*')
        .order('error_count', { ascending: false });

      if (error) throw error;
      setAnalytics(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const groupedByForm = analytics.reduce((acc, item) => {
    if (!acc[item.form_name]) {
      acc[item.form_name] = [];
    }
    acc[item.form_name].push(item);
    return acc;
  }, {} as Record<string, AnalyticsSummary[]>);

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const calculateAbandonmentRate = (abandons: number, completes: number) => {
    const total = abandons + completes;
    return total > 0 ? ((abandons / total) * 100).toFixed(1) : '0';
  };

  if (loading) {
    return (
      <PageTransition>
        <PageLayout intensity3D="subtle" show3D={true}>
          <div className="container mx-auto py-16 px-4">
            <p className="text-center text-muted-foreground">Loading analytics...</p>
          </div>
        </PageLayout>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PageLayout intensity3D="subtle" show3D={true}>
        <div className="container mx-auto py-16 px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-kanit font-bold mb-2">Form Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Track user behavior, field struggles, and abandonment rates across all forms
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {analytics.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No analytics data available yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Fill out some forms to start collecting data.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue={Object.keys(groupedByForm)[0]} className="space-y-6">
              <TabsList>
                {Object.keys(groupedByForm).map((formName) => (
                  <TabsTrigger key={formName} value={formName}>
                    {formName.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(groupedByForm).map(([formName, formData]) => (
                <TabsContent key={formName} value={formName} className="space-y-6">
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <p className="text-2xl font-bold">
                            {Math.max(...formData.map(d => d.unique_sessions))}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Time per Field</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p className="text-2xl font-bold">
                            {formatTime(
                              formData.reduce((sum, d) => sum + d.avg_time_spent_ms, 0) / formData.length
                            )}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          <p className="text-2xl font-bold text-destructive">
                            {formData.reduce((sum, d) => sum + d.error_count, 0)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <p className="text-2xl font-bold text-green-500">
                            {(100 - parseFloat(calculateAbandonmentRate(
                              formData.reduce((sum, d) => sum + d.abandon_count, 0),
                              formData.reduce((sum, d) => sum + d.complete_count, 0)
                            ))).toFixed(1)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Field-Level Analytics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Field-Level Performance</CardTitle>
                      <CardDescription>
                        Identify which fields users struggle with most
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {formData
                          .filter(d => d.field_name)
                          .sort((a, b) => b.error_count - a.error_count)
                          .map((field, index) => {
                            const abandonRate = calculateAbandonmentRate(
                              field.abandon_count,
                              field.complete_count
                            );
                            
                            return (
                              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium">{field.field_name}</p>
                                    {field.step_title && (
                                      <Badge variant="outline" className="text-xs">
                                        Step {field.step_number + 1}: {field.step_title}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Avg: {formatTime(field.avg_time_spent_ms)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {field.unique_sessions} sessions
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-4 items-center">
                                  <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Errors</p>
                                    <p className={`text-lg font-bold ${
                                      field.error_count > 5 ? 'text-destructive' : 'text-muted-foreground'
                                    }`}>
                                      {field.error_count}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Abandon Rate</p>
                                    <div className="flex items-center gap-1">
                                      {parseFloat(abandonRate) > 20 ? (
                                        <TrendingDown className="h-4 w-4 text-destructive" />
                                      ) : (
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                      )}
                                      <p className={`text-lg font-bold ${
                                        parseFloat(abandonRate) > 20 ? 'text-destructive' : 'text-green-500'
                                      }`}>
                                        {abandonRate}%
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step-Level Analytics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Step-Level Performance</CardTitle>
                      <CardDescription>
                        Track completion and abandonment rates by step
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Array.from(new Set(formData.map(d => d.step_number)))
                          .sort((a, b) => a - b)
                          .map((stepNum) => {
                            const stepData = formData.filter(d => d.step_number === stepNum);
                            const stepTitle = stepData[0]?.step_title || `Step ${stepNum + 1}`;
                            const totalAbandons = stepData.reduce((sum, d) => sum + d.abandon_count, 0);
                            const totalCompletes = stepData.reduce((sum, d) => sum + d.complete_count, 0);
                            const avgTime = stepData.reduce((sum, d) => sum + d.avg_time_spent_ms, 0) / stepData.length;
                            const abandonRate = calculateAbandonmentRate(totalAbandons, totalCompletes);

                            return (
                              <div key={stepNum} className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                  <p className="font-medium mb-1">{stepTitle}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Avg time: {formatTime(avgTime)}
                                  </p>
                                </div>
                                <div className="flex gap-6 items-center">
                                  <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Completed</p>
                                    <p className="text-lg font-bold text-green-500">{totalCompletes}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Abandoned</p>
                                    <p className="text-lg font-bold text-destructive">{totalAbandons}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Abandon Rate</p>
                                    <p className={`text-lg font-bold ${
                                      parseFloat(abandonRate) > 20 ? 'text-destructive' : 'text-green-500'
                                    }`}>
                                      {abandonRate}%
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </PageLayout>
    </PageTransition>
  );
}
