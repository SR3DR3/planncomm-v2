import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from './Modal';
import { exportTasksToExcel } from '../utils/excelExport';
import {
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  XCircleIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

interface Task {
  id: number;
  task_id: string;
  name: string;
  description?: string;
  task_type: string;
  status: string;
  planned_hours: number;
  actual_hours: number;
  company_name: string;
  assigned_employee_name?: string;
  end_date?: string;
  client_id?: number;
  assigned_employee_id?: number;
}

interface Client {
  id: number;
  client_id: string;
  company_name: string;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | 'overdue' | 'this_week' | 'my_tasks'>('all');
  const [sortBy, setSortBy] = useState<'due_date' | 'task_id' | 'status'>('due_date');
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [showOnlyTodo, setShowOnlyTodo] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    task_id: '',
    name: '',
    description: '',
    status: 'planned',
    planned_hours: 0,
    actual_hours: 0,
    client_id: 0, // Will be set after clients are loaded
    assigned_employee_id: 0, // Will be set after employees are loaded
    task_type: 'advisory' // Default task type
  });

  useEffect(() => {
    console.log('Tasks component mounted, fetching data...');
    fetchTasks();
    fetchEmployees();
    fetchClients();
  }, [selectedEmployeeId, selectedMonth, selectedYear]);

  const fetchTasks = async () => {
    try {
      const params: any = {};
      if (selectedEmployeeId !== 'all') {
        params.employee_id = selectedEmployeeId;
      }
      if (selectedMonth !== 'all') {
        params.month = selectedMonth;
        params.year = selectedYear;
      } else if (selectedYear !== 'all') {
        params.year = selectedYear;
      }
      console.log('Tasks: Fetching from https://planncomm-backend.onrender.com/api/tasks', params);
      const response = await axios.get('https://planncomm-backend.onrender.com/api/tasks', { params });
      console.log('Tasks: Received response:', response.data);
      console.log('Tasks: Number of tasks:', response.data.length);
      setTasks(response.data);
    } catch (error) {
      console.error('Tasks: Error fetching tasks:', error);
      if (axios.isAxiosError(error)) {
        console.error('Tasks: Error details:', error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error('Tasks: Error message:', error.message);
      } else {
        console.error('Tasks: Unknown error:', error);
      }
      setTasks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setEmployeesLoading(true);
      console.log('Fetching employees from:', 'https://planncomm-backend.onrender.com/api/employees');
      const response = await axios.get('https://planncomm-backend.onrender.com/api/employees');
      console.log('Employees fetched successfully:', response.data);
      console.log('Number of employees:', response.data.length);
      setEmployees(response.data);
      // Set default employee ID if we have employees
      if (response.data.length > 0 && formData.assigned_employee_id === 0) {
        setFormData(prev => ({ ...prev, assigned_employee_id: response.data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      if (axios.isAxiosError(error)) {
        console.error('Employee fetch error details:', error.response?.data || error.message);
      }
      setEmployees([]);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      console.log('Fetching clients...');
      const response = await axios.get('https://planncomm-backend.onrender.com/api/clients');
      console.log('Clients fetched:', response.data.length);
      setClients(response.data);
      // Set default client ID if we have clients
      if (response.data.length > 0 && formData.client_id === 0) {
        setFormData(prev => ({ ...prev, client_id: response.data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    }
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingTask(null);
    setFormData({
      task_id: '',
      name: '',
      description: '',
      status: 'planned',
      planned_hours: 0,
      actual_hours: 0,
      client_id: clients.length > 0 ? clients[0].id : 0,
      assigned_employee_id: employees.length > 0 ? employees[0].id : 0,
      task_type: 'advisory'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setIsAdding(false);
    setEditingTask(task);
    setFormData({
      task_id: task.task_id,
      name: task.name,
      description: task.description || '',
      status: task.status,
      planned_hours: task.planned_hours,
      actual_hours: task.actual_hours,
      client_id: task.client_id || (clients.length > 0 ? clients[0].id : 0), // Use task's client_id if available
      assigned_employee_id: task.assigned_employee_id || (employees.length > 0 ? employees[0].id : 0),
      task_type: task.task_type || 'advisory'
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsAdding(false);
    setEditingTask(null);
    setFormData({
      task_id: '',
      name: '',
      description: '',
      status: 'planned',
      planned_hours: 0,
      actual_hours: 0,
      client_id: clients.length > 0 ? clients[0].id : 0,
      assigned_employee_id: employees.length > 0 ? employees[0].id : 0,
      task_type: 'advisory'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isAdding) {
        // Create new task - need to prepare data for backend
        const taskData = {
          task_id: formData.task_id,
          client_id: formData.client_id,
          name: formData.name,
          description: formData.description,
          task_type: formData.task_type,
          planned_hours: formData.planned_hours,
          actual_hours: formData.actual_hours,
          status: formData.status,
          assigned_employee_id: formData.assigned_employee_id
        };
        await axios.post('https://planncomm-backend.onrender.com/api/tasks', taskData);
        alert('Task created successfully!');
      } else if (editingTask) {
        // Update existing task - include employee assignment
        const taskData = {
          ...formData,
          assigned_employee_id: formData.assigned_employee_id
        };
        await axios.put(`https://planncomm-backend.onrender.com/api/tasks/${editingTask.id}`, taskData);
        alert('Task updated successfully!');
      }

      await fetchTasks(); // Refresh the list
      handleCloseModal();
    } catch (error) {
      console.error('Error saving task:', error);
      if (axios.isAxiosError(error)) {
        alert(`Error ${isAdding ? 'creating' : 'updating'} task: ${error.response?.data?.error || error.message}`);
      } else {
        alert(`Error ${isAdding ? 'creating' : 'updating'} task`);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['planned_hours', 'actual_hours'].includes(name) ? parseInt(value) || 0 : value
    }));
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`https://planncomm-backend.onrender.com/api/tasks/${id}`);
        setTasks(tasks.filter(task => task.id !== id));
        alert('Task deleted successfully');
      } catch (error) {
        console.error('Error deleting task:', error);
        if (axios.isAxiosError(error)) {
          alert(`Error deleting task: ${error.response?.data?.error || error.message}`);
        } else {
          alert('Error deleting task');
        }
      }
    }
  };

  // Utility functions for enhanced UI
  const getDaysUntilDue = (dueDate: string | undefined): number => {
    if (!dueDate) return 999;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyLevel = (dueDate: string | undefined): 'overdue' | 'urgent' | 'normal' | 'future' => {
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return 'overdue';
    if (days <= 3) return 'urgent';
    if (days <= 7) return 'normal';
    return 'future';
  };

  const getUrgencyStyles = (dueDate: string | undefined, status: string): string => {
    // Don't apply urgency styling to completed tasks
    if (status === 'completed') {
      return 'border-l-4 border-green-500 bg-green-50';
    }

    const urgency = getUrgencyLevel(dueDate);
    switch (urgency) {
      case 'overdue':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'urgent':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'normal':
        return 'border-l-4 border-blue-500 bg-blue-50';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  const getTaskTypeColor = (taskType: string): string => {
    switch (taskType) {
      case 'btw_icp':
        return 'bg-blue-100 text-blue-800';
      case 'annual_accounts':
        return 'bg-green-100 text-green-800';
      case 'advisory':
        return 'bg-purple-100 text-purple-800';
      case 'salaries':
        return 'bg-orange-100 text-orange-800';
      case 'quarterly_admin':
        return 'bg-indigo-100 text-indigo-800';
      case 'secretarial':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string, progress?: number) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <ClockIcon className="w-5 h-5 text-blue-600" />;
      case 'on_hold':
        return <EyeIcon className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>;
    }
  };

  const getProgressPercentage = (actual: number, planned: number): number => {
    if (planned === 0) return 0;
    return Math.min((actual / planned) * 100, 100);
  };

  // Filter and sort tasks
  const getFilteredAndSortedTasks = () => {
    let filtered = tasks.filter(task => {
      // Apply To-Do filter first if enabled
      if (showOnlyTodo && task.status === 'completed') {
        return false;
      }
      
      switch (filter) {
        case 'overdue':
          return getDaysUntilDue(task.end_date) < 0;
        case 'this_week':
          const days = getDaysUntilDue(task.end_date);
          return days >= 0 && days <= 7;
        case 'my_tasks':
          return task.assigned_employee_name === 'Sarah van der Berg'; // Example - replace with actual user
        default:
          return true;
      }
    });

    // Sort by due date proximity
    filtered.sort((a, b) => {
      const daysA = getDaysUntilDue(a.end_date);
      const daysB = getDaysUntilDue(b.end_date);
      return daysA - daysB;
    });

    return filtered;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in_progress':
        return 'status-in_progress';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-planned';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-2">Manage tasks and assignments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportTasksToExcel(tasks)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            disabled={tasks.length === 0}
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export to Excel
          </button>
          <button
            onClick={() => handleAddNew()}
            className="btn-primary"
          >
            Add New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Employee Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Employee:</label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} {emp.department ? `(${emp.department})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Month Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Months</option>
            <option value="01">January</option>
            <option value="02">February</option>
            <option value="03">March</option>
            <option value="04">April</option>
            <option value="05">May</option>
            <option value="06">June</option>
            <option value="07">July</option>
            <option value="08">August</option>
            <option value="09">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>

        {/* Year Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex items-center space-x-2 ml-auto">
          <button
            onClick={() => setShowOnlyTodo(!showOnlyTodo)}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${
              showOnlyTodo 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            <ClipboardDocumentListIcon className="w-4 h-4" />
            To-Do {showOnlyTodo && `(${tasks.filter(t => t.status !== 'completed').length})`}
          </button>
          <button
            onClick={() => {
              const now = new Date();
              setSelectedMonth(String(now.getMonth() + 1).padStart(2, '0'));
              setSelectedYear(String(now.getFullYear()));
            }}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
          >
            This Month
          </button>
          <button
            onClick={() => {
              const next = new Date();
              next.setMonth(next.getMonth() + 1);
              setSelectedMonth(String(next.getMonth() + 1).padStart(2, '0'));
              setSelectedYear(String(next.getFullYear()));
            }}
            className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium"
          >
            Next Month
          </button>
          <button
            onClick={() => {
              setSelectedMonth('all');
              setSelectedYear('2025');
            }}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            View All
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'All Tasks' },
          { key: 'overdue', label: 'Overdue', icon: ExclamationTriangleIcon },
          { key: 'this_week', label: 'This Week', icon: ClockIcon },
          { key: 'my_tasks', label: 'My Tasks' },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              filter === key
                ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Until Due
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredAndSortedTasks().map((task) => {
                const daysUntilDue = getDaysUntilDue(task.end_date);
                const progressPercentage = getProgressPercentage(task.actual_hours, task.planned_hours);
                const urgencyStyles = getUrgencyStyles(task.end_date, task.status);

                return (
                  <tr key={task.id} className={`hover:bg-gray-50 ${urgencyStyles}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {task.task_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {task.name}
                        {task.task_type === 'btw_icp' && <ArrowPathIcon className="w-4 h-4 text-gray-400" title="Recurring Task" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.company_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(task.task_type)}`}>
                        {task.task_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <span className="text-sm text-gray-600 capitalize">
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-20">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-600 whitespace-nowrap">
                          {task.actual_hours}/{task.planned_hours}h
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {daysUntilDue < 0 ? (
                          <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                        ) : daysUntilDue <= 3 ? (
                          <ClockIcon className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={`text-sm font-medium ${
                          daysUntilDue < 0 ? 'text-red-600' :
                          daysUntilDue <= 3 ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
                           daysUntilDue === 0 ? 'Due today' :
                           daysUntilDue === 1 ? '1 day' : `${daysUntilDue} days`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleEdit(task)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isAdding ? 'Add New Task' : `Edit Task: ${editingTask?.name}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task ID (Auto-generated if left empty)
              </label>
              <input
                type="text"
                name="task_id"
                value={formData.task_id}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Auto-generated"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Employee
              <button
                type="button"
                onClick={fetchEmployees}
                className="ml-2 text-xs text-primary-600 hover:text-primary-800"
                disabled={employeesLoading}
              >
                {employeesLoading ? 'Loading...' : 'Refresh'}
              </button>
            </label>
            <select
              name="assigned_employee_id"
              value={formData.assigned_employee_id}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              <option value="">
                {employeesLoading
                  ? 'Loading employees...'
                  : employees.length === 0
                    ? 'No employees available'
                    : `Select Employee (${employees.length} available)`
                }
              </option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.employee_number}) - {employee.department}
                </option>
              ))}
            </select>
          </div>

          {isAdding && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company_name} ({client.client_id})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Type
            </label>
            <select
              name="task_type"
              value={formData.task_type}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              <option value="advisory">Advisory</option>
              <option value="audit">Audit</option>
              <option value="salaries">Salaries/Payroll</option>
              <option value="btw_icp">BTW/VAT Filing</option>
              <option value="quarterly_admin">Quarterly Admin</option>
              <option value="annual_accounts">Annual Accounts</option>
              <option value="secretarial">Secretarial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="input-field"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Planned Hours
              </label>
              <input
                type="number"
                name="planned_hours"
                value={formData.planned_hours}
                onChange={handleInputChange}
                className="input-field"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actual Hours
              </label>
              <input
                type="number"
                name="actual_hours"
                value={formData.actual_hours}
                onChange={handleInputChange}
                className="input-field"
                min="0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {isAdding ? 'Create Task' : 'Update Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
