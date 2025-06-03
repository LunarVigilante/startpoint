'use client'

import { useState, useEffect } from 'react'
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
  Plus,
  Edit,
  Save,
  X,
} from "lucide-react";

type Department = {
  department: string;
  siteId: string;
  userCount: number;
  activeUsers: number;
  totalAssets: number;
  totalTasks: number;
  todoTasks: number;
  anomalies: number;
  healthScore: number;
  lastReviewed: string | null;
  standardAssets: any[];
  requiredGroups: any[];
  requiredLists: any[];
  commonLicenses: any[];
};

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
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingBaseline, setEditingBaseline] = useState<Department | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/departments')
      if (!response.ok) throw new Error('Failed to fetch departments')
      const data = await response.json()
      setDepartments(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBaseline = async (dept: Department) => {
    try {
      setSaving(true)
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: dept.department,
          siteId: dept.siteId,
          standardAssets: dept.standardAssets,
          requiredGroups: dept.requiredGroups,
          requiredLists: dept.requiredLists,
          commonLicenses: dept.commonLicenses,
        }),
      })
      
      if (!response.ok) throw new Error('Failed to save baseline')
      
      setEditingBaseline(null)
      fetchDepartments() // Refresh data
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const calculateOverallStats = () => {
    if (departments.length === 0) return { avgHealth: 0, totalUsers: 0, totalAssets: 0, totalAnomalies: 0 }
    
    const avgHealth = Math.round(departments.reduce((sum, dept) => sum + dept.healthScore, 0) / departments.length)
    const totalUsers = departments.reduce((sum, dept) => sum + dept.userCount, 0)
    const totalAssets = departments.reduce((sum, dept) => sum + dept.totalAssets, 0)
    const totalAnomalies = departments.reduce((sum, dept) => sum + dept.anomalies, 0)
    
    return { avgHealth, totalUsers, totalAssets, totalAnomalies }
  }

  const stats = calculateOverallStats()

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Departments</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={fetchDepartments}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

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
          <Button onClick={fetchDepartments}>
            <Settings className="h-4 w-4 mr-2" />
            Refresh Data
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
            <div className="text-2xl font-bold">{stats.avgHealth}%</div>
            <p className="text-xs text-muted-foreground">
              Across {departments.length} departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              Managed assets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Anomalies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnomalies}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {departments.map((dept) => (
          <Card key={`${dept.department}-${dept.siteId}`} className={`${getHealthScoreBg(dept.healthScore)} border-2`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>{dept.department}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl font-bold ${getHealthScoreColor(dept.healthScore)}`}>
                    {dept.healthScore}%
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingBaseline(dept)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {dept.userCount} users • {dept.totalAssets} assets • {dept.anomalies} anomalies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>User Activity</span>
                    <span>{dept.userCount > 0 ? Math.round((dept.activeUsers / dept.userCount) * 100) : 0}%</span>
                  </div>
                  <Progress 
                    value={dept.userCount > 0 ? (dept.activeUsers / dept.userCount) * 100 : 0} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Task Completion</span>
                    <span>{dept.totalTasks > 0 ? Math.round(((dept.totalTasks - dept.todoTasks) / dept.totalTasks) * 100) : 0}%</span>
                  </div>
                  <Progress 
                    value={dept.totalTasks > 0 ? ((dept.totalTasks - dept.todoTasks) / dept.totalTasks) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">{dept.userCount}</div>
                  <div className="text-xs text-gray-600">Users</div>
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

              {/* Baseline Info */}
              {dept.standardAssets && dept.standardAssets.length > 0 && (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Standard Assets:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dept.standardAssets.slice(0, 3).map((asset: any, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {typeof asset === 'string' ? asset : asset.name}
                        </Badge>
                      ))}
                      {dept.standardAssets.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{dept.standardAssets.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setEditingBaseline(dept)}
                >
                  Manage Baseline
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Baseline Editor Modal */}
      {editingBaseline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Manage Baseline: {editingBaseline.department}
              </h3>
              <button
                onClick={() => setEditingBaseline(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standard Assets (comma-separated)
                </label>
                <textarea
                  value={editingBaseline.standardAssets?.join(', ') || ''}
                  onChange={(e) => setEditingBaseline({
                    ...editingBaseline,
                    standardAssets: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Laptop, Monitor, Keyboard, Mouse"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Groups (comma-separated)
                </label>
                <textarea
                  value={editingBaseline.requiredGroups?.join(', ') || ''}
                  onChange={(e) => setEditingBaseline({
                    ...editingBaseline,
                    requiredGroups: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Department-All, VPN-Access, System-Access"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Common Licenses (comma-separated)
                </label>
                <textarea
                  value={editingBaseline.commonLicenses?.join(', ') || ''}
                  onChange={(e) => setEditingBaseline({
                    ...editingBaseline,
                    commonLicenses: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Microsoft Office, Adobe Reader, Chrome"
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-6">
              <button
                onClick={() => setEditingBaseline(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveBaseline(editingBaseline)}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Baseline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 