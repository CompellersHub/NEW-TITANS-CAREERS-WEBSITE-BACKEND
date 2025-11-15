import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Upload } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentProofUploader } from "@/components/payment/PaymentProofUploader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Order {
  id: string;
  course_title: string;
  course_slug: string;
  price: number;
  purchase_date: string;
  payment_method: string | null;
  display_status: string;
  payment_reference: string | null;
  expires_at: string | null;
  payment_proof_urls: string[] | null;
  verified_at: string | null;
}

export function OrderHistoryTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      const { data, error } = await supabase
        .from("user_order_history")
        .select("*")
        .eq("customer_email", user.email)
        .order("purchase_date", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load order history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      completed: { variant: "default", label: "Completed" },
      pending: { variant: "secondary", label: "Pending Payment" },
      pending_proof: { variant: "outline", label: "Upload Proof" },
      under_review: { variant: "secondary", label: "Under Review" },
      expired: { variant: "destructive", label: "Expired" },
      failed: { variant: "destructive", label: "Failed" }
    };

    const config = variants[status] || variants.failed;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  };

  const toggleRow = (orderId: string) => {
    setExpandedRow(expandedRow === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Your course purchases and enrollments</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground mb-4">No orders yet</p>
          <Button asChild>
            <a href="/courses">Browse Courses</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>View and manage your course purchases</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <>
                  <TableRow 
                    key={order.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleRow(order.id)}
                  >
                    <TableCell className="font-medium">{order.course_title}</TableCell>
                    <TableCell>{formatDate(order.purchase_date)}</TableCell>
                    <TableCell>{formatPrice(order.price)}</TableCell>
                    <TableCell>{getStatusBadge(order.display_status)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(order.id);
                        }}
                      >
                        {expandedRow === order.id ? "Hide" : "Details"}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedRow === order.id && (
                    <TableRow>
                      <TableCell colSpan={5} className="bg-muted/30">
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium mb-1">Payment Method</p>
                              <p className="text-sm text-muted-foreground">
                                {order.payment_method || "Not specified"}
                              </p>
                            </div>
                            {order.payment_reference && (
                              <div>
                                <p className="text-sm font-medium mb-1">Reference</p>
                                <p className="text-sm text-muted-foreground">
                                  {order.payment_reference}
                                </p>
                              </div>
                            )}
                            {order.expires_at && new Date(order.expires_at) > new Date() && (
                              <div>
                                <p className="text-sm font-medium mb-1">Expires</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(order.expires_at)}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Payment Proof Upload for Bank Transfers */}
                          {order.display_status === 'pending_proof' && order.payment_reference && (
                            <div className="mt-4">
                              <PaymentProofUploader
                                reference={order.payment_reference}
                                existingProofs={order.payment_proof_urls || []}
                                onUploadComplete={loadOrders}
                              />
                            </div>
                          )}

                          {/* View Submitted Proofs */}
                          {order.payment_proof_urls && order.payment_proof_urls.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-2">Submitted Payment Proofs</p>
                              <div className="flex gap-2 flex-wrap">
                                {order.payment_proof_urls.map((url, idx) => (
                                  <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(url, '_blank')}
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Document {idx + 1}
                                  </Button>
                                ))}
                              </div>
                              {order.verified_at && (
                                <p className="text-sm text-green-600 mt-2">
                                  ✓ Verified on {formatDate(order.verified_at)}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={`/course/${order.course_slug}`}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Course
                              </a>
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
