import express from 'express';
import Whiteboard from '../models/Whiteboard.js';
import Project from '../models/Project.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all whiteboards for a project
router.get('/project/:projectId', authenticate, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    // Check project access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const whiteboards = await Whiteboard.find({ project: projectId })
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .sort({ updatedAt: -1 });
    
    res.json(whiteboards);
  } catch (error) {
    next(error);
  }
});

// Get single whiteboard
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const whiteboard = await Whiteboard.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');
    
    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }
    
    // Check access
    const project = await Project.findById(whiteboard.project);
    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(whiteboard);
  } catch (error) {
    next(error);
  }
});

// Create whiteboard
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, projectId, canvasWidth, canvasHeight, backgroundColor } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const whiteboard = await Whiteboard.create({
      name,
      project: projectId,
      workspace: project.workspace,
      canvasWidth: canvasWidth || 3000,
      canvasHeight: canvasHeight || 2000,
      backgroundColor: backgroundColor || '#f8f9fa',
      elements: [],
      createdBy: req.user._id,
      lastModifiedBy: req.user._id
    });
    
    await whiteboard.populate('createdBy', 'name email');
    
    // Emit to project room
    req.io.to(`project:${projectId}`).emit('whiteboard-created', {
      whiteboard,
      userId: req.user._id
    });
    
    res.status(201).json(whiteboard);
  } catch (error) {
    next(error);
  }
});

// Update whiteboard
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const updates = req.body;
    updates.lastModifiedBy = req.user._id;
    updates.lastModifiedAt = new Date();
    
    const whiteboard = await Whiteboard.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('createdBy', 'name email')
     .populate('lastModifiedBy', 'name email');
    
    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }
    
    req.io.to(`project:${whiteboard.project}`).emit('whiteboard-updated', {
      whiteboard,
      userId: req.user._id
    });
    
    res.json(whiteboard);
  } catch (error) {
    next(error);
  }
});

// Delete whiteboard
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const whiteboard = await Whiteboard.findById(req.params.id);
    
    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }
    
    const project = await Project.findById(whiteboard.project);
    const canDelete = whiteboard.createdBy.toString() === req.user._id.toString() ||
                      project.createdBy.toString() === req.user._id.toString();
    
    if (!canDelete) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await whiteboard.deleteOne();
    
    req.io.to(`project:${whiteboard.project}`).emit('whiteboard-deleted', {
      whiteboardId: req.params.id,
      userId: req.user._id
    });
    
    res.json({ message: 'Whiteboard deleted' });
  } catch (error) {
    next(error);
  }
});

// Add/update/delete elements
router.post('/:id/elements', authenticate, async (req, res, next) => {
  try {
    const { element } = req.body;
    const whiteboard = await Whiteboard.findById(req.params.id);
    
    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }
    
    element.createdBy = req.user._id;
    whiteboard.elements.push(element);
    whiteboard.lastModifiedBy = req.user._id;
    whiteboard.lastModifiedAt = new Date();
    await whiteboard.save();
    
    // Real-time update via socket already handled by client
    
    res.status(201).json(element);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/elements/:elementId', authenticate, async (req, res, next) => {
  try {
    const { updates } = req.body;
    const whiteboard = await Whiteboard.findById(req.params.id);
    
    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }
    
    const element = whiteboard.elements.id(req.params.elementId);
    if (!element) {
      return res.status(404).json({ message: 'Element not found' });
    }
    
    Object.assign(element, updates);
    whiteboard.lastModifiedBy = req.user._id;
    whiteboard.lastModifiedAt = new Date();
    await whiteboard.save();
    
    res.json(element);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/elements/:elementId', authenticate, async (req, res, next) => {
  try {
    const whiteboard = await Whiteboard.findById(req.params.id);
    
    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }
    
    whiteboard.elements = whiteboard.elements.filter(
      el => el.id !== req.params.elementId
    );
    whiteboard.lastModifiedBy = req.user._id;
    whiteboard.lastModifiedAt = new Date();
    await whiteboard.save();
    
    res.json({ message: 'Element deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
