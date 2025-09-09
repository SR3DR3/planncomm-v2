import sqlite3 from 'sqlite3';
import path from 'path';

// Create database connection
const dbPath = path.join(__dirname, '../database/planncomm.db');
const db = new sqlite3.Database(dbPath);

// Promisify database operations
export const dbRun = (sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

export const dbGet = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export const dbAll = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Initialize database tables
export const initializeDatabase = async () => {
  try {
    // Create tables directory if it doesn't exist
    const fs = require('fs');
    const dbDir = path.join(__dirname, '../database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Create users table (for authentication)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_number VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        role VARCHAR(20) DEFAULT 'user',
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create clients table (companies)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id VARCHAR(50) UNIQUE NOT NULL,
        company_name VARCHAR(200) NOT NULL,
        contact_person VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        industry VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create employees table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_number VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        department VARCHAR(50),
        capacity_hours INTEGER DEFAULT 160, -- 8 hours * 20 days
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tasks table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id VARCHAR(50) UNIQUE NOT NULL,
        client_id INTEGER NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        task_type VARCHAR(50) NOT NULL, -- quarterly_admin, btw_icp, salaries, annual_accounts
        status VARCHAR(20) DEFAULT 'planned', -- planned, in_progress, completed, cancelled
        priority VARCHAR(10) DEFAULT 'medium', -- low, medium, high
        planned_hours INTEGER NOT NULL,
        actual_hours INTEGER DEFAULT 0,
        start_date DATE,
        end_date DATE,
        assigned_employee_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id),
        FOREIGN KEY (assigned_employee_id) REFERENCES employees (id)
      )
    `);

    // Create task_assignments table (many-to-many relationship)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS task_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        employee_id INTEGER NOT NULL,
        assigned_hours INTEGER NOT NULL,
        assigned_date DATE DEFAULT CURRENT_DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks (id),
        FOREIGN KEY (employee_id) REFERENCES employees (id),
        UNIQUE(task_id, employee_id)
      )
    `);

    // Create planning_periods table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS planning_periods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        period_name VARCHAR(100) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        year INTEGER NOT NULL,
        quarter INTEGER,
        month INTEGER,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_tasks_assigned_employee ON tasks(assigned_employee_id)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_task_assignments_task_id ON task_assignments(task_id)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_task_assignments_employee_id ON task_assignments(employee_id)`);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export { db };
