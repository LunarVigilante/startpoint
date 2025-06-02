import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  Package,
  AlertTriangle,
  Building2,
} from "lucide-react";

// Mock data for demonstration
const reportTemplates = [
  {
    id: "1",
    name: "Asset Inventory Report",
    description: "Complete list of all assets with current status and assignments",
    category: "Assets",
    lastGenerated: "2024-01-15",
    frequency: "Weekly",
    icon: Package,
  },
  {
    id: "2",
    name: "User Access Audit",
    description: "Comprehensive review of user permissions and group memberships",
    category: "Security",
    lastGenerated: "2024-01-12",
    frequency: "Monthly",
    icon: Users,
  },
  {
    id: "3",
    name: "Department Health Summary",
    description: "Standardization scores and anomaly counts by department",
    category: "Analytics",
    lastGenerated: "2024-01-14",
    frequency: "Weekly",
    icon: Building2,
  },
  {
    id: "4",
    name: "Anomaly Trends Report",
    description: "Historical analysis of access and equipment anomalies",
    category: "Analytics",
    lastGenerated: "2024-01-10",
    frequency: "Monthly",
    icon: AlertTriangle,
  },
  {
    id: "5",
    name: "Offboarding Summary",
    description: "Status of all active and completed offboarding processes",
    category: "HR",
    lastGenerated: "2024-01-13",
    frequency: "Bi-weekly",
    icon: FileText,
  },
  {
    id: "6",
    name: "Asset Utilization Analysis",
    description: "Usage patterns and optimization recommendations for assets",
    category: "Analytics",
    lastGenerated: "2024-01-08",
    frequency: "Monthly",
    icon: BarChart3,
  },
];

const quickStats = [
  {
    title: "Reports Generated This Month",
    value: "47",
    change: "+12%",
    trend: "up",
  },
  {
    title: "Automated Reports",
    value: "23",
    change: "+5%",
    trend: "up",
  },
  {
    title: "Data Export Requests",
    value: "156",
    change: "+8%",
    trend: "up",
  },
  {
    title: "Average Generation Time",
    value: "2.3s",
    change: "-15%",
    trend: "down",
  },
];

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    Assets: "bg-blue-100 text-blue-800",
    Security: "bg-red-100 text-red-800",
    Analytics: "bg-purple-100 text-purple-800",
    HR: "bg-green-100 text-green-800",
  };
  
  return colors[category] || "bg-gray-100 text-gray-800";
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate insights and export data</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Custom Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>
                  {stat.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Export</CardTitle>
          <CardDescription>Generate common reports instantly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Asset Reports</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  All Assets (CSV)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Available Assets (PDF)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Warranty Expiring (Excel)
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">User Reports</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  User Directory (CSV)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Access Permissions (PDF)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Anomalies Report (Excel)
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Department Reports</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Health Scores (PDF)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Compliance Summary (CSV)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Trend Analysis (Excel)
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>Pre-configured reports for common use cases</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="assets">Assets</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => (
              <Card key={template.id} className="border-2 hover:border-blue-200 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <template.icon className="h-8 w-8 text-blue-600" />
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frequency:</span>
                      <span className="font-medium">{template.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Generated:</span>
                      <span className="font-medium">{template.lastGenerated}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      <Download className="h-3 w-3 mr-1" />
                      Generate
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Report Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Report Builder</CardTitle>
          <CardDescription>Create tailored reports with specific data points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Data Source</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assets">Assets</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="departments">Departments</SelectItem>
                    <SelectItem value="anomalies">Anomalies</SelectItem>
                    <SelectItem value="offboarding">Offboarding</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-7-days">Last 7 days</SelectItem>
                    <SelectItem value="last-30-days">Last 30 days</SelectItem>
                    <SelectItem value="last-90-days">Last 90 days</SelectItem>
                    <SelectItem value="last-year">Last year</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Filters</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Add filters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="asset-type">Asset Type</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Format</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Export format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Grouping</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Group by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No grouping</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="asset-type">Asset Type</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-6">
                <Button className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Custom Report
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
          <CardDescription>Automated reports sent via email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium">Weekly Asset Summary</div>
                  <div className="text-sm text-gray-600">Every Monday at 9:00 AM</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800">Active</Badge>
                <Button size="sm" variant="outline">Edit</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="font-medium">Monthly Security Audit</div>
                  <div className="text-sm text-gray-600">First Monday of each month</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800">Active</Badge>
                <Button size="sm" variant="outline">Edit</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="font-medium">Department Health Report</div>
                  <div className="text-sm text-gray-600">Bi-weekly on Fridays</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>
                <Button size="sm" variant="outline">Edit</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 