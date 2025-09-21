import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3 } from "lucide-react";
import { OMRResult } from "./OMRDashboard";

interface StatsOverviewProps {
  results: OMRResult[];
}

const StatsOverview = ({ results }: StatsOverviewProps) => {
  if (results.length === 0) {
    return (
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <BarChart3 className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
              <p className="text-muted-foreground">Process OMR sheets to see detailed analytics and statistics.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate subject averages
  const subjects = ['Math', 'AI', 'ML', 'DS', 'GenAI'];
  const subjectData = subjects.map(subject => {
    const scores = results.map(r => r.subjectScores[subject as keyof typeof r.subjectScores]);
    const average = scores.reduce((acc, score) => acc + score, 0) / scores.length;
    return {
      name: subject,
      average: Math.round(average * 10) / 10,
      maxScore: 20
    };
  });

  // Score distribution
  const scoreRanges = [
    { range: '90-100', count: 0, color: '#22c55e' },
    { range: '80-89', count: 0, color: '#84cc16' },
    { range: '70-79', count: 0, color: '#eab308' },
    { range: '60-69', count: 0, color: '#f97316' },
    { range: '0-59', count: 0, color: '#ef4444' }
  ];

  results.forEach(result => {
    if (result.totalScore >= 90) scoreRanges[0].count++;
    else if (result.totalScore >= 80) scoreRanges[1].count++;
    else if (result.totalScore >= 70) scoreRanges[2].count++;
    else if (result.totalScore >= 60) scoreRanges[3].count++;
    else scoreRanges[4].count++;
  });

  const totalStudents = results.length;
  const averageScore = Math.round(results.reduce((acc, r) => acc + r.totalScore, 0) / totalStudents);
  const passRate = Math.round((results.filter(r => r.totalScore >= 60).length / totalStudents) * 100);
  const flaggedRate = Math.round((results.filter(r => r.flagged).length / totalStudents) * 100);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader className="pb-2">
            <CardDescription>Average Score</CardDescription>
            <CardTitle className="text-3xl text-primary">{averageScore}/100</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={averageScore} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader className="pb-2">
            <CardDescription>Pass Rate (≥60%)</CardDescription>
            <CardTitle className="text-3xl text-success">{passRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={passRate} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader className="pb-2">
            <CardDescription>Flagged for Review</CardDescription>
            <CardTitle className="text-3xl text-warning">{flaggedRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={flaggedRate} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>Average scores by subject (out of 20)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectData.map((subject) => (
                <div key={subject.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{subject.name}</span>
                    <span className="text-sm text-muted-foreground">{subject.average}/20</span>
                  </div>
                  <Progress value={(subject.average / 20) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Number of students in each score range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scoreRanges.map((range) => (
                <div key={range.range} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{range.range}</span>
                    <span className="text-sm text-muted-foreground">{range.count} students</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(range.count / totalStudents) * 100}%`,
                        backgroundColor: range.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Subject Breakdown */}
      <Card className="bg-gradient-card border-0 shadow-soft">
        <CardHeader>
          <CardTitle>Subject Analysis</CardTitle>
          <CardDescription>Detailed performance metrics for each subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {subjects.map(subject => {
              const scores = results.map(r => r.subjectScores[subject as keyof typeof r.subjectScores]);
              const avg = scores.reduce((acc, score) => acc + score, 0) / scores.length;
              const highScores = scores.filter(s => s >= 16).length;
              const lowScores = scores.filter(s => s < 12).length;
              
              return (
                <div key={subject} className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-3">{subject}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average:</span>
                      <span className="font-medium">{Math.round(avg * 10) / 10}/20</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">High (≥16):</span>
                      <span className="text-success font-medium">{highScores}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Low (&lt;12):</span>
                      <span className="text-error font-medium">{lowScores}</span>
                    </div>
                    <Progress value={(avg / 20) * 100} className="h-1 mt-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;