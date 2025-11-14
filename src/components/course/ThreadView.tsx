import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, ThumbsUp, MessageSquare, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Thread {
  id: string;
  title: string;
  content: string;
  author_name: string;
  author_id: string;
  is_resolved: boolean;
  created_at: string;
}

interface Reply {
  id: string;
  content: string;
  author_name: string;
  author_id: string;
  is_solution: boolean;
  created_at: string;
  like_count?: number;
  user_has_liked?: boolean;
}

interface ThreadViewProps {
  threadId: string;
  onBack: () => void;
  isEnrolled: boolean;
}

export const ThreadView = ({ threadId, onBack, isEnrolled }: ThreadViewProps) => {
  const { user } = useAuth();
  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [threadLikeCount, setThreadLikeCount] = useState(0);
  const [userHasLikedThread, setUserHasLikedThread] = useState(false);

  useEffect(() => {
    loadThread();
    loadReplies();
    incrementViewCount();
  }, [threadId]);

  const incrementViewCount = async () => {
    try {
      const { data } = await supabase
        .from("discussion_threads")
        .select("view_count")
        .eq("id", threadId)
        .single();

      if (data) {
        await supabase
          .from("discussion_threads")
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq("id", threadId);
      }
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  };

  const loadThread = async () => {
    try {
      const { data, error } = await supabase
        .from("discussion_threads")
        .select("*")
        .eq("id", threadId)
        .single();

      if (error) throw error;
      setThread(data);

      // Load thread likes
      const { count: likeCount } = await supabase
        .from("thread_likes")
        .select("*", { count: "exact", head: true })
        .eq("thread_id", threadId);

      setThreadLikeCount(likeCount || 0);

      if (user) {
        const { data: userLike } = await supabase
          .from("thread_likes")
          .select("id")
          .eq("thread_id", threadId)
          .eq("user_id", user.id)
          .single();

        setUserHasLikedThread(!!userLike);
      }
    } catch (error: any) {
      toast.error("Failed to load thread", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async () => {
    try {
      const { data, error } = await supabase
        .from("discussion_replies")
        .select("*")
        .eq("thread_id", threadId)
        .order("is_solution", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Load like counts for each reply
      const repliesWithLikes = await Promise.all(
        (data || []).map(async (reply) => {
          const { count: likeCount } = await supabase
            .from("reply_likes")
            .select("*", { count: "exact", head: true })
            .eq("reply_id", reply.id);

          let userHasLiked = false;
          if (user) {
            const { data: userLike } = await supabase
              .from("reply_likes")
              .select("id")
              .eq("reply_id", reply.id)
              .eq("user_id", user.id)
              .single();

            userHasLiked = !!userLike;
          }

          return {
            ...reply,
            like_count: likeCount || 0,
            user_has_liked: userHasLiked,
          };
        })
      );

      setReplies(repliesWithLikes);
    } catch (error: any) {
      toast.error("Failed to load replies", {
        description: error.message,
      });
    }
  };

  const handleLikeThread = async () => {
    if (!user) {
      toast.error("Please sign in to like threads");
      return;
    }

    try {
      if (userHasLikedThread) {
        await supabase
          .from("thread_likes")
          .delete()
          .eq("thread_id", threadId)
          .eq("user_id", user.id);

        setThreadLikeCount((prev) => prev - 1);
        setUserHasLikedThread(false);
      } else {
        await supabase.from("thread_likes").insert({
          thread_id: threadId,
          user_id: user.id,
        });

        setThreadLikeCount((prev) => prev + 1);
        setUserHasLikedThread(true);
      }
    } catch (error: any) {
      toast.error("Failed to like thread", {
        description: error.message,
      });
    }
  };

  const handleLikeReply = async (replyId: string, currentlyLiked: boolean) => {
    if (!user) {
      toast.error("Please sign in to like replies");
      return;
    }

    try {
      if (currentlyLiked) {
        await supabase
          .from("reply_likes")
          .delete()
          .eq("reply_id", replyId)
          .eq("user_id", user.id);
      } else {
        await supabase.from("reply_likes").insert({
          reply_id: replyId,
          user_id: user.id,
        });
      }

      loadReplies();
    } catch (error: any) {
      toast.error("Failed to like reply", {
        description: error.message,
      });
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to reply");
      return;
    }

    if (!replyContent.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    setSubmitting(true);

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const authorName = profile?.full_name || user.email?.split("@")[0] || "Anonymous";

      const { error } = await supabase.from("discussion_replies").insert({
        thread_id: threadId,
        author_id: user.id,
        author_name: authorName,
        content: replyContent.trim(),
      });

      if (error) throw error;

      toast.success("Reply posted");
      setReplyContent("");
      loadReplies();
    } catch (error: any) {
      toast.error("Failed to post reply", {
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm("Are you sure you want to delete this reply?")) return;

    try {
      const { error } = await supabase
        .from("discussion_replies")
        .delete()
        .eq("id", replyId);

      if (error) throw error;

      toast.success("Reply deleted");
      loadReplies();
    } catch (error: any) {
      toast.error("Failed to delete reply", {
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading thread...</div>
        </CardContent>
      </Card>
    );
  }

  if (!thread) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Thread not found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Discussions
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{thread.title}</CardTitle>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    {thread.author_name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{thread.author_name}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
              </div>
            </div>
            {thread.is_resolved && (
              <Badge variant="default">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Resolved
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground whitespace-pre-wrap">{thread.content}</p>

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button
              variant={userHasLikedThread ? "default" : "outline"}
              size="sm"
              onClick={handleLikeThread}
              disabled={!isEnrolled}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              {threadLikeCount}
            </Button>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <Card>
        <CardHeader>
          <CardTitle>Replies ({replies.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className={`p-4 border rounded-lg ${
                reply.is_solution ? "border-green-500 bg-green-50 dark:bg-green-950" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {reply.author_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{reply.author_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {reply.is_solution && (
                  <Badge variant="default" className="bg-green-600">
                    Solution
                  </Badge>
                )}
              </div>

              <p className="text-sm whitespace-pre-wrap mb-3">{reply.content}</p>

              <div className="flex items-center gap-2">
                <Button
                  variant={reply.user_has_liked ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLikeReply(reply.id, reply.user_has_liked || false)}
                  disabled={!isEnrolled}
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  {reply.like_count || 0}
                </Button>

                {user?.id === reply.author_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteReply(reply.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {replies.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No replies yet. Be the first to respond!
            </p>
          )}

          {/* Reply Form */}
          {isEnrolled && (
            <form onSubmit={handleSubmitReply} className="space-y-3 pt-4 border-t">
              <Textarea
                placeholder="Write your reply... (Tip: Use @username to mention someone)"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={submitting || !replyContent.trim()}>
                  {submitting ? "Posting..." : "Post Reply"}
                </Button>
              </div>
            </form>
          )}

          {!isEnrolled && (
            <div className="p-4 bg-muted rounded-lg border text-center">
              <p className="text-sm text-muted-foreground">
                Enroll in this course to participate in discussions
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
