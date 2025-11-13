import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const sb: any = supabase;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Award, AlertCircle, Target } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ABTestControls } from "@/components/ab-testing/ABTestControls";

interface TemplatePerformance {
  template_id: string;
  template_name: string;
  campaign_type: string;
  is_ab_test: boolean;
  ab_test_name: string | null;
  variant_letter: string | null;
  tags: string[];
  sends_count: number;
  opens_count: number;
  clicks_count: number;
  open_rate: number;
  click_rate: number;
}

// Calculate chi-square test for statistical significance
const calculateSignificance = (variantA: TemplatePerformance, variantB: TemplatePerformance) => {
  const n1 = variantA.sends_count;
  const n2 = variantB.sends_count;
  const p1 = variantA.opens_count / n1;
  const p2 = variantB.opens_count / n2;
  
  const pooledP = (variantA.opens_count + variantB.opens_count) / (n1 + n2);
  const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
  
  if (se === 0) return { significant: false, pValue: 1, zScore: 0 };
  
  const zScore = Math.abs((p1 - p2) / se);
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));
  
  return {
    significant: pValue < 0.05,
    pValue,
    zScore
  };
};

// Standard normal CDF approximation
const normalCDF = (x: number) => {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
};

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

export default function ABTestDashboard() {
  const [selectedTest, setSelectedTest] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  // Fetch template performance data
  const { data: performanceData, isLoading } = useQuery({
    queryKey: ["template-performance"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("template_performance")
        .select("*")
        .order("sends_count", { ascending: false });

      if (error) throw error;
      return data as TemplatePerformance[];
    },
  });

  // Check template active status and manual controls
  const { data: templatesStatus } = useQuery({
    queryKey: ["templates-active-status"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("email_templates")
        .select("id, is_active, ab_test_name, auto_winner_paused, traffic_weight, name, variant_letter")
        .eq("is_ab_test", true);

      if (error) throw error;
      return data as Array<{ 
        id: string; 
        is_active: boolean; 
        ab_test_name: string | null;
        auto_winner_paused: boolean;
        traffic_weight: number;
        name: string;
        variant_letter: string | null;
      }>;
    },
  });

  // Filter data
  const filteredData = performanceData?.filter((item) => {
    const testMatch = selectedTest === "all" || item.ab_test_name === selectedTest;
    const tagMatch = selectedTag === "all" || item.tags?.includes(selectedTag);
    return testMatch && tagMatch;
  });

  // Group by A/B test
  const testGroups = filteredData?.reduce((acc, item) => {
    if (item.is_ab_test && item.ab_test_name) {
      if (!acc[item.ab_test_name]) {
        acc[item.ab_test_name] = [];
      }
      acc[item.ab_test_name].push(item);
    }
    return acc;
  }, {} as Record<string, TemplatePerformance[]>);

  // Get unique test names and tags
  const testNames = Array.from(new Set(performanceData?.filter(d => d.is_ab_test).map(d => d.ab_test_name).filter(Boolean))) as string[];
  const allTags = Array.from(new Set(performanceData?.flatMap(d => d.tags || [])));

  // Calculate overall metrics
  const totalSends = filteredData?.reduce((sum, item) => sum + item.sends_count, 0) || 0;
  const totalOpens = filteredData?.reduce((sum, item) => sum + item.opens_count, 0) || 0;
  const totalClicks = filteredData?.reduce((sum, item) => sum + item.clicks_count, 0) || 0;
  const avgOpenRate = totalSends > 0 ? ((totalOpens / totalSends) * 100).toFixed(2) : "0";
  const avgClickRate = totalSends > 0 ? ((totalClicks / totalSends) * 100).toFixed(2) : "0";

  // Prepare chart data
  const chartData = filteredData?.map((item) => ({
    name: `${item.template_name} ${item.variant_letter ? `(${item.variant_letter})` : ""}`,
    openRate: parseFloat(item.open_rate.toString()),
    clickRate: parseFloat(item.click_rate.toString()),
    sends: item.sends_count,
  })) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">A/B Test Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Compare template variants and identify winning strategies
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/admin/ab-test-history'}
        >
          View Winner History
        </Button>
      </div>

      {/* Automated Winner Selection Info */}
      <Alert className="mb-8">
        <TrendingUp className="h-4 w-4" />
        <AlertDescription>
          <div className="font-medium mb-1">Automated Winner Selection Active</div>
          <div className="text-sm">
            The system automatically evaluates A/B tests daily at 2 AM UTC. When a variant achieves statistical significance (95% confidence), 
            underperforming variants are automatically deactivated, promoting the winner to 100% traffic.
          </div>
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Filter by A/B Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedTest} onValueChange={setSelectedTest}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tests</SelectItem>
                {testNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Filter by Tag</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Overall Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Sends:</span>
              <span className="font-semibold">{totalSends}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg Open Rate:</span>
              <span className="font-semibold">{avgOpenRate}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg Click Rate:</span>
              <span className="font-semibold">{avgClickRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Comparison Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Performance Comparison</CardTitle>
          <CardDescription>Open rates and click rates across all templates</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="openRate" name="Open Rate %" fill="#4ECDC4" />
              <Bar dataKey="clickRate" name="Click Rate %" fill="#FF6B6B" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* A/B Test Results */}
      {testGroups && Object.keys(testGroups).length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">A/B Test Results</h2>
          
          {Object.entries(testGroups).map(([testName, variants]) => {
            if (variants.length < 2) return null;

            // Find winner
            const winner = variants.reduce((prev, current) =>
              current.open_rate > prev.open_rate ? current : prev
            );

            // Calculate significance between top 2 variants
            const sortedVariants = [...variants].sort((a, b) => b.open_rate - a.open_rate);
            const significance = sortedVariants.length >= 2
              ? calculateSignificance(sortedVariants[0], sortedVariants[1])
              : null;

            return (
              <Card key={testName}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {testName}
                        {significance?.significant && (
                          <Badge variant="default" className="ml-2">
                            Significant Result
                          </Badge>
                        )}
                        {templatesStatus?.some(t => t.ab_test_name === testName && t.auto_winner_paused) && (
                          <Badge variant="outline" className="ml-2">
                            Manual Control
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {variants.length} variants • {variants.reduce((sum, v) => sum + v.sends_count, 0)} total sends
                      </CardDescription>
                    </div>
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Manual Controls */}
                  {templatesStatus && (
                    <ABTestControls
                      testName={testName}
                      variants={variants.map(v => {
                        const templateStatus = templatesStatus.find(t => t.id === v.template_id);
                        return {
                          template_id: v.template_id,
                          template_name: v.template_name,
                          variant_letter: v.variant_letter,
                          auto_winner_paused: templateStatus?.auto_winner_paused ?? false,
                          traffic_weight: templateStatus?.traffic_weight ?? 100,
                        };
                      })}
                    />
                  )}

                  {/* Variants Grid */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {variants.map((variant, idx) => (
                      <Card key={variant.template_id} className={variant.template_id === winner.template_id ? "border-primary" : ""}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              Variant {variant.variant_letter}
                            </CardTitle>
                            <div className="flex gap-2">
                              {variant.template_id === winner.template_id && (
                                <Badge variant="default">Winner</Badge>
                              )}
                              {templatesStatus?.find(t => t.id === variant.template_id)?.is_active === false && (
                                <Badge variant="destructive">Deactivated</Badge>
                              )}
                            </div>
                          </div>
                          <CardDescription className="text-xs">{variant.template_name}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Sends</span>
                              <span className="font-semibold">{variant.sends_count}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Opens</span>
                              <span className="font-semibold">{variant.opens_count}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Clicks</span>
                              <span className="font-semibold">{variant.clicks_count}</span>
                            </div>
                          </div>
                          <div className="space-y-2 pt-2 border-t">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Open Rate</span>
                              <Badge variant="outline" className="font-mono">
                                {variant.open_rate}%
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Click Rate</span>
                              <Badge variant="outline" className="font-mono">
                                {variant.click_rate}%
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Statistical Significance */}
                  {significance && (
                    <Alert className={significance.significant ? "border-green-500" : "border-yellow-500"}>
                      <div className="flex items-start gap-2">
                        {significance.significant ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                        )}
                        <AlertDescription>
                          <div className="font-medium mb-1">
                            {significance.significant
                              ? "✓ Statistically Significant Result"
                              : "⚠ Result Not Yet Significant"}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>
                              <strong>P-value:</strong> {significance.pValue.toFixed(4)} 
                              {significance.significant ? " (< 0.05)" : " (≥ 0.05)"}
                            </div>
                            <div>
                              <strong>Z-score:</strong> {significance.zScore.toFixed(2)}
                            </div>
                            {!significance.significant && (
                              <div className="mt-2 text-xs">
                                Continue testing to reach statistical significance. Need more data for reliable conclusions.
                              </div>
                            )}
                            {significance.significant && (
                              <div className="mt-2 text-xs text-green-600">
                                ✓ The difference is statistically significant. The automated system will deactivate underperforming variants daily at 2 AM UTC.
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}

                  {/* Comparison Chart */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Performance Comparison</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={variants.map(v => ({
                        name: `Variant ${v.variant_letter}`,
                        open: parseFloat(v.open_rate.toString()),
                        click: parseFloat(v.click_rate.toString()),
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="open" name="Open Rate %" stroke="#4ECDC4" strokeWidth={2} />
                        <Line type="monotone" dataKey="click" name="Click Rate %" stroke="#FF6B6B" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {(!testGroups || Object.keys(testGroups).length === 0) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No A/B tests found. Create templates with A/B test configurations in the Template Editor to see results here.
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-8 flex gap-4">
        <Button variant="outline" asChild>
          <a href="/admin/template-editor">Template Editor</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/admin/lead-nurture">Lead Nurture Manager</a>
        </Button>
      </div>
    </div>
  );
}
