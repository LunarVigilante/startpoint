import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserMinus,
  Package,
  Key,
  Mail,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Plus,
} from "lucide-react";

// Mock data for demonstration
const offboardingCases = [
  {
    id: "1",
    user: {
      name: "Robert Johnson",
      email: "robert.johnson@anlinwindows.com",
      employeeId: "EMP123",
      department: "Sales",
      manager: "Carol Brown",
      lastWorkingDay: "2024-01-25",
    },
    status: "IN_PROGRESS",
    progress: 65,
    createdAt: "2024-01-15",
    assignedTo: "IT Support",
    assets: [
      { id: "1", name: "Dell Latitude 5520", tag: "LP-2024-001", status: "PENDING" },
      { id: "2", name: "iPhone 15 Pro", tag: "PH-2024-032", status: "RETURNED" },
      { id: "3", name: "Monitor 27\"", tag: "MN-2024-015", status: "PENDING" },
    ],
    accessItems: [
      { id: "1", system: "Active Directory", access: "Sales-All", status: "PENDING" },
      { id: "2", system: "Salesforce", access: "Sales Rep", status: "REMOVED" },
      { id: "3", system: "VPN", access: "Remote Access", status: "REMOVED" },
      { id: "4", system: "Email", access: "Exchange", status: "PENDING" },
    ],
    completedTasks: 13,
    totalTasks: 20,
  },
  {
    id: "2",
    user: {
      name: "Lisa Chen",
      email: "lisa.chen@anlinwindows.com",
      employeeId: "EMP456",
      department: "Marketing",
      manager: "Bob Wilson",
      lastWorkingDay: "2024-01-30",
    },
    status: "PENDING",
    progress: 25,
    createdAt: "2024-01-18",
    assignedTo: "HR Team",
    assets: [
      { id: "1", name: "MacBook Pro", tag: "LP-2024-089", status: "PENDING" },
      { id: "2", name: "iPad Pro", tag: "TB-2024-012", status: "PENDING" },
    ],
    accessItems: [
      { id: "1", system: "Active Directory", access: "Marketing-All", status: "PENDING" },
      { id: "2", system: "Adobe Creative", access: "Full License", status: "PENDING" },
      { id: "3", system: "Social Media", access: "Admin", status: "PENDING" },
    ],
    completedTasks: 5,
    totalTasks: 18,
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case "IN_PROGRESS":
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
    case "COMPLETED":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    case "RETURNED":
      return <Badge className="bg-green-100 text-green-800">Returned</Badge>;
    case "REMOVED":
      return <Badge className="bg-green-100 text-green-800">Removed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export default function OffboardingPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Offboarding</h1>
          <p className="text-gray-600">Manage employee departures and asset recovery</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Checklist
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Offboarding
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <UserMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Currently processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assets to Recover</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Pending return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Access to Remove</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Pending removal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2</div>
            <p className="text-xs text-muted-foreground">
              Days to complete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Offboarding Cases */}
      <div className="space-y-6">
        {offboardingCases.map((case_) => (
          <Card key={case_.id} className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`/avatars/${case_.user.employeeId}.png`} alt={case_.user.name} />
                    <AvatarFallback>{getInitials(case_.user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{case_.user.name}</CardTitle>
                    <CardDescription>
                      {case_.user.department} • {case_.user.employeeId} • Last day: {case_.user.lastWorkingDay}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(case_.status)}
                  <div className="text-right">
                    <div className="text-sm font-medium">{case_.progress}% Complete</div>
                    <div className="text-xs text-gray-500">
                      {case_.completedTasks}/{case_.totalTasks} tasks
                    </div>
                  </div>
                </div>
              </div>
              <Progress value={case_.progress} className="mt-2" />
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Assets Section */}
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Assets to Recover ({case_.assets.length})
                </h4>
                <div className="space-y-2">
                  {case_.assets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          checked={asset.status === "RETURNED"} 
                          disabled={asset.status === "RETURNED"}
                        />
                        <div>
                          <div className="font-medium text-sm">{asset.name}</div>
                          <div className="text-xs text-gray-500">{asset.tag}</div>
                        </div>
                      </div>
                      {getStatusBadge(asset.status)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Access Section */}
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <Key className="h-4 w-4 mr-2" />
                  Access to Remove ({case_.accessItems.length})
                </h4>
                <div className="space-y-2">
                  {case_.accessItems.map((access) => (
                    <div key={access.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          checked={access.status === "REMOVED"} 
                          disabled={access.status === "REMOVED"}
                        />
                        <div>
                          <div className="font-medium text-sm">{access.system}</div>
                          <div className="text-xs text-gray-500">{access.access}</div>
                        </div>
                      </div>
                      {getStatusBadge(access.status)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Tasks */}
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Additional Tasks
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox checked />
                      <div>
                        <div className="font-medium text-sm">Forward email to manager</div>
                        <div className="text-xs text-gray-500">Set up email forwarding</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox />
                      <div>
                        <div className="font-medium text-sm">Collect building access card</div>
                        <div className="text-xs text-gray-500">Physical security access</div>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox />
                      <div>
                        <div className="font-medium text-sm">Knowledge transfer session</div>
                        <div className="text-xs text-gray-500">Document handover</div>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                <Button className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Update Progress
                </Button>
                <Button variant="outline" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  View Full Checklist
                </Button>
                <Button variant="outline" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Reminder
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common offboarding tasks and templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              <span>Generate Checklist</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Mail className="h-6 w-6 mb-2" />
              <span>Email Template</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Package className="h-6 w-6 mb-2" />
              <span>Asset Recovery</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 