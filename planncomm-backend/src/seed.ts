import { dbRun, dbGet, dbAll } from './database';

export const seedDatabase = async () => {
  try {
    console.log('Seeding database with sample data...');

    // Clear existing data first (in reverse dependency order)
    console.log('Clearing existing data...');
    await dbRun('DELETE FROM task_assignments');
    await dbRun('DELETE FROM tasks');
    await dbRun('DELETE FROM employees');
    await dbRun('DELETE FROM clients');
    console.log('Cleared existing data');

    // Sample clients - expanded list
    console.log('Inserting clients...');
    await dbRun(`
      INSERT INTO clients (client_id, company_name, contact_person, phone, email, industry)
      VALUES
        ('CL001', 'TechCorp BV', 'Jan Jansen', '+31 20 123 4567', 'jan@techcorp.nl', 'Technology'),
        ('CL002', 'RetailPlus', 'Marie Dubois', '+31 20 987 6543', 'marie@retailplus.nl', 'Retail'),
        ('CL003', 'FinanceGroup', 'Peter de Vries', '+31 20 555 1234', 'peter@financegroup.nl', 'Financial Services'),
        ('CL004', 'Manufacturing Inc', 'Anna Schmidt', '+31 20 777 8888', 'anna@manufacturing.nl', 'Manufacturing'),
        ('CL005', 'Consulting Partners', 'Mark Johnson', '+31 20 333 4444', 'mark@consulting.nl', 'Consulting'),
        ('CL006', 'Healthcare Solutions', 'Dr. Elena Martinez', '+31 20 111 2222', 'elena@healthcare.nl', 'Healthcare'),
        ('CL007', 'Green Energy BV', 'Thomas Green', '+31 20 444 5555', 'thomas@greenenergy.nl', 'Energy'),
        ('CL008', 'Logistics Express', 'Sophie van Berg', '+31 20 666 7777', 'sophie@logistics.nl', 'Logistics'),
        ('CL009', 'Real Estate Holdings', 'Robert Brown', '+31 20 888 9999', 'robert@realestate.nl', 'Real Estate'),
        ('CL010', 'Digital Marketing Pro', 'Lisa Anderson', '+31 20 222 3333', 'lisa@digitalmarketing.nl', 'Marketing'),
        ('CL011', 'Construction Masters', 'Paul de Groot', '+31 20 555 6666', 'paul@construction.nl', 'Construction'),
        ('CL012', 'Food & Beverage Co', 'Maria Rodriguez', '+31 20 777 1111', 'maria@foodbev.nl', 'Food Industry')
    `);
    console.log('Clients inserted successfully');

    // Sample employees - expanded team
    console.log('Inserting employees...');
    await dbRun(`
      INSERT INTO employees (employee_number, name, email, department, capacity_hours)
      VALUES
        ('EMP001', 'Sarah van der Berg', 'sarah@accountancy.nl', 'Audit', 160),
        ('EMP002', 'Michael Rossi', 'michael@accountancy.nl', 'Tax', 160),
        ('EMP003', 'Lisa Chen', 'lisa@accountancy.nl', 'Audit', 160),
        ('EMP004', 'David Thompson', 'david@accountancy.nl', 'Financial Reporting', 160),
        ('EMP005', 'Emma Wilson', 'emma@accountancy.nl', 'Tax', 160),
        ('EMP006', 'Johan Bakker', 'johan@accountancy.nl', 'Advisory', 160),
        ('EMP007', 'Natalie van Dijk', 'natalie@accountancy.nl', 'Payroll', 160),
        ('EMP008', 'Carlos Mendez', 'carlos@accountancy.nl', 'Audit', 160),
        ('EMP009', 'Sophie Janssen', 'sophie@accountancy.nl', 'Tax', 160),
        ('EMP010', 'Tim de Boer', 'tim@accountancy.nl', 'Financial Reporting', 160)
    `);
    console.log('Employees inserted successfully');

    // Get the actual IDs from the database
    console.log('Getting client and employee IDs...');
    const clients = await dbAll("SELECT id, client_id FROM clients");
    const employees = await dbAll("SELECT id, employee_number FROM employees");
    
    // Create lookup maps for easier access
    const clientMap: any = {};
    clients.forEach((c: any) => clientMap[c.client_id] = c.id);
    
    const employeeMap: any = {};
    employees.forEach((e: any) => employeeMap[e.employee_number] = e.id);

    // Sample tasks distributed across the year 2025
    console.log('Inserting tasks...');
    
    // Create comprehensive task list
    const tasks = [
      // January 2025
      { id: 'TASK001', client: 'CL001', name: 'January Payroll Processing', desc: 'Monthly payroll for TechCorp', type: 'salaries', status: 'completed', planned: 8, actual: 8, start: '2025-01-01', end: '2025-01-31', emp: 'EMP007', priority: 'high' },
      { id: 'TASK002', client: 'CL002', name: 'Q4 2024 BTW Filing', desc: 'Quarterly VAT return', type: 'btw_icp', status: 'completed', planned: 6, actual: 7, start: '2025-01-10', end: '2025-01-20', emp: 'EMP002', priority: 'high' },
      { id: 'TASK003', client: 'CL003', name: 'Annual Accounts 2024 Prep', desc: 'Start preparation annual statements', type: 'annual_accounts', status: 'completed', planned: 20, actual: 22, start: '2025-01-15', end: '2025-01-31', emp: 'EMP001', priority: 'high' },
      
      // February 2025
      { id: 'TASK004', client: 'CL004', name: 'February Payroll', desc: 'Monthly payroll processing', type: 'salaries', status: 'completed', planned: 8, actual: 8, start: '2025-02-01', end: '2025-02-28', emp: 'EMP007', priority: 'high' },
      { id: 'TASK005', client: 'CL005', name: 'Tax Advisory Consultation', desc: 'Quarterly tax planning', type: 'advisory', status: 'completed', planned: 12, actual: 10, start: '2025-02-10', end: '2025-02-20', emp: 'EMP006', priority: 'medium' },
      { id: 'TASK006', client: 'CL006', name: 'Healthcare Compliance Audit', desc: 'Annual compliance review', type: 'audit', status: 'completed', planned: 40, actual: 42, start: '2025-02-01', end: '2025-02-28', emp: 'EMP003', priority: 'high' },
      
      // March 2025
      { id: 'TASK007', client: 'CL007', name: 'Q1 2025 Financial Review', desc: 'Quarterly financial statements', type: 'quarterly_admin', status: 'completed', planned: 16, actual: 15, start: '2025-03-01', end: '2025-03-31', emp: 'EMP004', priority: 'medium' },
      { id: 'TASK008', client: 'CL008', name: 'March Payroll', desc: 'Monthly payroll processing', type: 'salaries', status: 'completed', planned: 8, actual: 8, start: '2025-03-01', end: '2025-03-31', emp: 'EMP007', priority: 'high' },
      { id: 'TASK009', client: 'CL001', name: 'Annual Accounts 2024 Final', desc: 'Finalize annual statements', type: 'annual_accounts', status: 'completed', planned: 30, actual: 32, start: '2025-03-01', end: '2025-03-31', emp: 'EMP001', priority: 'high' },
      
      // April 2025
      { id: 'TASK010', client: 'CL002', name: 'Q1 2025 BTW Filing', desc: 'Quarterly VAT return', type: 'btw_icp', status: 'completed', planned: 6, actual: 6, start: '2025-04-10', end: '2025-04-20', emp: 'EMP002', priority: 'high' },
      { id: 'TASK011', client: 'CL009', name: 'Real Estate Tax Planning', desc: 'Property tax optimization', type: 'advisory', status: 'completed', planned: 20, actual: 18, start: '2025-04-01', end: '2025-04-30', emp: 'EMP006', priority: 'medium' },
      { id: 'TASK012', client: 'CL010', name: 'Marketing Budget Review', desc: 'Financial budget analysis', type: 'quarterly_admin', status: 'completed', planned: 12, actual: 12, start: '2025-04-15', end: '2025-04-30', emp: 'EMP004', priority: 'low' },
      
      // May 2025
      { id: 'TASK013', client: 'CL011', name: 'Construction Payroll May', desc: 'Complex payroll with bonuses', type: 'salaries', status: 'completed', planned: 12, actual: 14, start: '2025-05-01', end: '2025-05-31', emp: 'EMP007', priority: 'high' },
      { id: 'TASK014', client: 'CL012', name: 'Food Industry Compliance', desc: 'Health & safety financial audit', type: 'audit', status: 'completed', planned: 24, actual: 24, start: '2025-05-01', end: '2025-05-31', emp: 'EMP008', priority: 'high' },
      { id: 'TASK015', client: 'CL003', name: 'Mid-Year Tax Review', desc: 'Tax position assessment', type: 'advisory', status: 'completed', planned: 16, actual: 15, start: '2025-05-15', end: '2025-05-31', emp: 'EMP009', priority: 'medium' },
      
      // June 2025
      { id: 'TASK016', client: 'CL004', name: 'Q2 2025 Quarterly Admin', desc: 'Quarterly administration', type: 'quarterly_admin', status: 'completed', planned: 20, actual: 22, start: '2025-06-01', end: '2025-06-30', emp: 'EMP010', priority: 'high' },
      { id: 'TASK017', client: 'CL005', name: 'June Payroll', desc: 'Monthly payroll with vacation pay', type: 'salaries', status: 'completed', planned: 10, actual: 10, start: '2025-06-01', end: '2025-06-30', emp: 'EMP007', priority: 'high' },
      { id: 'TASK018', client: 'CL006', name: 'Healthcare Financial Audit', desc: 'Semi-annual audit', type: 'audit', status: 'completed', planned: 32, actual: 30, start: '2025-06-01', end: '2025-06-30', emp: 'EMP001', priority: 'high' },
      
      // July 2025
      { id: 'TASK019', client: 'CL007', name: 'Q2 2025 BTW Filing', desc: 'Quarterly VAT return', type: 'btw_icp', status: 'completed', planned: 8, actual: 8, start: '2025-07-10', end: '2025-07-20', emp: 'EMP002', priority: 'high' },
      { id: 'TASK020', client: 'CL008', name: 'Logistics Tax Optimization', desc: 'International tax planning', type: 'advisory', status: 'completed', planned: 24, actual: 26, start: '2025-07-01', end: '2025-07-31', emp: 'EMP009', priority: 'medium' },
      { id: 'TASK021', client: 'CL009', name: 'Property Portfolio Review', desc: 'Real estate financial analysis', type: 'quarterly_admin', status: 'completed', planned: 16, actual: 16, start: '2025-07-15', end: '2025-07-31', emp: 'EMP004', priority: 'medium' },
      
      // August 2025
      { id: 'TASK022', client: 'CL010', name: 'August Digital Campaign Audit', desc: 'Marketing expense audit', type: 'audit', status: 'completed', planned: 20, actual: 19, start: '2025-08-01', end: '2025-08-31', emp: 'EMP003', priority: 'low' },
      { id: 'TASK023', client: 'CL011', name: 'Construction Payroll August', desc: 'Monthly payroll processing', type: 'salaries', status: 'completed', planned: 12, actual: 12, start: '2025-08-01', end: '2025-08-31', emp: 'EMP007', priority: 'high' },
      { id: 'TASK024', client: 'CL012', name: 'Food Safety Compliance Report', desc: 'Regulatory compliance filing', type: 'secretarial', status: 'completed', planned: 8, actual: 8, start: '2025-08-15', end: '2025-08-31', emp: 'EMP005', priority: 'medium' },
      
      // September 2025
      { id: 'TASK025', client: 'CL001', name: 'Q3 2025 Financial Statements', desc: 'Quarterly reporting', type: 'quarterly_admin', status: 'completed', planned: 24, actual: 25, start: '2025-09-01', end: '2025-09-30', emp: 'EMP010', priority: 'high' },
      { id: 'TASK026', client: 'CL002', name: 'September Inventory Audit', desc: 'Retail inventory valuation', type: 'audit', status: 'completed', planned: 16, actual: 18, start: '2025-09-01', end: '2025-09-30', emp: 'EMP008', priority: 'medium' },
      { id: 'TASK027', client: 'CL003', name: 'Tax Planning 2026', desc: 'Annual tax strategy', type: 'advisory', status: 'in_progress', planned: 20, actual: 12, start: '2025-09-15', end: '2025-09-30', emp: 'EMP006', priority: 'high' },
      
      // October 2025
      { id: 'TASK028', client: 'CL004', name: 'Q3 2025 BTW Filing', desc: 'Quarterly VAT return', type: 'btw_icp', status: 'in_progress', planned: 8, actual: 4, start: '2025-10-10', end: '2025-10-20', emp: 'EMP002', priority: 'high' },
      { id: 'TASK029', client: 'CL005', name: 'October Payroll', desc: 'Monthly payroll processing', type: 'salaries', status: 'planned', planned: 8, actual: 0, start: '2025-10-01', end: '2025-10-31', emp: 'EMP007', priority: 'high' },
      { id: 'TASK030', client: 'CL006', name: 'Annual Budget Planning', desc: 'Healthcare budget 2026', type: 'advisory', status: 'planned', planned: 30, actual: 0, start: '2025-10-01', end: '2025-10-31', emp: 'EMP006', priority: 'high' },
      
      // November 2025
      { id: 'TASK031', client: 'CL007', name: 'Year-End Tax Preparation', desc: 'Preliminary tax calculations', type: 'annual_accounts', status: 'planned', planned: 40, actual: 0, start: '2025-11-01', end: '2025-11-30', emp: 'EMP001', priority: 'high' },
      { id: 'TASK032', client: 'CL008', name: 'November Payroll', desc: 'Monthly payroll with bonuses', type: 'salaries', status: 'planned', planned: 10, actual: 0, start: '2025-11-01', end: '2025-11-30', emp: 'EMP007', priority: 'high' },
      { id: 'TASK033', client: 'CL009', name: 'Property Tax Assessment', desc: 'Annual property tax review', type: 'advisory', status: 'planned', planned: 16, actual: 0, start: '2025-11-15', end: '2025-11-30', emp: 'EMP009', priority: 'medium' },
      
      // December 2025
      { id: 'TASK034', client: 'CL010', name: 'Annual Marketing Audit', desc: 'Year-end marketing expense audit', type: 'audit', status: 'planned', planned: 24, actual: 0, start: '2025-12-01', end: '2025-12-31', emp: 'EMP003', priority: 'medium' },
      { id: 'TASK035', client: 'CL011', name: 'Year-End Payroll', desc: 'December payroll with bonuses', type: 'salaries', status: 'planned', planned: 16, actual: 0, start: '2025-12-01', end: '2025-12-31', emp: 'EMP007', priority: 'high' },
      { id: 'TASK036', client: 'CL012', name: 'Annual Accounts 2025', desc: 'Prepare annual financial statements', type: 'annual_accounts', status: 'planned', planned: 48, actual: 0, start: '2025-12-01', end: '2025-12-31', emp: 'EMP001', priority: 'high' },
      
      // Recurring monthly tasks
      { id: 'TASK037', client: 'CL001', name: 'October Payroll TechCorp', desc: 'Monthly payroll', type: 'salaries', status: 'planned', planned: 6, actual: 0, start: '2025-10-25', end: '2025-10-31', emp: 'EMP007', priority: 'high' },
      { id: 'TASK038', client: 'CL002', name: 'Q4 2025 Planning', desc: 'Quarter planning review', type: 'quarterly_admin', status: 'planned', planned: 20, actual: 0, start: '2025-10-15', end: '2025-10-31', emp: 'EMP004', priority: 'medium' },
      { id: 'TASK039', client: 'CL003', name: 'November Tax Filing', desc: 'Monthly tax submissions', type: 'btw_icp', status: 'planned', planned: 8, actual: 0, start: '2025-11-10', end: '2025-11-20', emp: 'EMP002', priority: 'high' },
      { id: 'TASK040', client: 'CL004', name: 'December Financial Close', desc: 'Year-end closing procedures', type: 'annual_accounts', status: 'planned', planned: 36, actual: 0, start: '2025-12-15', end: '2025-12-31', emp: 'EMP010', priority: 'high' }
    ];
    
    // Insert all tasks
    for (const task of tasks) {
      await dbRun(`
        INSERT INTO tasks (
          task_id, client_id, name, description, task_type, status,
          planned_hours, actual_hours, start_date, end_date, assigned_employee_id, priority
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        task.id,
        clientMap[task.client],
        task.name,
        task.desc,
        task.type,
        task.status,
        task.planned,
        task.actual,
        task.start,
        task.end,
        employeeMap[task.emp],
        task.priority
      ]);
    }
    console.log('Tasks inserted successfully');

    // Task assignments are already handled via assigned_employee_id in the tasks table
    // No need for separate task_assignments table entries since we're using direct assignment
    console.log('Task assignments handled via direct employee assignment');

    console.log('Sample data seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    console.error('Error details:', error);
  }
};
