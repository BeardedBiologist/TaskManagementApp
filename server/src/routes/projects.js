import express from 'express';
import { body } from 'express-validator';
import Project from '../models/Project.js';
import Workspace from '../models/Workspace.js';
import Task from '../models/Task.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function formatDueDateOutput(value) {
  if (!value) return null;
  if (typeof value === 'string' && DATE_KEY_REGEX.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function sanitizeTask(task) {
  const obj = typeof task.toObject === 'function' ? task.toObject() : { ...task };
  obj.dueDate = formatDueDateOutput(obj.dueDate);
  return obj;
}

// Get all projects
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { workspaceId } = req.query;
    const query = {
      $or: [
        { createdBy: req.user._id },
        { 'members.user': req.user._id }
      ]
    };

    if (workspaceId) {
      query.workspace = workspaceId;
    }

    const projects = await Project.find(query)
      .populate('workspace', 'name')
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// Create project
router.post('/', authenticate, [
  body('name').trim().notEmpty(),
  body('workspaceId').notEmpty()
], async (req, res, next) => {
  try {
    const { name, description, workspaceId, columns } = req.body;

    // Check workspace access
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const isMember = workspace.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember && workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied to workspace' });
    }

    const defaultColumns = [
      { id: 'todo', title: 'To Do', order: 0, color: '#e2e8f0' },
      { id: 'inprogress', title: 'In Progress', order: 1, color: '#dbeafe' },
      { id: 'review', title: 'Review', order: 2, color: '#fef3c7' },
      { id: 'done', title: 'Done', order: 3, color: '#d1fae5' }
    ];

    const workspaceMembers = workspace.members || [];
    if (!workspaceMembers.some(m => m.user.toString() === req.user._id.toString())) {
      workspaceMembers.push({ user: req.user._id, role: 'admin' });
    }
    const members = workspaceMembers.length
      ? workspaceMembers.map(member => ({
          user: member.user,
          role: member.role === 'admin' ? 'admin' : 'member'
        }))
      : [{ user: req.user._id, role: 'admin' }];

    const project = await Project.create({
      name,
      description,
      workspace: workspaceId,
      createdBy: req.user._id,
      members,
      columns: columns || defaultColumns
    });

    // Add project to workspace
    workspace.projects.push(project._id);
    await workspace.save();

    await project.populate('workspace createdBy members.user');

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

// Get single project with tasks
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('workspace', 'name')
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember && project.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get tasks for this project
    const tasks = await Task.find({ project: project._id, isArchived: false })
      .populate('assignees', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ order: 1 });

    res.json({ project, tasks: tasks.map(sanitizeTask) });
  } catch (error) {
    next(error);
  }
});

// Update project
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
    const memberRole = project.members.find(m => m.user.toString() === req.user._id.toString())?.role;

    if (!isMember && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = req.body;
    Object.assign(project, updates);
    await project.save();
    await project.populate('workspace createdBy members.user');

    // Emit update to project room
    req.io.to(`project:${project._id}`).emit('project-updated', project);

    res.json(project);
  } catch (error) {
    next(error);
  }
});

// Add member to project (must be workspace member)
router.post('/:id/members', authenticate, async (req, res, next) => {
  try {
    const { userId, role = 'member' } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const member = project.members.find(m => m.user.toString() === req.user._id.toString());
    const isAdmin = member?.role === 'admin' || project.createdBy.toString() === req.user._id.toString();
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const workspace = await Workspace.findById(project.workspace);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const isWorkspaceMember = workspace.members.some(m => m.user.toString() === userId) || workspace.owner.toString() === userId;
    if (!isWorkspaceMember) {
      return res.status(400).json({ message: 'User must be a workspace member first' });
    }

    const alreadyMember = project.members.some(m => m.user.toString() === userId);
    if (alreadyMember) {
      return res.status(409).json({ message: 'User already a project member' });
    }

    project.members.push({ user: userId, role });
    await project.save();
    await project.populate('workspace createdBy members.user');

    req.io.to(`project:${project._id}`).emit('project-updated', project);

    res.json(project);
  } catch (error) {
    next(error);
  }
});

// Sync project members with workspace members
router.post('/:id/sync-members', authenticate, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const member = project.members.find(m => m.user.toString() === req.user._id.toString());
    const isAdmin = member?.role === 'admin' || project.createdBy.toString() === req.user._id.toString();
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const workspace = await Workspace.findById(project.workspace);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const existingMemberIds = new Set(project.members.map(m => m.user.toString()));
    const additions = [];

    for (const wsMember of workspace.members || []) {
      const userId = wsMember.user.toString();
      if (!existingMemberIds.has(userId)) {
        additions.push({ user: wsMember.user, role: wsMember.role === 'admin' ? 'admin' : 'member' });
      }
    }

    if (additions.length > 0) {
      project.members.push(...additions);
      await project.save();
    }

    await project.populate('workspace createdBy members.user');
    req.io.to(`project:${project._id}`).emit('project-updated', project);

    res.json({ project, added: additions.length });
  } catch (error) {
    next(error);
  }
});

// Delete project
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const member = project.members.find(m => m.user.toString() === req.user._id.toString());
    const isAdmin = member?.role === 'admin' || project.createdBy.toString() === req.user._id.toString();

    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Remove project from workspace
    await Workspace.findByIdAndUpdate(project.workspace, {
      $pull: { projects: project._id }
    });

    // Archive tasks instead of deleting
    await Task.updateMany({ project: project._id }, { isArchived: true });

    await project.deleteOne();

    res.json({ message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
