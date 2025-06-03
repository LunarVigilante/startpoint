'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Users, HardDrive, TrendingUp, Clock } from 'lucide-react';

interface DashboardStats {
  overview: {
    totalAssets: number;
    activeUsers: number;
    openAnomalies: number;
    avgDepartmentHealth: number;
  };
  assetsByStatus: Record<string, number>;
  departmentStats: Array<{
    department: string;
    userCount: number;
    assetCount: number;
    anomaliesCount: number;
    healthScore: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    user: string;
    department: string;
    timestamp: string;
    status: string;
  }>;
  recentAnomalies: Array<{
    id: string;
    type: string;
    description: string;
    user: string;
    department: string;
    severity: string;
    timestamp: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Asset & Access Intelligence Overview
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Asset & Access Intelligence Overview
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Make sure your database is connected and tables are created.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Asset & Access Intelligence Overview
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.assetsByStatus.assigned || 0} assigned, {stats.assetsByStatus.available || 0} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.departmentStats.length} departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Anomalies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overview.openAnomalies}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Health Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.avgDepartmentHealth}%</div>
            <p className="text-xs text-muted-foreground">
              Department average
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Department Health */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Department Health Scores</CardTitle>
            <CardDescription>
              Current standardization and compliance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.departmentStats.map((dept) => (
              <div key={dept.department} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{dept.department}</p>
                    <p className="text-xs text-muted-foreground">
                      {dept.userCount} users, {dept.assetCount} assets
                      {dept.anomaliesCount > 0 && (
                        <span className="text-red-500"> · {dept.anomaliesCount} issues</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{dept.healthScore}%</div>
                  </div>
                </div>
                <Progress value={dept.healthScore} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest asset and user changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user} · {activity.department}
                    </p>
                  </div>
                  <Badge variant={activity.status === 'ASSIGNED' ? 'default' : 'secondary'}>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Anomalies */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Access Anomalies</CardTitle>
          <CardDescription>
            Issues detected in user access and asset assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentAnomalies.map((anomaly) => (
              <div key={anomaly.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      anomaly.severity === 'HIGH' ? 'destructive' :
                      anomaly.severity === 'MEDIUM' ? 'default' : 'secondary'
                    }>
                      {anomaly.severity}
                    </Badge>
                    <p className="text-sm font-medium">{anomaly.user}</p>
                    <p className="text-xs text-muted-foreground">({anomaly.department})</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                </div>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 