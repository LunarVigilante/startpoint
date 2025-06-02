import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Plus,
  Search
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to StartPoint - Asset & Access Intelligence</p>
        </div>
        <div className="flex space-x-3">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Quick Search
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Anomalies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+3</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dept. Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Anomalies */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Anomalies</CardTitle>
            <CardDescription>Issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-sm">Missing Standard Laptop</p>
                  <p className="text-xs text-gray-600">John Smith - Engineering</p>
                </div>
              </div>
              <Badge variant="destructive">High</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-sm">Excessive Group Access</p>
                  <p className="text-xs text-gray-600">Sarah Johnson - Marketing</p>
                </div>
              </div>
              <Badge variant="secondary">Medium</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Package className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium text-sm">Outdated Hardware</p>
                  <p className="text-xs text-gray-600">Mike Davis - Sales</p>
                </div>
              </div>
              <Badge variant="secondary">Medium</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest asset and user changes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">Asset Assigned</p>
                <p className="text-xs text-gray-600">Laptop LP-2024-001 → Emma Wilson</p>
              </div>
              <span className="text-xs text-gray-500">2 min ago</span>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">User Added</p>
                <p className="text-xs text-gray-600">New employee: Alex Chen - IT</p>
              </div>
              <span className="text-xs text-gray-500">15 min ago</span>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Package className="h-5 w-5 text-gray-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">Asset Returned</p>
                <p className="text-xs text-gray-600">Monitor MN-2023-045 returned to inventory</p>
              </div>
              <span className="text-xs text-gray-500">1 hour ago</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Department Health Overview</CardTitle>
          <CardDescription>Standardization scores by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Engineering</h3>
                <Badge className="bg-green-100 text-green-800">95%</Badge>
              </div>
              <p className="text-sm text-gray-600">24 users, 2 minor issues</p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Marketing</h3>
                <Badge className="bg-yellow-100 text-yellow-800">78%</Badge>
              </div>
              <p className="text-sm text-gray-600">12 users, 5 issues</p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Sales</h3>
                <Badge className="bg-red-100 text-red-800">65%</Badge>
              </div>
              <p className="text-sm text-gray-600">18 users, 8 critical issues</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 