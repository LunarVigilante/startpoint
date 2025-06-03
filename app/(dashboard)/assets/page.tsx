'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, Package, Monitor, Laptop, Printer } from 'lucide-react'

type Asset = {
  id: string
  assetTag: string
  name: string
  type: 'LAPTOP' | 'DESKTOP' | 'MONITOR' | 'PHONE' | 'TABLET' | 'PRINTER' | 'NETWORK_EQUIPMENT' | 'OTHER_HARDWARE'
  category?: string | null
  manufacturer?: string | null
  model?: string | null
  serialNumber?: string | null
  siteId: string
  userId?: string | null
  assignmentType: 'UNASSIGNED' | 'USER' | 'DEPARTMENT' | 'EQUIPMENT'
  assignedToDepartment?: string | null
  assignedToEquipment?: string | null
  assignedDate?: Date | null
  status: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'RETIRED' | 'LOST' | 'STOLEN'
  condition?: string | null
  location?: string | null
  purchaseDate?: Date | null
  purchasePrice?: number | null
  vendor?: string | null
  invoiceNumber?: string | null
  warrantyExpiry?: Date | null
  history?: any
  maintenanceLog?: any
  createdAt: Date
  updatedAt: Date
}

type AssetWithUser = Asset & {
  user?: {
    name: string
    email: string
    department: string
  }
  site: {
    name: string
    code: string
  }
}

type NewAsset = {
  assetTag: string
  name: string
  type: AssetType
  siteCode: string
  manufacturer: string
  model: string
  serialNumber: string
  location: string
  purchasePrice: string
  vendor: string
  warrantyExpiry: string
  assignmentType: 'UNASSIGNED' | 'USER' | 'DEPARTMENT' | 'EQUIPMENT'
  assignedToDepartment: string
  assignedToEquipment: string
}

type AssetStatus = Asset['status']
type AssetType = Asset['type']
type AssignmentType = Asset['assignmentType']

const AssetTypeIcons = {
  LAPTOP: Laptop,
  DESKTOP: Monitor,
  MONITOR: Monitor,
  PRINTER: Printer,
  PHONE: Package,
  TABLET: Package,
  NETWORK_EQUIPMENT: Package,
  OTHER_HARDWARE: Package,
}

