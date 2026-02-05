import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  // What happened
  type: {
    type: String,
    required: true,
    enum: [
      // Task activities
      'task.created', 'task.updated', 'task.deleted', 'task.moved', 'task.assigned',
      'task.comment.added', 'task.comment.deleted',
      // Page/Note activities
      'page.created', 'page.updated', 'page.deleted',
      'page.comment.added', 'page.comment.resolved',
      // Whiteboard activities
      'whiteboard.created', 'whiteboard.updated', 'whiteboard.deleted',
      'whiteboard.element.added', 'whiteboard.element.updated', 'whiteboard.element.deleted',
      // Project activities
      'project.created', 'project.updated', 'project.member.added', 'project.member.removed',
      // User activities
      'user.joined', 'user.login', 'user.logout',
      // Template activities
      'template.created', 'template.used'
    ]
  },
  
  // Who did it
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Where did it happen
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  
  // Target entity
  targetType: { type: String, enum: ['task', 'page', 'whiteboard', 'project', 'user'] },
  targetId: mongoose.Schema.Types.ObjectId,
  targetName: String, // Denormalized for quick display
  
  // Additional context/data
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // For real-time updates
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for querying
activitySchema.index({ project: 1, timestamp: -1 });
activitySchema.index({ workspace: 1, timestamp: -1 });
activitySchema.index({ user: 1, timestamp: -1 });
activitySchema.index({ type: 1, timestamp: -1 });

// Static method to log activity
activitySchema.statics.log = async function(data) {
  return this.create({
    ...data,
    timestamp: new Date()
  });
};

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
