import React, { useEffect, useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import Modal from './Modal';
import { exportPlanningToExcel } from '../utils/excelExport';
import {
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  XCircleIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon
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
  assigned_employee_id?: number;
  end_date?: string;
  client_id?: number;
}

const Planning: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'planned' | 'in_progress' | 'completed'>('all');
  const [employees, setEmployees] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [formData, setFormData] = useState({
    task_id: '',
    name: '',
    description: '',
    status: 'planned',
    planned_hours: 0,
    actual_hours: 0,
    assigned_employee_id: 1
  });

  const fetchTasks = useCallback(async () => {
    try {
      console.log('Planning: Fetching from https://planncomm-backend.onrender.com/api/tasks');
      const params: any = {};
      if (filter !== 'all') params.status = filter;
      if (selectedEmployeeId !== 'all') params.employee_id = selectedEmployeeId;
      if (selectedMonth !== 'all') {
        params.month = selectedMonth;
        params.year = selectedYear;
      } else if (selectedYear !== 'all') {
        params.year = selectedYear;
      }
      const response = await axios.get('https://planncomm-backend.onrender.com/api/tasks', { params });
      console.log('Planning: Received response:', response.data);
      console.log('Planning: Number of tasks:', response.data.length);
      setTasks(response.data);
    } catch (error) {
      console.error('Planning: Error fetching tasks:', error);
      if (axios.isAxiosError(error)) {
        console.error('Planning: Error details:', error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error('Planning: Error message:', error.message);
      } else {
        console.error('Planning: Unknown error:', error);
      }
      setTasks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [filter, selectedEmployeeId, selectedMonth, selectedYear]);

  const fetchEmployees = useCallback(async () => {
    try {
      console.log('Planning: Fetching employees...');
      const response = await axios.get('https://planncomm-backend.onrender.com/api/employees');
      console.log('Planning: Employees fetched:', response.data.length);
      setEmployees(response.data);
    } catch (error) {
      console.error('Planning: Error fetching employees:', error);
      if (axios.isAxiosError(error)) {
        console.error('Employee fetch error details:', error.response?.data || error.message);
      }
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, [fetchTasks, fetchEmployees]);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      task_id: task.task_id,
      name: task.name,
      description: task.description || '',
      status: task.status,
      planned_hours: task.planned_hours,
      actual_hours: task.actual_hours,
      assigned_employee_id: task.assigned_employee_id || 1
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setFormData({
      task_id: '',
      name: '',
      description: '',
      status: 'planned',
      planned_hours: 0,
      actual_hours: 0,
      assigned_employee_id: 1
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      const taskData = {
        ...formData,
        assigned_employee_id: formData.assigned_employee_id
      };
      await axios.put(`https://planncomm-backend.onrender.com/api/tasks/${editingTask.id}`, taskData);
      await fetchTasks(); // Refresh the list
      handleCloseModal();
      alert('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['planned_hours', 'actual_hours', 'assigned_employee_id'].includes(name) ? parseInt(value) || 0 : value
    }));
  };

  const handleUpdateHours = (task: Task) => {
    const newHours = prompt(`Update actual hours for "${task.name}" (current: ${task.actual_hours || 0}):`, (task.actual_hours || 0).toString());
    if (newHours !== null && !isNaN(Number(newHours))) {
      // TODO: Implement API call to update hours
      alert(`Hours updated to ${newHours} - API integration needed`);
    }
  };

  // Enhanced UI utility functions
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

  const getStatusIcon = (status: string) => {
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

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const totalPlannedHours = filteredTasks.reduce((sum, task) => sum + task.planned_hours, 0);
  const totalActualHours = filteredTasks.reduce((sum, task) => sum + (task.actual_hours || 0), 0);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Planning Overview</h1>
            <p className="text-gray-600 mt-2">Monitor planned vs actual hours across all tasks</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Employee Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Employee:</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
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
                <option value="all">All</option>
                <option value="01">Jan</option>
                <option value="02">Feb</option>
                <option value="03">Mar</option>
                <option value="04">Apr</option>
                <option value="05">May</option>
                <option value="06">Jun</option>
                <option value="07">Jul</option>
                <option value="08">Aug</option>
                <option value="09">Sep</option>
                <option value="10">Oct</option>
                <option value="11">Nov</option>
                <option value="12">Dec</option>
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
            
            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const now = new Date();
                  setSelectedMonth(String(now.getMonth() + 1).padStart(2, '0'));
                  setSelectedYear(String(now.getFullYear()));
                }}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
              >
                This Month
              </button>
              <button
                onClick={() => {
                  setSelectedMonth('all');
                  setSelectedYear('2025');
                }}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
              >
                All
              </button>
              <button
                onClick={() => {
                  const summary = {
                    totalTasks: filteredTasks.length,
                    totalPlannedHours: totalPlannedHours,
                    totalActualHours: totalActualHours,
                    completionRate: totalPlannedHours > 0 ? Math.round((totalActualHours / totalPlannedHours) * 100) : 0,
                    tasksCompleted: filteredTasks.filter(t => t.status === 'completed').length,
                    tasksInProgress: filteredTasks.filter(t => t.status === 'in_progress').length,
                    tasksPlanned: filteredTasks.filter(t => t.status === 'planned').length
                  };
                  exportPlanningToExcel(filteredTasks, summary);
                }}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1"
                disabled={filteredTasks.length === 0}
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{filteredTasks.length}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Planned Hours</p>
              <p className="text-2xl font-bold text-gray-900">{totalPlannedHours}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actual Hours</p>
              <p className="text-2xl font-bold text-gray-900">{totalActualHours}</p>
              <p className="text-xs text-gray-500">
                {totalPlannedHours > 0 ? Math.round((totalActualHours / totalPlannedHours) * 100) : 0}% of planned
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2 mb-6">
        {[
          { key: 'all', label: 'All Tasks' },
          { key: 'planned', label: 'Planned' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'completed', label: 'Completed' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => {
          const daysUntilDue = getDaysUntilDue(task.end_date);
          const progressPercentage = getProgressPercentage(task.actual_hours, task.planned_hours);
          const urgencyStyles = getUrgencyStyles(task.end_date, task.status);

          return (
            <div key={task.id} className={`card hover:shadow-md transition-shadow ${urgencyStyles}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{task.name}</h3>
                  {task.task_type === 'btw_icp' && <ArrowPathIcon className="w-4 h-4 text-gray-400" title="Recurring Task" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskTypeColor(task.task_type)}`}>
                    {task.task_type.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(task.status)}
                    <span className="text-sm text-gray-600 capitalize">
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{task.task_type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Assigned:</span>
                  <span className="font-medium">{task.assigned_employee_name || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Due:</span>
                  <div className="flex items-center gap-2">
                    {daysUntilDue < 0 ? (
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                    ) : daysUntilDue <= 3 ? (
                      <ClockIcon className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={`font-medium ${
                      daysUntilDue < 0 ? 'text-red-600' :
                      daysUntilDue <= 3 ? 'text-yellow-600' : 'text-gray-900'
                    }`}>
                      {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
                       daysUntilDue === 0 ? 'Due today' :
                       daysUntilDue === 1 ? '1 day' : `${daysUntilDue} days`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Planned Hours:</span>
                  <span className="font-medium text-orange-600">{task.planned_hours}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Actual Hours:</span>
                  <span className="font-medium text-green-600">{task.actual_hours || 0}</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Progress</span>
                  <span>{task.actual_hours}/{task.planned_hours}h ({Math.round(progressPercentage)}%)</span>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="flex-1 btn-secondary text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleUpdateHours(task)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-2 px-3 rounded"
                >
                  Update Hours
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' ? 'Get started by creating your first task.' : `No ${filter.replace('_', ' ')} tasks found.`}
          </p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Edit Task: ${editingTask?.name}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task ID
              </label>
              <input
                type="text"
                name="task_id"
                value={formData.task_id}
                onChange={handleInputChange}
                className="input-field"
                required
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
            </label>
            <select
              name="assigned_employee_id"
              value={formData.assigned_employee_id}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              <option value="">
                {employees.length === 0
                  ? 'Loading employees...'
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
              Update Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Planning;
