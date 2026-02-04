import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Store files in memory (in production, use S3, Cloudinary, etc.)
const fileStorage = new Map();

// Upload file
router.post('/', authenticate, (req, res) => {
  try {
    // In a real app, you'd use multer or similar to handle file uploads
    // For demo, we'll accept base64 data
    const { name, type, size, data } = req.body;
    
    if (!name || !data) {
      return res.status(400).json({ message: 'File name and data required' });
    }

    const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const fileRecord = {
      id: fileId,
      name,
      type: type || 'application/octet-stream',
      size: size || data.length,
      data,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };
    
    fileStorage.set(fileId, fileRecord);
    
    // Return file metadata (without the data)
    const { data: _, ...metadata } = fileRecord;
    res.status(201).json(metadata);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Get file
router.get('/:id', authenticate, (req, res) => {
  const file = fileStorage.get(req.params.id);
  
  if (!file) {
    return res.status(404).json({ message: 'File not found' });
  }
  
  const { data, ...metadata } = file;
  res.json({ ...metadata, url: data });
});

// Delete file
router.delete('/:id', authenticate, (req, res) => {
  const file = fileStorage.get(req.params.id);
  
  if (!file) {
    return res.status(404).json({ message: 'File not found' });
  }
  
  // Check if user owns the file
  if (file.uploadedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  fileStorage.delete(req.params.id);
  res.json({ message: 'File deleted' });
});

export default router;