const StatusColors = {
  AVAILABLE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  ASSIGNED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  RETIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  LOST: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  STOLEN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<AssetWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<AssetStatus | 'ALL'>('ALL')
  const [filterType, setFilterType] = useState<AssetType | 'ALL'>('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAsset, setEditingAsset] = useState<AssetWithUser | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Form state for new asset
  const [newAsset, setNewAsset] = useState<NewAsset>({
    assetTag: '',
    name: '',
    type: 'LAPTOP',
    siteCode: 'HQ001',
    manufacturer: '',
    model: '',
    serialNumber: '',
    location: '',
    purchasePrice: '',
    vendor: '',
    warrantyExpiry: '',
    assignmentType: 'UNASSIGNED',
    assignedToDepartment: '',
    assignedToEquipment: '',
  })

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/assets')
      if (!response.ok) throw new Error('Failed to fetch assets')
      const data = await response.json()
      setAssets(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'ALL' || asset.status === filterStatus
    const matchesType = filterType === 'ALL' || asset.type === filterType
    
    return matchesSearch && matchesStatus && matchesType
  })

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAsset),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create asset')
      }
      
      setNewAsset({
        assetTag: '',
        name: '',
        type: 'LAPTOP',
        siteCode: 'HQ001',
        manufacturer: '',
        model: '',
        serialNumber: '',
        location: '',
        purchasePrice: '',
        vendor: '',
        warrantyExpiry: '',
        assignmentType: 'UNASSIGNED',
        assignedToDepartment: '',
        assignedToEquipment: '',
      })
      setShowCreateModal(false)
      fetchAssets() // Refresh the data
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEditAsset = (asset: AssetWithUser) => {
    setEditingAsset(asset)
    setShowEditModal(true)
  }

  const handleUpdateAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAsset) return
    
    try {
      setSaving(true)
      const response = await fetch('/api/assets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAsset.id,
          status: editingAsset.status,
          location: editingAsset.location,
          condition: editingAsset.condition,
          assignmentType: editingAsset.assignmentType,
          assignedToDepartment: editingAsset.assignedToDepartment,
          assignedToEquipment: editingAsset.assignedToEquipment,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update asset')
      }
      
      setShowEditModal(false)
      setEditingAsset(null)
      fetchAssets() // Refresh the data
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) {
      return
    }
    
    try {
      setSaving(true)
      const response = await fetch(`/api/assets?id=${assetId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete asset')
      }
      
      fetchAssets() // Refresh the data
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

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
          <h3 className="text-red-800 font-medium">Error Loading Assets</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={fetchAssets}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assets Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage hardware assets and assignments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          Add Asset
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/25">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{assets.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/25">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-green-600 dark:bg-green-400 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {assets.filter(a => a.status === 'AVAILABLE').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/25">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {assets.filter(a => a.status === 'ASSIGNED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/25">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-yellow-600 dark:bg-yellow-400 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {assets.filter(a => a.status === 'MAINTENANCE').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/25">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Assets
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, tag, serial, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as AssetStatus | 'ALL')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="RETIRED">Retired</option>
              <option value="LOST">Lost</option>
              <option value="STOLEN">Stolen</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as AssetType | 'ALL')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Types</option>
              <option value="LAPTOP">Laptop</option>
              <option value="DESKTOP">Desktop</option>
              <option value="MONITOR">Monitor</option>
              <option value="PHONE">Phone</option>
              <option value="TABLET">Tablet</option>
              <option value="PRINTER">Printer</option>
              <option value="NETWORK_EQUIPMENT">Network Equipment</option>
              <option value="OTHER_HARDWARE">Other Hardware</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/25 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                             {filteredAssets.map((asset) => {
                 const IconComponent = AssetTypeIcons[asset.type as keyof typeof AssetTypeIcons] || Package
                 return (
                   <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center">
                         <IconComponent className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                         <div>
                           <div className="text-sm font-medium text-gray-900 dark:text-white">
                             {asset.name}
                           </div>
                           <div className="text-sm text-gray-500 dark:text-gray-400">
                             {asset.assetTag} • {asset.serialNumber}
                           </div>
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className="text-sm text-gray-900 dark:text-white">
                         {asset.type.replace('_', ' ')}
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${StatusColors[asset.status as keyof typeof StatusColors]}`}>
                         {asset.status}
                       </span>
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {asset.assignmentType === 'USER' && asset.user ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {asset.user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {asset.user.department}
                          </div>
                        </div>
                      ) : asset.assignmentType === 'DEPARTMENT' && asset.assignedToDepartment ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {asset.assignedToDepartment} Department
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Department Asset
                          </div>
                        </div>
                      ) : asset.assignmentType === 'EQUIPMENT' && asset.assignedToEquipment ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {asset.assignedToEquipment}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Equipment/Location
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {asset.location || asset.site.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEditAsset(asset)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          disabled={saving}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          disabled={saving}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No assets found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'ALL' || filterType !== 'ALL'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first asset'}
            </p>
          </div>
        )}
      </div>

      {/* Create Asset Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Asset</h3>
            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Tag *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAsset.assetTag}
                    onChange={(e) => setNewAsset({ ...newAsset, assetTag: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter asset tag"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter asset name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Type *
                  </label>
                  <select
                    value={newAsset.type}
                    onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value as AssetType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="LAPTOP">Laptop</option>
                    <option value="DESKTOP">Desktop</option>
                    <option value="MONITOR">Monitor</option>
                    <option value="PHONE">Phone</option>
                    <option value="TABLET">Tablet</option>
                    <option value="PRINTER">Printer</option>
                    <option value="NETWORK_EQUIPMENT">Network Equipment</option>
                    <option value="OTHER_HARDWARE">Other Hardware</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site
                  </label>
                  <select
                    value={newAsset.siteCode}
                    onChange={(e) => setNewAsset({ ...newAsset, siteCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="HQ001">Corporate Headquarters</option>
                    <option value="BR001">Branch Office</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={newAsset.manufacturer}
                    onChange={(e) => setNewAsset({ ...newAsset, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter manufacturer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={newAsset.model}
                    onChange={(e) => setNewAsset({ ...newAsset, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter model"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={newAsset.serialNumber}
                    onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter serial number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newAsset.location}
                    onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAsset.purchasePrice}
                    onChange={(e) => setNewAsset({ ...newAsset, purchasePrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter purchase price"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor
                  </label>
                  <input
                    type="text"
                    value={newAsset.vendor}
                    onChange={(e) => setNewAsset({ ...newAsset, vendor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter vendor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warranty Expiry
                  </label>
                  <input
                    type="date"
                    value={newAsset.warrantyExpiry}
                    onChange={(e) => setNewAsset({ ...newAsset, warrantyExpiry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Assignment Section */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Asset Assignment</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assignment Type
                    </label>
                    <select
                      value={newAsset.assignmentType}
                      onChange={(e) => setNewAsset({ 
                        ...newAsset, 
                        assignmentType: e.target.value as AssignmentType,
                        assignedToDepartment: '',
                        assignedToEquipment: ''
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="UNASSIGNED">Unassigned (Available)</option>
                      <option value="DEPARTMENT">Assign to Department</option>
                      <option value="EQUIPMENT">Assign to Equipment/Location</option>
                    </select>
                  </div>

                  {newAsset.assignmentType === 'DEPARTMENT' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department *
                      </label>
                      <select
                        required
                        value={newAsset.assignedToDepartment}
                        onChange={(e) => setNewAsset({ ...newAsset, assignedToDepartment: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Department</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="HR">Human Resources</option>
                        <option value="IT">Information Technology</option>
                        <option value="Production">Production</option>
                        <option value="Quality Control">Quality Control</option>
                        <option value="Sales">Sales</option>
                        <option value="Accounting">Accounting</option>
                        <option value="Purchasing">Purchasing</option>
                        <option value="Safety">Safety</option>
                      </select>
                    </div>
                  )}

                  {newAsset.assignmentType === 'EQUIPMENT' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Equipment/Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAsset.assignedToEquipment}
                        onChange={(e) => setNewAsset({ ...newAsset, assignedToEquipment: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Saw Line 1, Punch Press A, CNC Machine 3"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Specify the production equipment, line, or specific location this asset is assigned to
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Asset Modal */}
      {showEditModal && editingAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Asset</h3>
            <form onSubmit={handleUpdateAsset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Name
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                  {editingAsset.name} ({editingAsset.assetTag})
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editingAsset.status}
                    onChange={(e) => setEditingAsset({ ...editingAsset, status: e.target.value as AssetStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="RETIRED">Retired</option>
                    <option value="LOST">Lost</option>
                    <option value="STOLEN">Stolen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingAsset.location || ''}
                    onChange={(e) => setEditingAsset({ ...editingAsset, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter location"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <input
                  type="text"
                  value={editingAsset.condition || ''}
                  onChange={(e) => setEditingAsset({ ...editingAsset, condition: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter condition notes"
                />
              </div>

              {/* Assignment Section */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Asset Assignment</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assignment Type
                    </label>
                    <select
                      value={editingAsset.assignmentType}
                      onChange={(e) => setEditingAsset({ 
                        ...editingAsset, 
                        assignmentType: e.target.value as AssignmentType,
                        assignedToDepartment: '',
                        assignedToEquipment: ''
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="UNASSIGNED">Unassigned (Available)</option>
                      <option value="DEPARTMENT">Assign to Department</option>
                      <option value="EQUIPMENT">Assign to Equipment/Location</option>
                    </select>
                  </div>

                  {editingAsset.assignmentType === 'DEPARTMENT' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department *
                      </label>
                      <select
                        required
                        value={editingAsset.assignedToDepartment || ''}
                        onChange={(e) => setEditingAsset({ ...editingAsset, assignedToDepartment: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Department</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="HR">Human Resources</option>
                        <option value="IT">Information Technology</option>
                        <option value="Production">Production</option>
                        <option value="Quality Control">Quality Control</option>
                        <option value="Sales">Sales</option>
                        <option value="Accounting">Accounting</option>
                        <option value="Purchasing">Purchasing</option>
                        <option value="Safety">Safety</option>
                      </select>
                    </div>
                  )}

                  {editingAsset.assignmentType === 'EQUIPMENT' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Equipment/Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingAsset.assignedToEquipment || ''}
                        onChange={(e) => setEditingAsset({ ...editingAsset, assignedToEquipment: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Saw Line 1, Punch Press A, CNC Machine 3"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingAsset(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 