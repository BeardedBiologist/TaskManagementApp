import mongoose from 'mongoose';

// This model tracks user presence and cursor positions in real-time
// It uses a short TTL to automatically clean up disconnected users

const presenceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  socketId: { type: String, required: true },
  
  // Where is the user?
  room: { type: String, required: true }, // e.g., "project:123", "whiteboard:456", "page:789"
  roomType: { type: String, enum: ['project', 'whiteboard', 'page', 'workspace'] },
  
  // Cursor position (for whiteboard and collaborative docs)
  cursor: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    // For docs, also track the block/element they're in
    blockId: String,
    selection: {
      start: Number,
      end: Number
    }
  },
  
  // What are they doing?
  activity: {
    type: String,
    enum: ['idle', 'typing', 'drawing', 'scrolling', 'selecting'],
    default: 'idle'
  },
  
  // Viewport (for collaborative scrolling/panning)
  viewport: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    zoom: { type: Number, default: 1 }
  },
  
  // Timestamp for TTL cleanup
  lastSeenAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Compound index for unique presence per user per room
presenceSchema.index({ user: 1, room: 1 }, { unique: true });
presenceSchema.index({ socketId: 1 });
presenceSchema.index({ lastSeenAt: 1 }, { expireAfterSeconds: 60 }); // Auto-delete after 60 seconds of inactivity

const Presence = mongoose.model('Presence', presenceSchema);
export default Presence;
