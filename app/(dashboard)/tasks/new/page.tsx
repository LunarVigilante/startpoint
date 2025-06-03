'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

const categoryOptions = [
  { value: 'USER_ONBOARDING', label: 'User Onboarding' },
  { value: 'USER_OFFBOARDING', label: 'User Offboarding' },
  { value: 'ASSET_ASSIGNMENT', label: 'Asset Assignment' },
  { value: 'ASSET_MAINTENANCE', label: 'Asset Maintenance' },
  { value: 'ACCESS_MANAGEMENT', label: 'Access Management' },
  { value: 'COMPLIANCE_CHECK', label: 'Compliance Check' },
  { value: 'INVENTORY_AUDIT', label: 'Inventory Audit' },
  { value: 'SYSTEM_UPDATE', label: 'System Update' },
  { value: 'DEPARTMENT_REVIEW', label: 'Department Review' },
  { value: 'OTHER', label: 'Other' },
];

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export default function NewTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM',
    assignedTo: '',
    department: '',
    dueDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For now, we'll use the admin user ID from our seed data
      // In a real app, this would come from authentication
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createdBy: 'admin@startpoint.com', // Using email to find the user
          siteId: 'HQ001', // Using site code to find the site
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      router.push('/tasks');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/tasks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tasks
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Create New Task</h2>
            <p className="text-muted-foreground">Add a new administrative task or workflow</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>
            Fill in the information below to create a new task
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter task title..."
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the task in detail..."
                rows={4}
                required
              />
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assigned To and Department */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign To</Label>
                <Input
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => handleChange('assignedTo', e.target.value)}
                  placeholder="Assignee email or name..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  placeholder="Related department..."
                />
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" asChild>
                <Link href="/tasks">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 