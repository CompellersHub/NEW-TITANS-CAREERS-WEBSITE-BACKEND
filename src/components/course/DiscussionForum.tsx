import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare, ThumbsUp, Pin, CheckCircle2, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { CreateThreadDialog } from "./CreateThreadDialog";
import { ThreadView } from "./ThreadView";
import { formatDistanceToNow } from "date-fns";

interface Thread {
  id: string;
  title: string;
  content: string;
  author_name: string;
  author_id: string;
  is_pinned: boolean;
  is_resolved: boolean;
  view_count: number;
  created_at: string;
  module_number: number | null;
  lesson_id: string | null;
  reply_count?: number;
  like_count?: number;
}

interface DiscussionForumProps {
  courseSlug: string;
  isEnrolled: boolean;
}

export const DiscussionForum = ({ courseSlug, isEnrolled }: DiscussionForumProps) => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [filteredThreads, setFilteredThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);

  useEffect(() => {
    loadThreads();
  }, [courseSlug]);

  useEffect(() => {
    filterThreads();
  }, [searchQuery, threads]);

  const loadThreads = async () => {
    try {
      const { data: threadsData, error } = await supabase
        .from("discussion_threads")
        .select("*")
        .eq("course_slug", courseSlug)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Load reply counts and like counts
      const threadsWithCounts = await Promise.all(
        (threadsData || []).map(async (thread) => {
          const [{ count: replyCount }, { count: likeCount }] = await Promise.all([
            supabase
              .from("discussion_replies")
              .select("*", { count: "exact", head: true })
              .eq("thread_id", thread.id),
            supabase
              .from("thread_likes")
              .select("*", { count: "exact", head: true })
              .eq("thread_id", thread.id),
          ]);

          return {
            ...thread,
            reply_count: replyCount || 0,
            like_count: likeCount || 0,
          };
        })
      );

      setThreads(threadsWithCounts);
    } catch (error: any) {
      toast.error("Failed to load discussions", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterThreads = () => {
    if (!searchQuery.trim()) {
      setFilteredThreads(threads);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = threads.filter(
      (thread) =>
        thread.title.toLowerCase().includes(query) ||
        thread.content.toLowerCase().includes(query) ||
        thread.author_name.toLowerCase().includes(query)
    );
    setFilteredThreads(filtered);
  };

  if (selectedThread) {
    return (
      <ThreadView
        threadId={selectedThread}
        onBack={() => {
          setSelectedThread(null);
          loadThreads();
        }}
        isEnrolled={isEnrolled}
      />
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading discussions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Course Discussions</CardTitle>
            {isEnrolled && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Thread
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {!isEnrolled && (
            <div className="p-4 bg-muted rounded-lg border text-center">
              <p className="text-sm text-muted-foreground">
                Enroll in this course to participate in discussions
              </p>
            </div>
          )}

          {filteredThreads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No discussions found matching your search" : "No discussions yet. Be the first to start one!"}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThread(thread.id)}
                  className="w-full text-left p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {thread.is_pinned && (
                          <Pin className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                        <h3 className="font-semibold line-clamp-1">{thread.title}</h3>
                        {thread.is_resolved && (
                          <Badge variant="default" className="ml-auto flex-shrink-0">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {thread.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {thread.reply_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {thread.like_count || 0}
                        </span>
                        <span>by {thread.author_name}</span>
                        <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateThreadDialog
        courseSlug={courseSlug}
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          setShowCreateDialog(false);
          loadThreads();
        }}
      />
    </div>
  );
};
