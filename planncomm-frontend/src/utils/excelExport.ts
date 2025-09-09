import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export const exportToExcel = (
  data: any[],
  columns: ExportColumn[],
  filename: string,
  sheetName: string = 'Sheet1'
) => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Transform data to match column structure
  const exportData = data.map(row => {
    const exportRow: any = {};
    columns.forEach(col => {
      exportRow[col.header] = row[col.key] || '';
    });
    return exportRow;
  });
  
  // Create worksheet from data
  const ws = XLSX.utils.json_to_sheet(exportData);
  
  // Set column widths
  const colWidths = columns.map(col => ({ wch: col.width || 15 }));
  ws['!cols'] = colWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
  // Save file
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportTasksToExcel = (tasks: any[]) => {
  const columns: ExportColumn[] = [
    { header: 'Task ID', key: 'task_id', width: 10 },
    { header: 'Task Name', key: 'name', width: 30 },
    { header: 'Company', key: 'company_name', width: 25 },
    { header: 'Type', key: 'task_type', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Priority', key: 'priority', width: 10 },
    { header: 'Assigned To', key: 'assigned_employee_name', width: 20 },
    { header: 'Planned Hours', key: 'planned_hours', width: 12 },
    { header: 'Actual Hours', key: 'actual_hours', width: 12 },
    { header: 'Start Date', key: 'start_date', width: 12 },
    { header: 'End Date', key: 'end_date', width: 12 },
    { header: 'Description', key: 'description', width: 40 }
  ];
  
  exportToExcel(tasks, columns, 'tasks_export', 'Tasks');
};

export const exportClientsToExcel = (clients: any[]) => {
  const columns: ExportColumn[] = [
    { header: 'Client ID', key: 'client_id', width: 12 },
    { header: 'Company Name', key: 'company_name', width: 30 },
    { header: 'Contact Person', key: 'contact_person', width: 20 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Industry', key: 'industry', width: 20 },
    { header: 'Status', key: 'status', width: 10 },
    { header: 'Address', key: 'address', width: 35 }
  ];
  
  exportToExcel(clients, columns, 'clients_export', 'Clients');
};

export const exportEmployeesToExcel = (employees: any[]) => {
  const columns: ExportColumn[] = [
    { header: 'Employee Number', key: 'employee_number', width: 15 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Department', key: 'department', width: 20 },
    { header: 'Capacity Hours', key: 'capacity_hours', width: 15 },
    { header: 'Active', key: 'is_active', width: 10 }
  ];
  
  exportToExcel(employees, columns, 'employees_export', 'Employees');
};

export const exportPlanningToExcel = (tasks: any[], summary: any) => {
  // Create workbook with multiple sheets
  const wb = XLSX.utils.book_new();
  
  // Sheet 1: Tasks
  const tasksColumns: ExportColumn[] = [
    { header: 'Task ID', key: 'task_id', width: 10 },
    { header: 'Task Name', key: 'name', width: 30 },
    { header: 'Company', key: 'company_name', width: 25 },
    { header: 'Assigned To', key: 'assigned_employee_name', width: 20 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Planned Hours', key: 'planned_hours', width: 12 },
    { header: 'Actual Hours', key: 'actual_hours', width: 12 },
    { header: 'Progress %', key: 'progress', width: 12 },
    { header: 'Start Date', key: 'start_date', width: 12 },
    { header: 'End Date', key: 'end_date', width: 12 }
  ];
  
  const tasksData = tasks.map(task => ({
    ...task,
    progress: task.planned_hours > 0 ? Math.round((task.actual_hours / task.planned_hours) * 100) : 0
  }));
  
  const tasksExportData = tasksData.map(row => {
    const exportRow: any = {};
    tasksColumns.forEach(col => {
      exportRow[col.header] = row[col.key] || '';
    });
    return exportRow;
  });
  
  const ws1 = XLSX.utils.json_to_sheet(tasksExportData);
  ws1['!cols'] = tasksColumns.map(col => ({ wch: col.width || 15 }));
  XLSX.utils.book_append_sheet(wb, ws1, 'Planning Tasks');
  
  // Sheet 2: Summary
  const summaryData = [
    { Metric: 'Total Tasks', Value: summary.totalTasks },
    { Metric: 'Total Planned Hours', Value: summary.totalPlannedHours },
    { Metric: 'Total Actual Hours', Value: summary.totalActualHours },
    { Metric: 'Completion Rate', Value: `${summary.completionRate}%` },
    { Metric: 'Tasks Completed', Value: summary.tasksCompleted },
    { Metric: 'Tasks In Progress', Value: summary.tasksInProgress },
    { Metric: 'Tasks Planned', Value: summary.tasksPlanned }
  ];
  
  const ws2 = XLSX.utils.json_to_sheet(summaryData);
  ws2['!cols'] = [{ wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Summary');
  
  // Generate and save file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `planning_export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportCompanyOverviewToExcel = (companyName: string, year: string, tasks: any[], monthlyData: any[]) => {
  const wb = XLSX.utils.book_new();
  
  // Sheet 1: All Tasks
  const tasksColumns: ExportColumn[] = [
    { header: 'Month', key: 'month', width: 12 },
    { header: 'Task ID', key: 'task_id', width: 10 },
    { header: 'Task Name', key: 'name', width: 30 },
    { header: 'Type', key: 'task_type', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Assigned To', key: 'assigned_employee_name', width: 20 },
    { header: 'Planned Hours', key: 'planned_hours', width: 12 },
    { header: 'Actual Hours', key: 'actual_hours', width: 12 },
    { header: 'Start Date', key: 'start_date', width: 12 },
    { header: 'End Date', key: 'end_date', width: 12 }
  ];
  
  const tasksWithMonth = tasks.map(task => {
    const endDate = new Date(task.end_date);
    const monthName = endDate.toLocaleString('default', { month: 'long' });
    return { ...task, month: monthName };
  });
  
  const tasksExportData = tasksWithMonth.map(row => {
    const exportRow: any = {};
    tasksColumns.forEach(col => {
      exportRow[col.header] = row[col.key] || '';
    });
    return exportRow;
  });
  
  const ws1 = XLSX.utils.json_to_sheet(tasksExportData);
  ws1['!cols'] = tasksColumns.map(col => ({ wch: col.width || 15 }));
  XLSX.utils.book_append_sheet(wb, ws1, 'Tasks');
  
  // Sheet 2: Monthly Summary
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  const monthlySummary = monthlyData.map(month => ({
    Month: monthNames[month.month - 1],
    'Task Count': month.tasks.length,
    'Planned Hours': month.tasks.reduce((sum: number, t: any) => sum + t.planned_hours, 0),
    'Actual Hours': month.tasks.reduce((sum: number, t: any) => sum + t.actual_hours, 0),
    'Completed': month.tasks.filter((t: any) => t.status === 'completed').length,
    'In Progress': month.tasks.filter((t: any) => t.status === 'in_progress').length,
    'Planned': month.tasks.filter((t: any) => t.status === 'planned').length
  }));
  
  const ws2 = XLSX.utils.json_to_sheet(monthlySummary);
  ws2['!cols'] = [
    { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Monthly Summary');
  
  // Sheet 3: Year Summary
  const yearSummary = [
    { Metric: 'Company', Value: companyName },
    { Metric: 'Year', Value: year },
    { Metric: 'Total Tasks', Value: tasks.length },
    { Metric: 'Total Planned Hours', Value: tasks.reduce((sum, t) => sum + t.planned_hours, 0) },
    { Metric: 'Total Actual Hours', Value: tasks.reduce((sum, t) => sum + t.actual_hours, 0) },
    { Metric: 'Tasks Completed', Value: tasks.filter(t => t.status === 'completed').length },
    { Metric: 'Tasks In Progress', Value: tasks.filter(t => t.status === 'in_progress').length },
    { Metric: 'Tasks Planned', Value: tasks.filter(t => t.status === 'planned').length }
  ];
  
  const ws3 = XLSX.utils.json_to_sheet(yearSummary);
  ws3['!cols'] = [{ wch: 20 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Year Summary');
  
  // Generate and save file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const filename = `${companyName.replace(/\s+/g, '_')}_${year}_overview_${new Date().toISOString().split('T')[0]}.xlsx`;
  saveAs(blob, filename);
};
