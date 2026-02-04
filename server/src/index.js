import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './utils/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.js';
import workspaceRoutes from './routes/workspaces.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import userRoutes from './routes/users.js';
import uploadRoutes from './routes/uploads.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach io to requests for real-time updates
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join workspace room
  socket.on('join-workspace', (workspaceId) => {
    socket.join(`workspace:${workspaceId}`);
    console.log(`Socket ${socket.id} joined workspace ${workspaceId}`);
  });

  // Join project room
  socket.on('join-project', (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`Socket ${socket.id} joined project ${projectId}`);
  });

  // Leave workspace room
  socket.on('leave-workspace', (workspaceId) => {
    socket.leave(`workspace:${workspaceId}`);
    console.log(`Socket ${socket.id} left workspace ${workspaceId}`);
  });

  // Leave project room
  socket.on('leave-project', (projectId) => {
    socket.leave(`project:${projectId}`);
    console.log(`Socket ${socket.id} left project ${projectId}`);
  });

  // Task moved event
  socket.on('task-moved', (data) => {
    socket.to(`project:${data.projectId}`).emit('task-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
