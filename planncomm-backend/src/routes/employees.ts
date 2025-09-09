import express from 'express';
import { dbAll, dbGet, dbRun } from '../database';

const router = express.Router();

// Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await dbAll(`
      SELECT * FROM employees
      WHERE is_active = 1
      ORDER BY name
    `);
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await dbGet(`
      SELECT * FROM employees WHERE id = ? AND is_active = 1
    `, [req.params.id]);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Create new employee
router.post('/', async (req, res) => {
  try {
    const { employee_number, name, email, department, capacity_hours } = req.body;

    if (!employee_number || !name) {
      return res.status(400).json({ error: 'Employee number and name are required' });
    }

    const result = await dbRun(`
      INSERT INTO employees (employee_number, name, email, department, capacity_hours)
      VALUES (?, ?, ?, ?, ?)
    `, [employee_number, name, email, department, capacity_hours || 160]);

    const newEmployee = await dbGet('SELECT * FROM employees WHERE id = ?', [result.lastID]);

    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const { employee_number, name, email, department, capacity_hours } = req.body;

    await dbRun(`
      UPDATE employees
      SET employee_number = ?, name = ?, email = ?, department = ?,
          capacity_hours = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [employee_number, name, email, department, capacity_hours, req.params.id]);

    const updatedEmployee = await dbGet('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    await dbRun(`
      UPDATE employees
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [req.params.id]);

    res.json({ message: 'Employee deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating employee:', error);
    res.status(500).json({ error: 'Failed to deactivate employee' });
  }
});

// Get employee workload/capacity
router.get('/:id/workload', async (req, res) => {
  try {
    const employee = await dbGet('SELECT * FROM employees WHERE id = ? AND is_active = 1', [req.params.id]);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Get assigned tasks and total planned hours
    const tasks = await dbAll(`
      SELECT t.*, c.company_name, ta.assigned_hours
      FROM tasks t
      JOIN clients c ON t.client_id = c.id
      LEFT JOIN task_assignments ta ON t.id = ta.task_id AND ta.employee_id = ?
      WHERE t.status IN ('planned', 'in_progress') AND t.assigned_employee_id = ?
      ORDER BY t.end_date
    `, [req.params.id, req.params.id]);

    const totalAssignedHours = tasks.reduce((sum, task) => sum + (task.assigned_hours || 0), 0);

    res.json({
      employee,
      tasks,
      totalAssignedHours,
      availableCapacity: employee.capacity_hours - totalAssignedHours
    });
  } catch (error) {
    console.error('Error fetching employee workload:', error);
    res.status(500).json({ error: 'Failed to fetch employee workload' });
  }
});

export default router;
