import express from 'express';
import { dbAll, dbGet, dbRun } from '../database';

const router = express.Router();

// Get all tasks with client and employee information
router.get('/', async (req, res) => {
  try {
    const { client_id, employee_id, status, task_type, month, year } = req.query;

    let query = `
      SELECT
        t.*,
        c.company_name,
        c.client_id as client_code,
        e.name as assigned_employee_name,
        e.employee_number
      FROM tasks t
      JOIN clients c ON t.client_id = c.id
      LEFT JOIN employees e ON t.assigned_employee_id = e.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (client_id) {
      query += ' AND t.client_id = ?';
      params.push(client_id);
    }

    if (employee_id) {
      query += ' AND t.assigned_employee_id = ?';
      params.push(employee_id);
    }

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (task_type) {
      query += ' AND t.task_type = ?';
      params.push(task_type);
    }

    // Handle date filtering
    if (month && year) {
      // Filter by specific month and year
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
      query += ' AND ((t.start_date <= ? AND t.end_date >= ?) OR (t.start_date >= ? AND t.start_date <= ?))';
      params.push(endDate, startDate, startDate, endDate);
    } else if (year) {
      // Filter by year only
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query += ' AND ((t.start_date <= ? AND t.end_date >= ?) OR (t.start_date >= ? AND t.start_date <= ?))';
      params.push(endDate, startDate, startDate, endDate);
    }

    query += ' ORDER BY t.start_date ASC, t.created_at DESC';

    const tasks = await dbAll(query, params);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await dbGet(`
      SELECT
        t.*,
        c.company_name,
        c.client_id as client_code,
        e.name as assigned_employee_name,
        e.employee_number
      FROM tasks t
      JOIN clients c ON t.client_id = c.id
      LEFT JOIN employees e ON t.assigned_employee_id = e.id
      WHERE t.id = ?
    `, [req.params.id]);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Get task assignments
    const assignments = await dbAll(`
      SELECT ta.*, e.name, e.employee_number
      FROM task_assignments ta
      JOIN employees e ON ta.employee_id = e.id
      WHERE ta.task_id = ?
    `, [req.params.id]);

    res.json({ ...task, assignments });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create new task
router.post('/', async (req, res) => {
  try {
    let {
      task_id,
      client_id,
      name,
      description,
      task_type,
      planned_hours,
      start_date,
      end_date,
      assigned_employee_id,
      priority
    } = req.body;

    if (!client_id || !name || !task_type || !planned_hours) {
      return res.status(400).json({
        error: 'Client ID, name, task type, and planned hours are required'
      });
    }

    // Auto-generate task_id if not provided or if it already exists
    if (!task_id) {
      // Get the highest task ID
      const maxTaskResult = await dbGet(
        "SELECT MAX(CAST(SUBSTR(task_id, 5) AS INTEGER)) as max_id FROM tasks"
      );
      const nextId = (maxTaskResult?.max_id || 0) + 1;
      task_id = `TASK${String(nextId).padStart(3, '0')}`;
    } else {
      // Check if provided task_id already exists
      const existingTask = await dbGet("SELECT id FROM tasks WHERE task_id = ?", [task_id]);
      if (existingTask) {
        // Generate a new ID
        const maxTaskResult = await dbGet(
          "SELECT MAX(CAST(SUBSTR(task_id, 5) AS INTEGER)) as max_id FROM tasks"
        );
        const nextId = (maxTaskResult?.max_id || 0) + 1;
        task_id = `TASK${String(nextId).padStart(3, '0')}`;
      }
    }

    const result = await dbRun(`
      INSERT INTO tasks (
        task_id, client_id, name, description, task_type,
        planned_hours, start_date, end_date, assigned_employee_id, priority
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      task_id, client_id, name, description, task_type,
      planned_hours, start_date, end_date, assigned_employee_id, priority || 'medium'
    ]);

    const newTask = await dbGet(`
      SELECT
        t.*,
        c.company_name,
        c.client_id as client_code,
        e.name as assigned_employee_name
      FROM tasks t
      JOIN clients c ON t.client_id = c.id
      LEFT JOIN employees e ON t.assigned_employee_id = e.id
      WHERE t.id = ?
    `, [result.lastID]);

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', async (req, res) => {
  try {
    const {
      task_id,
      name,
      description,
      task_type,
      status,
      planned_hours,
      actual_hours,
      start_date,
      end_date,
      assigned_employee_id,
      priority
    } = req.body;

    await dbRun(`
      UPDATE tasks
      SET task_id = ?, name = ?, description = ?, task_type = ?,
          status = ?, planned_hours = ?, actual_hours = ?,
          start_date = ?, end_date = ?, assigned_employee_id = ?,
          priority = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      task_id, name, description, task_type, status,
      planned_hours, actual_hours, start_date, end_date,
      assigned_employee_id, priority, req.params.id
    ]);

    const updatedTask = await dbGet(`
      SELECT
        t.*,
        c.company_name,
        c.client_id as client_code,
        e.name as assigned_employee_name
      FROM tasks t
      JOIN clients c ON t.client_id = c.id
      LEFT JOIN employees e ON t.assigned_employee_id = e.id
      WHERE t.id = ?
    `, [req.params.id]);

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    // Delete task assignments first
    await dbRun('DELETE FROM task_assignments WHERE task_id = ?', [req.params.id]);

    // Delete task
    await dbRun('DELETE FROM tasks WHERE id = ?', [req.params.id]);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Assign employee to task
router.post('/:id/assign', async (req, res) => {
  try {
    const { employee_id, assigned_hours } = req.body;

    if (!employee_id || !assigned_hours) {
      return res.status(400).json({ error: 'Employee ID and assigned hours are required' });
    }

    await dbRun(`
      INSERT OR REPLACE INTO task_assignments (task_id, employee_id, assigned_hours, assigned_date)
      VALUES (?, ?, ?, CURRENT_DATE)
    `, [req.params.id, employee_id, assigned_hours]);

    // Update the main task assignment if this is the primary employee
    await dbRun(`
      UPDATE tasks SET assigned_employee_id = ? WHERE id = ?
    `, [employee_id, req.params.id]);

    res.json({ message: 'Employee assigned successfully' });
  } catch (error) {
    console.error('Error assigning employee:', error);
    res.status(500).json({ error: 'Failed to assign employee' });
  }
});

// Get task types (for dropdowns)
router.get('/meta/task-types', (req, res) => {
  const taskTypes = [
    { value: 'quarterly_admin', label: 'Quarterly Administration' },
    { value: 'btw_icp', label: 'BTW/ICP Filings' },
    { value: 'salaries', label: 'Salaries Processing' },
    { value: 'annual_accounts', label: 'Annual Accounts' },
    { value: 'advisory', label: 'Advisory Services' },
    { value: 'secretarial', label: 'Secretarial Services' },
    { value: 'audit', label: 'Audit/Review' },
    { value: 'payroll', label: 'Payroll Processing' }
  ];

  res.json(taskTypes);
});

// Get task status options
router.get('/meta/statuses', (req, res) => {
  const statuses = [
    { value: 'planned', label: 'Planned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'on_hold', label: 'On Hold' }
  ];

  res.json(statuses);
});

export default router;
