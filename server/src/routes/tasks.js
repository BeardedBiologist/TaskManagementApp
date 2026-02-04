import express from 'express';
import { body } from 'express-validator';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Create task
router.post('/', authenticate, [
  body('title').trim().notEmpty(),
  body('projectId').notEmpty(),
  body('columnId').notEmpty()
], async (req, res, next) => {
  try {
    const { title, description, projectId, columnId, assignees, priority, dueDate, labels } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access
    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get max order in column
    const maxOrderTask = await Task.findOne({ project: projectId, columnId })
      .sort({ order: -1 })
      .limit(1);
    const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      project: projectId,
      workspace: project.workspace,
      columnId,
      order,
      assignees: assignees || [],
      priority: priority || 'medium',
      dueDate,
      labels: labels || [],
      createdBy: req.user._id
    });

    await task.populate('assignees createdBy');

    // Emit to project room
    req.io.to(`project:${projectId}`).emit('task-created', task);

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

// Get single task
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.author', 'name email avatar')
      .populate('attachments.uploadedBy', 'name email avatar')
      .populate('project', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());

    if (!isMember && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

// Update task
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());

    if (!isMember && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = req.body;
    Object.assign(task, updates);
    await task.save();
    await task.populate('assignees createdBy');

    // Emit update
    req.io.to(`project:${task.project}`).emit('task-updated', task);

    res.json(task);
  } catch (error) {
    next(error);
  }
});

// Move task (drag and drop)
router.post('/:id/move', authenticate, async (req, res, next) => {
  try {
    const { columnId, order } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());

    if (!isMember && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const oldColumnId = task.columnId;
    task.columnId = columnId;
    task.order = order;
    await task.save();

    await task.populate('assignees createdBy');

    // Emit move event
    req.io.to(`project:${task.project}`).emit('task-moved', {
      task,
      oldColumnId,
      newColumnId: columnId,
      newOrder: order
    });

    res.json(task);
  } catch (error) {
    next(error);
  }
});

// Add comment
router.post('/:id/comments', authenticate, [
  body('content').trim().notEmpty()
], async (req, res, next) => {
  try {
    const { content } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());

    if (!isMember && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const comment = {
      author: req.user._id,
      content,
      createdAt: new Date()
    };

    task.comments.push(comment);
    await task.save();
    await task.populate('comments.author', 'name email avatar');

    const newComment = task.comments[task.comments.length - 1];
    req.io.to(`project:${task.project}`).emit('task-comment-added', { taskId: task._id, comment: newComment });

    res.status(201).json(newComment);
  } catch (error) {
    next(error);
  }
});

// Delete task
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
    const member = project.members.find(m => m.user.toString() === req.user._id.toString());

    // Only task creator, project admin, or assignee can delete
    const canDelete = task.createdBy.toString() === req.user._id.toString() ||
                      member?.role === 'admin' ||
                      project.createdBy.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await task.deleteOne();

    req.io.to(`project:${task.project}`).emit('task-deleted', { taskId: task._id, columnId: task.columnId });

    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
