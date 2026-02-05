import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  
  // Template type
  type: {
    type: String,
    required: true,
    enum: ['project', 'board', 'page', 'checklist', 'workflow']
  },
  
  // Template data (varies by type)
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Example data for each type:
  // project: { columns: [...], defaultLabels: [...], settings: {...} }
  // board: { columns: [...] }
  // page: { blocks: [...] }
  // checklist: { items: [...] }
  // workflow: { stages: [...], automations: [...] }
  
  // Visibility
  visibility: {
    type: String,
    enum: ['private', 'workspace', 'public'],
    default: 'workspace'
  },
  
  // Ownership
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
  
  // Usage stats
  usageCount: { type: Number, default: 0 },
  
  // Preview/thumbnail
  previewImage: { type: String },
  
  // Tags for organization
  tags: [{ type: String }],
  
  // Featured template (for showcasing)
  isFeatured: { type: Boolean, default: false }
}, {
  timestamps: true
});

templateSchema.index({ type: 1, visibility: 1 });
templateSchema.index({ workspace: 1, type: 1 });
templateSchema.index({ createdBy: 1 });
templateSchema.index({ isFeatured: 1 });

const Template = mongoose.model('Template', templateSchema);
export default Template;
