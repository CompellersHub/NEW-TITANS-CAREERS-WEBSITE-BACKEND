import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Bell, X, Check, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  related_submission_id: string | null;
  metadata: any;
  read: boolean;
  created_at: string;
}

export const NotificationBell = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin || !user) return;

    fetchNotifications();

    // Setup realtime subscription for new notifications
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications',
          filter: `admin_user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for urgent notifications
          if (newNotification.notification_type === 'sla_overdue') {
            toast({
              title: newNotification.title,
              description: newNotification.message,
              variant: "destructive",
            });
          } else if (newNotification.notification_type === 'sla_approaching') {
            toast({
              title: newNotification.title,
              description: newNotification.message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("admin_notifications" as any)
        .select("*")
        .eq("admin_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20) as any;

      if (error) throw error;

      const typedData = (data || []) as Notification[];
      setNotifications(typedData);
      setUnreadCount(typedData.filter(n => !n.read).length);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("admin_notifications" as any)
        .update({ read: true } as any)
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("admin_notifications" as any)
        .update({ read: true } as any)
        .eq("admin_user_id", user.id)
        .eq("read", false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error: any) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.related_submission_id) {
      setIsOpen(false);
      navigate("/admin/form-submissions");
    } else if (notification.notification_type === 'sla_compliance_low') {
      setIsOpen(false);
      navigate("/admin/form-analytics");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'sla_overdue':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'sla_approaching':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'sla_compliance_low':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'sla_overdue':
        return "bg-destructive/10 text-destructive border-destructive/20";
      case 'sla_approaching':
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case 'sla_compliance_low':
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  if (!isAdmin) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm">{notification.title}</p>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getNotificationBadgeColor(notification.notification_type)}`}
                        >
                          {notification.notification_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
