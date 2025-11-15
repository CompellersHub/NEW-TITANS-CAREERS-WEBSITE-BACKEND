import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UploadedFile {
  file: File;
  preview: string;
  url?: string;
}

interface PaymentProofUploaderProps {
  reference: string;
  existingProofs?: string[];
  onUploadComplete: () => void;
}

export function PaymentProofUploader({ reference, existingProofs = [], onUploadComplete }: PaymentProofUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const MAX_FILES = 3;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndAddFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const currentCount = files.length + existingProofs.length;
    
    if (currentCount >= MAX_FILES) {
      toast({
        title: 'Maximum files reached',
        description: `You can only upload up to ${MAX_FILES} documents`,
        variant: 'destructive'
      });
      return;
    }

    const remainingSlots = MAX_FILES - currentCount;
    const filesToAdd = fileArray.slice(0, remainingSlots);

    for (const file of filesToAdd) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 5MB limit`,
          variant: 'destructive'
        });
        continue;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} must be an image (JPG, PNG, WEBP) or PDF`,
          variant: 'destructive'
        });
        continue;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFiles(prev => [...prev, {
          file,
          preview: reader.result as string
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const { file } of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${reference}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      // Combine with existing proofs
      const allUrls = [...existingProofs, ...uploadedUrls];

      const { error: updateError } = await supabase
        .from('bank_transfer_orders')
        .update({ 
          payment_proof_urls: allUrls,
          payment_proof_url: allUrls[0] // Keep backward compatibility
        })
        .eq('payment_reference', reference);

      if (updateError) throw updateError;

      toast({ 
        title: 'Upload successful', 
        description: `${files.length} document(s) uploaded. We'll verify your payment soon.`
      });
      
      setFiles([]);
      onUploadComplete();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ 
        title: 'Upload failed', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const canAddMore = files.length + existingProofs.length < MAX_FILES;

  return (
    <Card className="p-6 bg-gradient-to-br from-background to-muted/20 border-2 border-dashed border-border/50">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Upload Payment Proof</h3>
          <p className="text-sm text-muted-foreground">
            Upload your payment receipt or bank statement (Max {MAX_FILES} documents, 5MB each)
          </p>
        </div>

        {/* Drag and Drop Zone */}
        {canAddMore && (
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
              dragActive 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : 'border-border/50 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileInput}
              accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
              multiple
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm font-medium mb-1">
                Drop files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: JPG, PNG, WEBP, PDF
              </p>
            </label>
          </div>
        )}

        {/* File Previews */}
        {files.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {files.map((fileData, index) => (
              <Card key={index} className="relative overflow-hidden group">
                <div className="aspect-video bg-muted/30 flex items-center justify-center p-4">
                  {fileData.file.type.startsWith('image/') ? (
                    <img
                      src={fileData.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-contain rounded"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="w-12 h-12" />
                      <p className="text-xs text-center truncate w-full px-2">
                        {fileData.file.name}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="p-2 bg-background border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getFileIcon(fileData.file.type)}
                      <span className="text-xs truncate">
                        {fileData.file.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(fileData.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 h-6 w-6 p-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Existing Proofs */}
        {existingProofs.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Previously Uploaded:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {existingProofs.map((url, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <div className="aspect-video bg-muted/30 flex items-center justify-center">
                    {url.endsWith('.pdf') ? (
                      <FileText className="w-12 h-12 text-muted-foreground" />
                    ) : (
                      <img
                        src={url}
                        alt={`Uploaded proof ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <div className="p-2 bg-background border-t">
                    <p className="text-xs text-muted-foreground">
                      Document {index + 1} ✓ Uploaded
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {files.length > 0 && (
          <Button 
            onClick={handleUpload} 
            disabled={uploading}
            className="w-full"
            size="lg"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading {files.length} document(s)...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {files.length} document(s)
              </>
            )}
          </Button>
        )}

        <p className="text-xs text-center text-muted-foreground">
          {files.length + existingProofs.length} of {MAX_FILES} documents
        </p>
      </div>
    </Card>
  );
}
