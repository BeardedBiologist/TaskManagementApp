import express from 'express';
import { body } from 'express-validator';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function normalizeDueDateInput(value) {
  if (!value) return null;
  if (typeof value === 'string' && DATE_KEY_REGEX.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 12));
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12));
}

function formatDueDateOutput(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function sanitizeTask(task) {
  const obj = typeof task.toObject === 'function' ? task.toObject() : { ...task };
  obj.dueDate = formatDueDateOutput(obj.dueDate);
  return obj;
}

function normalizeId(value) {
  if (!value) return null;
  return value.toString();
}

function normalizeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function normalizeLabel(label) {
  if (!label) return null;
  return `${label.name || ''}|${label.color || ''}`.toLowerCase();
}

function normalizeAttachment(attachment) {
  if (!attachment) return null;
  return normalizeId(attachment._id) || attachment.url || attachment.name || null;
}

function normalizeSubtask(subtask) {
  if (!subtask) return null;
  return normalizeId(subtask._id) || subtask.title || null;
}

function collectChanges(original, updated, project) {
  const changes = [];

  const simpleFields = [
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'priority', label: 'Priority' },
    { key: 'columnId', label: 'Status' }
  ];

  simpleFields.forEach(({ key, label }) => {
    const from = original[key] ?? null;
    const to = updated[key] ?? null;
    if ((from ?? null) !== (to ?? null)) {
      let fromValue = from;
      let toValue = to;
      if (key === 'columnId' && project?.columns) {
        const fromColumn = project.columns.find(c => c.id === from);
        const toColumn = project.columns.find(c => c.id === to);
        fromValue = fromColumn?.title || from;
        toValue = toColumn?.title || to;
      }
      changes.push({ field: label, from: fromValue, to: toValue });
    }
  });

  const fromDue = formatDueDateOutput(original.dueDate);
  const toDue = formatDueDateOutput(updated.dueDate);
  if (fromDue !== toDue) {
    changes.push({ field: 'Due Date', from: fromDue, to: toDue });
  }

  const fromStart = normalizeDate(original.timeTracking?.startedAt);
  const toStart = normalizeDate(updated.timeTracking?.startedAt);
  if (fromStart !== toStart) {
    changes.push({ field: 'Start', from: fromStart, to: toStart });
  }

  const timeFields = [
    { key: 'estimated', label: 'Estimated' },
    { key: 'spent', label: 'Spent' },
    { key: 'isRunning', label: 'Timer' }
  ];
  timeFields.forEach(({ key, label }) => {
    const from = original.timeTracking?.[key] ?? null;
    const to = updated.timeTracking?.[key] ?? null;
    if ((from ?? null) !== (to ?? null)) {
      changes.push({ field: `Time ${label}`, from, to });
    }
  });

  const fromAssignees = new Set((original.assignees || []).map(normalizeId));
  const toAssignees = new Set((updated.assignees || []).map(normalizeId));
  const addedAssignees = [...toAssignees].filter(id => id && !fromAssignees.has(id));
  const removedAssignees = [...fromAssignees].filter(id => id && !toAssignees.has(id));
  if (addedAssignees.length || removedAssignees.length) {
    changes.push({ field: 'Assignees', added: addedAssignees, removed: removedAssignees });
  }

  const fromLabels = new Set((original.labels || []).map(normalizeLabel).filter(Boolean));
  const toLabels = new Set((updated.labels || []).map(normalizeLabel).filter(Boolean));
  const addedLabels = [...toLabels].filter(label => !fromLabels.has(label));
  const removedLabels = [...fromLabels].filter(label => !toLabels.has(label));
  if (addedLabels.length || removedLabels.length) {
    changes.push({ field: 'Labels', added: addedLabels, removed: removedLabels });
  }

  const fromAttachments = new Set((original.attachments || []).map(normalizeAttachment).filter(Boolean));
  const toAttachments = new Set((updated.attachments || []).map(normalizeAttachment).filter(Boolean));
  const addedAttachments = [...toAttachments].filter(item => !fromAttachments.has(item));
  const removedAttachments = [...fromAttachments].filter(item => !toAttachments.has(item));
  if (addedAttachments.length || removedAttachments.length) {
    changes.push({ field: 'Attachments', added: addedAttachments, removed: removedAttachments });
  }

  const fromSubtasks = new Map((original.subtasks || []).map(subtask => [normalizeSubtask(subtask), subtask]));
  const toSubtasks = new Map((updated.subtasks || []).map(subtask => [normalizeSubtask(subtask), subtask]));
  const addedSubtasks = [];
  const removedSubtasks = [];
  const toggledSubtasks = [];

  fromSubtasks.forEach((subtask, key) => {
    if (!toSubtasks.has(key)) {
      removedSubtasks.push(subtask);
    } else {
      const updatedSubtask = toSubtasks.get(key);
      if (subtask.completed !== updatedSubtask.completed) {
        toggledSubtasks.push({
          title: updatedSubtask.title,
          completed: updatedSubtask.completed
        });
      }
    }
  });

  toSubtasks.forEach((subtask, key) => {
    if (!fromSubtasks.has(key)) {
      addedSubtasks.push(subtask);
    }
  });

  if (addedSubtasks.length || removedSubtasks.length || toggledSubtasks.length) {
    changes.push({
      field: 'Checklist',
      added: addedSubtasks.map(item => item.title),
      removed: removedSubtasks.map(item => item.title),
      toggled: toggledSubtasks
    });
  }

  return changes;
}

// Create task
router.post('/', authenticate, [
  body('title').trim().notEmpty()
], async (req, res, next) => {
  try {
    const { title, description, projectId, pageId, workspace, columnId, assignees, priority, dueDate, labels } = req.body;

    // Task can belong to either a project OR a page
    let taskWorkspace = workspace;
    let taskProject = null;
    let taskPage = null;

    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check access
      const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
      if (!isMember && project.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      taskProject = projectId;
      taskWorkspace = project.workspace;
    } else if (pageId) {
      const Page = (await import('../models/Page.js')).default;
      const page = await Page.findById(pageId);
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      taskPage = pageId;
      taskWorkspace = page.workspace;
    } else if (!workspace) {
      return res.status(400).json({ message: 'Either projectId, pageId, or workspace is required' });
    }

    // Get max order in column (only for project tasks)
    let order = 0;
    if (taskProject) {
      const maxOrderTask = await Task.findOne({ project: taskProject, columnId: columnId || 'todo' })
        .sort({ order: -1 })
        .limit(1);
      order = maxOrderTask ? maxOrderTask.order + 1 : 0;
    }

    const task = await Task.create({
      title,
      description,
      project: taskProject,
      page: taskPage,
      workspace: taskWorkspace,
      columnId: columnId || 'todo',
      order,
      assignees: assignees || [],
      priority: priority || 'medium',
      dueDate: normalizeDueDateInput(dueDate),
      labels: labels || [],
      createdBy: req.user._id
    });

    await task.populate('assignees createdBy');

    const taskPayload = sanitizeTask(task);

    // Emit to project room if it's a project task
    if (taskProject) {
      req.io.to(`project:${taskProject}`).emit('task-created', taskPayload);

      const activity = await Activity.log({
        type: 'task.created',
        user: req.user._id,
        workspace: taskWorkspace,
        project: taskProject,
        targetType: 'task',
        targetId: task._id,
        targetName: task.title
      });
      req.io.to(`project:${taskProject}`).emit('activity', activity);
    }

    res.status(201).json(taskPayload);
  } catch (error) {
    next(error);
  }
});

// Get all tasks for current user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const tasks = await Task.find({
      $or: [
        { createdBy: req.user._id },
        { assignees: req.user._id }
      ]
    })
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('project', 'name')
    .populate('page', 'title icon')
    .sort({ createdAt: -1 });

    res.json(tasks.map(sanitizeTask));
  } catch (error) {
    next(error);
  }
});

