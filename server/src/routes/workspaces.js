import express from 'express';
import { body } from 'express-validator';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import WorkspaceInvite from '../models/WorkspaceInvite.js';
import Project from '../models/Project.js';
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

    // Ensure owner has workspace in user profile
    const owner = await User.findById(req.user._id);
    if (owner) {
      const alreadyLinked = owner.workspaces?.some(w => w.workspace.toString() === workspace._id.toString());
      if (!alreadyLinked) {
        owner.workspaces = owner.workspaces || [];
        owner.workspaces.push({ workspace: workspace._id, role: 'owner' });
        await owner.save();
      }
    }

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

    const invites = await WorkspaceInvite.find({ workspace: workspace._id, status: 'pending' }).sort({ createdAt: -1 });

    res.json({ workspace, invites });
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
    const { userId, email, role = 'member' } = req.body;
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

    let targetUser = null;
    if (userId) {
      targetUser = await User.findById(userId);
    } else if (email) {
      targetUser = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!targetUser) {
      if (!email) {
        return res.status(404).json({ message: 'User not found' });
      }
      const inviteEmail = email.toLowerCase().trim();
      const existingInvite = await WorkspaceInvite.findOne({ workspace: workspace._id, email: inviteEmail, status: 'pending' });
      if (!existingInvite) {
        await WorkspaceInvite.create({
          workspace: workspace._id,
          email: inviteEmail,
          role,
          invitedBy: req.user._id
        });
      }
      return res.json({ invited: true });
    }

    // Check if user already member
    const alreadyMember = workspace.members.some(m => m.user.toString() === targetUser._id.toString());
    if (alreadyMember) {
      return res.status(409).json({ message: 'User already a member' });
    }

    workspace.members.push({ user: targetUser._id, role });
    await workspace.save();
    // Add user to all existing projects in this workspace
    await Project.updateMany(
      { workspace: workspace._id, 'members.user': { $ne: targetUser._id } },
      { $push: { members: { user: targetUser._id, role } } }
    );
    await workspace.populate('members.user');

    // Link workspace on user profile
    const alreadyLinked = targetUser.workspaces?.some(w => w.workspace.toString() === workspace._id.toString());
    if (!alreadyLinked) {
      targetUser.workspaces = targetUser.workspaces || [];
      targetUser.workspaces.push({ workspace: workspace._id, role });
      await targetUser.save();
    }

    res.json(workspace);
  } catch (error) {
    next(error);
  }
});

// Get pending invites for workspace
router.get('/:id/invites', authenticate, async (req, res, next) => {
  try {
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

    const invites = await WorkspaceInvite.find({ workspace: workspace._id, status: 'pending' }).sort({ createdAt: -1 });
    res.json(invites);
  } catch (error) {
    next(error);
  }
});

// Delete pending invite
router.delete('/:id/invites/:inviteId', authenticate, async (req, res, next) => {
  try {
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

    const invite = await WorkspaceInvite.findOneAndDelete({
      _id: req.params.inviteId,
      workspace: workspace._id
    });

    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    res.json({ message: 'Invite deleted' });
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
