'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Laptop, Smartphone, Tablet, Printer, Monitor, Plus, Copy, FileText, Upload } from 'lucide-react';

type CreateMode = 'scratch' | 'template' | 'copy';
type AssetType = 'LAPTOP' | 'DESKTOP' | 'MONITOR' | 'PHONE' | 'TABLET' | 'PRINTER' | 'NETWORK_EQUIPMENT' | 'OTHER_HARDWARE' | 'CONSUMABLE';

interface AssetTemplate {
  id: string;
  name: string;
  type: AssetType;
  manufacturer?: string;
  model?: string;
  specifications?: any;
  category?: string;
}

interface Asset {
  id: string;
  assetTag: string;
  name: string;
  type: AssetType;
  manufacturer?: string;
  model?: string;
  specifications?: any;
  category?: string;
}

const assetTemplates: AssetTemplate[] = [
  {
    id: 'laptop-standard',
    name: 'Standard Business Laptop',
    type: 'LAPTOP',
    manufacturer: 'Dell',
    model: 'Latitude 5520',
    specifications: {
      ram: '16GB',
      cpu: 'Intel i7-1165G7',
      storage: '512GB',
      storageType: 'SSD',
      screenSize: '15.6'
    },
    category: 'Standard Issue'
  },
  {
    id: 'desktop-workstation',
    name: 'Engineering Workstation',
    type: 'DESKTOP',
    manufacturer: 'HP',
    model: 'Z4 G4',
    specifications: {
      ram: '32GB',
      cpu: 'Intel Xeon W-2123',
      storage: '1TB',
      storageType: 'NVMe SSD',
      gpu: 'NVIDIA Quadro P2000'
    },
    category: 'Engineering'
  },
  {
    id: 'phone-standard',
    name: 'Standard Business Phone',
    type: 'PHONE',
    manufacturer: 'Apple',
    model: 'iPhone 13',
    specifications: {
      storage: '128GB',
      carrier: 'Verizon'
    },
    category: 'Standard Issue'
  },
  {
    id: 'printer-office',
    name: 'Office Multifunction Printer',
    type: 'PRINTER',
    manufacturer: 'HP',
    model: 'LaserJet Pro MFP M428fdw',
    specifications: {
      printerType: 'Laser',
      printTechnology: 'Monochrome',
      colorSupport: 'No',
      networkEnabled: 'Yes'
    },
    category: 'Office Equipment'
  }
];

