import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, Zap, Shield, TrendingUp } from "lucide-react";

const ProcessingInfo = () => {
  return (
    <Card className="bg-gradient-card border-0 shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI-Powered Processing Features
        </CardTitle>
        <CardDescription>
          Enhanced accuracy with Google Vision AI and OpenRouter models
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-primary-light">
            <Zap className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Google Vision API</h4>
              <p className="text-xs text-muted-foreground">Advanced OCR and bubble detection even with poor image quality</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-success-light">
            <Shield className="h-5 w-5 text-success mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">OpenRouter AI</h4>
              <p className="text-xs text-muted-foreground">Intelligent ambiguous marking resolution with 99.5%+ accuracy</p>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Processing Capabilities
          </h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Rotation Correction</Badge>
            <Badge variant="outline">Skew Detection</Badge>
            <Badge variant="outline">Multi-version Support</Badge>
            <Badge variant="outline">Confidence Scoring</Badge>
            <Badge variant="outline">Quality Assessment</Badge>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-warning-light">
          <p className="text-sm">
            <strong>Note:</strong> To activate full AI processing, deploy the Python backend with your configured API keys. 
            The current interface shows simulated results for demonstration.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingInfo;