'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  CheckCircle, 
  ShieldAlert, 
  UserX, 
  Clock,
  User,
  Building,
  RefreshCcw
} from 'lucide-react'

type Anomaly = {
  id: string
  type: string
  category: string
  description: string
  suggestion: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    department: string
  }
}

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('createdAt')

  useEffect(() => {
    fetchAnomalies()
  }, [])

  const fetchAnomalies = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/anomalies')
      if (!response.ok) {
        throw new Error('Failed to fetch anomalies')
      }
      const data = await response.json()
      setAnomalies(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResolveAnomaly = async (anomalyId: string) => {
    try {
      const response = await fetch(`/api/anomalies/${anomalyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED' }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to resolve anomaly')
      }
      
      fetchAnomalies() // Refresh the data
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getAnomalyRemedySuggestion = (anomaly: Anomaly) => {
    const suggestions: Record<string, string> = {
      'EXCESSIVE_PERMISSIONS': 'Review and remove unnecessary group memberships. Consider principle of least privilege.',
      'UNUSED_ACCOUNT': 'Disable account if inactive for over 90 days. Initiate offboarding if employee has left.',
      'MISSING_MFA': 'Enable multi-factor authentication immediately. Schedule security awareness training.',
      'SHARED_ACCOUNT': 'Create individual accounts for each user. Disable shared account access.',
      'OUTDATED_ACCESS': 'Review and update access permissions based on current role. Remove obsolete permissions.',
      'POLICY_VIOLATION': 'Ensure compliance with company policy. Document exception if legitimate business need.',
      'SUSPICIOUS_LOGIN': 'Investigate login patterns. Reset password and enable additional security measures.',
      'EQUIPMENT_MISMATCH': 'Verify asset assignment accuracy. Update records or redistribute equipment as needed.',
      'UNAUTHORIZED_ACCESS': 'Immediately revoke access and investigate. Update security policies if needed.',
      'DORMANT_PERMISSIONS': 'Remove unused permissions. Conduct regular access reviews.',
      'PRIVILEGE_ESCALATION': 'Investigate elevated permissions. Ensure proper approval workflow.',
      'CROSS_DEPARTMENT_ACCESS': 'Verify business justification. Remove if no longer needed.'
    }
    
    return anomaly.suggestion || suggestions[anomaly.type] || 'Review this anomaly and take appropriate action based on company security policies.'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'URGENT': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'LOW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'RESOLVED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'DISMISSED': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const filteredAnomalies = anomalies.filter(anomaly => {
    const matchesSearch = 
      anomaly.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anomaly.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anomaly.user.department.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSeverity = severityFilter === 'ALL' || anomaly.severity === severityFilter
    const matchesStatus = statusFilter === 'ALL' || anomaly.status === statusFilter
    
    return matchesSearch && matchesSeverity && matchesStatus
  }).sort((a, b) => {
    if (sortBy === 'severity') {
      const severityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
      return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
             (severityOrder[a.severity as keyof typeof severityOrder] || 0)
    }
    if (sortBy === 'createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    return 0
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-300 font-medium">Error Loading Anomalies</h3>
          <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
          <button
            onClick={fetchAnomalies}
            className="mt-3 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded hover:bg-red-700 dark:hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Access Anomalies</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and resolve security and access issues
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchAnomalies} className="dark:border-gray-600 dark:hover:bg-gray-700">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Total Anomalies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{anomalies.length}</div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Open</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {anomalies.filter(a => a.status === 'OPEN').length}
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">High Priority</CardTitle>
            <ShieldAlert className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {anomalies.filter(a => a.severity === 'HIGH' || a.severity === 'URGENT').length}
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {anomalies.filter(a => a.status === 'RESOLVED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search anomalies, users, or departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem value="ALL">All Severity</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="DISMISSED">Dismissed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem value="createdAt">Recent</SelectItem>
                  <SelectItem value="severity">Severity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anomalies List */}
      <div className="space-y-4">
        {filteredAnomalies.length === 0 ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No anomalies found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || severityFilter !== 'ALL' || statusFilter !== 'ALL'
                    ? 'Try adjusting your search or filters'
                    : 'All access anomalies have been resolved'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAnomalies.map((anomaly) => (
            <Card key={anomaly.id} className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(anomaly.status)}>
                          {anomaly.status}
                        </Badge>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(anomaly.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium dark:text-white">{anomaly.user.name}</span>
                        <span className="text-gray-500 dark:text-gray-400">({anomaly.user.email})</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Building className="h-4 w-4" />
                        <span>{anomaly.user.department}</span>
                      </div>
                    </div>
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">Issue Description</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{anomaly.description}</p>
                  </div>

                  {/* Remedy Suggestion */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start space-x-3">
                      <ShieldAlert className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <h4 className="font-medium text-blue-900 dark:text-blue-300">Recommended Action</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-400">
                          {getAnomalyRemedySuggestion(anomaly)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {anomaly.status === 'OPEN' && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleResolveAnomaly(anomaly.id)}
                        className="dark:bg-green-600 dark:hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Resolved
                      </Button>
                      <Button size="sm" variant="outline" className="dark:border-gray-600 dark:hover:bg-gray-700">
                        <UserX className="h-4 w-4 mr-2" />
                        Take Action
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Clock className="h-4 w-4 mr-2" />
                        Mark In Progress
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 