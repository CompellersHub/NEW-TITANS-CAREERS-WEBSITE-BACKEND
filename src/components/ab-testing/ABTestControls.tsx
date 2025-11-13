import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Pause, Play, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface Variant {
  template_id: string;
  template_name: string;
  variant_letter: string;
  auto_winner_paused: boolean;
  traffic_weight: number;
}

interface ABTestControlsProps {
  testName: string;
  variants: Variant[];
}

export function ABTestControls({ testName, variants }: ABTestControlsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPaused, setIsPaused] = useState(variants.some(v => v.auto_winner_paused));
  const [weights, setWeights] = useState<Record<string, number>>(
    variants.reduce((acc, v) => ({ ...acc, [v.template_id]: v.traffic_weight }), {})
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleTogglePause = async () => {
    setIsSaving(true);
    try {
      const newPausedState = !isPaused;
      
      // Update all variants in this test
      const { error } = await supabase
        .from("email_templates")
        .update({ auto_winner_paused: newPausedState } as any)
        .in("id", variants.map(v => v.template_id));

      if (error) throw error;

      setIsPaused(newPausedState);
      queryClient.invalidateQueries({ queryKey: ["template-performance"] });
      queryClient.invalidateQueries({ queryKey: ["templates-active-status"] });

      toast({
        title: newPausedState ? "Auto-selection paused" : "Auto-selection resumed",
        description: newPausedState 
          ? "Automated winner selection is now paused. You can manually control traffic distribution."
          : "Automated winner selection will run on the next scheduled evaluation.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleWeightChange = (templateId: string, value: number[]) => {
    setWeights(prev => ({ ...prev, [templateId]: value[0] }));
  };

  const handleSaveWeights = async () => {
    // Validate that weights add up to 100
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    if (totalWeight !== 100) {
      toast({
        title: "Invalid weights",
        description: "Traffic weights must add up to exactly 100%",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Update each variant's traffic weight
      const updates = Object.entries(weights).map(([templateId, weight]) =>
        supabase
          .from("email_templates")
          .update({ traffic_weight: weight } as any)
          .eq("id", templateId)
      );

      await Promise.all(updates);

      queryClient.invalidateQueries({ queryKey: ["template-performance"] });
      queryClient.invalidateQueries({ queryKey: ["templates-active-status"] });

      toast({
        title: "Traffic weights updated",
        description: "The new traffic distribution will be applied to future emails.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Manual Controls</CardTitle>
          </div>
          <Badge variant={isPaused ? "destructive" : "default"}>
            {isPaused ? (
              <>
                <Pause className="h-3 w-3 mr-1" />
                Paused
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" />
                Auto
              </>
            )}
          </Badge>
        </div>
        <CardDescription>
          {isPaused 
            ? "Automated winner selection is paused. Manually control traffic distribution."
            : "Automated winner selection is active and will evaluate variants daily at 2 AM UTC."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pause/Resume Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="space-y-0.5">
            <Label className="text-base">Automated Winner Selection</Label>
            <p className="text-sm text-muted-foreground">
              {isPaused ? "Resume automatic evaluation" : "Pause to manually control variants"}
            </p>
          </div>
          <Switch
            checked={!isPaused}
            onCheckedChange={handleTogglePause}
            disabled={isSaving}
          />
        </div>

        {/* Traffic Weight Controls (only when paused) */}
        {isPaused && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Traffic Distribution</Label>
              <Badge variant={totalWeight === 100 ? "default" : "destructive"}>
                Total: {totalWeight}%
              </Badge>
            </div>

            {variants.map((variant) => (
              <div key={variant.template_id} className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">
                    Variant {variant.variant_letter}: {variant.template_name}
                  </Label>
                  <span className="text-sm font-mono font-bold">
                    {weights[variant.template_id]}%
                  </span>
                </div>
                <Slider
                  value={[weights[variant.template_id]]}
                  onValueChange={(value) => handleWeightChange(variant.template_id, value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            ))}

            {totalWeight !== 100 && (
              <p className="text-sm text-destructive">
                ⚠ Weights must add up to exactly 100% to save changes
              </p>
            )}

            <Button 
              onClick={handleSaveWeights} 
              disabled={isSaving || totalWeight !== 100}
              className="w-full"
            >
              {isSaving ? "Saving..." : "Save Traffic Distribution"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
