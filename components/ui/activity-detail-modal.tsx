'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  X, 
  Package, 
  User, 
  Calendar, 
  MapPin, 
  Building, 
  Monitor, 
  Smartphone,
  Settings,
  HardDrive,
  Mail,
  Phone
} from 'lucide-react'

interface ActivityDetailModalProps {
  activityId: string | null
  activityType: 'asset_update' | 'user_update'
  isOpen: boolean
  onClose: () => void
}

interface AssetDetail {
  id: string
  name: string
  assetTag: string
  type: string
  status: string
  location: string
  condition: string
  assignmentType: string
  manufacturer?: string
  model?: string
  serialNumber?: string
  cost?: number
  notes?: string
  user?: {
    name: string
    email: string
    department: string
  }
  createdAt: string
  updatedAt: string
}

interface UserDetail {
  id: string
  name: string
  email: string
  employeeId?: string
  department: string
  jobTitle?: string
  manager?: string
  status: string
  startDate?: string
  lastReviewed?: string
  site: {
    name: string
    code: string
  }
  recentAssets?: Array<{
    id: string
    name: string
    assetTag: string
    type: string
    status: string
  }>
}

export function ActivityDetailModal({ activityId, activityType, isOpen, onClose }: ActivityDetailModalProps) {
  const [data, setData] = useState<AssetDetail | UserDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && activityId) {
      fetchActivityDetails()
    }
  }, [isOpen, activityId, activityType])

  const fetchActivityDetails = async () => {
    try {
      setLoading(true)
      setError('')
      
      const endpoint = activityType === 'asset_update' 
        ? `/api/assets/${activityId}` 
        : `/api/users/${activityId}/details`
      
      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error('Failed to fetch details')
      }
      const result = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'ASSIGNED':
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'INACTIVE':
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'TERMINATED':
      case 'RETIRED':
      case 'LOST':
      case 'STOLEN':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'laptop':
      case 'desktop':
        return Monitor
      case 'phone':
      case 'tablet':
        return Smartphone
      default:
        return Package
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            {activityType === 'asset_update' ? (
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            ) : (
              <User className="h-6 w-6 text-green-600 dark:text-green-400" />
            )}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {activityType === 'asset_update' ? 'Asset Details' : 'User Details'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Recent activity information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {data && !loading && (
            <div className="space-y-6">
              {activityType === 'asset_update' && (
                <AssetDetailsView asset={data as AssetDetail} getStatusColor={getStatusColor} getTypeIcon={getTypeIcon} />
              )}
              
              {activityType === 'user_update' && (
                <UserDetailsView user={data as UserDetail} getStatusColor={getStatusColor} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AssetDetailsView({ 
  asset, 
  getStatusColor, 
  getTypeIcon 
}: { 
  asset: AssetDetail
  getStatusColor: (status: string) => string
  getTypeIcon: (type: string) => any
}) {
  const Icon = getTypeIcon(asset.type)
  
  return (
    <>
      {/* Asset Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{asset.name}</h4>
            <p className="text-gray-600 dark:text-gray-400">{asset.assetTag}</p>
            <Badge className={getStatusColor(asset.status)}>
              {asset.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Asset Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-700 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="text-sm font-medium dark:text-white">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                <p className="font-medium dark:text-white">{asset.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                <p className="font-medium dark:text-white">{asset.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Condition</p>
                <p className="font-medium dark:text-white">{asset.condition}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-700 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="text-sm font-medium dark:text-white">Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {asset.user ? (
              <>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Assigned To</p>
                    <p className="font-medium dark:text-white">{asset.user.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium dark:text-white">{asset.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                    <p className="font-medium dark:text-white">{asset.user.department}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Not assigned to any user</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timestamps */}
      <Card className="dark:bg-gray-700 dark:border-gray-600">
        <CardHeader>
          <CardTitle className="text-sm font-medium dark:text-white">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
              <p className="font-medium dark:text-white">{new Date(asset.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
              <p className="font-medium dark:text-white">{new Date(asset.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function UserDetailsView({ 
  user, 
  getStatusColor 
}: { 
  user: UserDetail
  getStatusColor: (status: string) => string
}) {
  return (
    <>
      {/* User Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
            <User className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{user.name}</h4>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            <Badge className={getStatusColor(user.status)}>
              {user.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* User Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-700 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="text-sm font-medium dark:text-white">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.employeeId && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Employee ID</p>
                  <p className="font-medium dark:text-white">{user.employeeId}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                <p className="font-medium dark:text-white">{user.department}</p>
              </div>
            </div>
            {user.jobTitle && (
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Job Title</p>
                  <p className="font-medium dark:text-white">{user.jobTitle}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-700 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="text-sm font-medium dark:text-white">Work Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Site</p>
                <p className="font-medium dark:text-white">{user.site.name} ({user.site.code})</p>
              </div>
            </div>
            {user.manager && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manager</p>
                  <p className="font-medium dark:text-white">{user.manager}</p>
                </div>
              </div>
            )}
            {user.startDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Start Date</p>
                  <p className="font-medium dark:text-white">{new Date(user.startDate).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Assets */}
      {user.recentAssets && user.recentAssets.length > 0 && (
        <Card className="dark:bg-gray-700 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="text-sm font-medium dark:text-white">Recent Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user.recentAssets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-600 rounded">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium dark:text-white">{asset.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{asset.assetTag}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(asset.status)}>
                    {asset.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
} 