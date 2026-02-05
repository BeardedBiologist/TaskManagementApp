import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './utils/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import jwt from 'jsonwebtoken';
import Whiteboard from './models/Whiteboard.js';
import Activity from './models/Activity.js';

// Route imports
import authRoutes from './routes/auth.js';
import workspaceRoutes from './routes/workspaces.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import userRoutes from './routes/users.js';
import uploadRoutes from './routes/uploads.js';
import pageRoutes from './routes/pages.js';
import whiteboardRoutes from './routes/whiteboards.js';
import activityRoutes from './routes/activities.js';
import commentRoutes from './routes/comments.js';
import templateRoutes from './routes/templates.js';

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
app.use('/api/pages', pageRoutes);
app.use('/api/whiteboards', whiteboardRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/templates', templateRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Socket.io connection handling with auth
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// Track connected users per room
const roomUsers = new Map();
const whiteboardActivityThrottle = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id, 'User:', socket.userId);

  // ===== BASIC ROOMS (PROJECT / WORKSPACE) =====
  socket.on('join-project', (projectId) => {
    if (!projectId) return;
    socket.join(`project:${projectId}`);
  });

  socket.on('leave-project', (projectId) => {
    if (!projectId) return;
    socket.leave(`project:${projectId}`);
  });

  socket.on('join-workspace', (workspaceId) => {
    if (!workspaceId) return;
    socket.join(`workspace:${workspaceId}`);
  });

  socket.on('leave-workspace', (workspaceId) => {
    if (!workspaceId) return;
    socket.leave(`workspace:${workspaceId}`);
  });

  // ===== PRESENCE & CURSORS =====
  
  // User joins a room (project, whiteboard, page)
  socket.on('join-room', async (data) => {
    const { roomId, roomType, user } = data;
    const roomName = `${roomType}:${roomId}`;
    
    socket.join(roomName);
    socket.currentRoom = roomName;
    
    // Track user in room
    if (!roomUsers.has(roomName)) {
      roomUsers.set(roomName, new Map());
    }
    roomUsers.get(roomName).set(socket.userId, {
      socketId: socket.id,
      user,
      cursor: { x: 0, y: 0 },
      activity: 'idle'
    });
    
    // Notify others in room
    socket.to(roomName).emit('user-joined', {
      userId: socket.userId,
      user,
      timestamp: new Date()
    });
    
    // Send list of existing users to new joiner
    const existingUsers = Array.from(roomUsers.get(roomName).entries())
      .filter(([id]) => id !== socket.userId)
      .map(([id, data]) => ({ userId: id, ...data }));
    
    socket.emit('room-users', existingUsers);
    
    console.log(`User ${socket.userId} joined ${roomName}`);
  });

  // User leaves a room
  socket.on('leave-room', (data) => {
    const { roomId, roomType } = data;
    const roomName = `${roomType}:${roomId}`;
    
    socket.leave(roomName);
    
    if (roomUsers.has(roomName)) {
      roomUsers.get(roomName).delete(socket.userId);
      
      // Notify others
      socket.to(roomName).emit('user-left', {
        userId: socket.userId,
        timestamp: new Date()
      });
    }
    
    console.log(`User ${socket.userId} left ${roomName}`);
  });

  // Cursor movement
  socket.on('cursor-move', (data) => {
    const { roomId, roomType, cursor } = data;
    const roomName = `${roomType}:${roomId}`;
    
    // Update stored cursor position
    if (roomUsers.has(roomName)) {
      const userData = roomUsers.get(roomName).get(socket.userId);
      if (userData) {
        userData.cursor = cursor;
      }
    }
    
    // Broadcast to others in room
    socket.to(roomName).emit('cursor-update', {
      userId: socket.userId,
      cursor,
      timestamp: new Date()
    });
  });

  // Activity status update (typing, drawing, etc.)
  socket.on('activity-update', (data) => {
    const { roomId, roomType, activity } = data;
    const roomName = `${roomType}:${roomId}`;
    
    if (roomUsers.has(roomName)) {
      const userData = roomUsers.get(roomName).get(socket.userId);
      if (userData) {
        userData.activity = activity;
      }
    }
    
    socket.to(roomName).emit('user-activity', {
      userId: socket.userId,
      activity,
      timestamp: new Date()
    });
  });

  // ===== WHITEBOARD REAL-TIME =====
  
  // Element added
  socket.on('whiteboard-element-add', async (data) => {
    try {
      const { whiteboardId, element } = data;
      const roomName = `whiteboard:${whiteboardId}`;

      const whiteboard = await Whiteboard.findById(whiteboardId);
      if (whiteboard) {
        element.createdBy = socket.userId;
        whiteboard.elements.push(element);
        whiteboard.lastModifiedBy = socket.userId;
        whiteboard.lastModifiedAt = new Date();
        await whiteboard.save();

        const activity = await Activity.log({
          type: 'whiteboard.element.added',
          user: socket.userId,
          workspace: whiteboard.workspace,
          project: whiteboard.project,
          targetType: 'whiteboard',
          targetId: whiteboard._id,
          targetName: whiteboard.name,
          metadata: { elementId: element.id, elementType: element.type }
        });
        io.to(`project:${whiteboard.project}`).emit('activity', activity);
      }

      socket.to(roomName).emit('whiteboard-element-added', {
        element,
        userId: socket.userId,
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Whiteboard element add failed:', err.message);
    }
  });

  // Element updated
  socket.on('whiteboard-element-update', async (data) => {
    try {
      const { whiteboardId, elementId, updates } = data;
      const roomName = `whiteboard:${whiteboardId}`;

      const whiteboard = await Whiteboard.findById(whiteboardId);
      if (whiteboard) {
        const element = whiteboard.elements.find(el => el.id === elementId);
        if (element) {
          Object.assign(element, updates, { updatedAt: new Date() });
          whiteboard.lastModifiedBy = socket.userId;
          whiteboard.lastModifiedAt = new Date();
          await whiteboard.save();

          const throttleKey = `${socket.userId}:${whiteboardId}`;
          const now = Date.now();
          const lastLoggedAt = whiteboardActivityThrottle.get(throttleKey) || 0;
          if (now - lastLoggedAt > 5000) {
            const activity = await Activity.log({
              type: 'whiteboard.element.updated',
              user: socket.userId,
              workspace: whiteboard.workspace,
              project: whiteboard.project,
              targetType: 'whiteboard',
              targetId: whiteboard._id,
              targetName: whiteboard.name,
              metadata: { elementId, elementType: element.type }
            });
            io.to(`project:${whiteboard.project}`).emit('activity', activity);
            whiteboardActivityThrottle.set(throttleKey, now);
          }
        }
      }

      socket.to(roomName).emit('whiteboard-element-updated', {
        elementId,
        updates,
        userId: socket.userId,
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Whiteboard element update failed:', err.message);
    }
  });

  // Element deleted
  socket.on('whiteboard-element-delete', async (data) => {
    try {
      const { whiteboardId, elementId } = data;
      const roomName = `whiteboard:${whiteboardId}`;

      const whiteboard = await Whiteboard.findById(whiteboardId);
      if (whiteboard) {
        const beforeCount = whiteboard.elements.length;
        whiteboard.elements = whiteboard.elements.filter(el => el.id !== elementId);
        if (whiteboard.elements.length !== beforeCount) {
          whiteboard.lastModifiedBy = socket.userId;
          whiteboard.lastModifiedAt = new Date();
          await whiteboard.save();

          const activity = await Activity.log({
            type: 'whiteboard.element.deleted',
            user: socket.userId,
            workspace: whiteboard.workspace,
            project: whiteboard.project,
            targetType: 'whiteboard',
            targetId: whiteboard._id,
            targetName: whiteboard.name,
            metadata: { elementId }
          });
          io.to(`project:${whiteboard.project}`).emit('activity', activity);
        }
      }

      socket.to(roomName).emit('whiteboard-element-deleted', {
        elementId,
        userId: socket.userId,
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Whiteboard element delete failed:', err.message);
    }
  });

  // Selection update (show what others are selecting)
  socket.on('whiteboard-selection', (data) => {
    const { whiteboardId, elementIds } = data;
    const roomName = `whiteboard:${whiteboardId}`;
    socket.to(roomName).emit('whiteboard-user-selection', {
      userId: socket.userId,
      elementIds,
      timestamp: new Date()
    });
  });

  // ===== COLLABORATIVE DOCUMENTS =====
  
  // Page content update
  socket.on('page-content-update', (data) => {
    const { pageId, content, blockId } = data;
    const roomName = `page:${pageId}`;
    socket.to(roomName).emit('page-content-changed', {
      content,
      blockId,
      userId: socket.userId,
      timestamp: new Date()
    });
  });

  // Block operation (add, delete, move)
  socket.on('page-block-operation', (data) => {
    const { pageId, operation, blockData } = data;
    const roomName = `page:${pageId}`;
    socket.to(roomName).emit('page-block-changed', {
      operation, // 'add', 'delete', 'move', 'update'
      blockData,
      userId: socket.userId,
      timestamp: new Date()
    });
  });

  // ===== TASK UPDATES =====
  
  socket.on('task-moved', (data) => {
    socket.to(`project:${data.projectId}`).emit('task-updated', data);
  });

  socket.on('task-update', (data) => {
    socket.to(`project:${data.projectId}`).emit('task-updated', data);
  });

  // ===== COMMENTS =====
  
  socket.on('comment-add', (data) => {
    const { targetType, targetId } = data;
    const roomName = `${targetType}:${targetId}`;
    socket.to(roomName).emit('comment-added', {
      ...data,
      userId: socket.userId,
      timestamp: new Date()
    });
  });

  socket.on('comment-resolve', (data) => {
    const { targetType, targetId, commentId } = data;
    const roomName = `${targetType}:${targetId}`;
    socket.to(roomName).emit('comment-resolved', {
      commentId,
      userId: socket.userId,
      timestamp: new Date()
    });
  });

  // ===== VIEWPORT SYNC (for presentations/demos) =====
  
  socket.on('viewport-update', (data) => {
    const { roomId, roomType, viewport } = data;
    const roomName = `${roomType}:${roomId}`;
    socket.to(roomName).emit('viewport-changed', {
      userId: socket.userId,
      viewport,
      timestamp: new Date()
    });
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id, 'User:', socket.userId);
    
    // Clean up user from all rooms
    roomUsers.forEach((users, roomName) => {
      if (users.has(socket.userId)) {
        users.delete(socket.userId);
        socket.to(roomName).emit('user-left', {
          userId: socket.userId,
          timestamp: new Date()
        });
      }
    });
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
