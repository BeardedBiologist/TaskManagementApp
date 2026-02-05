import mongoose from 'mongoose';

const commentReplySchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { _id: true });

const commentSchema = new mongoose.Schema({
  // Comment can be on various entities
  targetType: {
    type: String,
    required: true,
    enum: ['task', 'page', 'whiteboard-element']
  },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  
  // For whiteboard elements, store the element ID
  whiteboardElementId: { type: String },
  
  // Position for inline comments (on pages/docs)
  position: {
    blockId: String,
    startOffset: Number,
    endOffset: Number,
    x: Number, // for whiteboard overlay
    y: Number
  },
  
  // Comment content
  content: { type: String, required: true },
  
  // Author
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Mentions (@username)
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Thread/replies
  replies: [commentReplySchema],
  
  // Status
  status: {
    type: String,
    enum: ['open', 'resolved'],
    default: 'open'
  },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  
  // Context
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }
}, {
  timestamps: true
});

commentSchema.index({ targetType: 1, targetId: 1 });
commentSchema.index({ project: 1, createdAt: -1 });
commentSchema.index({ author: 1 });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
