import { useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon, Upload, CheckCircle } from "lucide-react";

interface UploadSectionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  acceptedFiles: string;
  multiple?: boolean;
  onFileUpload: (files: FileList | null) => void;
  uploaded: boolean;
  uploadedCount?: number;
}

const UploadSection = ({ 
  title, 
  description, 
  icon: Icon, 
  acceptedFiles, 
  multiple = false, 
  onFileUpload,
  uploaded,
  uploadedCount
}: UploadSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFileUpload(event.target.files);
  };

  return (
    <Card className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-200">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-light">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={handleUploadClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFiles}
            multiple={multiple}
            onChange={handleFileChange}
            className="hidden"
          />
          
          {uploaded ? (
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-success-light">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <p className="text-success font-medium">
                {multiple && uploadedCount ? `${uploadedCount} files uploaded` : 'File uploaded successfully'}
              </p>
              <Button variant="outline" size="sm">
                Change Files
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-muted">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium mb-1">Click to upload {multiple ? 'files' : 'file'}</p>
                <p className="text-sm text-muted-foreground">
                  Supports: {acceptedFiles.replace(/\./g, '').toUpperCase()}
                </p>
              </div>
              <Button>
                Choose {multiple ? 'Files' : 'File'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadSection;