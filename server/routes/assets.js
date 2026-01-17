import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Asset from '../models/Asset.js';
import { auth, adminAuth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for asset uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/assets');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Get all assets (with filters)
router.get('/', async (req, res) => {
  try {
    const { category, search, isPremium } = req.query;
    const query = {};

    if (category) query.category = category;
    if (isPremium !== undefined) query.isPremium = isPremium === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const assets = await Asset.find(query).sort({ createdAt: -1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get asset categories
router.get('/categories', (req, res) => {
  res.json([
    { id: 'quotes', name: 'Quotes & Text', icon: '' },
    { id: 'icons', name: 'Icons & Symbols', icon: '' },
    { id: 'patterns', name: 'Patterns & Textures', icon: '' },
    { id: 'borders', name: 'Borders & Frames', icon: '' },
    { id: 'characters', name: 'Characters', icon: '' },
    { id: 'seasonal', name: 'Seasonal/Trending', icon: '' }
  ]);
});

// Upload asset (admin only)
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, category, tags, isPremium } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image file required' });
    }

    const asset = new Asset({
      name,
      category,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      imageUrl: `/uploads/assets/${req.file.filename}`,
      isPremium: isPremium === 'true'
    });

    await asset.save();
    res.status(201).json(asset);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete asset (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Delete file
    const filePath = path.join(__dirname, '..', asset.imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await asset.deleteOne();
    res.json({ message: 'Asset deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
