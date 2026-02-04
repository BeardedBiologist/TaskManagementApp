import express from 'express';
import crypto from 'crypto';
import Page from '../models/Page.js';
import Project from '../models/Project.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all pages for a project
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
    
    res.json({ message: 'Page deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