// Get tasks for a page
router.get('/page/:pageId', authenticate, async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const tasks = await Task.find({ page: pageId })
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(tasks.map(sanitizeTask));
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

    res.json(sanitizeTask(task));
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

    const originalSnapshot = task.toObject({ depopulate: true });
    const updates = req.body;
    if (Object.prototype.hasOwnProperty.call(updates, 'dueDate')) {
      updates.dueDate = normalizeDueDateInput(updates.dueDate);
    }
    Object.assign(task, updates);
    await task.save();
    await task.populate('assignees createdBy');

    // Emit update
    const updatedPayload = sanitizeTask(task);
    req.io.to(`project:${task.project}`).emit('task-updated', updatedPayload);

    const updatedSnapshot = task.toObject({ depopulate: true });
    const changes = collectChanges(originalSnapshot, updatedSnapshot, project);

    if (changes.length > 0) {
      const assigneeIds = changes
        .filter(change => change.field === 'Assignees')
        .flatMap(change => [...(change.added || []), ...(change.removed || [])]);
      const userIds = [...new Set(assigneeIds.filter(Boolean))];
      let userNameMap = {};

      if (userIds.length > 0) {
        const users = await User.find({ _id: { $in: userIds } }).select('name');
        userNameMap = users.reduce((acc, user) => {
          const fullName = `${user.name?.first || ''} ${user.name?.last || ''}`.trim();
          acc[user._id.toString()] = fullName || user._id.toString();
          return acc;
        }, {});
      }

      const enrichedChanges = changes.map(change => {
        if (change.field === 'Assignees') {
          return {
            ...change,
            added: (change.added || []).map(id => userNameMap[id] || id),
            removed: (change.removed || []).map(id => userNameMap[id] || id)
          };
        }
        if (change.field === 'Labels') {
          return {
            ...change,
            added: (change.added || []).map(label => label.split('|')[0] || label),
            removed: (change.removed || []).map(label => label.split('|')[0] || label)
          };
        }
        if (change.field === 'Attachments') {
          return {
            ...change,
            added: (change.added || []).map(item => item.split('/').pop() || item),
            removed: (change.removed || []).map(item => item.split('/').pop() || item)
          };
        }
        return change;
      });

      const activity = await Activity.log({
        type: 'task.updated',
        user: req.user._id,
        workspace: project.workspace,
        project: project._id,
        targetType: 'task',
        targetId: task._id,
        targetName: task.title,
        metadata: { changes: enrichedChanges }
      });
      req.io.to(`project:${task.project}`).emit('activity', activity);
    }

    res.json(updatedPayload);
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
    const movedPayload = sanitizeTask(task);
    req.io.to(`project:${task.project}`).emit('task-moved', {
      task: movedPayload,
      oldColumnId,
      newColumnId: columnId,
      newOrder: order
    });

    const fromColumn = project.columns?.find(c => c.id === oldColumnId)
    const toColumn = project.columns?.find(c => c.id === columnId)
    const activity = await Activity.log({
      type: 'task.moved',
      user: req.user._id,
      workspace: project.workspace,
      project: project._id,
      targetType: 'task',
      targetId: task._id,
      targetName: task.title,
      metadata: {
        from: oldColumnId,
        to: columnId,
        fromName: fromColumn?.title || oldColumnId,
        toName: toColumn?.title || columnId
      }
    });
    req.io.to(`project:${task.project}`).emit('activity', activity);

    res.json(movedPayload);
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

    const activity = await Activity.log({
      type: 'task.comment.added',
      user: req.user._id,
      workspace: project.workspace,
      project: project._id,
      targetType: 'task',
      targetId: task._id,
      targetName: task.title,
      metadata: { commentId: newComment._id }
    });
    req.io.to(`project:${project._id}`).emit('activity', activity);

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

    const activity = await Activity.log({
      type: 'task.deleted',
      user: req.user._id,
      workspace: project.workspace,
      project: project._id,
      targetType: 'task',
      targetId: task._id,
      targetName: task.title
    });
    req.io.to(`project:${task.project}`).emit('activity', activity);

    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
