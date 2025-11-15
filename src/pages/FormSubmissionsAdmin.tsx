import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { NotificationBell } from "@/components/admin/NotificationBell";
import { AdminDashboardSkeleton } from "@/components/admin/AdminDashboardSkeleton";
import { format, formatDistanceToNow, differenceInMilliseconds } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  Search, 
  Loader2, 
  Mail, 
  MessageCircle, 
  Calendar,
  Filter,
  FileText,
  Edit2,
  Save,
  X,
  Trash2,
  CheckSquare,
  Bell,
  Clock,
  Users,
  Eye,
  User,
  TrendingUp
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

interface FormSubmission {
  id: string;
  form_type: string;
  form_data: any;
  created_at: string;
  submitted_at: string;
  status: 'new' | 'in_progress' | 'resolved' | 'archived';
  priority: 'low' | 'medium' | 'high';
  admin_notes: string | null;
  last_updated_by: string | null;
  last_updated_at: string | null;
  assigned_to: string | null;
  tags: string[];
  sla_deadline: string | null;
  sla_status: 'on_track' | 'approaching' | 'overdue' | 'met' | null;
}

interface AdminUser {
  id: string;
  email: string;
}

interface AuditLogEntry {
  id: string;
  submission_id: string;
  changed_by: string | null;
  action_type: 'status_changed' | 'notes_updated' | 'created' | 'assignment_changed' | 'tags_changed' | 'priority_changed';
  old_value: any;
  new_value: any;
  created_at: string;
}

