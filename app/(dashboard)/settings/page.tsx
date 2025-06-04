'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, Plus, Edit, Trash2, Building2, Users, Shield, Database, Bell } from 'lucide-react'

type Site = {
  id: string
  name: string
  code: string
  createdAt: string
  updatedAt: string
}

type SettingsData = {
  sites: Site[]
  userCount: number
  assetCount: number
  taskCount: number
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('sites')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [error, setError] = useState('')
  const [showAddSite, setShowAddSite] = useState(false)
  
  // Form states
  const [newSite, setNewSite] = useState({ name: '', code: '' })
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    taskReminders: true,
    systemAlerts: true,
    assetUpdates: false,
    maintenanceNotifications: true,
    securityAlerts: true,
    reportGenerationComplete: true,
    weeklyDigest: false,
  })
  
  // System settings
  const [systemSettings, setSystemSettings] = useState({
    dataRetentionDays: 365,
    autoBackup: true,
    maintenanceMode: false,
    debugLogging: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordExpiration: 90,
    requireMFA: false,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const [sitesRes, statsRes] = await Promise.all([
        fetch('/api/sites'),
        fetch('/api/dashboard/stats')
      ])
      
      if (!sitesRes.ok || !statsRes.ok) throw new Error('Failed to fetch settings')
      
      const sites = await sitesRes.json()
      const stats = await statsRes.json()
      
      setSettings({
        sites,
        userCount: stats.overview.activeUsers,
        assetCount: stats.overview.totalAssets,
        taskCount: stats.overview.totalTasks || 0,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const response = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSite),
      })
      
      if (!response.ok) throw new Error('Failed to create site')
      
      setNewSite({ name: '', code: '' })
      setShowAddSite(false)
      fetchSettings() // Refresh the data
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSite = async (siteId: string) => {
    if (!confirm('Are you sure you want to delete this site? This will also delete all associated data.')) {
      return
    }
    
    try {
      setSaving(true)
      const response = await fetch(`/api/sites?id=${siteId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete site')
      
      fetchSettings() // Refresh the data
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEditSite = (site: Site) => {
    setEditingSite(site)
  }

  const handleUpdateSite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSite) return
    
    try {
      setSaving(true)
      const response = await fetch('/api/sites', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSite.id,
          name: editingSite.name,
          code: editingSite.code,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update site')
      }
      
      setEditingSite(null)
      fetchSettings() // Refresh the data
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
          <h3 className="text-red-800 font-medium">Error Loading Settings</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={fetchSettings}
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
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-gray-600 dark:text-gray-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage system configuration and preferences</p>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/25">
          <div className="flex items-center">
            <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sites</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{settings?.sites.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/25">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{settings?.userCount || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/25">
          <div className="flex items-center">
            <Database className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{settings?.assetCount || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-gray-900/25">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{settings?.taskCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/25">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'sites', label: 'Sites', icon: Building2 },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'system', label: 'System', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Sites Tab */}
          {activeTab === 'sites' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Site Management</h2>
                  <p className="text-gray-600">Manage company locations and sites</p>
                </div>
                <button
                  onClick={() => setShowAddSite(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Site
                </button>
              </div>

              {/* Sites Table */}
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Site
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {settings?.sites.map((site) => (
                      <tr key={site.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                            <div className="text-sm font-medium text-gray-900">
                              {site.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {site.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(site.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEditSite(site)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteSite(site.id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={saving}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}



          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Notification Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400">Configure system notifications and alerts</p>
                </div>
                <button
                  onClick={() => {
                    // Save notification settings logic
                    console.log('Saving notification settings:', notificationSettings)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <Save className="w-4 h-4" />
                  Save Settings
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Enable Email Notifications', description: 'Receive notifications via email' },
                    { key: 'taskReminders', label: 'Task Reminders', description: 'Get reminders for due tasks and assignments' },
                    { key: 'systemAlerts', label: 'System Alerts', description: 'Important system status and error notifications' },
                    { key: 'assetUpdates', label: 'Asset Updates', description: 'Notifications when assets are modified or updated' },
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{setting.label}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                          onChange={(e) => setNotificationSettings(prev => ({
                            ...prev,
                            [setting.key]: e.target.checked
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Notifications</h3>
                <div className="space-y-4">
                  {[
                    { key: 'maintenanceNotifications', label: 'Maintenance Alerts', description: 'Notifications about scheduled maintenance' },
                    { key: 'securityAlerts', label: 'Security Alerts', description: 'Critical security and access notifications' },
                    { key: 'reportGenerationComplete', label: 'Report Generation', description: 'Alerts when reports are ready' },
                    { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Weekly summary of system activity' },
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{setting.label}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                          onChange={(e) => setNotificationSettings(prev => ({
                            ...prev,
                            [setting.key]: e.target.checked
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">System Configuration</h2>
                  <p className="text-gray-600 dark:text-gray-400">Advanced system settings and configuration</p>
                </div>
                <button
                  onClick={() => {
                    // Save system settings logic
                    console.log('Saving system settings:', systemSettings)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <Save className="w-4 h-4" />
                  Save Settings
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Data & Backup Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data & Backup</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Data Retention (days)
                      </label>
                      <input
                        type="number"
                        value={systemSettings.dataRetentionDays}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          dataRetentionDays: parseInt(e.target.value) || 365
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="30"
                        max="2555"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Automatic Backup</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Enable daily automatic backups</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.autoBackup}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            autoBackup: e.target.checked
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        value={systemSettings.sessionTimeout}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          sessionTimeout: parseInt(e.target.value) || 30
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="5"
                        max="480"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Login Attempts
                      </label>
                      <input
                        type="number"
                        value={systemSettings.maxLoginAttempts}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          maxLoginAttempts: parseInt(e.target.value) || 5
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="3"
                        max="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password Expiration (days)
                      </label>
                      <input
                        type="number"
                        value={systemSettings.passwordExpiration}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          passwordExpiration: parseInt(e.target.value) || 90
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="30"
                        max="365"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Require MFA</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Multi-factor authentication required</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.requireMFA}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            requireMFA: e.target.checked
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* System Maintenance */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Maintenance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Maintenance Mode</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Temporarily disable user access</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.maintenanceMode}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            maintenanceMode: e.target.checked
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Debug Logging</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Enable detailed system logging</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.debugLogging}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            debugLogging: e.target.checked
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* System Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Version</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">2.1.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Database</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">PostgreSQL 15.4</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Last Backup</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Today, 2:00 AM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Uptime</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">15 days, 4 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Site Modal */}
      {showAddSite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Site</h3>
            <form onSubmit={handleAddSite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  required
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter site name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Code
                </label>
                <input
                  type="text"
                  required
                  value={newSite.code}
                  onChange={(e) => setNewSite({ ...newSite, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter site code (e.g., HQ, NYC)"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddSite(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Site Modal */}
      {editingSite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Site</h3>
            <form onSubmit={handleUpdateSite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  required
                  value={editingSite.name}
                  onChange={(e) => setEditingSite({ ...editingSite, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter site name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Code
                </label>
                <input
                  type="text"
                  required
                  value={editingSite.code}
                  onChange={(e) => setEditingSite({ ...editingSite, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter site code"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingSite(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 