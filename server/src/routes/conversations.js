import express from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all conversations for current user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'name email avatar')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    
    // Add unread count for current user to each conversation
    const conversationsWithUnread = conversations.map(conv => {
      const convObj = conv.toObject();
      convObj.unreadCount = conv.getUnreadCount(req.user._id);
      return convObj;
    });
    
    res.json(conversationsWithUnread);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    next(error);
  }
});

// Create or get direct conversation with a user
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { participantId, type = 'direct' } = req.body;
    
    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }
    
    if (type === 'direct') {
      // Find or create direct conversation
      const conversation = await Conversation.findOrCreateDirect(
        req.user._id,
        participantId
      );
      
      // Populate last message if exists
      if (conversation.lastMessage) {
        await conversation.populate('lastMessage');
      }
      
      const convObj = conversation.toObject();
      convObj.unreadCount = conversation.getUnreadCount(req.user._id);
      
      res.json(convObj);
    } else {
      // Group conversation creation
      const { name, participantIds } = req.body;
      
      if (!name || !participantIds || !Array.isArray(participantIds)) {
        return res.status(400).json({ 
          message: 'Name and participantIds array are required for group conversations' 
        });
      }
      
      const allParticipants = [...new Set([req.user._id.toString(), ...participantIds])];
      
      const conversation = await Conversation.create({
        type: 'group',
        name,
        participants: allParticipants,
        createdBy: req.user._id,
        unreadCounts: allParticipants.map(id => ({ user: id, count: 0 }))
      });
      
      await conversation.populate('participants', 'name email avatar');
      
      res.status(201).json(conversation);
    }
  } catch (error) {
    console.error('Error creating conversation:', error);
    next(error);
  }
});

// Get messages for a conversation
router.get('/:id/messages', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 50, before } = req.query;
    
    // Check if user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: id,
      participants: req.user._id
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Build query
    const query = { conversation: id, isDeleted: false };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    
    const messages = await Message.find(query)
      .populate('sender', 'name email avatar')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    // Mark messages as read
    messages.forEach(msg => {
      if (msg.sender._id.toString() !== req.user._id.toString()) {
        msg.markAsRead(req.user._id);
      }
    });
    await Promise.all(messages.map(m => m.save()));
    
    // Clear unread count for this conversation
    conversation.clearUnread(req.user._id);
    await conversation.save();
    
    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    next(error);
  }
});

// Send a message
router.post('/:id/messages', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, attachments, replyTo } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    // Check if user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: id,
      participants: req.user._id
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Create message
    const message = await Message.create({
      conversation: id,
      sender: req.user._id,
      content: content.trim(),
      attachments: attachments || [],
      replyTo: replyTo || undefined,
      readBy: [{ user: req.user._id }]
    });
    
    // Populate sender info
    await message.populate('sender', 'name email avatar');
    
    // Update conversation
    conversation.lastMessage = message._id;
    conversation.incrementUnread(req.user._id);
    await conversation.save();
    
    // Emit socket event to all participants
    const io = req.app.get('io');
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user._id.toString()) {
        io.to(`user:${participantId}`).emit('new-message', {
          conversationId: id,
          message
        });
      }
    });
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    next(error);
  }
});

// Mark conversation as read
router.put('/:id/read', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const conversation = await Conversation.findOne({
      _id: id,
      participants: req.user._id
    });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // Clear unread count
    conversation.clearUnread(req.user._id);
    await conversation.save();
    
    // Mark all messages as read
    await Message.updateMany(
      {
        conversation: id,
        'readBy.user': { $ne: req.user._id }
      },
      {
        $push: { readBy: { user: req.user._id, readAt: new Date() } }
      }
    );
    
    // Emit socket event
    const io = req.app.get('io');
    conversation.participants.forEach(participantId => {
      io.to(`user:${participantId}`).emit('message-read', {
        conversationId: id,
        userId: req.user._id
      });
    });
    
    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Error marking as read:', error);
    next(error);
  }
});

// Get a single conversation by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id
    }).populate('participants', 'name email avatar');
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    const convObj = conversation.toObject();
    convObj.unreadCount = conversation.getUnreadCount(req.user._id);
    
    res.json(convObj);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    next(error);
  }
});

export default router;
