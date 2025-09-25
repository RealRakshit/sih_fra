import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload as UploadIcon, 
  FileText, 
  Check, 
  X, 
  Eye,
  Download,
  AlertCircle,
  Scan,
  FileCheck,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  extractedData?: {
    claimType: string;
    village: string;
    district: string;
    state: string;
    area: string;
    applicant: string;
    confidence: number;
  };
}

const Upload = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  // Mock extracted data for demo
  const mockExtractedData = {
    claimType: 'Individual Forest Rights (IFR)',
    village: 'Koraput Village',
    district: 'Koraput',
    state: 'Odisha',
    area: '2.5 hectares',
    applicant: 'Ramesh Kumar',
    confidence: 92,
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (fileList: File[]) => {
    const newFiles: UploadedFile[] = fileList.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0,
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate upload and processing
    newFiles.forEach((file, index) => {
      simulateProcessing(file.id, index * 1000);
    });

    toast({
      title: "Files uploaded",
      description: `${fileList.length} file(s) are being processed.`,
    });
  };

  const simulateProcessing = (fileId: string, delay: number) => {
    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setFiles(prev => prev.map(file => {
        if (file.id === fileId && file.status === 'uploading') {
          const newProgress = file.progress + 10;
          if (newProgress >= 100) {
            clearInterval(uploadInterval);
            setTimeout(() => {
              // Move to processing
              setFiles(prev => prev.map(f => 
                f.id === fileId 
                  ? { ...f, status: 'processing', progress: 0 }
                  : f
              ));

              // Simulate OCR processing
              const processInterval = setInterval(() => {
                setFiles(prev => prev.map(f => {
                  if (f.id === fileId && f.status === 'processing') {
                    const newProgress = f.progress + 15;
                    if (newProgress >= 100) {
                      clearInterval(processInterval);
                      // Complete processing
                      setTimeout(() => {
                        setFiles(prev => prev.map(file => 
                          file.id === fileId 
                            ? { 
                                ...file, 
                                status: 'completed', 
                                progress: 100,
                                extractedData: mockExtractedData 
                              }
                            : file
                        ));
                      }, 500);
                    }
                    return { ...f, progress: newProgress };
                  }
                  return f;
                }));
              }, 300);
            }, 1000);
          }
          return { ...file, progress: newProgress };
        }
        return file;
      }));
    }, 200);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <UploadIcon className="h-4 w-4 animate-pulse" />;
      case 'processing':
        return <Scan className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <Check className="h-4 w-4 text-success" />;
      case 'error':
        return <X className="h-4 w-4 text-destructive" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Badge variant="secondary">Uploading</Badge>;
      case 'processing':
        return <Badge className="status-pending">Processing</Badge>;
      case 'completed':
        return <Badge className="status-verified">Completed</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="fra-container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Document Upload & Digitization</h1>
          <p className="text-muted-foreground">
            Upload scanned FRA documents for automated OCR extraction and metadata processing
          </p>
        </div>

        {/* Upload Area */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="h-5 w-5" />
              Upload FRA Documents
            </CardTitle>
            <CardDescription>
              Drag and drop files or click to select. Supports PDF, JPG, PNG formats.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
              />
              
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <UploadIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Drop files here</h3>
                  <p className="text-muted-foreground">or click to browse from your device</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>• PDF, JPG, PNG supported</span>
                  <span>• Max 10MB per file</span>
                  <span>• Multiple files allowed</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Queue */}
        {files.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Processing Queue
              </CardTitle>
              <CardDescription>
                Track the status of your uploaded documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex items-center space-x-3 flex-1">
                      {getStatusIcon(file.status)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • {file.type}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {(file.status === 'uploading' || file.status === 'processing') && (
                        <div className="w-24">
                          <Progress value={file.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {file.progress}%
                          </p>
                        </div>
                      )}
                      
                      {getStatusBadge(file.status)}
                      
                      {file.status === 'completed' && (
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Extracted Data Preview */}
        {files.some(f => f.status === 'completed') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5" />
                Extracted Data Preview
              </CardTitle>
              <CardDescription>
                OCR and NER extracted information from your documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Claim Type</label>
                    <p className="font-medium">{mockExtractedData.claimType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Village</label>
                    <p className="font-medium">{mockExtractedData.village}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">District</label>
                    <p className="font-medium">{mockExtractedData.district}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">State</label>
                    <p className="font-medium">{mockExtractedData.state}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Area</label>
                    <p className="font-medium">{mockExtractedData.area}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Applicant Name</label>
                    <p className="font-medium">{mockExtractedData.applicant}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Extraction Confidence: {mockExtractedData.confidence}%
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline">
                    Edit Data
                  </Button>
                  <Button variant="success">
                    Confirm & Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Upload;