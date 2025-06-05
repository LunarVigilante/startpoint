'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, Package, Monitor, Laptop, Printer } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Upload,
  Camera,
  X
} from 'lucide-react'

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
  
  // Enhanced tracking fields
  cost?: number | null
  notes?: string | null
  
  // Purchase information
  purchaseDate?: Date | null
  purchasePrice?: number | null
  vendor?: string | null
  invoiceNumber?: string | null
  warrantyExpiry?: Date | null
  
  // Hardware specifications
  specifications?: any
  
  // Mobile device specific fields
  imei?: string | null
  phoneNumber?: string | null
  
  // Photo and documentation
  photoUrl?: string | null
  photoFilename?: string | null
  
  // System fields
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
  condition: string
  cost: string
  notes: string
  purchaseDate: string
  imei: string
  phoneNumber: string
  ram: string
  cpu: string
  storage: string
  storageType: string
  gpuModel: string
  screenSize: string
  resolution: string
  // Printer specifications
  printerType: string
  printTechnology: string
  colorSupport: string
  duplexSupport: string
  tonerType: string
  maxPaperSize: string
  connectivityType: string
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
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [editingAsset, setEditingAsset] = useState<AssetWithUser | null>(null)
  const [saving, setSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  
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
    condition: 'Good',
    cost: '',
    notes: '',
    purchaseDate: '',
    imei: '',
    phoneNumber: '',
    ram: '',
    cpu: '',
    storage: '',
    storageType: 'HDD',
    gpuModel: '',
    screenSize: '',
    resolution: '',
    // Printer specifications
    printerType: '',
    printTechnology: '',
    colorSupport: '',
    duplexSupport: '',
    tonerType: '',
    maxPaperSize: '',
    connectivityType: ''
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadPhoto = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('photo', file)
    
    const response = await fetch('/api/assets/upload-photo', {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error('Failed to upload photo')
    }
    
    const { url } = await response.json()
    return url
  }

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      
      let photoUrl = ''
      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile)
      }

      // Build specifications object based on asset type
      const specifications: any = {}
      
      if (['LAPTOP', 'DESKTOP'].includes(newAsset.type)) {
        if (newAsset.ram) specifications.ram = newAsset.ram
        if (newAsset.cpu) specifications.cpu = newAsset.cpu
        if (newAsset.storage) specifications.storage = newAsset.storage
        if (newAsset.storageType) specifications.storageType = newAsset.storageType
        if (newAsset.gpuModel) specifications.gpu = newAsset.gpuModel
      }
      
      if (['LAPTOP', 'MONITOR', 'PHONE', 'TABLET'].includes(newAsset.type)) {
        if (newAsset.screenSize) specifications.screenSize = newAsset.screenSize
        if (newAsset.resolution) specifications.resolution = newAsset.resolution
      }

      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetTag: newAsset.assetTag,
          name: newAsset.name,
          type: newAsset.type,
          manufacturer: newAsset.manufacturer,
          model: newAsset.model,
          serialNumber: newAsset.serialNumber,
          condition: newAsset.condition,
          location: newAsset.location,
          cost: newAsset.cost ? parseFloat(newAsset.cost) : null,
          notes: newAsset.notes,
          purchaseDate: newAsset.purchaseDate || null,
          purchasePrice: newAsset.purchasePrice ? parseFloat(newAsset.purchasePrice) : null,
          vendor: newAsset.vendor,
          warrantyExpiry: newAsset.warrantyExpiry || null,
          specifications: Object.keys(specifications).length > 0 ? specifications : null,
          imei: newAsset.imei,
          phoneNumber: newAsset.phoneNumber,
          photoUrl,
          assignmentType: newAsset.assignmentType,
          assignedToDepartment: newAsset.assignmentType === 'DEPARTMENT' ? newAsset.assignedToDepartment : null,
          assignedToEquipment: newAsset.assignmentType === 'EQUIPMENT' ? newAsset.assignedToEquipment : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create asset')
      }

      setShowCreateModal(false)
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
        condition: 'Good',
        cost: '',
        notes: '',
        purchaseDate: '',
        imei: '',
        phoneNumber: '',
        ram: '',
        cpu: '',
        storage: '',
        storageType: 'HDD',
        gpuModel: '',
        screenSize: '',
        resolution: '',
        // Printer specifications
        printerType: '',
        printTechnology: '',
        colorSupport: '',
        duplexSupport: '',
        tonerType: '',
        maxPaperSize: '',
        connectivityType: ''
      })
      setPhotoFile(null)
      setPhotoPreview(null)
      fetchAssets()
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

  const renderHardwareSpecFields = () => {
    if (!newAsset.type) return null

    const isComputer = ['LAPTOP', 'DESKTOP'].includes(newAsset.type)
    const hasScreen = ['LAPTOP', 'MONITOR', 'PHONE', 'TABLET'].includes(newAsset.type)
    const isMobile = ['PHONE', 'TABLET'].includes(newAsset.type)
    const isPrinter = newAsset.type === 'PRINTER'

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-white">Hardware Specifications</h4>
        
        {isComputer && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                RAM (GB)
              </label>
              <Input
                type="text"
                value={newAsset.ram}
                onChange={(e) => setNewAsset({ ...newAsset, ram: e.target.value })}
                placeholder="8, 16, 32"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CPU
              </label>
              <Input
                type="text"
                value={newAsset.cpu}
                onChange={(e) => setNewAsset({ ...newAsset, cpu: e.target.value })}
                placeholder="Intel i7-12700K, AMD Ryzen 5 5600X"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Storage Size
              </label>
              <Input
                type="text"
                value={newAsset.storage}
                onChange={(e) => setNewAsset({ ...newAsset, storage: e.target.value })}
                placeholder="256GB, 512GB, 1TB"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Storage Type
              </label>
              <Select value={newAsset.storageType} onValueChange={(value) => setNewAsset({ ...newAsset, storageType: value })}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem value="HDD">HDD</SelectItem>
                  <SelectItem value="SSD">SSD</SelectItem>
                  <SelectItem value="NVME">NVMe SSD</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Graphics Card
              </label>
              <Input
                type="text"
                value={newAsset.gpuModel}
                onChange={(e) => setNewAsset({ ...newAsset, gpuModel: e.target.value })}
                placeholder="NVIDIA RTX 4060, AMD RX 7600, Integrated"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        )}
        
        {hasScreen && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Screen Size
              </label>
              <Input
                type="text"
                value={newAsset.screenSize}
                onChange={(e) => setNewAsset({ ...newAsset, screenSize: e.target.value })}
                                 placeholder='13.3", 15.6", 27", 6.1"'
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resolution
              </label>
              <Input
                type="text"
                value={newAsset.resolution}
                onChange={(e) => setNewAsset({ ...newAsset, resolution: e.target.value })}
                placeholder="1920x1080, 2560x1440, 3840x2160"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        )}
        
        {isMobile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                IMEI
              </label>
              <Input
                type="text"
                value={newAsset.imei}
                onChange={(e) => setNewAsset({ ...newAsset, imei: e.target.value })}
                placeholder="15-digit IMEI number"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <Input
                type="text"
                value={newAsset.phoneNumber}
                onChange={(e) => setNewAsset({ ...newAsset, phoneNumber: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        )}
        
        {isPrinter && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Printer Type
              </label>
              <Select value={newAsset.printerType} onValueChange={(value) => setNewAsset({ ...newAsset, printerType: value })}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select printer type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem value="Printer">Printer Only</SelectItem>
                  <SelectItem value="MFP">Multifunction (Print/Scan/Copy)</SelectItem>
                  <SelectItem value="Scanner">Scanner Only</SelectItem>
                  <SelectItem value="Fax">Fax Machine</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Print Technology
              </label>
              <Select value={newAsset.printTechnology} onValueChange={(value) => setNewAsset({ ...newAsset, printTechnology: value })}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select technology" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem value="Laser">Laser</SelectItem>
                  <SelectItem value="Inkjet">Inkjet</SelectItem>
                  <SelectItem value="Thermal">Thermal</SelectItem>
                  <SelectItem value="Dot Matrix">Dot Matrix</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color Support
              </label>
              <Select value={newAsset.colorSupport} onValueChange={(value) => setNewAsset({ ...newAsset, colorSupport: value })}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select color support" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem value="Color">Color</SelectItem>
                  <SelectItem value="Black & White">Black & White Only</SelectItem>
                  <SelectItem value="Monochrome">Monochrome</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duplex Support
              </label>
              <Select value={newAsset.duplexSupport} onValueChange={(value) => setNewAsset({ ...newAsset, duplexSupport: value })}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select duplex capability" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem value="Automatic">Automatic Duplex</SelectItem>
                  <SelectItem value="Manual">Manual Duplex</SelectItem>
                  <SelectItem value="None">No Duplex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Toner/Ink Type
              </label>
              <Input
                type="text"
                value={newAsset.tonerType}
                onChange={(e) => setNewAsset({ ...newAsset, tonerType: e.target.value })}
                placeholder="HP 305XL, Brother TN-760, etc."
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Paper Size
              </label>
              <Select value={newAsset.maxPaperSize} onValueChange={(value) => setNewAsset({ ...newAsset, maxPaperSize: value })}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select max paper size" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem value="Letter">Letter (8.5x11)</SelectItem>
                  <SelectItem value="Legal">Legal (8.5x14)</SelectItem>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="A3">A3</SelectItem>
                  <SelectItem value="Tabloid">Tabloid (11x17)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Connectivity
              </label>
              <Input
                type="text"
                value={newAsset.connectivityType}
                onChange={(e) => setNewAsset({ ...newAsset, connectivityType: e.target.value })}
                placeholder="USB, Ethernet, WiFi, Bluetooth"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>
    )
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
        <div className="flex gap-3">
          <button
            onClick={() => setShowInventoryModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          >
            <Package className="w-4 h-4" />
            Inventory
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        </div>
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
                  Type & Specs
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cost/Value
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
                     <td className="px-6 py-4">
                       <div className="text-sm">
                         <div className="font-medium text-gray-900 dark:text-white">
                           {asset.type.replace('_', ' ')}
                         </div>
                         <div className="text-gray-500 dark:text-gray-400 text-xs space-y-1 mt-1">
                           {asset.manufacturer && <div>• {asset.manufacturer} {asset.model}</div>}
                           {asset.specifications && (
                             <>
                               {asset.specifications.ram && <div>• RAM: {asset.specifications.ram}</div>}
                               {asset.specifications.cpu && <div>• CPU: {asset.specifications.cpu}</div>}
                               {asset.specifications.storage && <div>• Storage: {asset.specifications.storage} {asset.specifications.storageType}</div>}
                               {asset.specifications.screenSize && <div>• Display: {asset.specifications.screenSize}"</div>}
                               {asset.specifications.printerType && <div>• {asset.specifications.printerType} {asset.specifications.printTechnology}</div>}
                               {asset.specifications.colorSupport && <div>• {asset.specifications.colorSupport}</div>}
                             </>
                           )}
                           {asset.imei && <div>• IMEI: {asset.imei}</div>}
                         </div>
                       </div>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {asset.cost && (
                          <div className="font-medium text-gray-900 dark:text-white">
                            ${Number(asset.cost).toLocaleString()}
                          </div>
                        )}
                        {asset.purchasePrice && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Purchase: ${Number(asset.purchasePrice).toLocaleString()}
                          </div>
                        )}
                        {asset.purchaseDate && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(asset.purchaseDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Asset</h3>
            <form onSubmit={handleCreateAsset} className="space-y-6">
              
              {/* Basic Information */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Asset Tag *
                    </label>
                    <Input
                      type="text"
                      required
                      value={newAsset.assetTag}
                      onChange={(e) => setNewAsset({ ...newAsset, assetTag: e.target.value })}
                      placeholder="Enter asset tag"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Asset Name *
                    </label>
                    <Input
                      type="text"
                      required
                      value={newAsset.name}
                      onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                      placeholder="Enter asset name"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type *
                    </label>
                                         <Select value={newAsset.type} onValueChange={(value) => setNewAsset({ ...newAsset, type: value as AssetType })}>
                       <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                         <SelectValue placeholder="Select asset type" />
                       </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectItem value="LAPTOP">Laptop</SelectItem>
                        <SelectItem value="DESKTOP">Desktop</SelectItem>
                        <SelectItem value="MONITOR">Monitor</SelectItem>
                        <SelectItem value="PHONE">Phone</SelectItem>
                        <SelectItem value="TABLET">Tablet</SelectItem>
                        <SelectItem value="PRINTER">Printer</SelectItem>
                        <SelectItem value="NETWORK_EQUIPMENT">Network Equipment</SelectItem>
                        <SelectItem value="OTHER_HARDWARE">Other Hardware</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Manufacturer
                    </label>
                    <Input
                      type="text"
                      value={newAsset.manufacturer}
                      onChange={(e) => setNewAsset({ ...newAsset, manufacturer: e.target.value })}
                      placeholder="Dell, HP, Apple, Lenovo"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Model
                    </label>
                    <Input
                      type="text"
                      value={newAsset.model}
                      onChange={(e) => setNewAsset({ ...newAsset, model: e.target.value })}
                      placeholder="Model number or name"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Serial Number
                    </label>
                    <Input
                      type="text"
                      value={newAsset.serialNumber}
                      onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                      placeholder="Unique serial number"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Hardware Specifications */}
              {renderHardwareSpecFields()}

              {/* Purchase Information */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Purchase Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cost
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newAsset.cost}
                      onChange={(e) => setNewAsset({ ...newAsset, cost: e.target.value })}
                      placeholder="0.00"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Purchase Price
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newAsset.purchasePrice}
                      onChange={(e) => setNewAsset({ ...newAsset, purchasePrice: e.target.value })}
                      placeholder="0.00"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vendor
                    </label>
                    <Input
                      type="text"
                      value={newAsset.vendor}
                      onChange={(e) => setNewAsset({ ...newAsset, vendor: e.target.value })}
                      placeholder="Supplier or vendor name"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Purchase Date
                    </label>
                    <Input
                      type="date"
                      value={newAsset.purchaseDate}
                      onChange={(e) => setNewAsset({ ...newAsset, purchaseDate: e.target.value })}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Warranty Expiry
                    </label>
                    <Input
                      type="date"
                      value={newAsset.warrantyExpiry}
                      onChange={(e) => setNewAsset({ ...newAsset, warrantyExpiry: e.target.value })}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Asset Photo</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload Photo
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <Camera className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  
                  {photoPreview && (
                    <div className="relative w-32 h-32">
                      <img 
                        src={photoPreview} 
                        alt="Asset preview" 
                        className="w-full h-full object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPreview(null)
                          setPhotoFile(null)
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Condition
                    </label>
                    <Select value={newAsset.condition} onValueChange={(value) => setNewAsset({ ...newAsset, condition: value })}>
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                        <SelectItem value="Poor">Poor</SelectItem>
                        <SelectItem value="Damaged">Damaged</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <Input
                      type="text"
                      value={newAsset.location}
                      onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                      placeholder="Building, floor, room"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <Textarea
                    value={newAsset.notes}
                    onChange={(e) => setNewAsset({ ...newAsset, notes: e.target.value })}
                    placeholder="Additional notes or comments"
                    rows={3}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              {/* Assignment */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Assignment</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Assignment Type
                    </label>
                                         <Select value={newAsset.assignmentType} onValueChange={(value) => setNewAsset({ ...newAsset, assignmentType: value as AssignmentType })}>
                       <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                         <SelectValue />
                       </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                        <SelectItem value="USER">Assigned to User</SelectItem>
                        <SelectItem value="DEPARTMENT">Assigned to Department</SelectItem>
                        <SelectItem value="EQUIPMENT">Assigned to Equipment/Location</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newAsset.assignmentType === 'DEPARTMENT' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Department *
                      </label>
                      <Input
                        type="text"
                        required
                        value={newAsset.assignedToDepartment}
                        onChange={(e) => setNewAsset({ ...newAsset, assignedToDepartment: e.target.value })}
                        placeholder="e.g., IT, HR, Engineering"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  )}

                  {newAsset.assignmentType === 'EQUIPMENT' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Equipment/Location *
                      </label>
                      <Input
                        type="text"
                        required
                        value={newAsset.assignedToEquipment}
                        onChange={(e) => setNewAsset({ ...newAsset, assignedToEquipment: e.target.value })}
                        placeholder="e.g., Saw Line 1, Punch Press A, CNC Machine 3"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  {saving ? 'Creating...' : 'Create Asset'}
                </Button>
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

      {/* Inventory Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Inventory Management</h3>
              <button
                onClick={() => setShowInventoryModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Inventory Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">In Stock</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {assets.filter(a => a.status === 'AVAILABLE').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                    <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Deployed</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {assets.filter(a => a.status === 'ASSIGNED').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Maintenance</p>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                      {assets.filter(a => a.status === 'MAINTENANCE').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      ${assets.reduce((sum, asset) => sum + (Number(asset.cost) || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Available Assets Table */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Available Assets</h4>
              <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Asset
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Condition
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                      {assets.filter(asset => asset.status === 'AVAILABLE').map((asset) => {
                        const IconComponent = AssetTypeIcons[asset.type as keyof typeof AssetTypeIcons] || Package
                        return (
                          <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <IconComponent className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {asset.name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {asset.assetTag}
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
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                asset.condition === 'Excellent' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                asset.condition === 'Good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                asset.condition === 'Fair' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              }`}>
                                {asset.condition || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900 dark:text-white">
                                {asset.location || asset.site.name}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {asset.cost ? `$${Number(asset.cost).toLocaleString()}` : '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  handleEditAsset(asset)
                                  setShowInventoryModal(false)
                                }}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                              >
                                Assign
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                
                {assets.filter(asset => asset.status === 'AVAILABLE').length === 0 && (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No available assets</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      All assets are currently assigned or unavailable
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 