interface PresenceState {
  user_id: string;
  email: string;
  viewing_submission: string | null;
  online_at: string;
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [slaFilter, setSlaFilter] = useState("all");
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [bulkTags, setBulkTags] = useState<string[]>([]);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [tempStatus, setTempStatus] = useState<string>("");
  const [tempNotes, setTempNotes] = useState<string>("");
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionStatus, setBulkActionStatus] = useState<string>("");
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loadingAuditLog, setLoadingAuditLog] = useState(false);
  const [onlineAdmins, setOnlineAdmins] = useState<PresenceState[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [showShortcuts, setShowShortcuts] = useState(false);

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

  // Setup presence tracking
  useEffect(() => {
    if (!isAdmin || !user) return;

    const presenceChannel = supabase.channel('form-submissions-presence');

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const presences: PresenceState[] = [];
        
        Object.keys(state).forEach((key) => {
          const presence = state[key] as any[];
          if (presence && presence.length > 0) {
            const presenceData = presence[0] as PresenceState;
            if (presenceData.user_id !== user.id) {
              presences.push(presenceData);
            }
          }
        });
        
        setOnlineAdmins(presences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            email: user.email,
            viewing_submission: selectedSubmission?.id || null,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [isAdmin, user, selectedSubmission?.id]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isAdmin) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // Allow Esc to blur inputs
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      // Show shortcuts help
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
        return;
      }

      // Close modal with Esc
      if (e.key === 'Escape') {
        if (selectedSubmission) {
          setSelectedSubmission(null);
          setSelectedIndex(-1);
        } else if (showShortcuts) {
          setShowShortcuts(false);
        }
        return;
      }

      // Focus search with /
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // Navigation with arrow keys
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredSubmissions.length === 0) return;

        let newIndex = selectedIndex;
        if (e.key === 'ArrowDown') {
          newIndex = selectedIndex < filteredSubmissions.length - 1 ? selectedIndex + 1 : 0;
        } else {
          newIndex = selectedIndex > 0 ? selectedIndex - 1 : filteredSubmissions.length - 1;
        }
        
        setSelectedIndex(newIndex);
        setSelectedIds(new Set([filteredSubmissions[newIndex].id]));
        
        // Scroll into view
        const row = document.querySelector(`[data-submission-index="${newIndex}"]`);
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        return;
      }

      // Open selected submission with Enter
      if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        setSelectedSubmission(filteredSubmissions[selectedIndex]);
        return;
      }

      // Mark as new with 'n'
      if (e.key === 'n' && selectedIds.size > 0) {
        e.preventDefault();
        bulkUpdateStatus('new');
        return;
      }

      // Mark as resolved with 'r'
      if (e.key === 'r' && selectedIds.size > 0) {
        e.preventDefault();
        bulkUpdateStatus('resolved');
        return;
      }

      // Mark as in progress with 'i'
      if (e.key === 'i' && selectedIds.size > 0) {
        e.preventDefault();
        bulkUpdateStatus('in_progress');
        return;
      }

      // Mark as archived with 'a'
      if (e.key === 'a' && selectedIds.size > 0) {
        e.preventDefault();
        bulkUpdateStatus('archived');
        return;
      }

      // Delete with 'd'
      if (e.key === 'd' && selectedIds.size > 0) {
        e.preventDefault();
        setShowBulkDeleteDialog(true);
        return;
      }

      // Select all with Ctrl/Cmd + A
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        if (selectedIds.size === filteredSubmissions.length) {
          setSelectedIds(new Set());
          setSelectedIndex(-1);
        } else {
          setSelectedIds(new Set(filteredSubmissions.map(s => s.id)));
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin, selectedSubmission, selectedIds, selectedIndex, filteredSubmissions, showShortcuts]);

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

  const fetchAdminUsers = async () => {
    try {
      // Fetch admin users from admin_notification_preferences table which has emails
      // @ts-ignore - Types will be regenerated
      const { data, error } = await supabase
        // @ts-ignore - Types will be regenerated
        .from("admin_notification_preferences")
        .select("admin_user_id, email");

      if (error) throw error;

      if (data && data.length > 0) {
        const admins = data.map((pref: any) => ({ 
          id: pref.admin_user_id, 
          email: pref.email 
        }));
        setAdminUsers(admins);
      }
    } catch (error: any) {
      console.error("Error fetching admin users:", error);
      // Fallback: just use current user
      if (user) {
        setAdminUsers([{ id: user.id, email: user.email || 'Unknown' }]);
      }
    }
  };

  const updateAssignment = async (submissionId: string, assignedTo: string | null) => {
    try {
      // @ts-ignore - Types will be regenerated
      // @ts-ignore - Types will be regenerated
      const { error } = await supabase
        // @ts-ignore - Types will be regenerated
        .from("form_submissions")
        .update({ 
          assigned_to: assignedTo,
          last_updated_by: user?.id,
          last_updated_at: new Date().toISOString()
        } as any)
        .eq("id", submissionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment updated successfully",
      });

      // Update local state
      setSubmissions(prev => 
        prev.map(s => s.id === submissionId ? { ...s, assigned_to: assignedTo } : s)
      );

      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(prev => prev ? { ...prev, assigned_to: assignedTo } : null);
      }
    } catch (error: any) {
      console.error("Error updating assignment:", error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      });
    }
  };

  const bulkUpdateAssignment = async (assignedTo: string | null) => {
    if (selectedIds.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select submissions first",
        variant: "destructive",
      });
      return;
    }

    try {
      const updates = Array.from(selectedIds).map(id =>
        // @ts-ignore - Types will be regenerated
        supabase
          // @ts-ignore - Types will be regenerated
          .from("form_submissions")
          .update({ 
            assigned_to: assignedTo,
            last_updated_by: user?.id,
            last_updated_at: new Date().toISOString()
          } as any)
          .eq("id", id)
      );

      await Promise.all(updates);

      toast({
        title: "Success",
        description: `Updated ${selectedIds.size} submissions`,
      });

      setSubmissions(prev =>
        prev.map(s => selectedIds.has(s.id) ? { ...s, assigned_to: assignedTo } : s)
      );

      setSelectedIds(new Set());
    } catch (error: any) {
      console.error("Error bulk updating assignment:", error);
      toast({
        title: "Error",
        description: "Failed to update assignments",
        variant: "destructive",
      });
    }
  };

  const updatePriority = async (submissionId: string, priority: 'low' | 'medium' | 'high') => {
    try {
      // @ts-ignore - Types will be regenerated
      const { error } = await supabase
        // @ts-ignore - Types will be regenerated
        .from("form_submissions")
        .update({ 
          priority: priority,
          last_updated_by: user?.id,
          last_updated_at: new Date().toISOString()
        } as any)
        .eq("id", submissionId);

      if (error) throw error;

      setSubmissions(prev =>
        prev.map(s => s.id === submissionId ? { ...s, priority } : s)
      );

      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(prev => prev ? { ...prev, priority } : null);
      }

      toast({
        title: "Success",
        description: `Priority updated to ${getPriorityLabel(priority)}`,
      });
    } catch (error: any) {
      console.error("Error updating priority:", error);
      toast({
        title: "Error",
        description: "Failed to update priority",
        variant: "destructive",
      });
    }
  };

  const bulkUpdatePriority = async (priority: 'low' | 'medium' | 'high') => {
    if (selectedIds.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select submissions first",
        variant: "destructive",
      });
      return;
    }

    try {
      const updates = Array.from(selectedIds).map(id =>
        // @ts-ignore - Types will be regenerated
        supabase
          // @ts-ignore - Types will be regenerated
          .from("form_submissions")
          .update({ 
            priority: priority,
            last_updated_by: user?.id,
            last_updated_at: new Date().toISOString()
          } as any)
          .eq("id", id)
      );

      await Promise.all(updates);

      toast({
        title: "Success",
        description: `Updated priority for ${selectedIds.size} submissions`,
      });

      setSubmissions(prev =>
        prev.map(s => selectedIds.has(s.id) ? { ...s, priority } : s)
      );

      setSelectedIds(new Set());
    } catch (error: any) {
      console.error("Error bulk updating priority:", error);
      toast({
        title: "Error",
        description: "Failed to update priorities",
        variant: "destructive",
      });
    }
  };

  const updateTags = async (submissionId: string, tags: string[]) => {
    try {
      // @ts-ignore - Types will be regenerated
      const { error } = await supabase
        // @ts-ignore - Types will be regenerated
        .from("form_submissions")
        .update({ 
          tags: tags,
          last_updated_by: user?.id,
          last_updated_at: new Date().toISOString()
        } as any)
        .eq("id", submissionId);

      if (error) throw error;

      setSubmissions(prev =>
        prev.map(s => s.id === submissionId ? { ...s, tags } : s)
      );

      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(prev => prev ? { ...prev, tags } : null);
      }

      // Update available tags
      const allTags = new Set(availableTags);
      tags.forEach(tag => allTags.add(tag));
      setAvailableTags(Array.from(allTags).sort());

      toast({
        title: "Success",
        description: "Tags updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating tags:", error);
      toast({
        title: "Error",
        description: "Failed to update tags",
        variant: "destructive",
      });
    }
  };

  const addTag = (submissionId: string, tag: string) => {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return;
    
    const currentTags = submission.tags || [];
    if (currentTags.includes(tag)) {
      toast({
        title: "Info",
        description: "Tag already exists",
      });
      return;
    }
    
    updateTags(submissionId, [...currentTags, tag]);
  };

  const removeTag = (submissionId: string, tagToRemove: string) => {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return;
    
    const updatedTags = (submission.tags || []).filter(tag => tag !== tagToRemove);
    updateTags(submissionId, updatedTags);
  };

  const bulkAddTags = async (tagsToAdd: string[]) => {
    if (selectedIds.size === 0 || tagsToAdd.length === 0) return;

    try {
      const updates = Array.from(selectedIds).map(id => {
        const submission = submissions.find(s => s.id === id);
        if (!submission) return null;
        
        const currentTags = submission.tags || [];
        const newTags = [...new Set([...currentTags, ...tagsToAdd])];
        
        // @ts-ignore - Types will be regenerated
        return supabase
          // @ts-ignore - Types will be regenerated
          .from("form_submissions")
          .update({ 
            tags: newTags,
            last_updated_by: user?.id,
            last_updated_at: new Date().toISOString()
          } as any)
          .eq("id", id);
      }).filter(Boolean);

      await Promise.all(updates);

      await fetchSubmissions();
      setSelectedIds(new Set());
      setBulkTags([]);

      toast({
        title: "Success",
        description: `Added tags to ${selectedIds.size} submissions`,
      });
    } catch (error: any) {
      console.error("Error bulk adding tags:", error);
      toast({
        title: "Error",
        description: "Failed to add tags",
        variant: "destructive",
      });
    }
  };

  const exportToPDF = () => {
    if (selectedIds.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select submissions to export",
        variant: "destructive",
      });
      return;
    }

    const selectedData = submissions.filter(s => selectedIds.has(s.id));
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Form Submissions Report', pageWidth / 2, 15, { align: 'center' });
    
    // Add export date
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'PPpp')}`, pageWidth / 2, 22, { align: 'center' });
    
    let yPosition = 30;
    
    selectedData.forEach((submission, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Submission header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Submission #${index + 1}`, 14, yPosition);
      yPosition += 8;
      
      // Basic info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const assignedEmail = submission.assigned_to 
        ? adminUsers.find(a => a.id === submission.assigned_to)?.email || 'N/A'
        : 'Unassigned';
      
      const basicInfo = [
        ['Form Type', submission.form_type],
        ['Priority', (submission.priority || 'medium').toUpperCase()],
        ['SLA Status', getSlaLabel(submission.sla_status)],
        ['Time Remaining', formatSlaCountdown(submission.sla_deadline, submission.status).text],
        ['Status', submission.status.toUpperCase()],
        ['Submitted', format(new Date(submission.submitted_at), 'PPpp')],
        ['Assigned To', assignedEmail],
        ['Tags', submission.tags && submission.tags.length > 0 ? submission.tags.join(', ') : 'No tags']
      ];
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Field', 'Value']],
        body: basicInfo,
        theme: 'grid',
        headStyles: { fillColor: [11, 31, 59] },
        margin: { left: 14, right: 14 },
        tableWidth: pageWidth - 28,
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 5;
      
      // Form data
      if (submission.form_data && typeof submission.form_data === 'object') {
        doc.setFont('helvetica', 'bold');
        doc.text('Form Data:', 14, yPosition);
        yPosition += 5;
        
        const formDataRows = Object.entries(submission.form_data as Record<string, any>).map(([key, value]) => [
          key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          String(value)
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          body: formDataRows,
          theme: 'striped',
          margin: { left: 14, right: 14 },
          tableWidth: pageWidth - 28,
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 60 },
            1: { cellWidth: 'auto' }
          }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 5;
      }
      
      // Admin notes
      if (submission.admin_notes) {
        doc.setFont('helvetica', 'bold');
        doc.text('Admin Notes:', 14, yPosition);
        yPosition += 5;
        doc.setFont('helvetica', 'normal');
        
        const splitNotes = doc.splitTextToSize(submission.admin_notes, pageWidth - 28);
        doc.text(splitNotes, 14, yPosition);
        yPosition += (splitNotes.length * 5) + 10;
      } else {
        yPosition += 10;
      }
      
      // Add separator line if not last submission
      if (index < selectedData.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(14, yPosition, pageWidth - 14, yPosition);
        yPosition += 10;
      }
    });
    
    // Save the PDF
    doc.save(`form-submissions-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.pdf`);
    toast({
      title: "Export Complete",
      description: `Exported ${selectedIds.size} submissions to PDF`,
    });
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSubmissions();
      fetchAdminUsers();
      fetchTemplates();
    }
  }, [isAdmin]);

  const fetchTemplates = async () => {
    try {
      // @ts-ignore - Types will be regenerated
      const { data, error } = await supabase
        // @ts-ignore - Types will be regenerated
        .from("response_templates")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
    }
  };

  const applyTemplate = (template: any) => {
    if (!selectedSubmission) return;
    
    const formData = selectedSubmission.form_data;
    let subject = template.subject;
    let content = template.content;
    
    // Replace placeholders
    if (formData.name) {
      subject = subject.replace(/\{name\}/g, formData.name);
      content = content.replace(/\{name\}/g, formData.name);
    }
    if (formData.email) {
      subject = subject.replace(/\{email\}/g, formData.email);
      content = content.replace(/\{email\}/g, formData.email);
    }
    
    setEmailSubject(subject);
    setEmailContent(content);
    setSelectedTemplate(template);
  };

  // Fetch audit log when submission is selected
  useEffect(() => {
    if (selectedSubmission) {
      fetchAuditLog(selectedSubmission.id);
    }
  }, [selectedSubmission?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('form-submissions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'form_submissions'
        },
        (payload) => {
          console.log('New submission received:', payload);
          // @ts-ignore - Types will be regenerated
          setSubmissions(prev => [payload.new, ...prev]);
          
          // Trigger notification
          supabase.functions.invoke('send-admin-notification', {
            body: {
              submission_id: payload.new.id,
              form_type: payload.new.form_type,
              status: payload.new.status || 'new',
              form_data: payload.new.form_data,
            }
          }).then(({ error }) => {
            if (error) console.error('Notification error:', error);
          });
          
          toast({
            title: "New Submission",
            description: "A new form submission has been received",
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'form_submissions'
        },
        (payload) => {
          console.log('Submission updated:', payload);
          // @ts-ignore - Types will be regenerated
          setSubmissions(prev => 
            prev.map(sub => sub.id === payload.new.id ? payload.new : sub)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'form_submissions'
        },
        (payload) => {
          console.log('Submission deleted:', payload);
          setSubmissions(prev => 
            prev.filter(sub => sub.id !== payload.old.id)
          );
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime connected');
          setRealtimeConnected(true);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime connection error');
          setRealtimeConnected(false);
        } else if (status === 'TIMED_OUT') {
          console.error('Realtime connection timed out');
          setRealtimeConnected(false);
        } else if (status === 'CLOSED') {
          console.log('Realtime connection closed');
          setRealtimeConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setRealtimeConnected(false);
    };
  }, [isAdmin, toast]);

  useEffect(() => {
    let filtered = [...submissions];

    // Filter by form type
    if (formTypeFilter !== "all") {
      filtered = filtered.filter(sub => sub.form_type === formTypeFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    // Filter by assignee
    if (assigneeFilter !== "all") {
      if (assigneeFilter === "unassigned") {
        filtered = filtered.filter(sub => !sub.assigned_to);
      } else {
        filtered = filtered.filter(sub => sub.assigned_to === assigneeFilter);
      }
    }

    if (tagFilter !== "all") {
      filtered = filtered.filter(sub => 
        sub.tags && sub.tags.includes(tagFilter)
      );
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(sub => sub.priority === priorityFilter);
    }

    if (slaFilter !== "all") {
      filtered = filtered.filter(sub => sub.sla_status === slaFilter);
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

    // Sort
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      filtered.sort((a, b) => {
        const aPriority = priorityOrder[a.priority] ?? 1;
        const bPriority = priorityOrder[b.priority] ?? 1;
        if (aPriority !== bPriority) return aPriority - bPriority;
        // Secondary sort by date for same priority
        return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
      });
    } else {
      // Sort by date (default)
      filtered.sort((a, b) => 
        new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
      );
    }

    setFilteredSubmissions(filtered);
  }, [submissions, searchQuery, formTypeFilter, dateFilter, statusFilter, assigneeFilter, tagFilter, priorityFilter, slaFilter, sortBy]);

  const exportToCSV = () => {
    if (filteredSubmissions.length === 0) {
      toast({
        title: "No Data",
        description: "No submissions to export",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Form Type", "Priority", "SLA Status", "SLA Time Remaining", "Email", "Name", "Message/Comment", "Status", "Tags", "Submitted At"];
    const rows = filteredSubmissions.map(sub => {
      const data = sub.form_data;
      const countdown = formatSlaCountdown(sub.sla_deadline, sub.status);
      return [
        sub.form_type,
        (sub.priority || 'medium').toUpperCase(),
        getSlaLabel(sub.sla_status),
        countdown.text,
        data.email || "N/A",
        data.name || "N/A",
        data.message || data.comment || "N/A",
        getStatusLabel(sub.status),
        (sub.tags || []).join('; '),
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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; border: string }> = {
      new: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
      in_progress: { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/20" },
      resolved: { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/20" },
      archived: { bg: "bg-gray-500/10", text: "text-gray-500", border: "border-gray-500/20" },
    };
    return styles[status] || styles.new;
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, { bg: string; text: string; border: string; icon: string }> = {
      high: { 
        bg: "bg-red-500/10", 
        text: "text-red-500", 
        border: "border-red-500/20",
        icon: "🔴"
      },
      medium: { 
        bg: "bg-amber-500/10", 
        text: "text-amber-500", 
        border: "border-amber-500/20",
        icon: "🟡"
      },
      low: { 
        bg: "bg-green-500/10", 
        text: "text-green-500", 
        border: "border-green-500/20",
        icon: "🟢"
      },
    };
    return styles[priority] || styles.medium;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      high: "High Priority",
      medium: "Medium Priority",
      low: "Low Priority",
    };
    return labels[priority] || "Medium Priority";
  };

  const getSlaStatusBadge = (slaStatus: string | null) => {
    const styles: Record<string, { bg: string; text: string; border: string; icon: string }> = {
      on_track: { 
        bg: "bg-green-500/10", 
        text: "text-green-500", 
        border: "border-green-500/20",
        icon: "✓"
      },
      approaching: { 
        bg: "bg-amber-500/10", 
        text: "text-amber-500", 
        border: "border-amber-500/20",
        icon: "⚠"
      },
      overdue: { 
        bg: "bg-red-500/10", 
        text: "text-red-500", 
        border: "border-red-500/20",
        icon: "⏰"
      },
      met: { 
        bg: "bg-blue-500/10", 
        text: "text-blue-500", 
        border: "border-blue-500/20",
        icon: "✓"
      },
    };
    return styles[slaStatus || 'on_track'] || styles.on_track;
  };

  const getSlaLabel = (slaStatus: string | null) => {
    const labels: Record<string, string> = {
      on_track: "On Track",
      approaching: "Approaching Deadline",
      overdue: "Overdue",
      met: "SLA Met",
    };
    return labels[slaStatus || 'on_track'] || "On Track";
  };

  const formatSlaCountdown = (deadline: string | null, status: string) => {
    if (!deadline || status === 'resolved' || status === 'archived') {
      return { text: 'Complete', isOverdue: false, isApproaching: false };
    }

    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diff = differenceInMilliseconds(deadlineDate, now);

    if (diff < 0) {
      const overdue = formatDistanceToNow(deadlineDate, { addSuffix: false });
      return { text: `${overdue} overdue`, isOverdue: true, isApproaching: false };
    }

    const remaining = formatDistanceToNow(deadlineDate, { addSuffix: false });
    
    // Check if approaching (less than 25% of time remaining)
    const createdDate = new Date(deadlineDate.getTime() - diff);
    const totalTime = deadlineDate.getTime() - createdDate.getTime();
    const isApproaching = diff < totalTime * 0.25;

    return { text: remaining, isOverdue: false, isApproaching };
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: "New",
      in_progress: "In Progress",
      resolved: "Resolved",
      archived: "Archived",
    };
    return labels[status] || status;
  };

  const getInitials = (email: string) => {
    if (!email) return '?';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const updateSubmissionStatus = async (id: string, status: string) => {
    try {
      // @ts-ignore - Types will be regenerated
      const { error } = await supabase
        // @ts-ignore - Types will be regenerated
        .from("form_submissions")
        .update({ status, last_updated_by: user?.id })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setSubmissions(prev => 
        prev.map(sub => sub.id === id ? { ...sub, status: status as any } : sub)
      );
      
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(prev => prev ? { ...prev, status: status as any } : null);
      }

      toast({
        title: "Status Updated",
        description: `Submission marked as ${getStatusLabel(status)}`,
      });
      setEditingStatus(false);
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
      variant: "destructive",
      });
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSubmissions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSubmissions.map(s => s.id)));
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selectedIds.size === 0) return;

    try {
      const idsArray = Array.from(selectedIds);
      
      // @ts-ignore - Types will be regenerated
      const { error } = await supabase
        // @ts-ignore - Types will be regenerated
        .from("form_submissions")
        .update({ status, last_updated_by: user?.id })
        .in("id", idsArray);

      if (error) throw error;

      // Update local state
      setSubmissions(prev => 
        prev.map(sub => 
          selectedIds.has(sub.id) ? { ...sub, status: status as any } : sub
        )
      );

      toast({
        title: "Bulk Update Complete",
        description: `${selectedIds.size} submissions marked as ${getStatusLabel(status)}`,
      });

      setSelectedIds(new Set());
      setBulkActionStatus("");
    } catch (error: any) {
      console.error("Error bulk updating:", error);
      toast({
        title: "Error",
        description: "Failed to update submissions",
        variant: "destructive",
      });
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      const idsArray = Array.from(selectedIds);
      
      // @ts-ignore - Types will be regenerated
      const { error } = await supabase
        // @ts-ignore - Types will be regenerated
        .from("form_submissions")
        .delete()
        .in("id", idsArray);

      if (error) throw error;

      // Update local state
      setSubmissions(prev => 
        prev.filter(sub => !selectedIds.has(sub.id))
      );

      toast({
        title: "Bulk Delete Complete",
        description: `${selectedIds.size} submissions deleted`,
      });

      setSelectedIds(new Set());
      setShowBulkDeleteDialog(false);
    } catch (error: any) {
      console.error("Error bulk deleting:", error);
      toast({
        title: "Error",
        description: "Failed to delete submissions",
        variant: "destructive",
      });
    }
  };

  const exportSelected = () => {
    if (selectedIds.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select submissions to export",
        variant: "destructive",
      });
      return;
    }

    const selectedSubmissions = filteredSubmissions.filter(sub => selectedIds.has(sub.id));

    const headers = ["Form Type", "Status", "Email", "Name", "Message/Comment", "Admin Notes", "Submitted At"];
    const rows = selectedSubmissions.map(sub => {
      const data = sub.form_data;
      return [
        sub.form_type,
        getStatusLabel(sub.status),
        data.email || "N/A",
        data.name || "N/A",
        data.message || data.comment || "N/A",
        sub.admin_notes || "N/A",
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
    a.download = `selected-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Exported ${selectedSubmissions.length} selected submissions`,
    });
  };

  const fetchAuditLog = async (submissionId: string) => {
    setLoadingAuditLog(true);
    try {
      // @ts-ignore - Types will be regenerated
      const { data, error } = await supabase
        // @ts-ignore - Types will be regenerated
        .from("form_submission_audit_log")
        .select("*")
        .eq("submission_id", submissionId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      // @ts-ignore - Types will be regenerated
      setAuditLog(data || []);
    } catch (error: any) {
      console.error("Error fetching audit log:", error);
      toast({
        title: "Error",
        description: "Failed to load activity log",
        variant: "destructive",
      });
    } finally {
      setLoadingAuditLog(false);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'status_changed':
        return <Edit2 className="h-4 w-4" />;
      case 'notes_updated':
        return <FileText className="h-4 w-4" />;
      case 'created':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionDescription = (entry: AuditLogEntry) => {
    switch (entry.action_type) {
      case 'status_changed':
        return `Status changed from ${getStatusLabel(entry.old_value?.status || 'unknown')} to ${getStatusLabel(entry.new_value?.status || 'unknown')}`;
      case 'notes_updated':
        const hadNotes = entry.old_value?.admin_notes;
        const hasNotes = entry.new_value?.admin_notes;
        if (!hadNotes && hasNotes) return 'Added notes';
        if (hadNotes && !hasNotes) return 'Removed notes';
        return 'Updated notes';
      case 'assignment_changed':
        const oldAssignee = entry.old_value?.assigned_to;
        const newAssignee = entry.new_value?.assigned_to;
        if (!oldAssignee && newAssignee) return 'Submission assigned';
        if (oldAssignee && !newAssignee) return 'Assignment removed';
        return 'Reassigned submission';
      case 'tags_changed':
        const oldTags = entry.old_value?.tags || [];
        const newTags = entry.new_value?.tags || [];
        const added = newTags.filter((t: string) => !oldTags.includes(t));
        const removed = oldTags.filter((t: string) => !newTags.includes(t));
        if (added.length > 0 && removed.length === 0) return `Added tag${added.length > 1 ? 's' : ''}: ${added.join(', ')}`;
        if (removed.length > 0 && added.length === 0) return `Removed tag${removed.length > 1 ? 's' : ''}: ${removed.join(', ')}`;
        return 'Updated tags';
      case 'priority_changed':
        const oldPriority = entry.old_value?.priority || 'medium';
        const newPriority = entry.new_value?.priority || 'medium';
        return `Priority changed from ${getPriorityLabel(oldPriority)} to ${getPriorityLabel(newPriority)}`;
      case 'created':
        return 'Submission created';
      default:
        return 'Unknown action';
    }
  };

  const updateSubmissionNotes = async (id: string, notes: string) => {
    try {
      // @ts-ignore - Types will be regenerated
      const { error } = await supabase
        // @ts-ignore - Types will be regenerated
        .from("form_submissions")
        // @ts-ignore - Types will be regenerated
        .update({ admin_notes: notes, last_updated_by: user?.id })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setSubmissions(prev => 
        prev.map(sub => sub.id === id ? { ...sub, admin_notes: notes } : sub)
      );
      
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(prev => prev ? { ...prev, admin_notes: notes } : null);
      }

      toast({
        title: "Notes Saved",
        description: "Admin notes have been updated",
      });
      setEditingNotes(false);
    } catch (error: any) {
      console.error("Error updating notes:", error);
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive",
      });
    }
  };

  const uniqueFormTypes = Array.from(new Set(submissions.map(s => s.form_type)));

  const getAdminsViewingSubmission = (submissionId: string) => {
    return onlineAdmins.filter(admin => admin.viewing_submission === submissionId);
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Copied!",
        description: `${fieldName} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const renderFormData = (data: any, formType: string) => {
    const fields: { label: string; value: string; key: string }[] = [];

    if (data.email) fields.push({ label: "Email", value: data.email, key: "email" });
    if (data.name) fields.push({ label: "Name", value: data.name, key: "name" });
    if (data.phone) fields.push({ label: "Phone", value: data.phone, key: "phone" });
    if (data.whatsapp) fields.push({ label: "WhatsApp", value: data.whatsapp, key: "whatsapp" });
    if (data.subject) fields.push({ label: "Subject", value: data.subject, key: "subject" });
    if (data.message) fields.push({ label: "Message", value: data.message, key: "message" });
    if (data.comment) fields.push({ label: "Comment", value: data.comment, key: "comment" });
    if (data.feedback) fields.push({ label: "Feedback", value: data.feedback, key: "feedback" });
    
    // Add any other fields that might exist in form_data
    Object.keys(data).forEach(key => {
      if (!['email', 'name', 'phone', 'whatsapp', 'subject', 'message', 'comment', 'feedback'].includes(key)) {
        fields.push({ 
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '), 
          value: typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key],
          key: key
        });
      }
    });

    return fields;
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <AdminLayout 
      title="Form Submissions" 
      description="View and manage all form submissions from your website"
    >
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              {realtimeConnected && (
                <span className="inline-flex items-center gap-1 text-sm text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                  Live
                </span>
              )}
              
              {onlineAdmins.length > 0 && (
                <TooltipProvider>
                  <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{onlineAdmins.length} online</span>
                    <div className="flex -space-x-2">
                      {onlineAdmins.slice(0, 3).map((admin) => (
                        <Tooltip key={admin.user_id}>
                          <TooltipTrigger>
                            <Avatar className="h-6 w-6 border-2 border-background">
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {getInitials(admin.email)}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{admin.email}</p>
                            {admin.viewing_submission && (
                              <p className="text-xs text-muted-foreground">Viewing a submission</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                      {onlineAdmins.length > 3 && (
                        <Avatar className="h-6 w-6 border-2 border-background">
                          <AvatarFallback className="text-xs bg-muted">
                            +{onlineAdmins.length - 3}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                </TooltipProvider>
              )}
            </div>
          </div>
          <div className="flex gap-2">
              <NotificationBell />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/form-analytics")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/templates")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/notification-settings")}
              >
                <Bell className="h-4 w-4 mr-2" />
                Notification Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShortcuts(true)}
              >
                <kbd className="px-2 py-1 text-xs font-semibold border rounded bg-muted">?</kbd>
                <span className="ml-2">Shortcuts</span>
              </Button>
          </div>
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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
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

              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Assignees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {adminUsers.map(admin => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Tag</label>
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {availableTags.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">🔴 High Priority</SelectItem>
                  <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                  <SelectItem value="low">🟢 Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by SLA Status</label>
              <Select value={slaFilter} onValueChange={setSlaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All SLA Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All SLA Status</SelectItem>
                  <SelectItem value="overdue">⏰ Overdue</SelectItem>
                  <SelectItem value="approaching">⚠ Approaching Deadline</SelectItem>
                  <SelectItem value="on_track">✓ On Track</SelectItem>
                  <SelectItem value="met">✓ SLA Met</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date (Newest First)</SelectItem>
                  <SelectItem value="priority">Priority (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredSubmissions.length} of {submissions.length} submissions
                {selectedIds.size > 0 && (
                  <span className="ml-2 font-medium text-primary">
                    • {selectedIds.size} selected
                  </span>
                )}
              </div>
              
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <Card className="mb-6 border-primary">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-primary" />
                    <span className="font-medium">{selectedIds.size} selected</span>
                  </div>
                  
                  <div className="h-6 w-px bg-border" />
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Bulk Actions:</span>
                    <Select value={bulkActionStatus} onValueChange={(value) => {
                      setBulkActionStatus(value);
                      if (value) bulkUpdateStatus(value);
                    }}>
                      <SelectTrigger className="w-[180px] h-9">
                        <SelectValue placeholder="Change Status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Mark as New</SelectItem>
                        <SelectItem value="in_progress">Mark as In Progress</SelectItem>
                        <SelectItem value="resolved">Mark as Resolved</SelectItem>
                        <SelectItem value="archived">Mark as Archived</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select onValueChange={(value) => {
                      bulkUpdateAssignment(value === "unassigned" ? null : value);
                    }}>
                      <SelectTrigger className="w-[180px] h-9">
                        <SelectValue placeholder="Assign to..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassign</SelectItem>
                        {adminUsers.map(admin => (
                          <SelectItem key={admin.id} value={admin.id}>
                            {admin.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                      <Select
                        value={bulkTags[0] || ""}
                        onValueChange={(value) => {
                          if (value === "new-tag") {
                            setShowTagInput(true);
                          } else {
                            setBulkTags([value]);
                          }
                        }}
                      >
                        <SelectTrigger className="w-[180px] h-9">
                          <SelectValue placeholder="Add Tag..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new-tag">+ Create New Tag</SelectItem>
                          {availableTags.map(tag => (
                            <SelectItem key={tag} value={tag}>
                              {tag}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {bulkTags.length > 0 && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            bulkAddTags(bulkTags);
                          }}
                        >
                          Apply Tags
                        </Button>
                      )}
                    </div>

                    <Select onValueChange={(value: any) => {
                      bulkUpdatePriority(value);
                    }}>
                      <SelectTrigger className="w-[180px] h-9">
                        <SelectValue placeholder="Set Priority..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">🔴 High Priority</SelectItem>
                        <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                        <SelectItem value="low">🟢 Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportSelected}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToPDF}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowBulkDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds(new Set())}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedIds.size === filteredSubmissions.length && filteredSubmissions.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>SLA Status</TableHead>
                      <TableHead>Form Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission, index) => {
                      const data = submission.form_data;
                      const isSelected = selectedIds.has(submission.id);
                      return (
                        <TableRow 
                          key={submission.id}
                          data-submission-index={index}
                          className={`cursor-pointer ${isSelected ? 'bg-muted/50' : 'hover:bg-muted/50'} ${index === selectedIndex ? 'ring-2 ring-primary' : ''}`}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelection(submission.id)}
                            />
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={submission.priority || "medium"}
                              onValueChange={(value: any) => updatePriority(submission.id, value)}
                            >
                              <SelectTrigger className="h-8 w-[120px]">
                                <SelectValue>
                                  <Badge 
                                    variant="outline" 
                                    className={`${getPriorityBadge(submission.priority || 'medium').bg} ${getPriorityBadge(submission.priority || 'medium').text} ${getPriorityBadge(submission.priority || 'medium').border}`}
                                  >
                                    {getPriorityBadge(submission.priority || 'medium').icon} {submission.priority?.toUpperCase() || 'MEDIUM'}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">🔴 High</SelectItem>
                                <SelectItem value="medium">🟡 Medium</SelectItem>
                                <SelectItem value="low">🟢 Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell onClick={() => setSelectedSubmission(submission)}>
                            {(() => {
                              const countdown = formatSlaCountdown(submission.sla_deadline, submission.status);
                              const slaStyle = getSlaStatusBadge(submission.sla_status);
                              return (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge 
                                        variant="outline" 
                                        className={`${slaStyle.bg} ${slaStyle.text} ${slaStyle.border} cursor-pointer`}
                                      >
                                        <Clock className="h-3 w-3 mr-1" />
                                        {countdown.text}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="space-y-1">
                                        <p className="font-semibold">{getSlaLabel(submission.sla_status)}</p>
                                        {submission.sla_deadline && (
                                          <p className="text-xs">
                                            Deadline: {format(new Date(submission.sla_deadline), 'MMM d, h:mm a')}
                                          </p>
                                        )}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              );
                            })()}
                          </TableCell>
                          <TableCell onClick={() => setSelectedSubmission(submission)}>
                            <Badge variant="outline" className={getFormTypeBadge(submission.form_type)}>
                              <span className="flex items-center gap-2">
                                {getFormTypeIcon(submission.form_type)}
                                {submission.form_type.split('-').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell onClick={() => setSelectedSubmission(submission)}>
                            <Badge 
                              variant="outline" 
                              className={`${getStatusBadge(submission.status).bg} ${getStatusBadge(submission.status).text} ${getStatusBadge(submission.status).border}`}
                            >
                              {getStatusLabel(submission.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium" onClick={() => setSelectedSubmission(submission)}>
                            {data.email || "N/A"}
                          </TableCell>
                          <TableCell onClick={() => setSelectedSubmission(submission)}>
                            {data.name || "N/A"}
                          </TableCell>
                          <TableCell className="max-w-xs" onClick={() => setSelectedSubmission(submission)}>
                            <div className="truncate text-sm text-muted-foreground">
                              {data.message || data.comment || data.feedback || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={submission.assigned_to || "unassigned"}
                              onValueChange={(value) => updateAssignment(submission.id, value === "unassigned" ? null : value)}
                            >
                              <SelectTrigger className="h-8 w-[180px]">
                                <SelectValue>
                                  {submission.assigned_to ? (
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-5 w-5">
                                        <AvatarFallback className="text-xs">
                                          {getInitials(adminUsers.find(a => a.id === submission.assigned_to)?.email || '')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm">
                                        {adminUsers.find(a => a.id === submission.assigned_to)?.email || 'Unknown'}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">Unassigned</span>
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">
                                  <span className="text-muted-foreground">Unassigned</span>
                                </SelectItem>
                                {adminUsers.map(admin => (
                                  <SelectItem key={admin.id} value={admin.id}>
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-5 w-5">
                                        <AvatarFallback className="text-xs">
                                          {getInitials(admin.email)}
                                        </AvatarFallback>
                                      </Avatar>
                                      {admin.email}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {submission.tags && submission.tags.length > 0 ? (
                                submission.tags.map(tag => (
                                  <Badge 
                                    key={tag} 
                                    variant="secondary"
                                    className="text-xs cursor-pointer hover:bg-secondary/80"
                                    onClick={() => removeTag(submission.id, tag)}
                                  >
                                    {tag}
                                    <X className="h-3 w-3 ml-1" />
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">No tags</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground" onClick={() => setSelectedSubmission(submission)}>
                            {new Date(submission.submitted_at).toLocaleDateString()} at{" "}
                            {new Date(submission.submitted_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <TooltipProvider>
                                {getAdminsViewingSubmission(submission.id).length > 0 && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="flex -space-x-2">
                                        {getAdminsViewingSubmission(submission.id).slice(0, 2).map((admin) => (
                                          <Avatar key={admin.user_id} className="h-5 w-5 border border-background">
                                            <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                                              {getInitials(admin.email)}
                                            </AvatarFallback>
                                          </Avatar>
                                        ))}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs font-semibold mb-1">Currently viewing:</p>
                                      {getAdminsViewingSubmission(submission.id).map((admin) => (
                                        <p key={admin.user_id} className="text-xs">{admin.email}</p>
                                      ))}
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </TooltipProvider>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedSubmission(submission)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
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

        {/* Detail Modal */}
        <Dialog open={!!selectedSubmission} onOpenChange={(open) => {
        if (!open) {
          setSelectedSubmission(null);
          setEditingStatus(false);
          setEditingNotes(false);
          setAuditLog([]);
        } else if (selectedSubmission) {
          fetchAuditLog(selectedSubmission.id);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  {getFormTypeIcon(selectedSubmission.form_type)}
                  <span>
                    {selectedSubmission.form_type.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')} Submission
                  </span>
                  
                  {getAdminsViewingSubmission(selectedSubmission.id).length > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-full text-xs">
                            <User className="h-3 w-3" />
                            <span>{getAdminsViewingSubmission(selectedSubmission.id).length} viewing</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs font-semibold mb-1">Other admins viewing:</p>
                          {getAdminsViewingSubmission(selectedSubmission.id).map((admin) => (
                            <p key={admin.user_id} className="text-xs">{admin.email}</p>
                          ))}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </DialogTitle>
                <DialogDescription>
                  Submitted on {new Date(selectedSubmission.submitted_at).toLocaleDateString()} at{" "}
                  {new Date(selectedSubmission.submitted_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Status and Form Type */}
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={getFormTypeBadge(selectedSubmission.form_type)}>
                    <span className="flex items-center gap-2">
                      {getFormTypeIcon(selectedSubmission.form_type)}
                      {selectedSubmission.form_type.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                  </Badge>

                  {editingStatus ? (
                    <div className="flex items-center gap-2">
                      <Select 
                        value={tempStatus} 
                        onValueChange={setTempStatus}
                      >
                        <SelectTrigger className="w-[150px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => updateSubmissionStatus(selectedSubmission.id, tempStatus)}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => setEditingStatus(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`${getStatusBadge(selectedSubmission.status).bg} ${getStatusBadge(selectedSubmission.status).text} ${getStatusBadge(selectedSubmission.status).border}`}
                      >
                        {getStatusLabel(selectedSubmission.status)}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setTempStatus(selectedSubmission.status);
                          setEditingStatus(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Admin Notes Section */}
                <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Admin Notes</h3>
                    {!editingNotes && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8"
                        onClick={() => {
                          setTempNotes(selectedSubmission.admin_notes || "");
                          setEditingNotes(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                  
                  {editingNotes ? (
                    <div className="space-y-2">
                      <Textarea
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Add internal notes about this submission..."
                        className="min-h-[100px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateSubmissionNotes(selectedSubmission.id, tempNotes)}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Notes
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingNotes(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedSubmission.admin_notes || "No notes added yet."}
                    </p>
                  )}
                </div>

                {/* All Form Fields */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Form Details
                  </h3>
                  
                  {renderFormData(selectedSubmission.form_data, selectedSubmission.form_type).map((field) => (
                    <div key={field.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">{field.label}</label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(field.value, field.label)}
                          className="h-8 w-8 p-0"
                        >
                          {copiedField === field.label ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="p-3 rounded-md bg-muted/50 border">
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {field.value || "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Metadata */}
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Metadata
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Submission ID</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {selectedSubmission.id.substring(0, 8)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(selectedSubmission.id, "Submission ID")}
                          className="h-6 w-6 p-0"
                        >
                          {copiedField === "Submission ID" ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Created At</p>
                      <p className="font-medium mt-1">
                        {new Date(selectedSubmission.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Activity Log Timeline */}
                <div className="space-y-3 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Activity Timeline
                    </h3>
                    {loadingAuditLog && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                  
                  {!loadingAuditLog && auditLog.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No activity recorded yet
                    </p>
                  )}

                  {!loadingAuditLog && auditLog.length > 0 && (
                    <div className="space-y-3">
                      {auditLog.map((entry, index) => (
                        <div 
                          key={entry.id} 
                          className="flex gap-3 pb-3 border-b last:border-0 last:pb-0"
                        >
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              {getActionIcon(entry.action_type)}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">
                                  {getActionDescription(entry)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {entry.changed_by ? (
                                    <>by Admin • {new Date(entry.created_at).toLocaleString()}</>
                                  ) : (
                                    <>System • {new Date(entry.created_at).toLocaleString()}</>
                                  )}
                                </p>
                              </div>
                            </div>

                            {entry.action_type === 'status_changed' && (
                              <div className="flex items-center gap-2 mt-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getStatusBadge(entry.old_value?.status).bg} ${getStatusBadge(entry.old_value?.status).text} ${getStatusBadge(entry.old_value?.status).border}`}
                                >
                                  {getStatusLabel(entry.old_value?.status)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">→</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getStatusBadge(entry.new_value?.status).bg} ${getStatusBadge(entry.new_value?.status).text} ${getStatusBadge(entry.new_value?.status).border}`}
                                >
                                  {getStatusLabel(entry.new_value?.status)}
                                </Badge>
                              </div>
                            )}

                            {entry.action_type === 'notes_updated' && entry.new_value?.admin_notes && (
                              <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                                {entry.new_value.admin_notes.substring(0, 100)}
                                {entry.new_value.admin_notes.length > 100 && '...'}
                              </div>
                    )}
                  </div>

                  {/* Assignment Section */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Assigned to:</span>
                    <Select
                      value={selectedSubmission.assigned_to || "unassigned"}
                      onValueChange={(value) => updateAssignment(selectedSubmission.id, value === "unassigned" ? null : value)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue>
                          {selectedSubmission.assigned_to ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-xs">
                                  {getInitials(adminUsers.find(a => a.id === selectedSubmission.assigned_to)?.email || '')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {adminUsers.find(a => a.id === selectedSubmission.assigned_to)?.email || 'Unknown'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Unassigned</span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">
                          <span className="text-muted-foreground">Unassigned</span>
                        </SelectItem>
                        {adminUsers.map(admin => (
                          <SelectItem key={admin.id} value={admin.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-xs">
                                  {getInitials(admin.email)}
                                </AvatarFallback>
                              </Avatar>
                              {admin.email}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority Section */}
                  <div className="space-y-2 pt-4 border-t">
                    <span className="text-sm font-semibold">Priority Level</span>
                    <Select
                      value={selectedSubmission.priority || "medium"}
                      onValueChange={(value: any) => updatePriority(selectedSubmission.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          <Badge 
                            variant="outline" 
                            className={`${getPriorityBadge(selectedSubmission.priority || 'medium').bg} ${getPriorityBadge(selectedSubmission.priority || 'medium').text} ${getPriorityBadge(selectedSubmission.priority || 'medium').border}`}
                          >
                            {getPriorityBadge(selectedSubmission.priority || 'medium').icon} {getPriorityLabel(selectedSubmission.priority || 'medium')}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            🔴 High Priority
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            🟡 Medium Priority
                          </div>
                        </SelectItem>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            🟢 Low Priority
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* SLA Status Section */}
                  <div className="space-y-2 pt-4 border-t">
                    <span className="text-sm font-semibold">SLA Status</span>
                    {(() => {
                      const countdown = formatSlaCountdown(selectedSubmission.sla_deadline, selectedSubmission.status);
                      const slaStyle = getSlaStatusBadge(selectedSubmission.sla_status);
                      return (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                            <div className="flex items-center gap-3">
                              <Clock className={`h-5 w-5 ${slaStyle.text}`} />
                              <div>
                                <p className="font-semibold">{getSlaLabel(selectedSubmission.sla_status)}</p>
                                <p className={`text-sm ${countdown.isOverdue ? 'text-red-500 font-semibold' : countdown.isApproaching ? 'text-amber-500' : 'text-muted-foreground'}`}>
                                  {countdown.isOverdue ? '⏰ ' : countdown.isApproaching ? '⚠ ' : ''}
                                  {countdown.text} {countdown.isOverdue ? '' : 'remaining'}
                                </p>
                              </div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`${slaStyle.bg} ${slaStyle.text} ${slaStyle.border}`}
                            >
                              {slaStyle.icon}
                            </Badge>
                          </div>
                          
                          {selectedSubmission.sla_deadline && (
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex justify-between">
                                <span>Created:</span>
                                <span className="font-medium">{format(new Date(selectedSubmission.created_at), 'MMM d, h:mm a')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Deadline:</span>
                                <span className={`font-medium ${countdown.isOverdue ? 'text-red-500' : countdown.isApproaching ? 'text-amber-500' : ''}`}>
                                  {format(new Date(selectedSubmission.sla_deadline), 'MMM d, h:mm a')}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Expected Response Time:</span>
                                <span className="font-medium">
                                  {selectedSubmission.priority === 'high' ? '1 hour' : 
                                   selectedSubmission.priority === 'medium' ? '24 hours' : 
                                   '48 hours'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Tags Section */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Tags</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {selectedSubmission.tags && selectedSubmission.tags.length > 0 ? (
                        selectedSubmission.tags.map(tag => (
                          <Badge 
                            key={tag} 
                            variant="secondary"
                            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            onClick={() => removeTag(selectedSubmission.id, tag)}
                          >
                            {tag}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">No tags assigned</span>
                      )}
                    </div>

                    {showTagInput ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter new tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newTag.trim()) {
                              addTag(selectedSubmission.id, newTag.trim());
                              setNewTag("");
                              setShowTagInput(false);
                            }
                          }}
                          className="h-8"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            if (newTag.trim()) {
                              addTag(selectedSubmission.id, newTag.trim());
                              setNewTag("");
                              setShowTagInput(false);
                            }
                          }}
                        >
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setNewTag("");
                            setShowTagInput(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowTagInput(true)}
                        >
                          + New Tag
                        </Button>
                        {availableTags.slice(0, 5).map(tag => {
                          const hasTag = selectedSubmission.tags?.includes(tag);
                          if (hasTag) return null;
                          return (
                            <Button
                              key={tag}
                              size="sm"
                              variant="ghost"
                              onClick={() => addTag(selectedSubmission.id, tag)}
                              className="text-xs"
                            >
                              + {tag}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const allData = renderFormData(selectedSubmission.form_data, selectedSubmission.form_type)
                        .map(field => `${field.label}: ${field.value}`)
                        .join('\n');
                      copyToClipboard(allData, "All data");
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All Data
                  </Button>
                  
                  {selectedSubmission.form_data.email && (
                    <>
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => setShowTemplateDialog(true)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Reply with Template
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          window.location.href = `mailto:${selectedSubmission.form_data.email}`;
                        }}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Direct Email
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Template Reply Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reply with Template</DialogTitle>
            <DialogDescription>
              Select a template and customize your response
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Template</label>
                <Select 
                  value={selectedTemplate?.id || ""} 
                  onValueChange={(value) => {
                    const template = templates.find(t => t.id === value);
                    if (template) applyTemplate(template);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          {template.category && (
                            <div className="text-xs text-muted-foreground">{template.category}</div>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">To</label>
                    <Input 
                      value={selectedSubmission.form_data.email} 
                      disabled 
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input 
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Email subject"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      placeholder="Email content"
                      className="min-h-[300px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        const mailtoLink = `mailto:${selectedSubmission.form_data.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailContent)}`;
                        window.location.href = mailtoLink;
                        setShowTemplateDialog(false);
                        toast({
                          title: "Email Client Opened",
                          description: "Your email client should open with the template",
                        });
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Open in Email Client
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`To: ${selectedSubmission.form_data.email}\nSubject: ${emailSubject}\n\n${emailContent}`);
                        toast({
                          title: "Copied",
                          description: "Email content copied to clipboard",
                        });
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </Button>
                  </div>
                </>
              )}

              {templates.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-4">No templates available</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowTemplateDialog(false);
                      navigate("/admin/templates");
                    }}
                  >
                    Create Templates
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Submissions?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected submissions from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={bulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Use these shortcuts to navigate and manage submissions faster
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Navigation</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Focus search</span>
                  <kbd className="px-3 py-1.5 text-sm font-semibold border rounded bg-muted">/</kbd>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Navigate up/down</span>
                  <div className="flex gap-2">
                    <kbd className="px-3 py-1.5 text-sm font-semibold border rounded bg-muted">↑</kbd>
                    <kbd className="px-3 py-1.5 text-sm font-semibold border rounded bg-muted">↓</kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Open selected submission</span>
                  <kbd className="px-3 py-1.5 text-sm font-semibold border rounded bg-muted">Enter</kbd>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Close modal</span>
                  <kbd className="px-3 py-1.5 text-sm font-semibold border rounded bg-muted">Esc</kbd>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Selection</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Select all</span>
                  <div className="flex gap-1 items-center">
                    <kbd className="px-3 py-1.5 text-sm font-semibold border rounded bg-muted">Ctrl</kbd>
                    <span className="text-muted-foreground">+</span>
                    <kbd className="px-3 py-1.5 text-sm font-semibold border rounded bg-muted">A</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Actions</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Mark as New</span>
                  <kbd className="px-3 py-1.5 text-sm font-semibold border rounded bg-muted">N</kbd>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Mark as Resolved</span>
                  <kbd className="px-3 py-1.5 text-sm font-semibold border rounded bg-muted">R</kbd>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Mark as In Progress</span>
                  <kbd className="px-3 py-1.5 text-sm font-semibold border rounded bg-muted">I</kbd>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Mark as Archived</span>
                  <kbd className="px-3 py-1.5 text-sm font-semibold border rounded bg-muted">A</kbd>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Delete selected</span>
                  <kbd className="px-3 py-1.5 text-sm font-semibold border rounded bg-muted">D</kbd>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Help</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Show this dialog</span>
                  <div className="flex gap-1 items-center">
                    <kbd className="px-3 py-1.5 text-sm font-semibold border rounded bg-muted">Shift</kbd>
                    <span className="text-muted-foreground">+</span>
                    <kbd className="px-3 py-1.5 text-sm font-semibold border rounded bg-muted">?</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
};

export default FormSubmissionsAdmin;
