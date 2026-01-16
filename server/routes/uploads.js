import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import UserUpload from '../models/UserUpload.js';
import { auth } from '../middleware/auth.js';
import { removeBackground } from '../utils/backgroundRemoval.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get user's uploads
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, backgroundRemoved } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user.id };

    // Filter by background removal status if specified
    if (backgroundRemoved !== undefined) {
      query.backgroundRemoved = backgroundRemoved === 'true';
    }

    const uploads = await UserUpload.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await UserUpload.countDocuments(query);

    res.json({
      uploads,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching uploads:', error);
    res.status(500).json({ error: 'Failed to fetch uploads' });
  }
});

// Delete an upload
router.delete('/:id', auth, async (req, res) => {
  try {
    const upload = await UserUpload.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    // Delete files from filesystem
    const filesToDelete = [upload.imageUrl];
    if (upload.processedImageUrl) {
      filesToDelete.push(upload.processedImageUrl);
    }

    filesToDelete.forEach(fileUrl => {
      const filePath = path.join(__dirname, '..', fileUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(`Failed to delete file: ${filePath}`, err);
        }
      }
    });

    // Delete database record
    await UserUpload.deleteOne({ _id: req.params.id });

    res.json({ message: 'Upload deleted successfully' });
  } catch (error) {
    console.error('Error deleting upload:', error);
    res.status(500).json({ error: 'Failed to delete upload' });
  }
});

// Remove background from an upload
router.post('/:id/remove-background', auth, async (req, res) => {
  try {
    const upload = await UserUpload.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    // Check if already processed
    if (upload.backgroundRemoved && upload.processedImageUrl) {
      return res.json({
        message: 'Background already removed',
        processedImageUrl: upload.processedImageUrl,
        upload
      });
    }

    // Construct file paths
    // Remove leading slash and join with server root
    const relativePath = upload.imageUrl.startsWith('/') ? upload.imageUrl.substring(1) : upload.imageUrl;
    const inputPath = path.join(__dirname, '..', relativePath);

    console.log('Background removal - Upload URL:', upload.imageUrl);
    console.log('Background removal - Relative path:', relativePath);
    console.log('Background removal - Input path:', inputPath);
    console.log('Background removal - File exists:', fs.existsSync(inputPath));

    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ error: 'Original image file not found', path: inputPath });
    }

    // Create output directory if it doesn't exist
    const bgRemovedDir = path.join(__dirname, '../uploads/designs/bg-removed');
    if (!fs.existsSync(bgRemovedDir)) {
      fs.mkdirSync(bgRemovedDir, { recursive: true });
    }

    // Generate output filename
    const ext = path.extname(upload.imageUrl);
    const filename = path.basename(upload.imageUrl, ext);
    const outputFilename = `${filename}-nobg.png`;
    const outputPath = path.join(bgRemovedDir, outputFilename);
    const outputUrl = `/uploads/designs/bg-removed/${outputFilename}`;

    // Remove background
    try {
      await removeBackground(inputPath, outputPath);

      // Update database
      upload.processedImageUrl = outputUrl;
      upload.backgroundRemoved = true;
      await upload.save();

      res.json({
        message: 'Background removed successfully',
        processedImageUrl: outputUrl,
        upload
      });
    } catch (bgError) {
      // Return specific error message from background removal
      console.error('Background removal error:', bgError.message);
      return res.status(400).json({ error: bgError.message });
    }
  } catch (error) {
    console.error('Error removing background:', error);
    res.status(500).json({ error: 'Failed to remove background' });
  }
});

export default router;
