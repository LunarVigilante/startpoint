import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  Users,
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Settings,
  FileText,
} from "lucide-react";

// Mock data for demonstration
const departments = [
  {
    id: "1",
    name: "Engineering",
    userCount: 24,
    activeUsers: 22,
    totalAssets: 67,
    standardAssets: 64,
    anomalies: 3,
    healthScore: 95,
    trend: "up",
    lastReviewed: "2024-01-15",
    requiredAssets: ["Laptop", "Monitor", "Keyboard", "Mouse"],
    requiredGroups: ["Engineering-All", "VPN-Access", "Git-Access"],
    commonLicenses: ["Visual Studio", "JetBrains", "Adobe Creative"],
  },
  {
    id: "2",
    name: "Marketing",
    userCount: 12,
    activeUsers: 11,
    totalAssets: 28,
    standardAssets: 22,
    anomalies: 5,
    healthScore: 78,
    trend: "down",
    lastReviewed: "2024-01-10",
    requiredAssets: ["Laptop", "Monitor", "Phone"],
    requiredGroups: ["Marketing-All", "Social-Media", "Analytics"],
    commonLicenses: ["Adobe Creative", "Canva Pro", "HubSpot"],
  },
  {
    id: "3",
    name: "Sales",
    userCount: 18,
    activeUsers: 16,
    totalAssets: 45,
    standardAssets: 29,
    anomalies: 8,
    healthScore: 65,
    trend: "down",
    lastReviewed: "2023-12-20",
    requiredAssets: ["Laptop", "Phone", "Tablet"],
    requiredGroups: ["Sales-All", "CRM-Access", "VPN-Access"],
    commonLicenses: ["Salesforce", "Microsoft Office", "Zoom"],
  },
  {
    id: "4",
    name: "IT",
    userCount: 8,
    activeUsers: 8,
    totalAssets: 32,
    standardAssets: 31,
    anomalies: 1,
    healthScore: 97,
    trend: "up",
    lastReviewed: "2024-01-12",
    requiredAssets: ["Laptop", "Monitor", "Phone", "Testing Equipment"],
    requiredGroups: ["IT-All", "Admin-Access", "Server-Access"],
    commonLicenses: ["VMware", "Microsoft Admin", "Monitoring Tools"],
  },
  {
    id: "5",
    name: "HR",
    userCount: 6,
    activeUsers: 5,
    totalAssets: 15,
    standardAssets: 13,
    anomalies: 2,
    healthScore: 87,
    trend: "up",
    lastReviewed: "2024-01-08",
    requiredAssets: ["Laptop", "Monitor", "Phone"],
    requiredGroups: ["HR-All", "Payroll-Access", "Benefits-Access"],
    commonLicenses: ["ADP", "BambooHR", "Microsoft Office"],
  },
];

function getHealthScoreColor(score: number) {
  if (score >= 90) return "text-green-600";
  if (score >= 75) return "text-yellow-600";
  return "text-red-600";
}

function getHealthScoreBg(score: number) {
  if (score >= 90) return "bg-green-50 border-green-200";
  if (score >= 75) return "bg-yellow-50 border-yellow-200";
  return "bg-red-50 border-red-200";
}

function getTrendIcon(trend: string) {
  return trend === "up" ? (
    <TrendingUp className="h-4 w-4 text-green-500" />
  ) : (
    <TrendingDown className="h-4 w-4 text-red-500" />
  );
}

export default function DepartmentsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600">Analyze department health and standardization</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Manage Baselines
          </Button>
        </div>
      </div>

      {/* Overall Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Health Score</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68</div>
            <p className="text-xs text-muted-foreground">
              Across 5 departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Standard Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">159/187</div>
            <p className="text-xs text-muted-foreground">
              85% compliance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Anomalies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">19</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {departments.map((dept) => (
          <Card key={dept.id} className={`${getHealthScoreBg(dept.healthScore)} border-2`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>{dept.name}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(dept.trend)}
                  <span className={`text-2xl font-bold ${getHealthScoreColor(dept.healthScore)}`}>
                    {dept.healthScore}%
                  </span>
                </div>
              </div>
              <CardDescription>
                {dept.userCount} users • Last reviewed {dept.lastReviewed}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Asset Compliance</span>
                    <span>{Math.round((dept.standardAssets / dept.totalAssets) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(dept.standardAssets / dept.totalAssets) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Active Users</span>
                    <span>{Math.round((dept.activeUsers / dept.userCount) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(dept.activeUsers / dept.userCount) * 100} 
                    className="h-2"
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">{dept.userCount}</div>
                  <div className="text-xs text-gray-600">Total Users</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{dept.totalAssets}</div>
                  <div className="text-xs text-gray-600">Assets</div>
                </div>
                <div>
                  <div className={`text-lg font-semibold ${dept.anomalies > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {dept.anomalies}
                  </div>
                  <div className="text-xs text-gray-600">Anomalies</div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Required Assets:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {dept.requiredAssets.map((asset, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {asset}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="font-medium">Key Groups:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {dept.requiredGroups.slice(0, 2).map((group, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {group}
                      </Badge>
                    ))}
                    {dept.requiredGroups.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{dept.requiredGroups.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Fix Issues
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Anomaly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Department Anomaly Summary</CardTitle>
          <CardDescription>Issues requiring attention across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-sm">Missing Standard Equipment</p>
                  <p className="text-xs text-gray-600">8 users across Sales and Marketing missing required laptops</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="destructive">High</Badge>
                <Button size="sm">Fix</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-sm">Inconsistent Group Access</p>
                  <p className="text-xs text-gray-600">5 users in Marketing missing required group memberships</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                <Button size="sm" variant="outline">Review</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-3">
                <Package className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium text-sm">Outdated Hardware</p>
                  <p className="text-xs text-gray-600">6 users across multiple departments with hardware past refresh cycle</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-orange-100 text-orange-800">Medium</Badge>
                <Button size="sm" variant="outline">Schedule</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 