import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const sb: any = supabase;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PageLayout } from "@/components/layouts/PageLayout";
import { Mail, TrendingUp, Eye, MousePointer, RefreshCw } from "lucide-react";

interface Variant {
  id: string;
  variant_name: string;
  subject_line: string;
  preview_text: string;
  is_active: boolean;
}

interface VariantStats {
  variant_id: string;
  variant_name: string;
  subject_line: string;
  total_sends: number;
  total_opens: number;
  total_clicks: number;
  open_rate: number;
  click_rate: number;
}

export default function EmailABTestDashboard() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [stats, setStats] = useState<VariantStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newVariant, setNewVariant] = useState({
    variant_name: "",
    subject_line: "",
    preview_text: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load variants
      const { data: variantsData, error: variantsError } = await sb
        .from("email_ab_variants")
        .select("*")
        .eq("email_type", "conversation_summary")
        .order("created_at", { ascending: false });

      if (variantsError) throw variantsError;
      setVariants(variantsData || []);

      // Load stats for each variant
      const { data: sendsData, error: sendsError } = await sb
        .from("email_sends")
        .select(`
          variant_id,
          opened_at,
          clicked_at,
          email_ab_variants (
            variant_name,
            subject_line
          )
        `);

      if (sendsError) throw sendsError;

      // Calculate stats
      const statsMap = new Map<string, VariantStats>();
      
      sendsData?.forEach((send: any) => {
        const variantId = send.variant_id;
        if (!variantId) return;

        if (!statsMap.has(variantId)) {
          statsMap.set(variantId, {
            variant_id: variantId,
            variant_name: send.email_ab_variants?.variant_name || "Unknown",
            subject_line: send.email_ab_variants?.subject_line || "",
            total_sends: 0,
            total_opens: 0,
            total_clicks: 0,
            open_rate: 0,
            click_rate: 0,
          });
        }

        const stat = statsMap.get(variantId)!;
        stat.total_sends++;
        if (send.opened_at) stat.total_opens++;
        if (send.clicked_at) stat.total_clicks++;
      });

      // Calculate rates
      const statsArray = Array.from(statsMap.values()).map(stat => ({
        ...stat,
        open_rate: stat.total_sends > 0 ? (stat.total_opens / stat.total_sends) * 100 : 0,
        click_rate: stat.total_sends > 0 ? (stat.total_clicks / stat.total_sends) * 100 : 0,
      }));

      setStats(statsArray);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load A/B test data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVariant = async (variantId: string, currentStatus: boolean) => {
    try {
      const { error } = await sb
        .from("email_ab_variants")
        .update({ is_active: !currentStatus })
        .eq("id", variantId);

      if (error) throw error;
      toast.success(`Variant ${!currentStatus ? "activated" : "deactivated"}`);
      loadData();
    } catch (error) {
      console.error("Error toggling variant:", error);
      toast.error("Failed to toggle variant");
    }
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newVariant.variant_name || !newVariant.subject_line) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { error } = await sb
        .from("email_ab_variants")
        .insert({
          variant_name: newVariant.variant_name,
          subject_line: newVariant.subject_line,
          preview_text: newVariant.preview_text,
          email_type: "conversation_summary",
        });

      if (error) throw error;
      
      toast.success("New variant added successfully");
      setNewVariant({ variant_name: "", subject_line: "", preview_text: "" });
      loadData();
    } catch (error) {
      console.error("Error adding variant:", error);
      toast.error("Failed to add variant");
    }
  };

  const getBestPerformer = () => {
    if (stats.length === 0) return null;
    return stats.reduce((best, current) => 
      current.open_rate > best.open_rate ? current : best
    );
  };

  const bestPerformer = getBestPerformer();

  return (
    <PageLayout intensity3D="subtle" show3D={true}>
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Email A/B Test Dashboard</h1>
            <p className="text-muted-foreground">
              Optimize your email campaigns by testing different subject lines and content
            </p>
          </div>

          {/* Overall Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Variants</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{variants.length}</div>
                <p className="text-xs text-muted-foreground">
                  {variants.filter(v => v.is_active).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sends</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.reduce((sum, s) => sum + s.total_sends, 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.length > 0
                    ? (stats.reduce((sum, s) => sum + s.open_rate, 0) / stats.length).toFixed(1)
                    : 0}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Click Rate</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.length > 0
                    ? (stats.reduce((sum, s) => sum + s.click_rate, 0) / stats.length).toFixed(1)
                    : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Best Performer */}
          {bestPerformer && (
            <Card className="border-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Best Performing Variant
                </CardTitle>
                <CardDescription>
                  Highest open rate among all variants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{bestPerformer.subject_line}</p>
                  <div className="flex gap-4">
                    <Badge variant="secondary">
                      {bestPerformer.variant_name}
                    </Badge>
                    <Badge variant="outline">
                      {bestPerformer.open_rate.toFixed(1)}% open rate
                    </Badge>
                    <Badge variant="outline">
                      {bestPerformer.total_sends} sends
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Variant Performance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Variant Performance</CardTitle>
                <CardDescription>Compare performance across all email variants</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={loadData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground text-center py-8">Loading...</p>
              ) : stats.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No data yet. Send some emails to see performance stats.
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.map((stat) => {
                    const variant = variants.find(v => v.id === stat.variant_id);
                    return (
                      <div
                        key={stat.variant_id}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{stat.variant_name}</h3>
                              {variant && (
                                <Badge variant={variant.is_active ? "default" : "secondary"}>
                                  {variant.is_active ? "Active" : "Inactive"}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{stat.subject_line}</p>
                          </div>
                          {variant && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleVariant(variant.id, variant.is_active)}
                            >
                              {variant.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Sends</p>
                            <p className="text-xl font-semibold">{stat.total_sends}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Opens</p>
                            <p className="text-xl font-semibold">{stat.total_opens}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Open Rate</p>
                            <p className="text-xl font-semibold text-accent">
                              {stat.open_rate.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Click Rate</p>
                            <p className="text-xl font-semibold text-accent">
                              {stat.click_rate.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add New Variant */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Variant</CardTitle>
              <CardDescription>
                Create a new email variant to test different subject lines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddVariant} className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="variant_name">Variant Name *</Label>
                    <Input
                      id="variant_name"
                      placeholder="e.g., curiosity_v2"
                      value={newVariant.variant_name}
                      onChange={(e) =>
                        setNewVariant({ ...newVariant, variant_name: e.target.value })
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject_line">Subject Line *</Label>
                    <Input
                      id="subject_line"
                      placeholder="e.g., Your personalized course recommendations"
                      value={newVariant.subject_line}
                      onChange={(e) =>
                        setNewVariant({ ...newVariant, subject_line: e.target.value })
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="preview_text">Preview Text (Optional)</Label>
                    <Input
                      id="preview_text"
                      placeholder="e.g., See what courses match your goals"
                      value={newVariant.preview_text}
                      onChange={(e) =>
                        setNewVariant({ ...newVariant, preview_text: e.target.value })
                      }
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  Add Variant
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </PageLayout>
  );
}
