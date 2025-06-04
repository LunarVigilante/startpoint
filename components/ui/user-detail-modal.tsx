"use client";

import { useState, useEffect } from 'react';
import { X, User, Mail, Building, Calendar, Shield, Package, Users, FileText, MapPin, Phone, Badge } from 'lucide-react';

type UserDetail = {
  id: string;
  name: string;
  email: string;
  department?: string;
  title?: string;
  employeeId?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED';
  createdAt: string;
  updatedAt: string;
  site?: {
    name: string;
    code: string;
  };
  assets?: Array<{
    id: string;
    name: string;
    assetTag: string;
    type: string;
    status: string;
  }>;
  groups?: Array<{
    id: string;
    name: string;
    type: string;
    description?: string;
  }>;
  licenses?: Array<{
    id: string;
    name: string;
    type: string;
    expiryDate?: string;
    status: string;
  }>;
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
}

interface UserDetailModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailModal({ userId, isOpen, onClose }: UserDetailModalProps) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/users/${userId}/details`);
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      const data = await response.json();
      setUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'INACTIVE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'TERMINATED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'LOW': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {loading ? 'Loading...' : user?.name || 'User Details'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.title || 'Employee Information'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5 dark:text-white" />
          </button>
        </div>

        {loading && (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading user details...</p>
          </div>
        )}

        {error && (
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {user && !loading && (
          <>
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'assets', label: 'Assets', icon: Package },
                  { id: 'access', label: 'Access & Groups', icon: Shield },
                  { id: 'tasks', label: 'Tasks', icon: FileText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                          <p className="font-medium dark:text-white">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Building className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                          <p className="font-medium dark:text-white">{user.department || 'Not assigned'}</p>
                        </div>
                      </div>
                      {user.employeeId && (
                        <div className="flex items-center gap-3">
                          <Badge className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Employee ID</p>
                            <p className="font-medium dark:text-white">{user.employeeId}</p>
                          </div>
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                            <p className="font-medium dark:text-white">{user.phone}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Employment Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Employment Details</h3>
                    <div className="space-y-3">
                      {user.site && (
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                            <p className="font-medium dark:text-white">{user.site.name}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Joined</p>
                          <p className="font-medium dark:text-white">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                          <p className="font-medium dark:text-white">{formatDate(user.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'assets' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Assigned Assets</h3>
                  {user.assets && user.assets.length > 0 ? (
                    <div className="grid gap-4">
                      {user.assets.map((asset) => (
                        <div key={asset.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium dark:text-white">{asset.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{asset.assetTag} • {asset.type}</p>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                              {asset.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No assets assigned</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'access' && (
                <div className="space-y-6">
                  {/* Groups */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Groups & Permissions</h3>
                    {user.groups && user.groups.length > 0 ? (
                      <div className="grid gap-3">
                        {user.groups.map((group) => (
                          <div key={group.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium dark:text-white">{group.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{group.type}</p>
                              </div>
                              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            {group.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{group.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No groups assigned</p>
                      </div>
                    )}
                  </div>

                  {/* Licenses */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Software Licenses</h3>
                    {user.licenses && user.licenses.length > 0 ? (
                      <div className="grid gap-3">
                        {user.licenses.map((license) => (
                          <div key={license.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium dark:text-white">{license.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{license.type}</p>
                                {license.expiryDate && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Expires: {formatDate(license.expiryDate)}
                                  </p>
                                )}
                              </div>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(license.status)}`}>
                                {license.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No licenses assigned</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Tasks</h3>
                  {user.tasks && user.tasks.length > 0 ? (
                    <div className="grid gap-4">
                      {user.tasks.map((task) => (
                        <div key={task.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium dark:text-white">{task.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Created: {formatDate(task.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                                {task.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No recent tasks</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 