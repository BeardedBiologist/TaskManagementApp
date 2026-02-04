import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
  id: String,
  type: {
    type: String,
    enum: ['text', 'heading1', 'heading2', 'heading3', 'todo', 'bullet', 'numbered', 'quote', 'code', 'divider', 'image'],
    default: 'text'
  },
  content: String,
  checked: Boolean,
  language: String,
  url: String,
  caption: String,
  number: Number
}, { _id: false });

const pageSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Untitled'
  },
  icon: {
    type: String,
    default: '📄'
  },
  cover: {
    type: String,
    default: null
  },
  content: {
    type: [blockSchema],
    default: []
  },
  // HIERARCHY: Page belongs to a Project (which belongs to a Workspace)
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  // Parent page for nested pages within a project
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page',
    default: null
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Page type
  isDatabase: {
    type: Boolean,
    default: false
  },
  // Template reference
  template: {
    type: String,
    enum: ['blank', 'meeting', 'requirements', 'sprint-plan', 'retrospective', 'bug-report'],
    default: 'blank'
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
pageSchema.index({ project: 1, parent: 1 });
pageSchema.index({ workspace: 1 });
pageSchema.index({ owner: 1 });

const Page = mongoose.model('Page', pageSchema);
export default Page;
