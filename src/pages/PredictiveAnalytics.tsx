import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, RefreshCw, Brain, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Prediction {
  id: string;
  prediction_date: string;
  prediction_period: string;
  channel: string;
  predicted_alert_probability: number;
  predicted_conversion_rate: number;
  predicted_roi: number;
  confidence_score: number;
  contributing_factors: any;
  recommendations: any;
}

const PredictiveAnalytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("next_24h");

  useEffect(() => {
    checkAdminRole();
    fetchPredictions();
  }, []);

  const checkAdminRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || roleData.role !== "admin") {
      navigate("/");
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
    }
  };

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("alert_predictions" as any)
        .select("*")
        .order("prediction_date", { ascending: false })
        .limit(100);

      if (error) throw error;
      setPredictions((data as any) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("predict-alerts");

      if (error) throw error;

      toast({
        title: "Predictions Generated",
        description: `Successfully generated ${data.predictions_generated} predictions`,
      });

      await fetchPredictions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const getLatestPredictions = () => {
    return predictions
      .filter(p => p.prediction_period === selectedPeriod)
      .slice(0, 4);
  };

  const getRiskLevel = (probability: number) => {
    if (probability >= 70) return { level: "High", color: "destructive" };
    if (probability >= 40) return { level: "Medium", color: "default" };
    return { level: "Low", color: "secondary" };
  };

  const getChannelIcon = (channel: string) => {
    const icons: Record<string, string> = {
      email: "📧",
      sms: "💬",
      whatsapp: "📱",
      overall: "🌐"
    };
    return icons[channel] || "📊";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const latestPredictions = getLatestPredictions();
  const highRiskPredictions = latestPredictions.filter(p => p.predicted_alert_probability >= 70);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            Predictive Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            ML-powered forecasting to prevent alerts before they happen
          </p>
        </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/prediction-accuracy')}>
              <Target className="mr-2 h-4 w-4" />
              Model Accuracy
            </Button>
            <Button onClick={generatePredictions} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Predictions
                </>
              )}
            </Button>
          </div>
      </div>

      {highRiskPredictions.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>High Risk Alert:</strong> {highRiskPredictions.length} channel(s) are predicted to trigger alerts soon. Take action now!
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
        <TabsList>
          <TabsTrigger value="next_24h">Next 24 Hours</TabsTrigger>
          <TabsTrigger value="next_7d">Next 7 Days</TabsTrigger>
          <TabsTrigger value="next_30d">Next 30 Days</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="space-y-6">
          {/* Risk Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {latestPredictions.map((prediction) => {
              const risk = getRiskLevel(prediction.predicted_alert_probability);
              return (
                <Card key={prediction.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <span>{getChannelIcon(prediction.channel)}</span>
                        {prediction.channel.toUpperCase()}
                      </CardTitle>
                      <Badge variant={risk.color as any}>{risk.level} Risk</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Alert Probability</span>
                        <span className="font-bold">{prediction.predicted_alert_probability.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Conv. Rate</span>
                        <span className="flex items-center gap-1">
                          {prediction.predicted_conversion_rate >= 5 ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          {prediction.predicted_conversion_rate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">ROI</span>
                        <span className={prediction.predicted_roi < 0 ? "text-red-500 font-semibold" : "text-green-500 font-semibold"}>
                          {prediction.predicted_roi.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Confidence</span>
                        <span>{prediction.confidence_score.toFixed(0)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Predicted Alert Probability</CardTitle>
                <CardDescription>Risk levels by channel</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={latestPredictions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="predicted_alert_probability" fill="hsl(var(--destructive))" name="Alert Probability %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Predicted Performance</CardTitle>
                <CardDescription>Conversion rate vs ROI forecast</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={latestPredictions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="predicted_conversion_rate" stroke="hsl(var(--primary))" name="Conv. Rate %" />
                    <Line type="monotone" dataKey="predicted_roi" stroke="hsl(var(--chart-2))" name="ROI %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <div className="grid gap-6 md:grid-cols-2">
            {latestPredictions.map((prediction) => (
              <Card key={prediction.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>{getChannelIcon(prediction.channel)}</span>
                    {prediction.channel.toUpperCase()} - Insights & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Contributing Factors
                    </h4>
                    <ul className="space-y-1">
                      {(Array.isArray(prediction.contributing_factors) ? prediction.contributing_factors : []).map((factor, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-destructive">•</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Recommended Actions
                    </h4>
                    <ul className="space-y-1">
                      {(Array.isArray(prediction.recommendations) ? prediction.recommendations : []).map((rec, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalytics;