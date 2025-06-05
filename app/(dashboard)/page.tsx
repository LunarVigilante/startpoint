'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ActivityDetailModal } from '@/components/ui/activity-detail-modal';
import { AlertTriangle, Users, HardDrive, TrendingUp, Clock, Eye, CheckCircle, ShieldAlert, UserX, ExternalLink, Laptop, Smartphone, Tablet, Printer, Monitor, Plus, Copy, FileText } from 'lucide-react';

interface DashboardStats {
  overview: {
    totalAssets: number;
    activeUsers: number;
    openAnomalies: number;
    avgDepartmentHealth: number;
  };
  assetsByStatus: Record<string, number>;
  assetCategories: {
    computers: {
      total: number;
      laptops: number;
      desktops: number;
    };
    mobileDevices: {
      total: number;
      tablets: number;
      phones: number;
    };
    printers: number;
    miscellaneous: number;
    consumables: number;
  };
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
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<{
    id: string;
    type: 'asset_update' | 'user_update';
  } | null>(null);

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

  const getAnomalyRemedySuggestion = (anomaly: any) => {
    const suggestions: Record<string, string> = {
      'EXCESSIVE_PERMISSIONS': 'Review and remove unnecessary group memberships. Consider principle of least privilege.',
      'UNUSED_ACCOUNT': 'Disable account if inactive for over 90 days. Initiate offboarding if employee has left.',
      'MISSING_MFA': 'Enable multi-factor authentication immediately. Schedule security awareness training.',
      'SHARED_ACCOUNT': 'Create individual accounts for each user. Disable shared account access.',
      'OUTDATED_ACCESS': 'Review and update access permissions based on current role. Remove obsolete permissions.',
      'POLICY_VIOLATION': 'Ensure compliance with company policy. Document exception if legitimate business need.',
      'SUSPICIOUS_LOGIN': 'Investigate login patterns. Reset password and enable additional security measures.',
      'EQUIPMENT_MISMATCH': 'Verify asset assignment accuracy. Update records or redistribute equipment as needed.'
    };
    
    // Extract anomaly type from description or use a default
    const anomalyType = anomaly.type || 'POLICY_VIOLATION';
    return suggestions[anomalyType] || 'Review this anomaly and take appropriate action based on company security policies.';
  };

  const navigateToAssets = () => router.push('/assets');
  const navigateToUsers = () => router.push('/users'); 
  const navigateToAnomalies = () => router.push('/anomalies');
  const navigateToDepartments = () => router.push('/departments');
  const navigateToDepartment = (department: string) => {
    router.push(`/departments?filter=${encodeURIComponent(department)}`);
  };

  const handleActivityClick = (activity: any) => {
    // Extract asset/user ID from the activity and set the modal state
    const activityId = activity.id.replace('activity_', ''); // Remove prefix if exists
    setSelectedActivity({
      id: activityId,
      type: activity.type === 'asset_update' ? 'asset_update' : 'user_update'
    });
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-muted-foreground dark:text-gray-400">
            Asset & Access Intelligence Overview
          </p>
        </div>
        <div className="flex space-x-2">
          <div className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
            Live Data
          </div>
          <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
            Auto-refresh: 30s
          </div>
        </div>
      </div>

      {/* Asset Categories Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card 
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
          onClick={navigateToAssets}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Assets</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
              <HardDrive className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.overview.totalAssets}</div>
            <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
              {stats.assetsByStatus.assigned || 0} assigned, {stats.assetsByStatus.available || 0} available
              <ExternalLink className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
          onClick={() => router.push('/assets?filter=computers')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Computers</CardTitle>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-full">
              <Laptop className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{stats.assetCategories.computers.total}</div>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
              {stats.assetCategories.computers.laptops} laptops, {stats.assetCategories.computers.desktops} desktops
              <ExternalLink className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 border-cyan-200 dark:border-cyan-800 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
          onClick={() => router.push('/assets?filter=mobile')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-900 dark:text-cyan-100">Mobile Devices</CardTitle>
            <div className="p-2 bg-cyan-100 dark:bg-cyan-800 rounded-full">
              <Smartphone className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">{stats.assetCategories.mobileDevices.total}</div>
            <p className="text-xs text-cyan-700 dark:text-cyan-300 flex items-center gap-1">
              {stats.assetCategories.mobileDevices.tablets} tablets, {stats.assetCategories.mobileDevices.phones} phones
              <ExternalLink className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
          onClick={() => router.push('/assets?filter=printers')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">Printers</CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-full">
              <Printer className="h-4 w-4 text-orange-600 dark:text-orange-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.assetCategories.printers}</div>
            <p className="text-xs text-orange-700 dark:text-orange-300 flex items-center gap-1">
              All printer types
              <ExternalLink className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border-slate-200 dark:border-slate-800 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
          onClick={() => router.push('/assets?filter=misc')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Miscellaneous</CardTitle>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
              <Monitor className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.assetCategories.miscellaneous}</div>
            <p className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
              Monitors, docks, etc.
              <ExternalLink className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
          onClick={() => router.push('/assets?filter=consumables')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Consumables</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
              <Users className="h-4 w-4 text-green-600 dark:text-green-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.assetCategories.consumables}</div>
            <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
              Toner, cables, etc.
              <ExternalLink className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Asset</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Choose how you'd like to create a new asset</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Button
            onClick={() => router.push('/assets/create?mode=scratch')}
            variant="outline"
            className="p-6 h-auto flex flex-col items-center gap-3 border-2 border-dashed hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20"
          >
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900 dark:text-white">From Scratch</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Create a completely new asset</div>
            </div>
          </Button>

          <Button
            onClick={() => router.push('/assets/create?mode=template')}
            variant="outline"
            className="p-6 h-auto flex flex-col items-center gap-3 border-2 border-dashed hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20"
          >
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900 dark:text-white">From Template</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Use predefined templates</div>
            </div>
          </Button>

          <Button
            onClick={() => router.push('/assets/create?mode=copy')}
            variant="outline"
            className="p-6 h-auto flex flex-col items-center gap-3 border-2 border-dashed hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20"
          >
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Copy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900 dark:text-white">Copy Existing</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Duplicate an existing asset</div>
            </div>
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card 
          className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
          onClick={navigateToAnomalies}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">Open Anomalies</CardTitle>
            <div className="p-2 bg-red-100 dark:bg-red-800 rounded-full">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.overview.openAnomalies}</div>
            <p className="text-xs text-red-700 dark:text-red-300 flex items-center gap-1">
              Require attention
              <ExternalLink className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
          onClick={navigateToUsers}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Active Users</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
              <Users className="h-4 w-4 text-green-600 dark:text-green-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.overview.activeUsers}</div>
            <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
              Across {stats.departmentStats.length} departments
              <ExternalLink className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
          onClick={navigateToDepartments}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Avg Health Score</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-full">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.overview.avgDepartmentHealth}%</div>
            <p className="text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1">
              Department average
              <ExternalLink className="h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900 dark:text-yellow-100">System Status</CardTitle>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-full">
              <CheckCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">Online</div>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Department Health */}
        <Card className="col-span-2 dark:bg-gray-800 dark:border-gray-700 shadow-lg dark:shadow-gray-900/25">
          <CardHeader className="border-b dark:border-gray-700">
            <CardTitle className="text-gray-900 dark:text-white">Department Health Scores</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Current standardization and compliance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {stats.departmentStats.map((dept) => (
              <div 
                key={dept.department} 
                className="space-y-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => navigateToDepartment(dept.department)}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none text-gray-900 dark:text-white flex items-center gap-2">
                      {dept.department}
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      {dept.userCount} users, {dept.assetCount} assets
                      {dept.anomaliesCount > 0 && (
                        <span className="text-red-500 dark:text-red-400"> · {dept.anomaliesCount} issues</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      dept.healthScore >= 90 ? 'text-green-600 dark:text-green-400' :
                      dept.healthScore >= 75 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {dept.healthScore}%
                    </div>
                  </div>
                </div>
                <Progress value={dept.healthScore} className="h-3" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg dark:shadow-gray-900/25">
          <CardHeader className="border-b dark:border-gray-700">
            <CardTitle className="text-gray-900 dark:text-white">Recent Activity</CardTitle>
            <CardDescription className="dark:text-gray-400">Latest asset and user changes</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors group"
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none text-gray-900 dark:text-white flex items-center gap-2">
                      {activity.description}
                      <Eye className="h-3 w-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      {activity.user} · {activity.department}
                    </p>
                  </div>
                  <Badge variant={activity.status === 'ASSIGNED' ? 'default' : 'secondary'} className="dark:bg-gray-600 dark:text-gray-200">
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Anomalies */}
      <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg dark:shadow-gray-900/25">
        <CardHeader className="border-b dark:border-gray-700">
          <CardTitle className="text-gray-900 dark:text-white">Recent Access Anomalies</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Issues detected in user access and asset assignments
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {stats.recentAnomalies.map((anomaly) => (
              <div key={anomaly.id} className="flex items-center justify-between p-4 border dark:border-gray-600 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      anomaly.severity === 'HIGH' ? 'destructive' :
                      anomaly.severity === 'MEDIUM' ? 'default' : 'secondary'
                    } className="dark:bg-red-900 dark:text-red-100">
                      {anomaly.severity}
                    </Badge>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{anomaly.user}</p>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">({anomaly.department})</p>
                  </div>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">{anomaly.description}</p>
                </div>
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full ml-4">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activityId={selectedActivity?.id || null}
        activityType={selectedActivity?.type || 'asset_update'}
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </div>
  );
} 