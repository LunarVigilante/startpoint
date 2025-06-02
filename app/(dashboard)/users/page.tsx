import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, AlertTriangle, CheckCircle, User, Mail, Building } from "lucide-react";

// Mock data for demonstration
const users = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@anlinwindows.com",
    employeeId: "EMP001",
    department: "Engineering",
    jobTitle: "Senior Software Engineer",
    manager: "Alice Johnson",
    status: "ACTIVE",
    startDate: "2023-01-15",
    assetsCount: 3,
    anomaliesCount: 1,
    lastReviewed: "2024-01-15",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@anlinwindows.com",
    employeeId: "EMP002",
    department: "Marketing",
    jobTitle: "Marketing Manager",
    manager: "Bob Wilson",
    status: "ACTIVE",
    startDate: "2022-08-20",
    assetsCount: 2,
    anomaliesCount: 2,
    lastReviewed: "2024-01-10",
  },
  {
    id: "3",
    name: "Mike Davis",
    email: "mike.davis@anlinwindows.com",
    employeeId: "EMP003",
    department: "Sales",
    jobTitle: "Sales Representative",
    manager: "Carol Brown",
    status: "ACTIVE",
    startDate: "2023-06-01",
    assetsCount: 4,
    anomaliesCount: 3,
    lastReviewed: "2023-12-20",
  },
  {
    id: "4",
    name: "Emma Wilson",
    email: "emma.wilson@anlinwindows.com",
    employeeId: "EMP004",
    department: "Engineering",
    jobTitle: "Frontend Developer",
    manager: "Alice Johnson",
    status: "ACTIVE",
    startDate: "2024-01-08",
    assetsCount: 2,
    anomaliesCount: 0,
    lastReviewed: "2024-01-08",
  },
  {
    id: "5",
    name: "Alex Chen",
    email: "alex.chen@anlinwindows.com",
    employeeId: "EMP005",
    department: "IT",
    jobTitle: "System Administrator",
    manager: "David Lee",
    status: "ACTIVE",
    startDate: "2023-03-15",
    assetsCount: 5,
    anomaliesCount: 0,
    lastReviewed: "2024-01-12",
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    case "INACTIVE":
      return <Badge className="bg-yellow-100 text-yellow-800">Inactive</Badge>;
    case "TERMINATED":
      return <Badge className="bg-red-100 text-red-800">Terminated</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getDepartmentColor(department: string) {
  const colors: Record<string, string> = {
    Engineering: "bg-blue-100 text-blue-800",
    Marketing: "bg-purple-100 text-purple-800",
    Sales: "bg-green-100 text-green-800",
    IT: "bg-orange-100 text-orange-800",
    HR: "bg-pink-100 text-pink-800",
    Finance: "bg-indigo-100 text-indigo-800",
  };
  
  return colors[department] || "bg-gray-100 text-gray-800";
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export default function UsersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage user profiles and access permissions</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter users by department, status, or search by name</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search users..." className="pl-10" />
            </div>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="it">IT</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Anomalies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="with-anomalies">With Anomalies</SelectItem>
                <SelectItem value="no-anomalies">No Anomalies</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>Complete list of all users and their access information</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assets</TableHead>
                <TableHead>Anomalies</TableHead>
                <TableHead>Last Reviewed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/avatars/${user.id}.png`} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{user.employeeId}</TableCell>
                  <TableCell>
                    <Badge className={getDepartmentColor(user.department)}>
                      {user.department}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.jobTitle}</TableCell>
                  <TableCell>{user.manager}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">{user.assetsCount}</span>
                      <span className="text-sm text-gray-500">assets</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.anomaliesCount > 0 ? (
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-red-600">{user.anomaliesCount}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">None</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{user.lastReviewed}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Department Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Engineering</span>
            </CardTitle>
            <CardDescription>24 users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Active Users</span>
                <span className="font-medium">22</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Assets</span>
                <span className="font-medium">67</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Anomalies</span>
                <span className="font-medium text-red-600">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Health Score</span>
                <Badge className="bg-green-100 text-green-800">95%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Marketing</span>
            </CardTitle>
            <CardDescription>12 users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Active Users</span>
                <span className="font-medium">11</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Assets</span>
                <span className="font-medium">28</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Anomalies</span>
                <span className="font-medium text-yellow-600">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Health Score</span>
                <Badge className="bg-yellow-100 text-yellow-800">78%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Sales</span>
            </CardTitle>
            <CardDescription>18 users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Active Users</span>
                <span className="font-medium">16</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Assets</span>
                <span className="font-medium">45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Anomalies</span>
                <span className="font-medium text-red-600">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Health Score</span>
                <Badge className="bg-red-100 text-red-800">65%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 