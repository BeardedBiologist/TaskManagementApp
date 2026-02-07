import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['task-assigned', 'task-comment', 'mention', 'project-member-added', 'task-due-soon']
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: null
  },
  read: {
    type: Boolean,
    default: false
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

/**
 * Create a notification and emit it to the recipient's socket room.
 */
notificationSchema.statics.send = async function(io, { recipient, type, message, link, data }) {
  const notification = await this.create({ recipient, type, message, link, data });
  const obj = notification.toObject();
  io.to(`user:${recipient}`).emit('notification', obj);
  return notification;
};

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
