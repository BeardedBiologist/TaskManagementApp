import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get current user
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('workspaces.workspace', 'name description');
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update current user profile
router.put('/me', authenticate, [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('timezone').optional().trim().notEmpty(),
  body('theme').optional().trim().isIn(['default', 'ocean', 'forest', 'sunset']),
  body('darkMode').optional().isBoolean()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, timezone, theme, darkMode } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (firstName || lastName) {
      user.name.first = firstName || user.name.first;
      user.name.last = lastName || user.name.last;
    }

    // Update settings
    user.settings = user.settings || {};
    
    if (timezone) {
      user.settings.timezone = timezone;
    }
    
    if (theme) {
      user.settings.theme = theme;
    }
    
    if (darkMode !== undefined) {
      user.settings.darkMode = darkMode;
    }

    await user.save();
    const updated = await User.findById(user._id).populate('workspaces.workspace', 'name description');
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Get all users (for chat)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { limit = 100, excludeSelf = true } = req.query;
    
    const query = {};
    if (excludeSelf === 'true') {
      query._id = { $ne: req.user._id };
    }
    
    const users = await User.find(query)
      .select('name email avatar')
      .sort({ 'name.first': 1 })
      .limit(parseInt(limit));
    
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Search users
router.get('/search', authenticate, async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { 'name.first': { $regex: q, $options: 'i' } },
        { 'name.last': { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
    .select('name email avatar')
    .limit(10);

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email avatar lastActive');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
