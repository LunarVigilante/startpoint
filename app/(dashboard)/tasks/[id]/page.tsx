'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, User, MapPin, Clock, Edit, Save, X, CheckSquare, Square, Plus } from 'lucide-react'

type ChecklistItem = {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

type Task = {
  id: string
  taskNumber: string
  title: string
  description?: string | null
  category: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED'
  createdAt: string
  updatedAt: string
  dueDate?: string | null
  completedAt?: string | null
  department?: string | null
  serviceNowTicket?: string | null
  checklist?: ChecklistItem[]
  creator: {
    name: string
    email: string
  }
  user?: {
    name: string
    email: string
  } | null
  asset?: {
    name: string
    assetTag: string
  } | null
}

const PriorityColors = {
  LOW: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  MEDIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  URGENT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

const StatusColors = {
  OPEN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  WAITING: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editedTask, setEditedTask] = useState<Partial<Task>>({})
  const [taskId, setTaskId] = useState<string>('')
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [addingChecklistItem, setAddingChecklistItem] = useState(false)

  useEffect(() => {
    async function getParams() {
      const resolvedParams = await params
      setTaskId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (taskId) {
      fetchTask()
    }
  }, [taskId])

  const fetchTask = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tasks/${taskId}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Task not found')
        }
        throw new Error('Failed to fetch task')
      }
      const data = await response.json()
      setTask(data)
      setEditedTask(data)
      setChecklist(data.checklist || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!task) return
    
    try {
      setSaving(true)
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editedTask.status,
          priority: editedTask.priority,
          description: editedTask.description,
          dueDate: editedTask.dueDate,
          serviceNowTicket: editedTask.serviceNowTicket,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update task')
      }
      
      const updatedTask = await response.json()
      setTask(updatedTask)
      setEditedTask(updatedTask)
      setEditing(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedTask(task || {})
    setEditing(false)
  }

  const addChecklistItem = async () => {
    if (!newChecklistItem.trim() || !task) return
    
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newChecklistItem.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    }
    
    const updatedChecklist = [...checklist, newItem]
    setChecklist(updatedChecklist)
    setNewChecklistItem('')
    setAddingChecklistItem(false)
    
    // Save to server
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklist: updatedChecklist,
        }),
      })
    } catch (err) {
      console.error('Failed to save checklist item:', err)
      // Revert on error
      setChecklist(checklist)
    }
  }

  const toggleChecklistItem = async (itemId: string) => {
    const updatedChecklist = checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    )
    setChecklist(updatedChecklist)
    
    // Save to server
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklist: updatedChecklist,
        }),
      })
    } catch (err) {
      console.error('Failed to update checklist item:', err)
      // Revert on error
      setChecklist(checklist)
    }
  }

  const removeChecklistItem = async (itemId: string) => {
    const updatedChecklist = checklist.filter(item => item.id !== itemId)
    setChecklist(updatedChecklist)
    
    // Save to server
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklist: updatedChecklist,
        }),
      })
    } catch (err) {
      console.error('Failed to remove checklist item:', err)
      // Revert on error
      setChecklist(checklist)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

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
          <h3 className="text-red-800 dark:text-red-300 font-medium">Error Loading Task</h3>
          <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={fetchTask}
              className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded hover:bg-red-700 dark:hover:bg-red-600"
            >
              Try Again
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!task) return null

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 dark:text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{task.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{task.taskNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Task Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/25 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Description</h2>
            {editing ? (
              <textarea
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter task description..."
              />
            ) : (
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {task.description || 'No description provided.'}
              </div>
            )}
          </div>

          {/* Checklist */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/25 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Checklist</h2>
              <button
                onClick={() => setAddingChecklistItem(true)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <button
                    onClick={() => toggleChecklistItem(item.id)}
                    className="flex-shrink-0 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    {item.completed ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                  <span className={`flex-1 ${item.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => removeChecklistItem(item.id)}
                    className="flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {addingChecklistItem && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <input
                    type="text"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                    placeholder="Enter checklist item..."
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400 rounded"
                    autoFocus
                  />
                  <button
                    onClick={addChecklistItem}
                    className="px-3 py-1 text-sm bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setAddingChecklistItem(false)
                      setNewChecklistItem('')
                    }}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              )}
              
              {checklist.length === 0 && !addingChecklistItem && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No checklist items yet</p>
                  <p className="text-sm">Add items to track your progress</p>
                </div>
              )}
            </div>
          </div>

          {/* Status and Priority */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/25 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Status & Priority</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                {editing ? (
                  <select
                    value={editedTask.status || task.status}
                    onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as Task['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="WAITING">Waiting</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                ) : (
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${StatusColors[task.status]}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                {editing ? (
                  <select
                    value={editedTask.priority || task.priority}
                    onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as Task['priority'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                ) : (
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${PriorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ServiceNow Integration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/25 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">ServiceNow Integration</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ServiceNow Ticket
              </label>
              {editing ? (
                <input
                  type="text"
                  value={editedTask.serviceNowTicket || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, serviceNowTicket: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter ServiceNow ticket number (e.g., INC0001234)"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">
                  {task.serviceNowTicket ? (
                    <a 
                      href={`https://your-instance.service-now.com/nav_to.do?uri=incident.do?sys_id=${task.serviceNowTicket}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                    >
                      {task.serviceNowTicket}
                    </a>
                  ) : (
                    'No ServiceNow ticket linked'
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Task Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/25 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Task Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(task.createdAt)}</p>
                </div>
              </div>
              
              {task.dueDate && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</p>
                    {editing ? (
                      <input
                        type="datetime-local"
                        value={editedTask.dueDate ? new Date(editedTask.dueDate).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(task.dueDate)}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Created by</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{task.creator.name}</p>
                </div>
              </div>

              {task.department && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{task.department}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Items */}
          {(task.user || task.asset) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/25 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Related Items</h2>
              <div className="space-y-3">
                {task.user && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">User</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{task.user.name}</p>
                  </div>
                )}
                {task.asset && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Asset</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{task.asset.name} ({task.asset.assetTag})</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Category */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/25 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Category</h2>
            <span className="inline-flex px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full">
              {task.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 