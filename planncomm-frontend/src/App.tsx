import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import Employees from './components/Employees';
import Tasks from './components/Tasks';
import Planning from './components/Planning';
import CompanyOverview from './components/CompanyOverview';

export type Page = 'dashboard' | 'clients' | 'employees' | 'tasks' | 'planning' | 'company-overview';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <Clients />;
      case 'employees':
        return <Employees />;
      case 'tasks':
        return <Tasks />;
      case 'planning':
        return <Planning />;
      case 'company-overview':
        return <CompanyOverview />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;