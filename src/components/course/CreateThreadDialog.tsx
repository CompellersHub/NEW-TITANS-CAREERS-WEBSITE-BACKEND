import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Lesson {
  id: string;
  module_number: number;
  lesson_number: number;
  title: string;
}

interface CreateThreadDialogProps {
  courseSlug: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateThreadDialog = ({ courseSlug, open, onClose, onSuccess }: CreateThreadDialogProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadLessons();
    }
  }, [open, courseSlug]);

  const loadLessons = async () => {
    try {
      const { data, error } = await supabase
        .from("course_lessons")
        .select("id, module_number, lesson_number, title")
        .eq("course_slug", courseSlug)
        .order("module_number")
        .order("lesson_number");

      if (error) throw error;
      setLessons(data || []);
    } catch (error: any) {
      console.error("Error loading lessons:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to create a thread");
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // Get user profile for author name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const authorName = profile?.full_name || user.email?.split("@")[0] || "Anonymous";

      // Find selected lesson for module info
      const lesson = selectedLesson ? lessons.find((l) => l.id === selectedLesson) : null;

      const { error } = await supabase.from("discussion_threads").insert({
        course_slug: courseSlug,
        author_id: user.id,
        author_name: authorName,
        title: title.trim(),
        content: content.trim(),
        lesson_id: selectedLesson || null,
        module_number: lesson?.module_number || null,
      });

      if (error) throw error;

      toast.success("Discussion thread created");
      setTitle("");
      setContent("");
      setSelectedLesson("");
      onSuccess();
    } catch (error: any) {
      toast.error("Failed to create thread", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Discussion Thread</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="What would you like to discuss?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson">Related to (optional)</Label>
            <Select value={selectedLesson} onValueChange={setSelectedLesson}>
              <SelectTrigger>
                <SelectValue placeholder="Select a lesson" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Discussion</SelectItem>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    Module {lesson.module_number}.{lesson.lesson_number} - {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts, questions, or insights..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Thread"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
