import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, AtSign, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  thread_id: string | null;
  created_at: string;
  metadata: any;
}

interface NotificationsListProps {
  onClose: () => void;
  onUpdate: () => void;
}

export const NotificationsList = ({ onClose, onUpdate }: NotificationsListProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      toast.error("Failed to load notifications", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("user_notifications")
        .update({ read: true })
        .eq("id", notificationId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      onUpdate();
    } catch (error: any) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await supabase
        .from("user_notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      onUpdate();
      toast.success("All notifications marked as read");
    } catch (error: any) {
      toast.error("Failed to mark all as read", {
        description: error.message,
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await supabase
        .from("user_notifications")
        .delete()
        .eq("id", notificationId);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      onUpdate();
      toast.success("Notification deleted");
    } catch (error: any) {
      toast.error("Failed to delete notification", {
        description: error.message,
      });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate to thread if available
    if (notification.thread_id) {
      onClose();
      // For now, we'll need to know the course slug to navigate properly
      // This could be enhanced by storing course_slug in notification metadata
      const { data: thread } = await supabase
        .from("discussion_threads")
        .select("course_slug")
        .eq("id", notification.thread_id)
        .single();

      if (thread) {
        navigate(`/courses/${thread.course_slug}?tab=discussions&thread=${notification.thread_id}`);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "mention":
        return <AtSign className="w-4 h-4 text-primary" />;
      case "reply":
        return <MessageSquare className="w-4 h-4 text-primary" />;
      default:
        return <MessageSquare className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[500px]">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Notifications</h3>
        {notifications.some((n) => !n.read) && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          No notifications yet
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-accent/50 cursor-pointer transition-colors ${
                  !notification.read ? "bg-accent/20" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getIcon(notification.type)}</div>
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    {notification.metadata?.preview && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                        "{notification.metadata.preview}"
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
