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
  Mail, 
  MessageCircle, 
  Calendar,
  Filter,
  FileText
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormSubmission {
  id: string;
  form_type: string;
  form_data: any;
  created_at: string;
  submitted_at: string;
}

const FormSubmissionsAdmin = () => {
  const { isAdmin, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<FormSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formTypeFilter, setFormTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && user && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, authLoading, user, navigate, toast]);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      // @ts-ignore - Types will be regenerated after table is synced
      const { data, error } = await supabase
        // @ts-ignore - Types will be regenerated after table is synced
        .from("form_submissions")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      // @ts-ignore - Types will be regenerated after table is synced
      setSubmissions(data || []);
      // @ts-ignore - Types will be regenerated after table is synced
      setFilteredSubmissions(data || []);
    } catch (error: any) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load form submissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSubmissions();
    }
  }, [isAdmin]);

  useEffect(() => {
    let filtered = [...submissions];

    // Filter by form type
    if (formTypeFilter !== "all") {
      filtered = filtered.filter(sub => sub.form_type === formTypeFilter);
    }

    // Filter by date
    const now = new Date();
    if (dateFilter === "today") {
      filtered = filtered.filter(sub => {
        const submittedDate = new Date(sub.submitted_at);
        return submittedDate.toDateString() === now.toDateString();
      });
    } else if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(sub => new Date(sub.submitted_at) >= weekAgo);
    } else if (dateFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(sub => new Date(sub.submitted_at) >= monthAgo);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(sub => {
        const data = sub.form_data;
        const searchLower = searchQuery.toLowerCase();
        return (
          sub.form_type.toLowerCase().includes(searchLower) ||
          (data.email && data.email.toLowerCase().includes(searchLower)) ||
          (data.name && data.name.toLowerCase().includes(searchLower)) ||
          (data.message && data.message.toLowerCase().includes(searchLower)) ||
          (data.comment && data.comment.toLowerCase().includes(searchLower))
        );
      });
    }

    setFilteredSubmissions(filtered);
  }, [submissions, searchQuery, formTypeFilter, dateFilter]);

  const exportToCSV = () => {
    if (filteredSubmissions.length === 0) {
      toast({
        title: "No Data",
        description: "No submissions to export",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Form Type", "Email", "Name", "Message/Comment", "Submitted At"];
    const rows = filteredSubmissions.map(sub => {
      const data = sub.form_data;
      return [
        sub.form_type,
        data.email || "N/A",
        data.name || "N/A",
        data.message || data.comment || "N/A",
        new Date(sub.submitted_at).toLocaleString()
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `form-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Exported ${filteredSubmissions.length} submissions`,
    });
  };

  const getFormTypeIcon = (type: string) => {
    switch (type) {
      case "contact":
        return <Mail className="h-4 w-4" />;
      case "quick-contact":
        return <MessageCircle className="h-4 w-4" />;
      case "feedback":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getFormTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      contact: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "quick-contact": "bg-green-500/10 text-green-500 border-green-500/20",
      feedback: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    };
    return colors[type] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  const uniqueFormTypes = Array.from(new Set(submissions.map(s => s.form_type)));

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Form Submissions</h1>
          <p className="text-muted-foreground">View and manage all form submissions from your website</p>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{submissions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contact Forms</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions.filter(s => s.form_type === "contact").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Contact</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions.filter(s => s.form_type === "quick-contact").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feedback</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {submissions.filter(s => s.form_type === "feedback").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter & Search</CardTitle>
            <CardDescription>Filter submissions by type, date, or search by content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search submissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={formTypeFilter} onValueChange={setFormTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Form Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Form Types</SelectItem>
                  {uniqueFormTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={exportToCSV} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredSubmissions.length} of {submissions.length} submissions
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No submissions found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || formTypeFilter !== "all" || dateFilter !== "all"
                    ? "Try adjusting your filters"
                    : "No form submissions have been received yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Form Type</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => {
                      const data = submission.form_data;
                      return (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <Badge variant="outline" className={getFormTypeBadge(submission.form_type)}>
                              <span className="flex items-center gap-2">
                                {getFormTypeIcon(submission.form_type)}
                                {submission.form_type.split('-').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {data.email || "N/A"}
                          </TableCell>
                          <TableCell>
                            {data.name || "N/A"}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate text-sm text-muted-foreground">
                              {data.message || data.comment || data.feedback || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(submission.submitted_at).toLocaleDateString()} at{" "}
                            {new Date(submission.submitted_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default FormSubmissionsAdmin;
