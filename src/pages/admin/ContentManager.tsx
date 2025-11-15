import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, FileText, MessageSquare, Trophy, BookOpen, GraduationCap } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CourseConfigManager } from "@/components/admin/content/CourseConfigManager";
import { StaticPagesManager } from "@/components/admin/content/StaticPagesManager";
import { TestimonialsManager } from "@/components/admin/content/TestimonialsManager";
import { SuccessStoriesManager } from "@/components/admin/content/SuccessStoriesManager";
import { BlogPostsManager } from "@/components/admin/content/BlogPostsManager";
import { SiteSettingsManager } from "@/components/admin/content/SiteSettingsManager";

const ContentManager = () => {
  return (
    <PageTransition>
      <AdminLayout
        title="Content Management"
        description="Manage all website content, courses, pages, and settings"
      >
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto">
            <TabsTrigger value="courses" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Courses</span>
            </TabsTrigger>
            <TabsTrigger value="pages" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Pages</span>
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Testimonials</span>
            </TabsTrigger>
            <TabsTrigger value="stories" className="gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Stories</span>
            </TabsTrigger>
            <TabsTrigger value="blog" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Blog</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4">
            <CourseConfigManager />
          </TabsContent>

          <TabsContent value="pages" className="space-y-4">
            <StaticPagesManager />
          </TabsContent>

          <TabsContent value="testimonials" className="space-y-4">
            <TestimonialsManager />
          </TabsContent>

          <TabsContent value="stories" className="space-y-4">
            <SuccessStoriesManager />
          </TabsContent>

          <TabsContent value="blog" className="space-y-4">
            <BlogPostsManager />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <SiteSettingsManager />
          </TabsContent>
        </Tabs>
      </AdminLayout>
    </PageTransition>
  );
};

export default ContentManager;
