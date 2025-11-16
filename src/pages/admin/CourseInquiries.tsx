import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Mail, Eye, MessageSquare, Calendar } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function CourseInquiries() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["course-inquiries", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("course_inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateInquiryMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      const updateData: any = {
        status,
        admin_notes: notes,
      };

      if (status === "contacted" && !selectedInquiry.contacted_at) {
        updateData.contacted_at = new Date().toISOString();
      }
      if (status === "completed" && !selectedInquiry.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("course_inquiries")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-inquiries"] });
      toast({
        title: "Updated",
        description: "Inquiry has been updated successfully.",
      });
      setDetailDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update inquiry.",
        variant: "destructive",
      });
    },
  });

  const filteredInquiries = inquiries?.filter(inq => 
    searchTerm === "" || 
    inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inq.course_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: inquiries?.length || 0,
    pending: inquiries?.filter(i => i.status === "pending").length || 0,
    contacted: inquiries?.filter(i => i.status === "contacted").length || 0,
    completed: inquiries?.filter(i => i.status === "completed").length || 0,
  };

  const handleViewDetails = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setAdminNotes(inquiry.admin_notes || "");
    setDetailDialogOpen(true);
  };

  const handleUpdateInquiry = () => {
    if (!selectedInquiry) return;
    updateInquiryMutation.mutate({
      id: selectedInquiry.id,
      status: selectedInquiry.status,
      notes: adminNotes,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "default",
      contacted: "secondary",
      completed: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Course Inquiries</h1>
        <p className="text-muted-foreground">Manage free session requests and WhatsApp group inquiries</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Inquiries</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Contacted</div>
          <div className="text-2xl font-bold text-blue-500">{stats.contacted}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, email, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Inquiries List */}
      {isLoading ? (
        <div className="text-center py-8">Loading inquiries...</div>
      ) : (
        <Card>
          <div className="p-6 space-y-4">
            {filteredInquiries && filteredInquiries.length > 0 ? (
              filteredInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-2 md:space-y-0 md:grid md:grid-cols-4 md:gap-4">
                    <div>
                      <div className="font-semibold">{inquiry.name}</div>
                      <div className="text-sm text-muted-foreground">{inquiry.email}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{inquiry.course_title}</div>
                      <div className="text-xs text-muted-foreground">
                        {inquiry.inquiry_type === "free_session" ? "Free Session" : "WhatsApp Group"}
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(inquiry.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <Calendar className="inline-block w-3 h-3 mr-1" />
                      {format(new Date(inquiry.created_at), "MMM d, yyyy")}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0">
                    <Button size="sm" variant="outline" onClick={() => handleViewDetails(inquiry)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`mailto:${inquiry.email}`, "_blank")}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const phone = inquiry.phone.replace(/\D/g, "");
                        window.open(`https://wa.me/${inquiry.country_code}${phone}`, "_blank");
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No inquiries found
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>
              View and manage course inquiry information
            </DialogDescription>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedInquiry.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Course</Label>
                  <p className="text-sm text-muted-foreground">{selectedInquiry.course_title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedInquiry.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedInquiry.country_code} {selectedInquiry.phone}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Inquiry Type</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedInquiry.inquiry_type === "free_session"
                      ? "Free Session"
                      : "WhatsApp Group"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedInquiry.created_at), "PPp")}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={selectedInquiry.status}
                  onValueChange={(value) =>
                    setSelectedInquiry({ ...selectedInquiry, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Admin Notes</Label>
                <Textarea
                  id="notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this inquiry..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateInquiry}
              disabled={updateInquiryMutation.isPending}
            >
              {updateInquiryMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
