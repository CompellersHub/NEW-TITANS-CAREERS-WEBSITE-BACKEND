import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageLayout } from "@/components/layouts/PageLayout";
import { ResponseTemplateManager } from "@/components/admin/ResponseTemplateManager";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AdminTemplates = () => {
  const { isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <PageLayout intensity3D="subtle" show3D={true}>
      <main className="container py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/form-submissions")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Submissions
          </Button>
        </div>
        <ResponseTemplateManager />
      </main>
    </PageLayout>
  );
};

export default AdminTemplates;
