import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { OMRResult } from "./OMRDashboard";

interface ResultsTableProps {
  results: OMRResult[];
}

const ResultsTable = ({ results }: ResultsTableProps) => {
  if (results.length === 0) {
    return (
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <Table className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No Results Yet</h3>
              <p className="text-muted-foreground">Upload and process OMR sheets to see results here.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-error" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default' as const;
      case 'error':
        return 'destructive' as const;
      case 'pending':
        return 'secondary' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-error';
  };

  return (
    <Card className="bg-gradient-card border-0 shadow-soft">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="font-semibold">Student ID</TableHead>
                <TableHead className="font-semibold">Total Score</TableHead>
                <TableHead className="font-semibold">Math</TableHead>
                <TableHead className="font-semibold">AI</TableHead>
                <TableHead className="font-semibold">ML</TableHead>
                <TableHead className="font-semibold">DS</TableHead>
                <TableHead className="font-semibold">GenAI</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Flags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id} className="border-border/50 hover:bg-muted/50">
                  <TableCell className="font-medium">{result.studentId}</TableCell>
                  <TableCell>
                    <span className={`font-bold text-lg ${getScoreColor(result.totalScore, 100)}`}>
                      {result.totalScore}/100
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={getScoreColor(result.subjectScores.Math, 20)}>
                      {result.subjectScores.Math}/20
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={getScoreColor(result.subjectScores.AI, 20)}>
                      {result.subjectScores.AI}/20
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={getScoreColor(result.subjectScores.ML, 20)}>
                      {result.subjectScores.ML}/20
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={getScoreColor(result.subjectScores.DS, 20)}>
                      {result.subjectScores.DS}/20
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={getScoreColor(result.subjectScores.GenAI, 20)}>
                      {result.subjectScores.GenAI}/20
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(result.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(result.status)}
                      {result.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {result.flagged && (
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <AlertTriangle className="h-3 w-3 text-warning" />
                        Review
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsTable;