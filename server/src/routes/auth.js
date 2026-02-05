import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import Workspace from '../models/Workspace.js';
import WorkspaceInvite from '../models/WorkspaceInvite.js';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';

const router = express.Router();

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('timezone').optional().trim().notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, timezone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const user = await User.create({
      email,
      password,
      name: { first: firstName, last: lastName },
      ...(timezone ? { settings: { timezone } } : {})
    });

    // Attach any pending workspace invites by email
    const pendingInvites = await WorkspaceInvite.find({ email: email.toLowerCase().trim(), status: 'pending' });
    for (const invite of pendingInvites) {
      const workspace = await Workspace.findById(invite.workspace);
      if (!workspace) continue;

      const alreadyMember = workspace.members.some(m => m.user.toString() === user._id.toString());
      if (!alreadyMember) {
        workspace.members.push({ user: user._id, role: invite.role || 'member' });
        await workspace.save();
      }

      const alreadyLinked = user.workspaces?.some(w => w.workspace.toString() === workspace._id.toString());
      if (!alreadyLinked) {
        user.workspaces = user.workspaces || [];
        user.workspaces.push({ workspace: workspace._id, role: invite.role || 'member' });
      }

      // Add user to all existing projects in this workspace
      await Project.updateMany(
        { workspace: workspace._id, 'members.user': { $ne: user._id } },
        { $push: { members: { user: user._id, role: invite.role || 'member' } } }
      );

      invite.status = 'accepted';
      await invite.save();
    }

    if (pendingInvites.length > 0) {
      await user.save();
    }

    // Log activity
    await Activity.log({
      type: 'user.joined',
      user: user._id,
      targetType: 'user',
      targetId: user._id,
      targetName: `${user.name.first} ${user.name.last}`
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.lastActive = new Date();
    await user.save();

    // Log activity
    await Activity.log({
      type: 'user.login',
      user: user._id,
      targetType: 'user',
      targetId: user._id,
      targetName: `${user.name.first} ${user.name.last}`
    });

    const token = generateToken(user._id);

    res.json({
      token,
      user
    });
  } catch (error) {
    next(error);
  }
});

export default router;
