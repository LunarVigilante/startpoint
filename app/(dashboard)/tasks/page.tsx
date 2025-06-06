'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  User, 
  Calendar,
  Hash,
  CheckSquare,
  Square,
  List,
  Grid3X3,
  Check,
  X
} from 'lucide-react';
import Link from 'next/link';

interface Task {
  id: string;
  taskNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdBy: string;
  department?: string;
  userId?: string;
  assetId?: string;
  serviceNowTicket?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    name: string;
    email: string;
  };
  user?: {
    name: string;
    email: string;
  };
  asset?: {
    name: string;
    assetTag: string;
  };
}

const priorityColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

  const statusColors = {
  OPEN: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  WAITING: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-red-100 text-red-800',
};

const categoryLabels = {
  USER_ONBOARDING: 'User Onboarding',
  USER_OFFBOARDING: 'User Offboarding',
  ASSET_ASSIGNMENT: 'Asset Assignment',
  ASSET_MAINTENANCE: 'Asset Maintenance',
  ACCESS_MANAGEMENT: 'Access Management',
  COMPLIANCE_CHECK: 'Compliance Check',
  INVENTORY_AUDIT: 'Inventory Audit',
  SYSTEM_UPDATE: 'System Update',
  DEPARTMENT_REVIEW: 'Department Review',
  OTHER: 'Other',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.taskNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.creator.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Square className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4" />;
      case 'WAITING':
        return <AlertCircle className="h-4 w-4" />;
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CLOSED':
        return <CheckSquare className="h-4 w-4" />;
      default:
        return <Square className="h-4 w-4" />;
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    setUpdatingTask(taskId);
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: taskId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task status');
    } finally {
      setUpdatingTask(null);
    }
  };

  const markTaskComplete = (task: Task) => {
    const nextStatus = task.status === 'RESOLVED' ? 'CLOSED' : 'RESOLVED';
    updateTaskStatus(task.id, nextStatus);
  };

  const kanbanColumns = [
    { id: 'OPEN', title: 'Open', color: 'bg-gray-50 border-gray-200' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-purple-50 border-purple-200' },
    { id: 'WAITING', title: 'Waiting', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'RESOLVED', title: 'Resolved', color: 'bg-green-50 border-green-200' },
    { id: 'CLOSED', title: 'Closed', color: 'bg-red-50 border-red-200' },
  ];

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const renderTaskCard = (task: Task) => (
    <Card key={task.id} className="mb-3 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link 
                href={`/tasks/${task.id}`} 
                className="font-medium text-sm hover:underline block"
              >
                #{task.taskNumber} - {task.title}
              </Link>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {task.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                markTaskComplete(task);
              }}
              disabled={updatingTask === task.id}
              className="ml-2 h-6 w-6 p-0"
            >
              {updatingTask === task.id ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              ) : task.status === 'RESOLVED' || task.status === 'CLOSED' ? (
                <CheckSquare className="h-3 w-3 text-green-600" />
              ) : (
                <Square className="h-3 w-3" />
              )}
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-1">
            <Badge 
              variant="outline" 
              className={`text-xs ${priorityColors[task.priority as keyof typeof priorityColors]}`}
            >
              {task.priority}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {categoryLabels[task.category as keyof typeof categoryLabels]}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>{task.creator.name}</span>
            </div>
            {task.dueDate && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Task Management</h2>
            <p className="text-muted-foreground">Manage IT administrative tasks and workflows</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="text-sm text-muted-foreground">Loading tasks...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Task Management</h2>
            <p className="text-muted-foreground">Manage IT administrative tasks and workflows</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Make sure your database is connected and the tasks table exists.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Task Management</h2>
          <p className="text-muted-foreground">Manage IT administrative tasks and workflows</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg p-1 bg-muted">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="h-7 px-3"
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-7 px-3"
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
          </div>
          <Button asChild>
            <Link href="/tasks/new">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <Square className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {tasks.filter(t => t.status === 'OPEN').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {tasks.filter(t => t.status === 'IN_PROGRESS').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.status === 'RESOLVED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="WAITING">Waiting</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="USER_ONBOARDING">User Onboarding</SelectItem>
                <SelectItem value="USER_OFFBOARDING">User Offboarding</SelectItem>
                <SelectItem value="ASSET_ASSIGNMENT">Asset Assignment</SelectItem>
                <SelectItem value="ASSET_MAINTENANCE">Asset Maintenance</SelectItem>
                <SelectItem value="ACCESS_MANAGEMENT">Access Management</SelectItem>
                <SelectItem value="COMPLIANCE_CHECK">Compliance Check</SelectItem>
                <SelectItem value="INVENTORY_AUDIT">Inventory Audit</SelectItem>
                <SelectItem value="SYSTEM_UPDATE">System Update</SelectItem>
                <SelectItem value="DEPARTMENT_REVIEW">Department Review</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Display */}
      {viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {kanbanColumns.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            return (
              <div key={column.id} className="space-y-4">
                <div className={`rounded-lg p-4 border-2 ${column.color}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">{column.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {columnTasks.length}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {columnTasks.map(renderTaskCard)}
                  </div>
                  
                  {columnTasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No {column.title.toLowerCase()} tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-lg font-medium">No tasks found</div>
                <p className="text-muted-foreground mt-2">
                  {tasks.length === 0 
                    ? "Create your first task to get started."
                    : "Try adjusting your filters to see more results."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-4">
                        <Link 
                          href={`/tasks/${task.id}`} 
                          className="font-semibold text-lg hover:underline"
                        >
                          #{task.taskNumber} - {task.title}
                        </Link>
                        <div className="flex space-x-2">
                          <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                            {task.priority}
                          </Badge>
                          <Badge className={statusColors[task.status as keyof typeof statusColors]}>
                            {getStatusIcon(task.status)}
                            <span className="ml-1">{task.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markTaskComplete(task)}
                          disabled={updatingTask === task.id}
                          className="h-8 w-8 p-0"
                        >
                          {updatingTask === task.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          ) : task.status === 'RESOLVED' || task.status === 'CLOSED' ? (
                            <CheckSquare className="h-4 w-4 text-green-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>Created by: {task.creator.name}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                        {task.department && (
                          <div>
                            <span className="font-medium">Dept:</span> {task.department}
                          </div>
                        )}
                        {task.asset && (
                          <div>
                            <span className="font-medium">Asset:</span> {task.asset.name}
                          </div>
                        )}
                        {task.user && (
                          <div>
                            <span className="font-medium">User:</span> {task.user.name}
                          </div>
                        )}
                        {task.serviceNowTicket && (
                          <div>
                            <span className="font-medium">ServiceNow:</span> 
                            <a 
                              href={`https://your-instance.service-now.com/nav_to.do?uri=incident.do?sys_id=${task.serviceNowTicket}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline ml-1"
                            >
                              {task.serviceNowTicket}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant="outline">
                        {categoryLabels[task.category as keyof typeof categoryLabels]}
                      </Badge>
                      {task.dueDate && (
                        <div className="text-xs text-muted-foreground">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
} 