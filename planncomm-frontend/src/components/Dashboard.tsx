import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  UsersIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalClients: number;
  totalEmployees: number;
  totalTasks: number;
  plannedHours: number;
  completedTasks: number;
  overdueTasks: number;
}

interface Employee {
  id: number;
  employee_number: string;
  name: string;
  department?: string;
}

interface Task {
  id: number;
  task_id: string;
  name: string;
  status: string;
  planned_hours: number;
  actual_hours: number;
  end_date?: string;
  assigned_employee_id?: number;
  assigned_employee_name?: string;
  company_name?: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalEmployees: 0,
    totalTasks: 0,
    plannedHours: 0,
    completedTasks: 0,
    overdueTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | 'all'>('all');
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchDashboardStats();
    checkBackendConnection();
  }, [selectedEmployeeId]);

  const checkBackendConnection = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/health');
      console.log('Backend connection successful:', response.data);
    } catch (error) {
      console.error('Backend connection failed:', error);
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Build task query params based on selected employee
      const taskParams = selectedEmployeeId !== 'all' 
        ? { employee_id: selectedEmployeeId } 
        : {};

      const [clientsRes, employeesRes, tasksRes] = await Promise.all([
        axios.get('http://localhost:5000/api/clients'),
        axios.get('http://localhost:5000/api/employees'),
        axios.get('http://localhost:5000/api/tasks', { params: taskParams }),
      ]);

      const clients = clientsRes.data;
      const employeesList = employeesRes.data;
      const tasks = tasksRes.data;

      // Set employees for the dropdown
      setEmployees(employeesList);

      // Sort tasks by date for recent tasks display
      const sortedTasks = [...tasks].sort((a: Task, b: Task) => {
        const dateA = a.end_date ? new Date(a.end_date).getTime() : 0;
        const dateB = b.end_date ? new Date(b.end_date).getTime() : 0;
        return dateB - dateA;
      });
      setRecentTasks(sortedTasks.slice(0, 5));

      const plannedHours = tasks.reduce((sum: number, task: any) => sum + (task.planned_hours || 0), 0);
      const completedTasks = tasks.filter((task: any) => task.status === 'completed').length;
      const overdueTasks = tasks.filter((task: any) =>
        task.end_date && new Date(task.end_date) < new Date() && task.status !== 'completed'
      ).length;

      setStats({
        totalClients: clients.length,
        totalEmployees: employeesList.length,
        totalTasks: tasks.length,
        plannedHours,
        completedTasks,
        overdueTasks,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: BuildingOfficeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Employees',
      value: stats.totalEmployees,
      icon: UsersIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: ClipboardDocumentListIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Planned Hours',
      value: stats.plannedHours,
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Completed Tasks',
      value: stats.completedTasks,
      icon: CheckCircleIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Overdue Tasks',
      value: stats.overdueTasks,
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Overview of your planning activities</p>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter by Employee:</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} {emp.department ? `(${emp.department})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Tasks {selectedEmployeeId !== 'all' && `(Filtered)`}
          </h3>
          {recentTasks.length > 0 ? (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{task.name}</p>
                    <p className="text-sm text-gray-500">{task.company_name}</p>
                    {task.assigned_employee_name && (
                      <p className="text-xs text-gray-500">Assigned to: {task.assigned_employee_name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    {task.end_date && (
                      <p className="text-xs text-gray-500 mt-1">
                        Due: {new Date(task.end_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No tasks found</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Workload</h3>
          {employees.length > 0 ? (
            <div className="space-y-2">
              {employees.slice(0, 5).map((emp) => {
                const empTasks = recentTasks.filter(t => t.assigned_employee_id === emp.id);
                const totalHours = empTasks.reduce((sum, t) => sum + (t.planned_hours || 0), 0);
                return (
                  <div key={emp.id} className="flex items-center justify-between p-2">
                    <span className="text-sm text-gray-700">{emp.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{empTasks.length} tasks</span>
                      <span className="text-sm font-medium text-gray-900">{totalHours}h</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600">Loading employee data...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
