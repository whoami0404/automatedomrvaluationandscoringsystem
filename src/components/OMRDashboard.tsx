import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileSpreadsheet, ScanLine, Download, CheckCircle, AlertTriangle, XCircle, BarChart3, Code } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import UploadSection from "./UploadSection";
import ResultsTable from "./ResultsTable";
import StatsOverview from "./StatsOverview";
import ProcessingInfo from "./ProcessingInfo";
import BackendGuide from "./BackendGuide";

export interface OMRResult {
  id: string;
  studentId: string;
  totalScore: number;
  subjectScores: {
    Python: number;
    EDA: number;
    SQL: number;
    'Power BI': number;
    Statistics: number;
  };
  status: 'completed' | 'pending' | 'error';
  flagged: boolean;
  processingTime: number;
  confidence: number;
}

const OMRDashboard = () => {
  const [results, setResults] = useState<OMRResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [answerKeyUploaded, setAnswerKeyUploaded] = useState(false);
  const [omrSheetsUploaded, setOmrSheetsUploaded] = useState(0);

  const handleFileUpload = (files: FileList | null, type: 'omr' | 'answerKey') => {
    if (!files) return;

    if (type === 'answerKey') {
      setAnswerKeyUploaded(true);
      toast({
        title: "Answer Key Uploaded",
        description: "Excel answer key has been successfully uploaded and validated.",
      });
    } else {
      setOmrSheetsUploaded(files.length);
      toast({
        title: "OMR Sheets Uploaded",
        description: `${files.length} OMR sheets uploaded successfully.`,
      });
    }
  };

  const startProcessing = async () => {
    if (!answerKeyUploaded || omrSheetsUploaded === 0) {
      toast({
        title: "Missing Files",
        description: "Please upload both answer key and OMR sheets before processing.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    // Enhanced mock results based on your Excel format
    const mockResults: OMRResult[] = Array.from({ length: omrSheetsUploaded }, (_, i) => ({
      id: `student_${i + 1}`,
      studentId: `STU${String(i + 1).padStart(3, '0')}`,
      totalScore: Math.floor(Math.random() * 40) + 60, // 60-100 range
      subjectScores: {
        Python: Math.floor(Math.random() * 8) + 12, // 12-20 range per subject
        EDA: Math.floor(Math.random() * 8) + 12,
        SQL: Math.floor(Math.random() * 8) + 12,
        'Power BI': Math.floor(Math.random() * 8) + 12,
        Statistics: Math.floor(Math.random() * 8) + 12,
      },
      status: Math.random() > 0.1 ? 'completed' : (Math.random() > 0.5 ? 'pending' : 'error'),
      flagged: Math.random() > 0.8,
      processingTime: Math.floor(Math.random() * 3000) + 1000,
      confidence: Math.floor(Math.random() * 20) + 80, // 80-100% confidence
    }));

    // Simulate processing progress
    for (let i = 0; i <= 100; i += 10) {
      setProcessingProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setResults(mockResults);
    setIsProcessing(false);
    
    toast({
      title: "Processing Complete",
      description: `Successfully processed ${mockResults.length} OMR sheets.`,
    });
  };

  const downloadResults = () => {
    // Create CSV content with your Excel format
    const csvContent = [
      'Student ID,Total Score,Python,EDA,SQL,Power BI,Statistics,Status,Flagged,Confidence %',
      ...results.map(result => 
        `${result.studentId},${result.totalScore},${result.subjectScores.Python},${result.subjectScores.EDA},${result.subjectScores.SQL},${result.subjectScores['Power BI']},${result.subjectScores.Statistics},${result.status},${result.flagged},${result.confidence}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omr_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Results Downloaded",
      description: "CSV file has been downloaded successfully.",
    });
  };

  const completedCount = results.filter(r => r.status === 'completed').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const flaggedCount = results.filter(r => r.flagged).length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-primary shadow-soft">
              <ScanLine className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">OMR Evaluation System</h1>
              <p className="text-lg text-muted-foreground">Automated assessment scoring and analysis</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success-light">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Processed</p>
                    <p className="text-2xl font-bold text-success">{completedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-error-light">
                    <XCircle className="h-5 w-5 text-error" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Errors</p>
                    <p className="text-2xl font-bold text-error">{errorCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning-light">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Flagged</p>
                    <p className="text-2xl font-bold text-warning">{flaggedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-light">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                    <p className="text-2xl font-bold text-primary">
                      {results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.totalScore, 0) / results.length) : 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <Card className="mb-6 bg-gradient-card border-0 shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Processing OMR Sheets...</h3>
                  <Progress value={processingProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-2">{processingProgress}% complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload & Process
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Results
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="backend" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Backend Setup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div className="space-y-6">
              {/* AI Processing Info */}
              <ProcessingInfo />
              
              {/* Upload Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UploadSection 
                  title="Upload Answer Key"
                  description="Excel file with format: Python (1-20), EDA (21-40), SQL (41-60), Power BI (61-80), Statistics (81-100)"
                  icon={FileSpreadsheet}
                  acceptedFiles=".xlsx,.xls,.csv"
                  onFileUpload={(files) => handleFileUpload(files, 'answerKey')}
                  uploaded={answerKeyUploaded}
                />
                
                <UploadSection 
                  title="Upload OMR Sheets"
                  description="High-quality images of completed OMR sheets. Supports rotation, skew, and lighting correction."
                  icon={Upload}
                  acceptedFiles=".jpg,.jpeg,.png,.pdf"
                  multiple
                  onFileUpload={(files) => handleFileUpload(files, 'omr')}
                  uploaded={omrSheetsUploaded > 0}
                  uploadedCount={omrSheetsUploaded}
                />
              </div>
              
              {/* Processing Controls */}
              <Card className="bg-gradient-card border-0 shadow-medium">
                <CardHeader>
                  <CardTitle>AI-Powered OMR Processing</CardTitle>
                  <CardDescription>
                    Advanced computer vision processing with Google Vision API and OpenRouter AI for maximum accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant={answerKeyUploaded ? "default" : "secondary"} className="flex items-center gap-1">
                        {answerKeyUploaded ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        Answer Key
                      </Badge>
                      <Badge variant={omrSheetsUploaded > 0 ? "default" : "secondary"} className="flex items-center gap-1">
                        {omrSheetsUploaded > 0 ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        OMR Sheets ({omrSheetsUploaded})
                      </Badge>
                    </div>
                    <Button 
                      onClick={startProcessing} 
                      disabled={!answerKeyUploaded || omrSheetsUploaded === 0 || isProcessing}
                      size="lg"
                      className="bg-gradient-primary hover:opacity-90 shadow-soft"
                    >
                      {isProcessing ? "Processing..." : "Start AI Processing"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="results">
            <div className="space-y-6">
              {results.length > 0 && (
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Evaluation Results</h2>
                  <Button onClick={downloadResults} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download CSV
                  </Button>
                </div>
              )}
              <ResultsTable results={results} />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <StatsOverview results={results} />
          </TabsContent>

          <TabsContent value="backend">
            <BackendGuide />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OMRDashboard;