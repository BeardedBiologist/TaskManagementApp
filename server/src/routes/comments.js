import express from 'express';
import Comment from '../models/Comment.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get comments for a target
router.get('/:targetType/:targetId', authenticate, async (req, res, next) => {
  try {
    const { targetType, targetId } = req.params;
    
    const comments = await Comment.find({ targetType, targetId })
      .populate('author', 'name email avatar')
      .populate('replies.author', 'name email avatar')
      .populate('mentions', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    next(error);
  }
});

// Create comment
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { targetType, targetId, content, position, projectId, workspaceId } = req.body;
    
    // Extract mentions from content (@username) and resolve to user IDs
    const mentionRegex = /@(\w+)/g;
    const mentionNames = [...content.matchAll(mentionRegex)].map(m => m[1]);
    let resolvedMentionIds = [];
    let resolvedMentionUsers = [];
    if (mentionNames.length > 0) {
      const regexArray = mentionNames.map(name => new RegExp(`^${name}$`, 'i'));
      resolvedMentionUsers = await User.find({ 'name.first': { $in: regexArray } });
      resolvedMentionIds = resolvedMentionUsers.map(u => u._id);
    }

    const comment = await Comment.create({
      targetType,
      targetId,
      content,
      position,
      author: req.user._id,
      project: projectId,
      workspace: workspaceId,
      mentions: resolvedMentionIds
    });

    await comment.populate('author', 'name email avatar');

    // Emit to room
    const roomName = `${targetType}:${targetId}`;
    req.io.to(roomName).emit('comment-added', comment);

    // Also emit to project for activity feed
    req.io.to(`project:${projectId}`).emit('activity', {
      type: `${targetType}.comment.added`,
      user: req.user._id,
      project: projectId,
      targetType,
      targetId,
      metadata: { commentId: comment._id }
    });

    // Send mention notifications
    const commenterId = req.user._id.toString();
    const commenterName = `${req.user.name.first} ${req.user.name.last}`.trim();
    for (const mentioned of resolvedMentionUsers) {
      const mentionedId = mentioned._id.toString();
      if (mentionedId === commenterId) continue;
      await Notification.send(req.io, {
        recipient: mentionedId,
        type: 'mention',
        message: `<strong>${commenterName}</strong> mentioned you in a comment`,
        link: projectId ? `/projects/${projectId}` : null,
        data: { commentId: comment._id.toString(), targetType, targetId, projectId: projectId || null }
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

// Add reply
router.post('/:id/replies', authenticate, async (req, res, next) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    comment.replies.push({
      content,
      author: req.user._id
    });
    
    await comment.save();
    await comment.populate('replies.author', 'name email avatar');
    
    const roomName = `${comment.targetType}:${comment.targetId}`;
    req.io.to(roomName).emit('comment-reply-added', {
      commentId: comment._id,
      reply: comment.replies[comment.replies.length - 1]
    });
    
    res.json(comment);
  } catch (error) {
    next(error);
  }
});

// Resolve comment
router.put('/:id/resolve', authenticate, async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    comment.status = 'resolved';
    comment.resolvedBy = req.user._id;
    comment.resolvedAt = new Date();
    
    await comment.save();
    await comment.populate('resolvedBy', 'name email');
    
    const roomName = `${comment.targetType}:${comment.targetId}`;
    req.io.to(roomName).emit('comment-resolved', {
      commentId: comment._id,
      resolvedBy: comment.resolvedBy,
      resolvedAt: comment.resolvedAt
    });
    
    res.json(comment);
  } catch (error) {
    next(error);
  }
});

// Reopen comment
router.put('/:id/reopen', authenticate, async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    comment.status = 'open';
    comment.resolvedBy = null;
    comment.resolvedAt = null;
    
    await comment.save();
    
    const roomName = `${comment.targetType}:${comment.targetId}`;
    req.io.to(roomName).emit('comment-reopened', {
      commentId: comment._id
    });
    
    res.json(comment);
  } catch (error) {
    next(error);
  }
});

// Delete comment
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Only author or project admin can delete
    const project = await Project.findById(comment.project);
    const canDelete = comment.author.toString() === req.user._id.toString() ||
                      project.createdBy.toString() === req.user._id.toString();
    
    if (!canDelete) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await comment.deleteOne();
    
    const roomName = `${comment.targetType}:${comment.targetId}`;
    req.io.to(roomName).emit('comment-deleted', {
      commentId: req.params.id
    });
    
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
