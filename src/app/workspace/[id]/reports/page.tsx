"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  UserCheck,
  UserX,
  Target,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";
import { useWorkspace } from "@/lib/workspace-context";
import { motion } from "framer-motion";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import apiClient from "@/utils/api.client";

interface WorkspaceData {
  table: {
    rows: any[];
    schema: any[];
  };
}

interface AnalyticsData {
  totalCandidates: number;
  hiredCandidates: number;
  suitableCandidates: number;
  averageScore: number;
  hiringRate: number;
  monthlyTrends: Array<{
    month: string;
    applications: number;
    hired: number;
    suitable: number;
  }>;
  scoreDistribution: Array<{
    range: string;
    count: number;
  }>;
  departmentStats: Array<{
    department: string;
    total: number;
    hired: number;
    suitable: number;
  }>;
}

// Simple Bar Chart Component
const BarChart = ({ data, title }: { data: any[], title: string }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.applications || d.total, d.hired, d.suitable || d.count)));
  
  return (
    <div>
      <h4 className="text-sm font-medium mb-4">{title}</h4>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{item.month || item.department || item.range}</span>
              <span className="font-medium">
                {item.applications || item.total || item.count}
              </span>
            </div>
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${((item.applications || item.total || item.count) / maxValue) * 100}%` 
                }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple Pie Chart Component
const PieChart = ({ data, title }: { data: { label: string, value: number, color: string }[], title: string }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div>
      <h4 className="text-sm font-medium mb-4">{title}</h4>
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 42 42">
            <circle
              cx="21"
              cy="21"
              r="15.91549430918954"
              fill="transparent"
              stroke="#f3f4f6"
              strokeWidth="2"
            />
            {data.map((segment, index) => {
              const previousTotal = data.slice(0, index).reduce((sum, item) => sum + item.value, 0);
              const percentage = (segment.value / total) * 100;
              const offset = (previousTotal / total) * 100;
              
              return (
                <motion.circle
                  key={index}
                  cx="21"
                  cy="21"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth="2"
                  strokeDasharray={`${percentage} ${100 - percentage}`}
                  strokeDashoffset={-offset}
                  initial={{ strokeDasharray: "0 100" }}
                  animate={{ strokeDasharray: `${percentage} ${100 - percentage}` }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                />
              );
            })}
          </svg>
        </div>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function WorkspaceReportsPage() {
  const params = useParams();
  const workspaceId = params?.id as string;
  const { selectedWorkspace, isLoading } = useWorkspace();
  const [timeRange, setTimeRange] = useState("6m");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch workspace data and calculate analytics
  const fetchAnalyticsData = async () => {
    if (!selectedWorkspace) {
      console.log('No selected workspace, skipping analytics fetch');
      return;
    }
    
    setDataLoading(true);
    try {
      console.log('Fetching analytics for workspace:', selectedWorkspace._id);
      const response = await apiClient.get<WorkspaceData>(`/workspaces/${selectedWorkspace._id}`);
      const workspaceData = response.data;
      
      console.log('Raw workspace data:', workspaceData);
      
      const rows = workspaceData.table?.rows || [];
      const schema = workspaceData.table?.schema || [];

      console.log('Extracted rows count:', rows.length);
      console.log('Extracted schema:', schema);

      if (rows.length === 0) {
        console.log('No rows found in workspace data');
        setAnalyticsData({
          totalCandidates: 0,
          hiredCandidates: 0,
          suitableCandidates: 0,
          averageScore: 0,
          hiringRate: 0,
          monthlyTrends: [],
          scoreDistribution: [],
          departmentStats: []
        });
        return;
      }

      // Process data to calculate analytics
      const analytics = calculateAnalytics(rows, schema);
      console.log('Calculated analytics:', analytics);
      setAnalyticsData(analytics);
    } catch (error) {
      console.error("Failed to fetch workspace analytics:", error);
      
      const errorObj = error as any;
      console.error("Error details:", {
        message: errorObj?.message || 'Unknown error',
        stack: errorObj?.stack || 'No stack trace',
        response: errorObj?.response?.data || 'No response data'
      });
      
      // Fallback to empty data
      setAnalyticsData({
        totalCandidates: 0,
        hiredCandidates: 0,
        suitableCandidates: 0,
        averageScore: 0,
        hiringRate: 0,
        monthlyTrends: [],
        scoreDistribution: [],
        departmentStats: []
      });
    } finally {
      setDataLoading(false);
    }
  };

  // Calculate analytics from workspace rows
  const calculateAnalytics = (rows: any[], schema: any[]): AnalyticsData => {
    console.log('=== ANALYTICS CALCULATION START ===');
    console.log('Input rows:', rows.length);
    console.log('Input schema:', schema);
    
    if (!rows.length) {
      console.log('No rows to process, returning empty analytics');
      return {
        totalCandidates: 0,
        hiredCandidates: 0,
        suitableCandidates: 0,
        averageScore: 0,
        hiringRate: 0,
        monthlyTrends: [],
        scoreDistribution: [],
        departmentStats: []
      };
    }

    const totalCandidates = rows.length;
    console.log('Total candidates:', totalCandidates);
    
    // Find columns with multiple strategies
    const statusColumn = schema.find(col => 
      col.name.toLowerCase().includes('status')
    )?.name || 'Status';
    
    const scoreColumn = schema.find(col => 
      col.name === 'AI Score' || 
      col.name.toLowerCase() === 'ai score' ||
      col.name.toLowerCase().includes('score')
    )?.name || 'AI Score';
    
    const departmentColumn = schema.find(col => 
      col.name.toLowerCase().includes('department') ||
      col.name.toLowerCase().includes('dept') ||
      col.name.toLowerCase().includes('team')
    )?.name || 'Department';
    
    const dateColumn = schema.find(col => 
      col.name.toLowerCase().includes('date') || 
      col.name.toLowerCase().includes('created') ||
      col.name.toLowerCase().includes('time')
    )?.name || 'Date';

    console.log('=== COLUMN DETECTION ===');
    console.log('Available columns:', schema.map(col => col.name));
    console.log('Detected statusColumn:', statusColumn);
    console.log('Detected scoreColumn:', scoreColumn);
    console.log('Detected departmentColumn:', departmentColumn);
    console.log('Detected dateColumn:', dateColumn);

    // Sample first few rows to understand data structure
    console.log('=== SAMPLE DATA ===');
    rows.slice(0, 3).forEach((row, index) => {
      console.log(`Row ${index}:`, {
        status: row[statusColumn],
        score: row[scoreColumn],
        department: row[departmentColumn],
        date: row[dateColumn],
        allKeys: Object.keys(row)
      });
    });

    // Calculate hired candidates
    const hiredCandidates = rows.filter(row => {
      const status = row[statusColumn];
      const isHired = status && typeof status === 'string' && status.toLowerCase().includes('hired');
      console.log(`Hired check: "${status}" -> ${isHired}`);
      return isHired;
    }).length;

    console.log('Total hired candidates:', hiredCandidates);

    // Calculate suitable candidates (AI Score > 85)
    const suitableCandidates = rows.filter(row => {
      const rawScore = row[scoreColumn];
      const score = parseFloat(rawScore);
      const isSuitable = !isNaN(score) && score > 85;
      console.log(`Suitable check: "${rawScore}" -> parsed: ${score} -> suitable: ${isSuitable}`);
      return isSuitable;
    }).length;

    console.log('Total suitable candidates:', suitableCandidates);

    // Calculate average score with better validation
    const validScores = rows
      .map(row => parseFloat(row[scoreColumn]))
      .filter(score => !isNaN(score) && score > 0);
    
    console.log('Valid scores:', validScores);
    const averageScore = validScores.length > 0 ? 
      validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;

    console.log('Average score:', averageScore);

    // Calculate hiring rate
    const hiringRate = totalCandidates > 0 ? (hiredCandidates / totalCandidates) * 100 : 0;

    console.log('Hiring rate:', hiringRate);

    // Generate trends and distributions
    const monthlyTrends = generateMonthlyTrends(rows, dateColumn, statusColumn, scoreColumn);
    const scoreDistribution = generateScoreDistribution(validScores);
    const departmentStats = generateDepartmentStats(rows, departmentColumn, statusColumn, scoreColumn);

    const result = {
      totalCandidates,
      hiredCandidates,
      suitableCandidates,
      averageScore: Math.round(averageScore * 10) / 10,
      hiringRate: Math.round(hiringRate * 10) / 10,
      monthlyTrends,
      scoreDistribution,
      departmentStats
    };

    console.log('=== FINAL ANALYTICS RESULT ===');
    console.log(result);
    
    return result;
  };

  // Generate monthly trends data
  const generateMonthlyTrends = (rows: any[], dateColumn: string, statusColumn: string, scoreColumn: string) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const monthlyData: { [key: string]: { applications: number; hired: number; suitable: number } } = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      const monthKey = months[date.getMonth()];
      monthlyData[monthKey] = { applications: 0, hired: 0, suitable: 0 };
    }

    // Process rows
    rows.forEach(row => {
      if (row[dateColumn]) {
        const rowDate = new Date(row[dateColumn]);
        const monthKey = months[rowDate.getMonth()];
        
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].applications++;
          
          if (row[statusColumn] && row[statusColumn].toLowerCase().includes('hired')) {
            monthlyData[monthKey].hired++;
          }
          
          const score = parseFloat(row[scoreColumn]);
          if (!isNaN(score) && score > 85) {
            monthlyData[monthKey].suitable++;
            console.log(`Monthly trend: ${monthKey} - suitable candidate with score ${score}`);
          }
        }
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    }));
  };

  // Generate score distribution
  const generateScoreDistribution = (scores: number[]) => {
    const distribution = {
      '90-100': 0,
      '85-90': 0,
      '80-85': 0,
      '70-80': 0,
      '60-70': 0,
      '<60': 0
    };

    scores.forEach(score => {
      if (score >= 90) distribution['90-100']++;
      else if (score >= 85) distribution['85-90']++;
      else if (score >= 80) distribution['80-85']++;
      else if (score >= 70) distribution['70-80']++;
      else if (score >= 60) distribution['60-70']++;
      else distribution['<60']++;
    });

    return Object.entries(distribution).map(([range, count]) => ({
      range,
      count
    }));
  };

  // Generate department statistics
  const generateDepartmentStats = (rows: any[], departmentColumn: string, statusColumn: string, scoreColumn: string) => {
    const departmentData: { [key: string]: { total: number; hired: number; suitable: number } } = {};

    rows.forEach(row => {
      const department = row[departmentColumn] || 'Unknown';
      
      if (!departmentData[department]) {
        departmentData[department] = { total: 0, hired: 0, suitable: 0 };
      }
      
      departmentData[department].total++;
      
      if (row[statusColumn] && row[statusColumn].toLowerCase().includes('hired')) {
        departmentData[department].hired++;
      }
      
      const score = parseFloat(row[scoreColumn]);
      if (!isNaN(score) && score > 85) {
        departmentData[department].suitable++;
        console.log(`Department ${department}: suitable candidate with score ${score}`);
      }
    });

    return Object.entries(departmentData).map(([department, data]) => ({
      department,
      ...data
    }));
  };

  useEffect(() => {
    if (selectedWorkspace) {
      fetchAnalyticsData();
    }
  }, [selectedWorkspace]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnalyticsData();
    setIsRefreshing(false);
  };

  const handleExport = () => {
    if (!analyticsData) return;
    
    const exportData = {
      workspace: selectedWorkspace?.name,
      generatedAt: new Date().toISOString(),
      analytics: analyticsData
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedWorkspace?.name}-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading || dataLoading) {
    return (
      <WorkspaceLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </WorkspaceLayout>
    );
  }

  const pieChartData = analyticsData ? [
    { label: 'Hired', value: analyticsData.hiredCandidates, color: '#22c55e' },
    { label: 'Suitable', value: analyticsData.suitableCandidates - analyticsData.hiredCandidates, color: '#3b82f6' },
    { label: 'Others', value: analyticsData.totalCandidates - analyticsData.suitableCandidates, color: '#e5e7eb' },
  ] : [];

  return (
    <WorkspaceLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics & Reports</h1>
            <p className="text-muted-foreground">
              Insights and metrics for {selectedWorkspace?.name || 'this workspace'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Candidates
                    </p>
                    <p className="text-2xl font-bold">
                      {analyticsData?.totalCandidates || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Out of 200 target
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Hired Candidates
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {analyticsData?.hiredCandidates || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {analyticsData?.hiringRate || 0}% hiring rate
                    </p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Suitable for JD
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {analyticsData?.suitableCandidates || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Good AI score match
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Average Score
                    </p>
                    <p className="text-2xl font-bold">
                      {analyticsData?.averageScore || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Out of 10.0
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts and Analytics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="scores">Score Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Candidate Status Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of candidate statuses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PieChart data={pieChartData} title="" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Applications</CardTitle>
                  <CardDescription>
                    Application volume over the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart 
                    data={analyticsData?.monthlyTrends || []} 
                    title="" 
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hiring Trends</CardTitle>
                <CardDescription>
                  Monthly hiring patterns and success rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <BarChart 
                    data={(analyticsData?.monthlyTrends || []).map((trend: any) => ({
                      month: trend.month,
                      applications: trend.applications,
                      hired: trend.hired,
                      suitable: trend.suitable
                    }))} 
                    title="Applications vs Hired" 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>
                  Hiring statistics by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart 
                  data={analyticsData?.departmentStats || []} 
                  title="" 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scores" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Score Distribution</CardTitle>
                <CardDescription>
                  Distribution of candidate AI scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart 
                  data={analyticsData?.scoreDistribution || []} 
                  title="" 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </WorkspaceLayout>
  );
}