import React from 'react';
import { Page } from '../App';
import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: HomeIcon },
    { id: 'clients' as Page, label: 'Clients', icon: BuildingOfficeIcon },
    { id: 'employees' as Page, label: 'Employees', icon: UsersIcon },
    { id: 'tasks' as Page, label: 'Tasks', icon: ClipboardDocumentListIcon },
    { id: 'planning' as Page, label: 'Planning', icon: CalendarDaysIcon },
    { id: 'company-overview' as Page, label: 'Company Overview', icon: ChartBarIcon },
  ];

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-700">PlannComm</h1>
        <p className="text-sm text-gray-500 mt-1">Planning Software</p>
      </div>

      <nav className="px-4 pb-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-6 py-4 mt-auto">
        <div className="text-xs text-gray-400">
          <p>© 2024 Accounting Firm</p>
          <p>PlannComm v2.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
