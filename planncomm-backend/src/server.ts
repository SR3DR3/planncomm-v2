import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import dotenv from 'dotenv';
import { initializeDatabase } from './database';
import { seedDatabase } from './seed';
import clientRoutes from './routes/clients';
import employeeRoutes from './routes/employees';
import taskRoutes from './routes/tasks';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PlannComm Backend is running' });
});

app.use('/api/clients', clientRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Handle real-time updates for multi-user support
  socket.on('task-updated', (data) => {
    socket.broadcast.emit('task-updated', data);
  });

  socket.on('client-updated', (data) => {
    socket.broadcast.emit('client-updated', data);
  });

  socket.on('employee-updated', (data) => {
    socket.broadcast.emit('employee-updated', data);
  });
});

server.listen(PORT, async () => {
  console.log(`PlannComm Backend running on port ${PORT}`);

  // Initialize database on startup
  try {
    await initializeDatabase();
    console.log('Database ready');

    // Check if database needs seeding
    const { dbGet } = require('./database');
    const taskCount = await dbGet('SELECT COUNT(*) as count FROM tasks');
    
    if (!taskCount || taskCount.count === 0) {
      console.log('Database is empty, seeding with sample data...');
      await seedDatabase();
    } else {
      console.log(`Database already contains ${taskCount.count} tasks, skipping seed.`);
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
});
