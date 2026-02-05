import express from 'express';
import Activity from '../models/Activity.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get activity feed for a project
router.get('/project/:projectId', authenticate, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { limit = 50, before } = req.query;
    
    // Check access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const isMember = project.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember && project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const query = { project: projectId };
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }
    
    const activities = await Activity.find(query)
      .populate('user', 'name email avatar')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(activities);
  } catch (error) {
    next(error);
  }
});

// Get activity feed for a workspace
router.get('/workspace/:workspaceId', authenticate, async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { limit = 50, before } = req.query;
    
    const query = { workspace: workspaceId };
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }
    
    const activities = await Activity.find(query)
      .populate('user', 'name email avatar')
      .populate('project', 'name')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(activities);
  } catch (error) {
    next(error);
  }
});

// Get user's recent activity
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    
    const activities = await Activity.find({ user: req.user._id })
      .populate('project', 'name')
      .populate('workspace', 'name')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(activities);
  } catch (error) {
    next(error);
  }
});

// Get activity feed across all user workspaces/projects
router.get('/all', authenticate, async (req, res, next) => {
  try {
    const { limit = 50, before } = req.query;

    const user = await User.findById(req.user._id);
    const workspaceIds = (user?.workspaces || []).map(w => w.workspace);

    const query = { workspace: { $in: workspaceIds } };
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    const activities = await Activity.find(query)
      .populate('user', 'name email avatar')
      .populate('project', 'name')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json(activities);
  } catch (error) {
    next(error);
  }
});

// Create activity (internal use)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const activity = await Activity.log({
      ...req.body,
      user: req.user._id
    });
    
    // Emit to relevant rooms
    if (activity.project) {
      req.io.to(`project:${activity.project}`).emit('activity', activity);
    }
    if (activity.workspace) {
      req.io.to(`workspace:${activity.workspace}`).emit('activity', activity);
    }
    
    res.status(201).json(activity);
  } catch (error) {
    next(error);
  }
});

// Get activity statistics
router.get('/project/:projectId/stats', authenticate, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const stats = await Activity.aggregate([
      { $match: { project: project._id, timestamp: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // User activity
    const userStats = await Activity.aggregate([
      { $match: { project: project._id, timestamp: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    await Activity.populate(userStats, { path: '_id', select: 'name email' });
    
    res.json({
      activityTypes: stats,
      topContributors: userStats
    });
  } catch (error) {
    next(error);
  }
});

export default router;
