# PlannComm v2 - Demo Setup Instructions

## 🚀 Quick Start (5 minutes)

### Prerequisites:
- Node.js installed (v16+ recommended)
- Any code editor (VS Code, Cursor, etc.)

### Setup Steps:

1. **Extract the zip file** to any folder

2. **Open TWO terminal windows**

3. **Terminal 1 - Start Backend:**
```bash
cd planncomm-backend
npm install
npm run dev
```
Wait until you see: `Database already contains 380 tasks, skipping seed.`

4. **Terminal 2 - Start Frontend:**
```bash
cd planncomm-frontend
npm install
npm start
```
Wait until browser opens at http://localhost:3000

## ✅ What's Working:

- **376+ Tasks** across 12 companies
- **Monthly recurring tasks** (Payroll, BTW filings)
- **Quarterly reviews** for all companies
- **Task Creation** with auto-generated IDs
- **Excel Export** on all pages
- **Employee/Month filtering**
- **To-Do button** showing 110 incomplete tasks
- **Company Overview** - yearly view per company

## 🎯 Demo Highlights:

1. **Dashboard**: Shows 376 total tasks
2. **Create Task**: Leave Task ID blank - auto-generates
3. **To-Do Filter**: Purple button shows incomplete tasks
4. **Company Overview**: Select any company for yearly view
5. **Excel Export**: Green button on every page

## 📊 Sample Data:

- **Companies**: 12 (TechCorp BV, RetailPlus, etc.)
- **Employees**: 10 across different departments
- **Task Types**: Payroll, BTW/VAT, Quarterly Admin, Advisory, Audit
- **Time Period**: Full year 2025 with monthly/quarterly tasks

## 🔧 Troubleshooting:

If backend shows only 40 tasks instead of 376:
1. Stop the backend (Ctrl+C)
2. The database with 380 tasks is already included
3. Restart: `npm run dev`

## 💡 Key Features to Show:

1. **Filter by Employee**: Dropdown at top of Tasks/Planning
2. **Filter by Month**: Select month/year to see specific period
3. **Quick Actions**: "This Month", "Next Month", "View All"
4. **Task Status**: Completed (266), In Progress (14), Planned (96)
5. **Export**: Creates timestamped Excel files

## 📱 Access from Network:
- Frontend: http://10.0.0.7:3000 (check your IP)
- Backend API: http://localhost:5000/api/tasks

---
**Built with:** React, TypeScript, Node.js, Express, SQLite
**Total Development Time:** Rapid prototype
**Current Task Count:** 380+ tasks
