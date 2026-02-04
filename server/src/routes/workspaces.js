import express from 'express';
import { body } from 'express-validator';
import Workspace from '../models/Workspace.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all workspaces for current user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .populate('projects', 'name description settings.isArchived');

    res.json(workspaces);
  } catch (error) {
    next(error);
  }
});

// Create workspace
router.post('/', authenticate, [
  body('name').trim().notEmpty()
], async (req, res, next) => {
  try {
    const { name, description, settings } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
      settings
    });

    await workspace.populate('owner members.user');

    res.status(201).json(workspace);
  } catch (error) {
    next(error);
  }
});

// Get single workspace
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('projects');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is member or owner
    const isMember = workspace.members.some(m => m.user._id.toString() === req.user._id.toString());
    const isOwner = workspace.owner._id.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(workspace);
  } catch (error) {
    next(error);
  }
});

// Update workspace
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Only owner or admin can update
    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const member = workspace.members.find(m => m.user.toString() === req.user._id.toString());
    const isAdmin = member?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = req.body;
    Object.assign(workspace, updates);
    await workspace.save();
    await workspace.populate('owner members.user');

    res.json(workspace);
  } catch (error) {
    next(error);
  }
});

// Add member to workspace
router.post('/:id/members', authenticate, async (req, res, next) => {
  try {
    const { userId, role = 'member' } = req.body;
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const member = workspace.members.find(m => m.user.toString() === req.user._id.toString());
    const isAdmin = member?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if user already member
    const alreadyMember = workspace.members.some(m => m.user.toString() === userId);
    if (alreadyMember) {
      return res.status(409).json({ message: 'User already a member' });
    }

    workspace.members.push({ user: userId, role });
    await workspace.save();
    await workspace.populate('members.user');

    res.json(workspace);
  } catch (error) {
    next(error);
  }
});

// Delete workspace
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can delete workspace' });
    }

    await workspace.deleteOne();
    res.json({ message: 'Workspace deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
