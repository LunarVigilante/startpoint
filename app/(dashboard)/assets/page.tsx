import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Filter, Download, Search } from "lucide-react";

// Mock data for demonstration
const assets = [
  {
    id: "1",
    assetTag: "LP-2024-001",
    name: "Dell Latitude 5520",
    type: "LAPTOP",
    status: "ASSIGNED",
    assignedTo: "John Smith",
    department: "Engineering",
    location: "Clovis Office",
    serialNumber: "DL5520001",
    warrantyExpiry: "2025-12-31",
  },
  {
    id: "2",
    assetTag: "MN-2024-015",
    name: "Dell UltraSharp 27\"",
    type: "MONITOR",
    status: "AVAILABLE",
    assignedTo: null,
    department: null,
    location: "IT Storage",
    serialNumber: "DU27015",
    warrantyExpiry: "2026-06-15",
  },
  {
    id: "3",
    assetTag: "PH-2024-032",
    name: "iPhone 15 Pro",
    type: "PHONE",
    status: "ASSIGNED",
    assignedTo: "Sarah Johnson",
    department: "Marketing",
    location: "Clovis Office",
    serialNumber: "IP15032",
    warrantyExpiry: "2025-09-20",
  },
  {
    id: "4",
    assetTag: "DT-2023-089",
    name: "HP EliteDesk 800",
    type: "DESKTOP",
    status: "MAINTENANCE",
    assignedTo: "Mike Davis",
    department: "Sales",
    location: "IT Repair",
    serialNumber: "HP800089",
    warrantyExpiry: "2024-03-15",
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "ASSIGNED":
      return <Badge className="bg-green-100 text-green-800">Assigned</Badge>;
    case "AVAILABLE":
      return <Badge className="bg-blue-100 text-blue-800">Available</Badge>;
    case "MAINTENANCE":
      return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
    case "RETIRED":
      return <Badge className="bg-gray-100 text-gray-800">Retired</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getTypeBadge(type: string) {
  const typeColors: Record<string, string> = {
    LAPTOP: "bg-purple-100 text-purple-800",
    DESKTOP: "bg-indigo-100 text-indigo-800",
    MONITOR: "bg-cyan-100 text-cyan-800",
    PHONE: "bg-pink-100 text-pink-800",
    TABLET: "bg-orange-100 text-orange-800",
    PRINTER: "bg-teal-100 text-teal-800",
  };
  
  return (
    <Badge className={typeColors[type] || "bg-gray-100 text-gray-800"}>
      {type.toLowerCase().replace('_', ' ')}
    </Badge>
  );
}

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
          <p className="text-gray-600">Manage and track all company assets</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter assets by type, status, or location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search assets..." className="pl-10" />
            </div>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Asset Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="laptop">Laptop</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="monitor">Monitor</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
                <SelectItem value="printer">Printer</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="clovis">Clovis Office</SelectItem>
                <SelectItem value="storage">IT Storage</SelectItem>
                <SelectItem value="repair">IT Repair</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Inventory</CardTitle>
          <CardDescription>Complete list of all company assets</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset Tag</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Warranty</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.assetTag}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>{getTypeBadge(asset.type)}</TableCell>
                  <TableCell>{getStatusBadge(asset.status)}</TableCell>
                  <TableCell>{asset.assignedTo || "-"}</TableCell>
                  <TableCell>{asset.department || "-"}</TableCell>
                  <TableCell>{asset.location}</TableCell>
                  <TableCell className="font-mono text-sm">{asset.serialNumber}</TableCell>
                  <TableCell>
                    {new Date(asset.warrantyExpiry) < new Date() ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : (
                      <span className="text-sm">{asset.warrantyExpiry}</span>
                    )}
                  </TableCell>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">156</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assigned Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">1,091</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">12</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Warranty Expiring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">8</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 