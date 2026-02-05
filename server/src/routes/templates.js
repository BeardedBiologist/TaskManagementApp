import express from 'express';
import Template from '../models/Template.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get templates
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { type, visibility, workspaceId, featured } = req.query;
    
    let query = {};
    
    if (type) query.type = type;
    if (featured === 'true') query.isFeatured = true;
    
    if (visibility === 'public') {
      query.visibility = 'public';
    } else if (visibility === 'workspace' && workspaceId) {
      query.$or = [
        { visibility: 'public' },
        { visibility: 'workspace', workspace: workspaceId },
        { createdBy: req.user._id }
      ];
    } else {
      // Default: user's own templates + public templates
      query.$or = [
        { visibility: 'public' },
        { createdBy: req.user._id }
      ];
    }
    
    const templates = await Template.find(query)
      .populate('createdBy', 'name email')
      .populate('workspace', 'name')
      .sort({ usageCount: -1, createdAt: -1 });
    
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

// Get single template
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('workspace', 'name');
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    next(error);
  }
});

// Create template
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, description, type, data, visibility, workspaceId, tags } = req.body;
    
    const template = await Template.create({
      name,
      description,
      type,
      data,
      visibility: visibility || 'private',
      workspace: workspaceId,
      createdBy: req.user._id,
      tags: tags || []
    });
    
    await template.populate('createdBy', 'name email');
    
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

// Update template
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    if (template.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updates = req.body;
    Object.assign(template, updates);
    await template.save();
    
    res.json(template);
  } catch (error) {
    next(error);
  }
});

// Delete template
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    if (template.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await template.deleteOne();
    res.json({ message: 'Template deleted' });
  } catch (error) {
    next(error);
  }
});

// Use template (increment usage count)
router.post('/:id/use', authenticate, async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    template.usageCount += 1;
    await template.save();
    
    res.json({ template, message: 'Template applied' });
  } catch (error) {
    next(error);
  }
});

// Get default templates (seeds)
router.get('/defaults/:type', authenticate, async (req, res, next) => {
  try {
    const { type } = req.params;
    
    const defaultTemplates = {
      project: [
        {
          name: 'Kanban Board',
          description: 'Standard kanban with To Do, In Progress, Done',
          type: 'project',
          data: {
            columns: [
              { id: 'todo', title: 'To Do', color: '#8b5cf6' },
              { id: 'inprogress', title: 'In Progress', color: '#06b6d4' },
              { id: 'done', title: 'Done', color: '#10b981' }
            ]
          }
        },
        {
          name: 'Sprint Planning',
          description: 'Agile sprint board with backlog',
          type: 'project',
          data: {
            columns: [
              { id: 'backlog', title: 'Backlog', color: '#6b7280' },
              { id: 'todo', title: 'To Do', color: '#8b5cf6' },
              { id: 'inprogress', title: 'In Progress', color: '#06b6d4' },
              { id: 'review', title: 'Review', color: '#f59e0b' },
              { id: 'done', title: 'Done', color: '#10b981' }
            ]
          }
        }
      ],
      checklist: [
        {
          name: 'Project Kickoff',
          description: 'Essential tasks to start a new project',
          type: 'checklist',
          data: {
            items: [
              { text: 'Define project scope', checked: false },
              { text: 'Set up team members', checked: false },
              { text: 'Create project wiki', checked: false },
              { text: 'Schedule kickoff meeting', checked: false },
              { text: 'Set up integrations', checked: false }
            ]
          }
        },
        {
          name: 'Release Checklist',
          description: 'Pre-release verification steps',
          type: 'checklist',
          data: {
            items: [
              { text: 'All tests passing', checked: false },
              { text: 'Documentation updated', checked: false },
              { text: 'Staging environment verified', checked: false },
              { text: 'Rollback plan ready', checked: false },
              { text: 'Team notified', checked: false }
            ]
          }
        }
      ]
    };
    
    res.json(defaultTemplates[type] || []);
  } catch (error) {
    next(error);
  }
});

export default router;
