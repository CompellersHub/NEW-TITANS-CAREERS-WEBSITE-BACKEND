import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Target, TrendingUp, CheckCircle, XCircle, RefreshCw, BarChart3, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PageLayout } from "@/components/layouts/PageLayout";
import { PageTransition } from "@/components/PageTransition";
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { format } from "date-fns";

interface ValidatedPrediction {
  id: string;
  prediction_date: string;
  channel: string;
  predicted_alert_probability: number;
  predicted_conversion_rate: number;
  predicted_roi: number;
  confidence_score: number;
  actual_alert_triggered: boolean;
  prediction_accuracy: number;
  validated_at: string;
}

const PredictionAccuracy = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [predictions, setPredictions] = useState<ValidatedPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    checkAdminRole();
    fetchValidatedPredictions();
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

  const fetchValidatedPredictions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("alert_predictions" as any)
        .select("*")
        .not("validated_at", "is", null)
        .order("validated_at", { ascending: false })
        .limit(200);

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

  const runValidation = async () => {
    setValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke("validate-predictions");

      if (error) throw error;

      toast({
        title: "Validation Complete",
        description: `Validated ${data.validated} predictions with ${data.average_accuracy}% average accuracy`,
      });

      await fetchValidatedPredictions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setValidating(false);
    }
  };

  const calculateMetrics = () => {
    if (predictions.length === 0) {
      return {
        overallAccuracy: 0,
        truePositives: 0,
        trueNegatives: 0,
        falsePositives: 0,
        falseNegatives: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
      };
    }

    let truePositives = 0;
    let trueNegatives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    predictions.forEach(pred => {
      const predictedAlert = pred.predicted_alert_probability >= 50;
      const actualAlert = pred.actual_alert_triggered;

      if (predictedAlert && actualAlert) truePositives++;
      else if (!predictedAlert && !actualAlert) trueNegatives++;
      else if (predictedAlert && !actualAlert) falsePositives++;
      else if (!predictedAlert && actualAlert) falseNegatives++;
    });

    const precision = truePositives + falsePositives > 0
      ? (truePositives / (truePositives + falsePositives)) * 100
      : 0;

    const recall = truePositives + falseNegatives > 0
      ? (truePositives / (truePositives + falseNegatives)) * 100
      : 0;

    const f1Score = precision + recall > 0
      ? (2 * (precision * recall) / (precision + recall))
      : 0;

    const overallAccuracy = predictions.reduce((sum, p) => sum + p.prediction_accuracy, 0) / predictions.length;

    return {
      overallAccuracy,
      truePositives,
      trueNegatives,
      falsePositives,
      falseNegatives,
      precision,
      recall,
      f1Score,
    };
  };

  const getAccuracyByChannel = () => {
    const channelData: { [key: string]: { total: number; accuracy: number; count: number } } = {};

    predictions.forEach(pred => {
      if (!channelData[pred.channel]) {
        channelData[pred.channel] = { total: 0, accuracy: 0, count: 0 };
      }
      channelData[pred.channel].total += pred.prediction_accuracy;
      channelData[pred.channel].count++;
    });

    return Object.entries(channelData).map(([channel, data]) => ({
      channel: channel.charAt(0).toUpperCase() + channel.slice(1),
      accuracy: data.total / data.count,
      predictions: data.count,
    }));
  };

  const getAccuracyOverTime = () => {
    const last30Days = predictions
      .filter(p => {
        const date = new Date(p.validated_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return date >= thirtyDaysAgo;
      })
      .sort((a, b) => new Date(a.validated_at).getTime() - new Date(b.validated_at).getTime());

    const dailyData: { [key: string]: { total: number; count: number } } = {};

    last30Days.forEach(pred => {
      const date = format(new Date(pred.validated_at), 'MM/dd');
      if (!dailyData[date]) {
        dailyData[date] = { total: 0, count: 0 };
      }
      dailyData[date].total += pred.prediction_accuracy;
      dailyData[date].count++;
    });

    return Object.entries(dailyData).map(([date, data]) => ({
      date,
      accuracy: data.total / data.count,
      count: data.count,
    }));
  };

  const getConfidenceVsAccuracy = () => {
    return predictions.map(pred => ({
      confidence: pred.confidence_score,
      accuracy: pred.prediction_accuracy,
      channel: pred.channel,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const metrics = calculateMetrics();
  const channelAccuracy = getAccuracyByChannel();
  const timelineData = getAccuracyOverTime();
  const confidenceData = getConfidenceVsAccuracy();

  return (
    <PageTransition>
      <PageLayout intensity3D="subtle" show3D={true}>
        <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="h-8 w-8" />
              Prediction Accuracy Tracking
            </h1>
            <p className="text-muted-foreground mt-2">
              Validate forecasts against actual results and track model performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/predictive-analytics')}>
              <Brain className="mr-2 h-4 w-4" />
              Back to Predictions
            </Button>
            <Button onClick={runValidation} disabled={validating}>
              {validating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Run Validation
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Overall Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.overallAccuracy.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {predictions.length} predictions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Precision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.precision.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                When we predict alert, how often correct
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Recall
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.recall.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Of actual alerts, how many we caught
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                F1 Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.f1Score.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Harmonic mean of precision & recall
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Confusion Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Confusion Matrix</CardTitle>
            <CardDescription>Prediction vs Actual Alert Status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 max-w-2xl">
              <div></div>
              <div className="text-center font-semibold">Alert Happened</div>
              <div className="text-center font-semibold">No Alert</div>

              <div className="font-semibold">Predicted Alert</div>
              <Card className="bg-green-50 dark:bg-green-950">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {metrics.truePositives}
                  </div>
                  <p className="text-xs text-muted-foreground">True Positives</p>
                </CardContent>
              </Card>
              <Card className="bg-red-50 dark:bg-red-950">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {metrics.falsePositives}
                  </div>
                  <p className="text-xs text-muted-foreground">False Positives</p>
                </CardContent>
              </Card>

              <div className="font-semibold">Predicted No Alert</div>
              <Card className="bg-red-50 dark:bg-red-950">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {metrics.falseNegatives}
                  </div>
                  <p className="text-xs text-muted-foreground">False Negatives</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 dark:bg-green-950">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {metrics.trueNegatives}
                  </div>
                  <p className="text-xs text-muted-foreground">True Negatives</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <Tabs defaultValue="timeline" className="space-y-4">
          <TabsList>
            <TabsTrigger value="timeline">Accuracy Over Time</TabsTrigger>
            <TabsTrigger value="channels">By Channel</TabsTrigger>
            <TabsTrigger value="confidence">Confidence vs Accuracy</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Accuracy Trend (Last 30 Days)</CardTitle>
                <CardDescription>Daily average prediction accuracy</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2} name="Accuracy %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels">
            <Card>
              <CardHeader>
                <CardTitle>Accuracy by Channel</CardTitle>
                <CardDescription>Model performance across different channels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={channelAccuracy}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="accuracy" fill="hsl(var(--primary))" name="Accuracy %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="confidence">
            <Card>
              <CardHeader>
                <CardTitle>Model Confidence vs Actual Accuracy</CardTitle>
                <CardDescription>Correlation between confidence score and prediction accuracy</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="confidence" name="Confidence" unit="%" domain={[0, 100]} />
                    <YAxis dataKey="accuracy" name="Accuracy" unit="%" domain={[0, 100]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter name="Predictions" data={confidenceData} fill="hsl(var(--primary))" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Validations */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Validations</CardTitle>
            <CardDescription>Latest prediction validation results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {predictions.slice(0, 10).map((pred) => (
                <div key={pred.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {pred.actual_alert_triggered ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium">{pred.channel.toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">
                        Predicted {pred.predicted_alert_probability.toFixed(0)}% chance of alert
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={pred.prediction_accuracy >= 70 ? "default" : pred.prediction_accuracy >= 50 ? "secondary" : "destructive"}>
                      {pred.prediction_accuracy.toFixed(1)}% Accurate
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(pred.validated_at), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
      </PageLayout>
    </PageTransition>
  );
};

export default PredictionAccuracy;