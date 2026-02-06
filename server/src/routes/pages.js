import express from 'express';
import crypto from 'crypto';
import Page from '../models/Page.js';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all pages for current user across all projects
router.get('/', authenticate, async (req, res) => {
  try {
    // First, find all projects the user is a member of
    const projects = await Project.find({
      $or: [
        { 'members.user': req.user._id },
        { createdBy: req.user._id }
      ]
    }).select('_id');

    const projectIds = projects.map(p => p._id);

    // Get all pages from those projects
    const pages = await Page.find({
      project: { $in: projectIds }
    })
      .sort({ updatedAt: -1 })
      .populate('project', 'name workspace')
      .populate('owner', 'name email');

    res.json(pages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all pages for a project (including subpages)
router.get('/project/:projectId/all', authenticate, async (req, res) => {
  try {
    const { projectId } = req.params;
    const pages = await Page.find({ project: projectId })
      .sort({ updatedAt: -1 })
      .populate('owner', 'name email');

    res.json(pages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all top-level pages for a project
router.get('/project/:projectId', authenticate, async (req, res) => {
  try {
    const { projectId } = req.params;
    const pages = await Page.find({ 
      project: projectId,
      parent: null  // Only get top-level pages
    })
      .sort({ updatedAt: -1 })
      .populate('owner', 'name email');
    
    res.json(pages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get child pages
router.get('/:id/children', authenticate, async (req, res) => {
  try {
    const pages = await Page.find({ 
      parent: req.params.id 
    })
      .sort({ order: 1, updatedAt: -1 })
      .populate('owner', 'name email');
    
    res.json(pages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get breadcrumb for a page
router.get('/:id/breadcrumb', authenticate, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id)
      .populate('project', 'name workspace');
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    const breadcrumb = [];
    
    // Get workspace from project
    const project = await Project.findById(page.project)
      .populate('workspace', 'name');
    
    if (project?.workspace) {
      breadcrumb.push({
        _id: project.workspace._id,
        name: project.workspace.name,
        path: `/workspaces/${project.workspace._id}`,
        icon: '🏢'
      });
    }
    
    // Add project
    if (page.project) {
      breadcrumb.push({
        _id: project._id,
        name: project.name,
        path: `/projects/${project._id}`,
        icon: '📁'
      });
    }
    
    // If page has a parent, build parent chain
    let currentPage = page;
    const pageChain = [];
    
    while (currentPage.parent) {
      currentPage = await Page.findById(currentPage.parent);
      if (currentPage) {
        pageChain.unshift({
          _id: currentPage._id,
          name: currentPage.title || 'Untitled',
          path: `/projects/${page.project}/pages/${currentPage._id}`,
          icon: currentPage.icon
        });
      }
    }
    
    breadcrumb.push(...pageChain);
    
    // Add current page
    breadcrumb.push({
      _id: page._id,
      name: page.title || 'Untitled',
      icon: page.icon
    });
    
    res.json(breadcrumb);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single page
router.get('/:id', authenticate, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id)
      .populate('project', 'name workspace')
      .populate('owner', 'name email')
      .populate('parent', 'title');
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    res.json(page);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create page
router.post('/', authenticate, async (req, res) => {
  try {
    const { project, title, icon, parent, content, isDatabase, properties } = req.body;
    
    // Get workspace from project
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const page = new Page({
      project,
      workspace: projectDoc.workspace,
      owner: req.user._id,
      title: title || 'Untitled',
      icon: icon || '📄',
      parent: parent || null,
      content: content || [{ 
        id: crypto.randomUUID(), 
        type: 'text', 
        content: '' 
      }],
      isDatabase: isDatabase || false,
      properties: properties || []
    });
    
    await page.save();
    await page.populate('owner', 'name email');
    
    // Log activity
    const activity = await Activity.log({
      type: 'page.created',
      user: req.user._id,
      workspace: projectDoc.workspace,
      project: projectDoc._id,
      targetType: 'page',
      targetId: page._id,
      targetName: page.title
    });
    // Emit to project room
    req.io.to(`project:${project}`).emit('activity', activity);

    res.status(201).json(page);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update page
router.put('/:id', authenticate, async (req, res) => {
  try {
    const updates = req.body;
    updates.updatedAt = Date.now();
    
    const page = await Page.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('project', 'name workspace')
     .populate('owner', 'name email');
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    // Log activity only if title changed or significant update
    if (updates.title) {
        const activity = await Activity.log({
          type: 'page.updated',
          user: req.user._id,
          workspace: page.project.workspace,
          project: page.project._id,
          targetType: 'page',
          targetId: page._id,
          targetName: page.title,
          metadata: { changes: [{ field: 'Title', to: updates.title }] }
        });
        req.io.to(`project:${page.project._id}`).emit('activity', activity);
    } 

    res.json(page);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete page
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Check if page has children
    const childCount = await Page.countDocuments({ parent: req.params.id });
    if (childCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete page with subpages. Move or delete subpages first.' 
      });
    }
    
    const page = await Page.findByIdAndDelete(req.params.id);
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Need to fetch project info before deletion for logging, but we only have ID now.
    // Ideally should fetch before delete, but assuming we can get workspace context if we had looked it up.
    // For now, simpler to skip workspace context if we didn't fetch it, or do a fetch before delete.
    // Let's rely on client context or just log what we can. 
    // Actually, let's look up the page before deleting to get context.
    
    // Refactoring to fetch first
    /* 
       Wait, I can't undo the delete line above easily with this tool without changing more context.
       However, the previous block I wrote was:
       const page = await Page.findByIdAndDelete(req.params.id);
       
       I will assume the user is okay with me fetching it first in a cleaner implementation if I were rewriting the whole block, 
       but here I must stick to the replacement chunk constraints.
       
       Actually, `findByIdAndDelete` returns the document found. So `page` variable holds the deleted doc.
       However, it doesn't have populated fields unless I populate them.
       Let's attempt to look up project from the deleted doc's project ID if needed, or just log basic info.
    */
    
    if (page.project) {
        // Try to find project to get workspace link, or just log what we have
        const project = await Project.findById(page.project);
        
        const activity = await Activity.log({
            type: 'page.deleted',
            user: req.user._id,
            workspace: project?.workspace,
            project: page.project,
            targetType: 'page',
            targetId: page._id,
            targetName: page.title
        });
        if (project) {
            req.io.to(`project:${project._id}`).emit('activity', activity);
        }
    }

    res.json({ message: 'Page deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
