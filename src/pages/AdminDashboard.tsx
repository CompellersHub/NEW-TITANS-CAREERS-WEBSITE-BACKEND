import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  Search, 
  Loader2, 
  UserX, 
  UserCheck, 
  Mail, 
  MessageCircle, 
  Calendar,
  Filter,
  Trash2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  whatsapp: string | null;
  source: string | null;
  subscribed_at: string;
  active: boolean;
  welcome_email_sent: boolean;
  tags: string[];
  engagement_score: number;
  total_opens: number;
  total_clicks: number;
  last_engagement_at: string | null;
}

const AdminDashboard = () => {
  const { isAdmin, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && user && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, authLoading, user, navigate, toast]);

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
      setFilteredSubscribers(data || []);
    } catch (error: any) {
      console.error("Error fetching subscribers:", error);
      toast({
        title: "Error",
        description: "Failed to load subscribers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && user) {
      fetchSubscribers();
    }
  }, [isAdmin, user]);

  useEffect(() => {
    let filtered = subscribers;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (sub) =>
          sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.whatsapp?.includes(searchQuery)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((sub) =>
        statusFilter === "active" ? sub.active : !sub.active
      );
    }

    // Source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter((sub) => sub.source === sourceFilter);
    }

    setFilteredSubscribers(filtered);
  }, [searchQuery, statusFilter, sourceFilter, subscribers]);

  const handleUnsubscribe = async (id: string) => {
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ active: false })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Subscriber Unsubscribed",
        description: "The subscriber has been marked as inactive.",
      });

      fetchSubscribers();
    } catch (error: any) {
      console.error("Error unsubscribing:", error);
      toast({
        title: "Error",
        description: "Failed to unsubscribe user",
        variant: "destructive",
      });
    }
  };

  const handleResubscribe = async (id: string) => {
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ active: true })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Subscriber Reactivated",
        description: "The subscriber has been reactivated.",
      });

      fetchSubscribers();
    } catch (error: any) {
      console.error("Error resubscribing:", error);
      toast({
        title: "Error",
        description: "Failed to reactivate subscriber",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast({
        title: "Subscriber Deleted",
        description: "The subscriber has been permanently deleted.",
      });

      fetchSubscribers();
    } catch (error: any) {
      console.error("Error deleting subscriber:", error);
      toast({
        title: "Error",
        description: "Failed to delete subscriber",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const exportToCSV = () => {
    const csvHeaders = ["Email", "Name", "WhatsApp", "Source", "Tags", "Engagement Score", "Total Opens", "Total Clicks", "Subscribed At", "Active", "Welcome Email Sent"];
    const csvData = filteredSubscribers.map((sub) => [
      sub.email,
      sub.name || "",
      sub.whatsapp || "",
      sub.source || "",
      sub.tags?.join("; ") || "",
      sub.engagement_score || 0,
      sub.total_opens || 0,
      sub.total_clicks || 0,
      new Date(sub.subscribed_at).toLocaleString(),
      sub.active ? "Yes" : "No",
      sub.welcome_email_sent ? "Yes" : "No",
    ]);

    const csv = [
      csvHeaders.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast({
      title: "Export Successful",
      description: `Exported ${filteredSubscribers.length} subscribers to CSV`,
    });
  };

  const sources = Array.from(new Set(subscribers.map((s) => s.source).filter(Boolean)));

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-tc-navy" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container max-w-7xl py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-tc-navy mb-2">Subscriber Management</h1>
          <p className="text-muted-foreground">
            Manage your newsletter subscribers, export contacts, and handle unsubscribe requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Subscribers</CardDescription>
              <CardTitle className="text-3xl">{subscribers.length}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Subscribers</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {subscribers.filter((s) => s.active).length}
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>With WhatsApp</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {subscribers.filter((s) => s.whatsapp).length}
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>This Month</CardDescription>
              <CardTitle className="text-3xl text-tc-amber">
                {
                  subscribers.filter(
                    (s) =>
                      new Date(s.subscribed_at).getMonth() === new Date().getMonth() &&
                      new Date(s.subscribed_at).getFullYear() === new Date().getFullYear()
                  ).length
                }
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by email, name, or WhatsApp..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {sources.map((source) => (
                    <SelectItem key={source} value={source!}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={exportToCSV} className="bg-tc-navy hover:bg-tc-blue">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscribers Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No subscribers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            {subscriber.email}
                          </div>
                        </TableCell>
                        <TableCell>{subscriber.name || "-"}</TableCell>
                        <TableCell>
                          {subscriber.whatsapp ? (
                            <div className="flex items-center gap-2">
                              <MessageCircle className="w-4 h-4 text-green-600" />
                              {subscriber.whatsapp}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{subscriber.source || "unknown"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {subscriber.tags && subscriber.tags.length > 0 ? (
                              subscriber.tags.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={subscriber.engagement_score >= 70 ? "default" : subscriber.engagement_score >= 40 ? "secondary" : "outline"}
                            >
                              {subscriber.engagement_score || 0}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              ({subscriber.total_opens || 0} opens, {subscriber.total_clicks || 0} clicks)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {new Date(subscriber.subscribed_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={subscriber.active ? "default" : "secondary"}>
                            {subscriber.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {subscriber.active ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUnsubscribe(subscriber.id)}
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResubscribe(subscriber.id)}
                              >
                                <UserCheck className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteId(subscriber.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the subscriber
              from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
