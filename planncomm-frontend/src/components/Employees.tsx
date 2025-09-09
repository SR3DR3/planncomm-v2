import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from './Modal';
import { exportEmployeesToExcel } from '../utils/excelExport';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface Employee {
  id: number;
  employee_number: string;
  name: string;
  email?: string;
  department?: string;
  capacity_hours: number;
  is_active: number;
}

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    employee_number: '',
    name: '',
    email: '',
    department: '',
    capacity_hours: 160
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('https://planncomm-backend.onrender.com/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingEmployee(null);
    setFormData({
      employee_number: '',
      name: '',
      email: '',
      department: '',
      capacity_hours: 160
    });
    setIsModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setIsAdding(false);
    setEditingEmployee(employee);
    setFormData({
      employee_number: employee.employee_number,
      name: employee.name,
      email: employee.email || '',
      department: employee.department || '',
      capacity_hours: employee.capacity_hours
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsAdding(false);
    setEditingEmployee(null);
    setFormData({
      employee_number: '',
      name: '',
      email: '',
      department: '',
      capacity_hours: 160
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isAdding) {
        // Create new employee
        await axios.post('https://planncomm-backend.onrender.com/api/employees', formData);
        alert('Employee created successfully!');
      } else if (editingEmployee) {
        // Update existing employee
        await axios.put(`https://planncomm-backend.onrender.com/api/employees/${editingEmployee.id}`, formData);
        alert('Employee updated successfully!');
      }

      await fetchEmployees(); // Refresh the list
      handleCloseModal();
    } catch (error) {
      console.error('Error saving employee:', error);
      alert(`Error ${isAdding ? 'creating' : 'updating'} employee`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity_hours' ? parseInt(value) || 160 : value
    }));
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axios.delete(`https://planncomm-backend.onrender.com/api/employees/${id}`);
        setEmployees(employees.filter(employee => employee.id !== id));
        alert('Employee deleted successfully');
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Error deleting employee');
      }
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
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-2">Manage your team members and their capacity</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportEmployeesToExcel(employees)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            disabled={employees.length === 0}
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export to Excel
          </button>
          <button
            onClick={() => handleAddNew()}
            className="btn-primary"
          >
            Add New Employee
          </button>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity (hours)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {employee.employee_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.department || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.capacity_hours}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isAdding ? 'Add New Employee' : `Edit Employee: ${editingEmployee?.name}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Number
              </label>
              <input
                type="text"
                name="employee_number"
                value={formData.employee_number}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Select Department</option>
                <option value="Audit">Audit</option>
                <option value="Tax">Tax</option>
                <option value="Financial Reporting">Financial Reporting</option>
                <option value="Advisory">Advisory</option>
                <option value="Administration">Administration</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity Hours (per month)
            </label>
            <input
              type="number"
              name="capacity_hours"
              value={formData.capacity_hours}
              onChange={handleInputChange}
              className="input-field"
              min="1"
              max="320"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Default is 160 hours (8 hours/day × 20 days)
            </p>
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
              {isAdding ? 'Create Employee' : 'Update Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
