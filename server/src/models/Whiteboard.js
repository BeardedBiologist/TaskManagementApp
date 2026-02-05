import mongoose from 'mongoose';

const whiteboardElementSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['shape', 'sticky', 'text', 'image', 'freehand', 'connector'],
    required: true
  },
  // Position and dimensions
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  width: { type: Number, default: 100 },
  height: { type: Number, default: 100 },
  rotation: { type: Number, default: 0 },
  
  // Shape properties
  shapeType: { type: String, enum: ['rectangle', 'circle', 'triangle', 'diamond'] },
  
  // Style properties
  backgroundColor: { type: String, default: '#ffffff' },
  borderColor: { type: String, default: '#000000' },
  borderWidth: { type: Number, default: 2 },
  opacity: { type: Number, default: 1 },
  
  // Content
  text: { type: String, default: '' },
  fontSize: { type: Number, default: 16 },
  fontColor: { type: String, default: '#000000' },
  
  // Image
  imageUrl: { type: String },
  
  // Freehand path
  path: [{ x: Number, y: Number }],
  strokeWidth: { type: Number, default: 3 },
  
  // Connector
  fromElementId: { type: String },
  toElementId: { type: String },
  fromPoint: { x: Number, y: Number },
  toPoint: { x: Number, y: Number },
  
  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const whiteboardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  elements: [whiteboardElementSchema],
  
  // Canvas settings
  canvasWidth: { type: Number, default: 3000 },
  canvasHeight: { type: Number, default: 2000 },
  backgroundColor: { type: String, default: '#f8f9fa' },
  
  // Access control
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

whiteboardSchema.index({ project: 1 });

const Whiteboard = mongoose.model('Whiteboard', whiteboardSchema);
export default Whiteboard;