export default function CreateAssetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get('mode') as CreateMode) || 'scratch';
  const copyFromId = searchParams.get('copyFrom');

  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<AssetTemplate | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  const [formData, setFormData] = useState({
    assetTag: '',
    name: '',
    type: '' as AssetType | '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    category: '',
    cost: '',
    purchaseDate: '',
    vendor: '',
    location: '',
    notes: '',
    specifications: {} as any
  });

  useEffect(() => {
    if (mode === 'copy') {
      fetchAssets();
      if (copyFromId) {
        // Auto-select the asset to copy from if provided in URL
        fetchAssetDetails(copyFromId);
      }
    }
  }, [mode, copyFromId]);

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets');
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const fetchAssetDetails = async (assetId: string) => {
    try {
      const response = await fetch(`/api/assets/${assetId}`);
      if (response.ok) {
        const asset = await response.json();
        setSelectedAsset(asset);
        populateFormFromAsset(asset);
      }
    } catch (error) {
      console.error('Error fetching asset details:', error);
    }
  };

  const populateFormFromTemplate = (template: AssetTemplate) => {
    setFormData({
      ...formData,
      name: template.name,
      type: template.type,
      manufacturer: template.manufacturer || '',
      model: template.model || '',
      category: template.category || '',
      specifications: template.specifications || {}
    });
  };

  const populateFormFromAsset = (asset: Asset) => {
    setFormData({
      assetTag: '', // Generate new asset tag
      name: `Copy of ${asset.name}`,
      type: asset.type,
      manufacturer: asset.manufacturer || '',
      model: asset.model || '',
      serialNumber: '', // Don't copy serial number
      category: asset.category || '',
      cost: '',
      purchaseDate: '',
      vendor: '',
      location: '',
      notes: `Copied from ${asset.assetTag}`,
      specifications: asset.specifications || {}
    });
  };

  const handleTemplateSelect = (template: AssetTemplate) => {
    setSelectedTemplate(template);
    populateFormFromTemplate(template);
  };

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    populateFormFromAsset(asset);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          purchaseDate: formData.purchaseDate || null,
        }),
      });

      if (response.ok) {
        router.push('/assets');
      } else {
        throw new Error('Failed to create asset');
      }
    } catch (error) {
      console.error('Error creating asset:', error);
      alert('Failed to create asset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'template':
        return <FileText className="h-6 w-6" />;
      case 'copy':
        return <Copy className="h-6 w-6" />;
      default:
        return <Plus className="h-6 w-6" />;
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'template':
        return 'Create Asset from Template';
      case 'copy':
        return 'Create Asset by Copying';
      default:
        return 'Create New Asset';
    }
  };

  const getModeDescription = () => {
    switch (mode) {
      case 'template':
        return 'Choose a predefined template to quickly create assets with standard configurations';
      case 'copy':
        return 'Select an existing asset to duplicate with similar specifications';
      default:
        return 'Create a completely new asset from scratch';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                {getModeIcon()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getModeTitle()}</h1>
                <p className="text-gray-600 dark:text-gray-400">{getModeDescription()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selection Step */}
      {mode === 'template' && !selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Choose a Template</CardTitle>
            <CardDescription>Select from predefined asset templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {assetTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-500"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {template.type === 'LAPTOP' && <Laptop className="h-5 w-5 text-blue-600" />}
                        {template.type === 'DESKTOP' && <Monitor className="h-5 w-5 text-green-600" />}
                        {template.type === 'PHONE' && <Smartphone className="h-5 w-5 text-purple-600" />}
                        {template.type === 'TABLET' && <Tablet className="h-5 w-5 text-orange-600" />}
                        {template.type === 'PRINTER' && <Printer className="h-5 w-5 text-red-600" />}
                        {template.type === 'MONITOR' && <Monitor className="h-5 w-5 text-gray-600" />}
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {template.manufacturer} {template.model}
                    </p>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Asset Selection Step */}
      {mode === 'copy' && !selectedAsset && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Asset to Copy</CardTitle>
            <CardDescription>Select an existing asset to duplicate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => handleAssetSelect(asset)}
                >
                  <div className="flex items-center gap-3">
                    {asset.type === 'LAPTOP' && <Laptop className="h-5 w-5 text-blue-600" />}
                    {asset.type === 'DESKTOP' && <Monitor className="h-5 w-5 text-green-600" />}
                    {asset.type === 'PHONE' && <Smartphone className="h-5 w-5 text-purple-600" />}
                    {asset.type === 'TABLET' && <Tablet className="h-5 w-5 text-orange-600" />}
                    {asset.type === 'PRINTER' && <Printer className="h-5 w-5 text-red-600" />}
                    {asset.type === 'MONITOR' && <Monitor className="h-5 w-5 text-gray-600" />}
                    <div>
                      <div className="font-medium">{asset.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {asset.assetTag} • {asset.manufacturer} {asset.model}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Select</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Asset Creation Form */}
      {(mode === 'scratch' || selectedTemplate || selectedAsset) && (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the basic details for the asset</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="assetTag">Asset Tag *</Label>
                    <Input
                      id="assetTag"
                      value={formData.assetTag}
                      onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })}
                      placeholder="AUTO-GENERATED"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Asset Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter asset name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="type">Asset Type *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: AssetType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LAPTOP">Laptop</SelectItem>
                      <SelectItem value="DESKTOP">Desktop</SelectItem>
                      <SelectItem value="MONITOR">Monitor</SelectItem>
                      <SelectItem value="PHONE">Phone</SelectItem>
                      <SelectItem value="TABLET">Tablet</SelectItem>
                      <SelectItem value="PRINTER">Printer</SelectItem>
                      <SelectItem value="NETWORK_EQUIPMENT">Network Equipment</SelectItem>
                      <SelectItem value="OTHER_HARDWARE">Other Hardware</SelectItem>
                      <SelectItem value="CONSUMABLE">Consumable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="manufacturer">Manufacturer</Label>
                    <Input
                      id="manufacturer"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      placeholder="e.g., Dell, HP, Apple"
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="e.g., Latitude 5520"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input
                      id="serialNumber"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      placeholder="Enter serial number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Standard Issue, Engineering"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Information */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase Information</CardTitle>
                <CardDescription>Financial and vendor details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="cost">Purchase Cost</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    placeholder="e.g., CDW, Amazon Business"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Main Office, Warehouse"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes or comments"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Asset'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
} 