import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Mail, Phone, Calendar, Filter } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function CourseInquiries() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

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
        <div className="space-y-4">
          {filteredInquiries?.map((inquiry) => (
            <Card key={inquiry.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{inquiry.name}</h3>
                    <Badge variant={inquiry.status === "pending" ? "default" : "secondary"}>
                      {inquiry.status}
                    </Badge>
                    <Badge variant="outline">
                      {inquiry.inquiry_type === "free_session" ? "Free Session" : "WhatsApp Group"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="font-medium">{inquiry.course_title}</div>
                    <div className="flex flex-wrap gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {inquiry.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {inquiry.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(inquiry.created_at), "MMM dd, yyyy HH:mm")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${inquiry.email}`}>Email</a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://wa.me/${inquiry.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
