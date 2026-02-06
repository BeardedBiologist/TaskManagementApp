import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  name: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  unreadCounts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for finding conversations by participants
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

// Static method to find or create direct conversation between two users
conversationSchema.statics.findOrCreateDirect = async function(userId1, userId2) {
  // Look for existing direct conversation between these two users
  let conversation = await this.findOne({
    type: 'direct',
    participants: { $all: [userId1, userId2], $size: 2 }
  }).populate('participants', 'name email avatar');
  
  if (!conversation) {
    // Create new conversation
    conversation = await this.create({
      type: 'direct',
      participants: [userId1, userId2],
      createdBy: userId1,
      unreadCounts: [
        { user: userId1, count: 0 },
        { user: userId2, count: 0 }
      ]
    });
    await conversation.populate('participants', 'name email avatar');
  }
  
  return conversation;
};

// Method to get unread count for a specific user
conversationSchema.methods.getUnreadCount = function(userId) {
  const entry = this.unreadCounts.find(
    uc => uc.user.toString() === userId.toString()
  );
  return entry ? entry.count : 0;
};

// Method to increment unread count for all participants except sender
conversationSchema.methods.incrementUnread = function(senderId) {
  this.unreadCounts.forEach(uc => {
    if (uc.user.toString() !== senderId.toString()) {
      uc.count += 1;
    }
  });
};

// Method to clear unread count for a user
conversationSchema.methods.clearUnread = function(userId) {
  const entry = this.unreadCounts.find(
    uc => uc.user.toString() === userId.toString()
  );
  if (entry) {
    entry.count = 0;
  }
};

export default mongoose.model('Conversation', conversationSchema);
