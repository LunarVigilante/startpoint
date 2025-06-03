'use client'

import { useState, useEffect } from 'react'
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
  X,
} from "lucide-react";

type OffboardingCase = {
  id: string
  taskNumber: string
  title: string
  description: string
  status: string
  progress: number
  createdAt: string
  dueDate?: string | null
  user?: {
    id: string
    name: string
    email: string
    employeeId: string | null
    department: string
    manager: string | null
  } | null
  creator: {
    name: string
    email: string
  }
  assignee?: {
    name: string
    email: string
  } | null
  assets: any[]
  accessItems: any[]
  completedTasks: number
  totalTasks: number
}

function getStatusBadge(status: string) {
  switch (status) {
    case "TODO":
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
  const [offboardingCases, setOffboardingCases] = useState<OffboardingCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showNewOffboarding, setShowNewOffboarding] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [newOffboarding, setNewOffboarding] = useState({
    userId: '',
    lastWorkingDay: '',
    notes: '',
    priority: 'MEDIUM'
  })

  useEffect(() => {
    fetchOffboardingCases()
    fetchUsers()
  }, [])

  const fetchOffboardingCases = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/offboarding')
      if (!response.ok) throw new Error('Failed to fetch offboarding cases')
      const data = await response.json()
      setOffboardingCases(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.filter((user: any) => user.status === 'ACTIVE'))
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  const handleCreateOffboarding = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const response = await fetch('/api/offboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newOffboarding,
          createdBy: 'current-user-id', // In real app, get from auth context
          siteId: 'default-site-id', // In real app, get from user's site
        }),
      })
      
      if (!response.ok) throw new Error('Failed to create offboarding case')
      
      setNewOffboarding({ userId: '', lastWorkingDay: '', notes: '', priority: 'MEDIUM' })
      setShowNewOffboarding(false)
      fetchOffboardingCases() // Refresh data
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateCase = async (caseId: string, updates: any) => {
    try {
      const response = await fetch('/api/offboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: caseId, ...updates }),
      })
      
      if (!response.ok) throw new Error('Failed to update case')
      
      fetchOffboardingCases() // Refresh data
    } catch (err: any) {
      setError(err.message)
    }
  }

  const calculateStats = () => {
    const activeCases = offboardingCases.filter(c => c.status !== 'COMPLETED').length
    const assetsToRecover = offboardingCases.reduce((sum, c) => sum + c.assets.filter(a => a.status === 'PENDING').length, 0)
    const accessToRemove = offboardingCases.reduce((sum, c) => sum + c.accessItems.filter(a => a.status === 'PENDING').length, 0)
    const avgCompletion = offboardingCases.length > 0 
      ? Math.round(offboardingCases.reduce((sum, c) => sum + c.progress, 0) / offboardingCases.length)
      : 0

    return { activeCases, assetsToRecover, accessToRemove, avgCompletion }
  }

  const stats = calculateStats()

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
          <h3 className="text-red-800 font-medium">Error Loading Offboarding Cases</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={fetchOffboardingCases}
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
          <h1 className="text-3xl font-bold text-gray-900">Offboarding</h1>
          <p className="text-gray-600">Manage employee departures and asset recovery</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Checklist
          </Button>
          <Button onClick={() => setShowNewOffboarding(true)}>
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
            <div className="text-2xl font-bold">{stats.activeCases}</div>
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
            <div className="text-2xl font-bold">{stats.assetsToRecover}</div>
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
            <div className="text-2xl font-bold">{stats.accessToRemove}</div>
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
            <div className="text-2xl font-bold">{stats.avgCompletion}%</div>
            <p className="text-xs text-muted-foreground">
              Progress across cases
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Offboarding Cases */}
      <div className="space-y-6">
        {offboardingCases.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <UserMinus className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No offboarding cases</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new offboarding case.
              </p>
              <div className="mt-6">
                <Button onClick={() => setShowNewOffboarding(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Offboarding
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          offboardingCases.map((case_) => (
            <Card key={case_.id} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`/avatars/${case_.user?.employeeId}.png`} alt={case_.user?.name} />
                      <AvatarFallback>{case_.user ? getInitials(case_.user.name) : 'UN'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{case_.user?.name || 'Unknown User'}</CardTitle>
                      <CardDescription>
                        {case_.user?.department} • {case_.user?.employeeId} • {case_.taskNumber}
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
                {case_.assets.length > 0 && (
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
                              checked={asset.status === "AVAILABLE"} 
                              disabled={asset.status === "AVAILABLE"}
                            />
                            <div>
                              <div className="font-medium text-sm">{asset.name}</div>
                              <div className="text-xs text-gray-500">{asset.assetTag}</div>
                            </div>
                          </div>
                          {getStatusBadge(asset.status)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Access Section */}
                {case_.accessItems.length > 0 && (
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
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t">
                  <Button 
                    className="flex-1"
                    onClick={() => handleUpdateCase(case_.id, { status: 'IN_PROGRESS' })}
                    disabled={case_.status === 'COMPLETED'}
                  >
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
          ))
        )}
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

      {/* New Offboarding Modal */}
      {showNewOffboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create Offboarding Case</h3>
              <button
                onClick={() => setShowNewOffboarding(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateOffboarding} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee
                </label>
                <select
                  required
                  value={newOffboarding.userId}
                  onChange={(e) => setNewOffboarding({ ...newOffboarding, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select employee</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.employeeId}) - {user.department}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Working Day
                </label>
                <input
                  type="date"
                  value={newOffboarding.lastWorkingDay}
                  onChange={(e) => setNewOffboarding({ ...newOffboarding, lastWorkingDay: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={newOffboarding.priority}
                  onChange={(e) => setNewOffboarding({ ...newOffboarding, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={newOffboarding.notes}
                  onChange={(e) => setNewOffboarding({ ...newOffboarding, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes or special instructions..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewOffboarding(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 