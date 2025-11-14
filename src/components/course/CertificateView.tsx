import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, Share2 } from "lucide-react";

interface Certificate {
  id: string;
  course_title: string;
  completion_date: string;
  certificate_number: string;
  user_name: string;
}

interface CertificateViewProps {
  certificate: Certificate;
}

export const CertificateView = ({ certificate }: CertificateViewProps) => {
  const handleDownload = () => {
    // In a real implementation, this would generate a PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Certificate - ${certificate.course_title}</title>
          <style>
            body {
              font-family: 'Georgia', serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .certificate {
              width: 800px;
              padding: 60px;
              background: white;
              border: 20px solid #1a365d;
              text-align: center;
              box-shadow: 0 0 50px rgba(0,0,0,0.1);
            }
            .certificate-header {
              font-size: 48px;
              color: #1a365d;
              margin-bottom: 20px;
              font-weight: bold;
            }
            .certificate-title {
              font-size: 24px;
              color: #666;
              margin-bottom: 40px;
            }
            .recipient-name {
              font-size: 36px;
              color: #1a365d;
              margin: 30px 0;
              font-weight: bold;
              border-bottom: 2px solid #1a365d;
              display: inline-block;
              padding-bottom: 10px;
            }
            .course-title {
              font-size: 28px;
              color: #333;
              margin: 30px 0;
            }
            .certificate-footer {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
              padding-top: 30px;
              border-top: 1px solid #ddd;
            }
            .signature-line {
              width: 200px;
              border-top: 2px solid #333;
              padding-top: 10px;
              font-size: 14px;
              color: #666;
            }
            .certificate-number {
              font-size: 12px;
              color: #999;
              margin-top: 20px;
            }
            @media print {
              body { background: white; }
              .certificate { border: 20px solid #1a365d; }
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="certificate-header">CERTIFICATE OF COMPLETION</div>
            <div class="certificate-title">This certifies that</div>
            <div class="recipient-name">${certificate.user_name}</div>
            <div class="certificate-title">has successfully completed</div>
            <div class="course-title">${certificate.course_title}</div>
            <div class="certificate-footer">
              <div class="signature-line">
                Titans Training Group
                <br>
                <small>Training Director</small>
              </div>
              <div class="signature-line">
                ${new Date(certificate.completion_date).toLocaleDateString()}
                <br>
                <small>Completion Date</small>
              </div>
            </div>
            <div class="certificate-number">Certificate No: ${certificate.certificate_number}</div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const handleShare = () => {
    const shareText = `I've completed ${certificate.course_title} at Titans Training Group! 🎉`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Course Completion Certificate',
        text: shareText,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Share text copied to clipboard!');
    }
  };

  return (
    <Card className="border-2 border-primary">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          {/* Certificate Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Award className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Certificate Header */}
          <div>
            <h2 className="text-3xl font-bold text-primary mb-2">
              Certificate of Completion
            </h2>
            <p className="text-muted-foreground">Congratulations on completing the course!</p>
          </div>

          {/* Certificate Content */}
          <div className="py-8 space-y-4">
            <p className="text-sm text-muted-foreground">This certifies that</p>
            <p className="text-2xl font-bold">{certificate.user_name}</p>
            <p className="text-sm text-muted-foreground">has successfully completed</p>
            <p className="text-xl font-semibold text-primary">{certificate.course_title}</p>
          </div>

          {/* Certificate Footer */}
          <div className="pt-6 border-t space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">Completion Date</p>
                <p>{new Date(certificate.completion_date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Certificate No</p>
                <p className="font-mono">{certificate.certificate_number}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center pt-4">
              <Button onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={handleShare} className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
