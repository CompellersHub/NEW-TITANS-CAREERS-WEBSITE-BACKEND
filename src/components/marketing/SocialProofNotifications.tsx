import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, CheckCircle, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const sb: any = supabase;

interface Notification {
  id: string;
  message: string;
  icon: "users" | "check" | "trending";
  timestamp: Date;
}

export function SocialProofNotifications() {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [queue, setQueue] = useState<Notification[]>([]);

  useEffect(() => {
    // Generate realistic notifications
    const notifications: Omit<Notification, "timestamp">[] = [
      { id: "1", message: "John from London just contacted us 2 mins ago", icon: "users" },
      { id: "2", message: "Sarah from Manchester sent an inquiry", icon: "check" },
      { id: "3", message: "12 people viewing this page right now", icon: "trending" },
      { id: "4", message: "Michael from Birmingham just reached out", icon: "users" },
      { id: "5", message: "150+ inquiries received this month", icon: "trending" },
      { id: "6", message: "Emma just scheduled a consultation", icon: "check" },
      { id: "7", message: "New inquiry from Leeds 5 mins ago", icon: "users" },
      { id: "8", message: "Response rate: 95% within 24h", icon: "trending" },
    ];

    // Shuffle and add timestamps
    const shuffled = [...notifications]
      .sort(() => Math.random() - 0.5)
      .map(n => ({ ...n, timestamp: new Date() }));

    setQueue(shuffled);
  }, []);

  useEffect(() => {
    if (queue.length === 0) return;

    // Show first notification after 5 seconds
    const initialDelay = setTimeout(() => {
      showNextNotification();
    }, 5000);

    return () => clearTimeout(initialDelay);
  }, [queue]);

  const showNextNotification = () => {
    if (queue.length === 0) return;

    const [next, ...rest] = queue;
    setNotification(next);
    setQueue(rest);

    // Track impression
    sb.from("user_behaviors").insert({
      email: "anonymous",
      behavior_type: "social_proof_view",
      score_value: 0,
      behavior_data: { notification: next.message },
    });

    // Hide after 5 seconds and show next after 15 seconds
    setTimeout(() => {
      setNotification(null);
      if (rest.length > 0) {
        setTimeout(() => {
          showNextNotification();
        }, 15000);
      }
    }, 5000);
  };

  const getIcon = (icon: string) => {
    switch (icon) {
      case "users":
        return <Users className="h-4 w-4 text-accent" />;
      case "check":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "trending":
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-accent" />;
    }
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-6 z-50 max-w-sm"
        >
          <div className="bg-background border border-border shadow-lg rounded-lg p-4 flex items-center gap-3">
            <div className="flex-shrink-0">
              {getIcon(notification.icon)}
            </div>
            <p className="text-sm text-foreground flex-1">
              {notification.message}
            </p>
            <button
              onClick={() => setNotification(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
