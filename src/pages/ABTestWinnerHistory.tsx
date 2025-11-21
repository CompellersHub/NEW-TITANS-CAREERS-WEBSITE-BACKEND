import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const sb: any = supabase;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { TrendingUp, Calendar, Trophy, Users, Download } from "lucide-react";
import { PageLayout } from "@/components/layouts/PageLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface WinnerHistory {
  id: string;
  ab_test_name: string;
  campaign_type: string;
  winner_template_name: string;
  winner_variant_letter: string;
  winner_open_rate: number;
  winner_click_rate: number;
  winner_combined_score: number;
  winner_sends_count: number;
  improvement_percent: number;
  deactivated_variants_count: number;
  deactivated_variants: any[];
  selected_by: string;
  admin_action: string | null;
  created_at: string;
}

export default function ABTestWinnerHistory() {
  const { data: history, isLoading } = useQuery({
    queryKey: ["ab-test-winner-history"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("ab_test_winner_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WinnerHistory[];
    },
  });

  // Calculate summary stats
  const stats = history
    ? {
        totalWinners: history.length,
        avgImprovement:
          history.reduce((sum, h) => sum + Number(h.improvement_percent), 0) / history.length || 0,
        totalDeactivated: history.reduce((sum, h) => sum + h.deactivated_variants_count, 0),
        automatedSelections: history.filter((h) => h.selected_by === "automated").length,
      }
    : null;

  const exportToCSV = () => {
    if (!history || history.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Date",
      "Test Name",
      "Campaign Type",
      "Winner Template",
      "Variant",
      "Open Rate (%)",
      "Click Rate (%)",
      "Sends",
      "Improvement (%)",
      "Deactivated Count",
      "Selection Type",
      "Admin Action"
    ];

    const rows = history.map((record) => [
      format(new Date(record.created_at), "yyyy-MM-dd HH:mm"),
      record.ab_test_name,
      record.campaign_type,
      record.winner_template_name,
      record.winner_variant_letter,
      record.winner_open_rate.toFixed(2),
      record.winner_click_rate.toFixed(2),
      record.winner_sends_count.toString(),
      record.improvement_percent.toFixed(1),
      record.deactivated_variants_count.toString(),
      record.selected_by,
      record.admin_action || "N/A"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ab-test-winner-history-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV export completed successfully");
  };

  const exportToPDF = () => {
    if (!history || history.length === 0) {
      toast.error("No data to export");
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("A/B Test Winner History Report", 14, 20);
    
    // Add summary stats
    doc.setFontSize(12);
    doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, 14, 30);
    
    if (stats) {
      doc.setFontSize(10);
      doc.text(`Total Winners: ${stats.totalWinners}`, 14, 40);
      doc.text(`Average Improvement: +${stats.avgImprovement.toFixed(1)}%`, 14, 46);
      doc.text(`Total Deactivated: ${stats.totalDeactivated}`, 14, 52);
      doc.text(`Automated Selections: ${stats.automatedSelections}`, 14, 58);
    }

    // Add table
    const tableData = history.map((record) => [
      format(new Date(record.created_at), "MMM dd, yyyy"),
      record.ab_test_name,
      record.winner_template_name,
      record.winner_variant_letter,
      `${record.winner_open_rate.toFixed(2)}%`,
      `${record.winner_click_rate.toFixed(2)}%`,
      record.winner_sends_count.toLocaleString(),
      `+${record.improvement_percent.toFixed(1)}%`,
      record.selected_by
    ]);

    autoTable(doc, {
      startY: 65,
      head: [["Date", "Test Name", "Winner", "Variant", "Open %", "Click %", "Sends", "Improve", "Type"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
    });

    doc.save(`ab-test-winner-history-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("PDF export completed successfully");
  };

  return (
    <PageLayout intensity3D="subtle" show3D={true}>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">A/B Test Winner History</h1>
            <p className="text-muted-foreground">
              Track all automated and manual A/B test winner selections over time
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={!history || history.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={exportToPDF}
              disabled={!history || history.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Total Winners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalWinners}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Avg Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +{stats.avgImprovement.toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-500" />
                  Variants Deactivated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDeactivated}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Automated Selections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.automatedSelections}</div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Winner Selection History</CardTitle>
            <CardDescription>
              Detailed log of all A/B test winner selections with performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : !history || history.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Winner Selections Yet</h3>
                <p className="text-muted-foreground">
                  Winner selections will appear here once A/B tests reach statistical significance
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Winner</TableHead>
                      <TableHead className="text-right">Open Rate</TableHead>
                      <TableHead className="text-right">Click Rate</TableHead>
                      <TableHead className="text-right">Sends</TableHead>
                      <TableHead className="text-right">Improvement</TableHead>
                      <TableHead className="text-right">Deactivated</TableHead>
                      <TableHead>Selection Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {format(new Date(record.created_at), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{record.ab_test_name}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {record.campaign_type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{record.winner_template_name}</div>
                          <Badge variant="outline" className="mt-1">
                            Variant {record.winner_variant_letter}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {record.winner_open_rate.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right">
                          {record.winner_click_rate.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right">
                          {record.winner_sends_count.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-green-600 font-semibold">
                            +{record.improvement_percent.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {record.deactivated_variants_count}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={record.selected_by === "automated" ? "secondary" : "default"}
                          >
                            {record.selected_by}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </PageLayout>
  );
}
