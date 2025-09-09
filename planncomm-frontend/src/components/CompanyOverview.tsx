import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { exportCompanyOverviewToExcel } from '../utils/excelExport';
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  BriefcaseIcon,
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
  start_date: string;
  end_date: string;
  assigned_employee_name?: string;
  priority: string;
}

interface Client {
  id: number;
  client_id: string;
  company_name: string;
  industry?: string;
}

interface MonthData {
  month: number;
  tasks: Task[];
}

const CompanyOverview: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const taskTypeIcons: { [key: string]: any } = {
    'salaries': CurrencyEuroIcon,
    'btw_icp': DocumentTextIcon,
    'quarterly_admin': CalendarIcon,
    'annual_accounts': BriefcaseIcon,
    'audit': CheckCircleIcon,
    'advisory': ExclamationTriangleIcon,
    'secretarial': DocumentTextIcon,
    'payroll': CurrencyEuroIcon
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      fetchCompanyTasks();
    }
  }, [selectedClientId, selectedYear]);

  useEffect(() => {
    // Organize tasks by month
    const organized: MonthData[] = [];
    for (let i = 1; i <= 12; i++) {
      const monthTasks = tasks.filter(task => {
        const startDate = new Date(task.start_date);
        const endDate = new Date(task.end_date);
        const monthStart = new Date(parseInt(selectedYear), i - 1, 1);
        const monthEnd = new Date(parseInt(selectedYear), i, 0);
        
        // Check if task overlaps with this month
        return (startDate <= monthEnd && endDate >= monthStart);
      });
      
      organized.push({
        month: i,
        tasks: monthTasks
      });
    }
    setMonthlyData(organized);
  }, [tasks, selectedYear]);

  const fetchClients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/clients');
      setClients(response.data);
      // Auto-select first client if available
      if (response.data.length > 0) {
        setSelectedClientId(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchCompanyTasks = async () => {
    if (!selectedClientId) return;
    
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/tasks', {
        params: {
          client_id: selectedClientId,
          year: selectedYear
        }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching company tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'salaries':
      case 'payroll':
        return 'text-green-600';
      case 'btw_icp':
        return 'text-blue-600';
      case 'quarterly_admin':
        return 'text-purple-600';
      case 'annual_accounts':
        return 'text-orange-600';
      case 'audit':
        return 'text-red-600';
      case 'advisory':
        return 'text-indigo-600';
      default:
        return 'text-gray-600';
    }
  };

  const calculateTotalHours = (monthTasks: Task[]) => {
    return {
      planned: monthTasks.reduce((sum, task) => sum + task.planned_hours, 0),
      actual: monthTasks.reduce((sum, task) => sum + task.actual_hours, 0)
    };
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Company Overview</h1>
        <p className="text-gray-600 mt-2">Annual task overview per company</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Company</label>
            <select
              value={selectedClientId || ''}
              onChange={(e) => setSelectedClientId(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a company...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company_name} ({client.client_id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={() => {
                if (selectedClient && tasks.length > 0) {
                  exportCompanyOverviewToExcel(
                    selectedClient.company_name,
                    selectedYear,
                    tasks,
                    monthlyData
                  );
                }
              }}
              disabled={!selectedClientId || tasks.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export to Excel
            </button>
            <button
              onClick={fetchCompanyTasks}
              disabled={!selectedClientId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {selectedClient && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">{selectedClient.company_name}</h3>
            <p className="text-sm text-gray-600">
              Client ID: {selectedClient.client_id} | Industry: {selectedClient.industry || 'N/A'}
            </p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Yearly Grid View */}
      {!loading && selectedClientId && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-6">
            {monthlyData.map((monthData) => {
              const hours = calculateTotalHours(monthData.tasks);
              const monthName = months[monthData.month - 1];
              
              return (
                <div key={monthData.month} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  {/* Month Header */}
                  <div className="flex justify-between items-center mb-3 pb-2 border-b">
                    <h3 className="font-semibold text-gray-900">{monthName}</h3>
                    <span className="text-sm text-gray-500">
                      {monthData.tasks.length} task{monthData.tasks.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Hours Summary */}
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-gray-600">Hours:</span>
                    <div className="text-right">
                      <span className="text-blue-600 font-medium">{hours.planned}h planned</span>
                      {hours.actual > 0 && (
                        <span className="text-green-600 ml-2">/ {hours.actual}h actual</span>
                      )}
                    </div>
                  </div>

                  {/* Tasks List */}
                  {monthData.tasks.length > 0 ? (
                    <div className="space-y-2">
                      {monthData.tasks.map((task) => {
                        const Icon = taskTypeIcons[task.task_type] || DocumentTextIcon;
                        return (
                          <div
                            key={task.id}
                            className={`p-2 rounded-md border ${getStatusColor(task.status)} cursor-pointer hover:shadow-sm transition-all`}
                            title={`${task.name}\nAssigned to: ${task.assigned_employee_name || 'Unassigned'}\nStatus: ${task.status}`}
                          >
                            <div className="flex items-start gap-2">
                              <Icon className={`w-4 h-4 mt-0.5 ${getTaskTypeColor(task.task_type)}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{task.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-600">
                                    {task.task_type.replace('_', ' ')}
                                  </span>
                                  {task.priority === 'high' && (
                                    <span className="text-xs text-red-600 font-medium">High</span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium">{task.planned_hours}h</p>
                                {task.status === 'completed' && (
                                  <CheckCircleIcon className="w-4 h-4 text-green-600 mt-1" />
                                )}
                                {task.status === 'in_progress' && (
                                  <ClockIcon className="w-4 h-4 text-blue-600 mt-1" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      <p className="text-sm">No tasks scheduled</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Year Summary */}
          <div className="bg-gray-50 p-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {tasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tasks.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Planned</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tasks.filter(t => t.status === 'planned').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !selectedClientId && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Company</h3>
          <p className="text-gray-600">Choose a company from the dropdown above to view their annual task overview</p>
        </div>
      )}
    </div>
  );
};

export default CompanyOverview;
