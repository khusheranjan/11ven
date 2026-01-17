import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Design from '../models/Design.js';
import UserUpload from '../models/UserUpload.js';
import { auth } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for design uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/designs');
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

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Helper function to save base64 image to file
const saveBase64Image = (base64Data, prefix) => {
  if (!base64Data) return null;
  const buffer = Buffer.from(base64Data.split(',')[1], 'base64');
  const filename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1E9)}.png`;
  const filepath = path.join(__dirname, '../uploads/designs', filename);
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, buffer);
  return `/uploads/designs/${filename}`;
};

// Save design
router.post('/', auth, async (req, res) => {
  try {
    const {
      canvasJSON,
      name,
      tshirtColor,
      side,
      mockupData,
      printData,
      // New fields for front/back support
      frontMockupData,
      frontPrintData,
      backMockupData,
      backPrintData,
      hasBackDesign
    } = req.body;

    // Save base64 images as files
    const mockupUrl = saveBase64Image(mockupData, 'mockup');
    const printFileUrl = saveBase64Image(printData, 'print');
    const frontMockupUrl = saveBase64Image(frontMockupData, 'front-mockup');
    const frontPrintFileUrl = saveBase64Image(frontPrintData, 'front-print');
    const backMockupUrl = saveBase64Image(backMockupData, 'back-mockup');
    const backPrintFileUrl = saveBase64Image(backPrintData, 'back-print');

    const design = new Design({
      userId: req.user._id,
      canvasJSON,
      name: name || 'Untitled Design',
      tshirtColor,
      side,
      mockupUrl: mockupUrl || frontMockupUrl, // Backward compatibility
      printFileUrl: printFileUrl || frontPrintFileUrl,
      frontMockupUrl,
      frontPrintFileUrl,
      backMockupUrl,
      backPrintFileUrl,
      hasBackDesign: hasBackDesign || false
    });

    await design.save();
    res.status(201).json(design);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user's designs
router.get('/', auth, async (req, res) => {
  try {
    const designs = await Design.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(designs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single design
router.get('/:id', auth, async (req, res) => {
  try {
    const design = await Design.findOne({ _id: req.params.id, userId: req.user._id });
    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }
    res.json(design);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update design
router.patch('/:id', auth, async (req, res) => {
  try {
    const design = await Design.findOne({ _id: req.params.id, userId: req.user._id });
    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }

    const { canvasJSON, name, tshirtColor, side, mockupData, printData } = req.body;

    if (canvasJSON) design.canvasJSON = canvasJSON;
    if (name) design.name = name;
    if (tshirtColor) design.tshirtColor = tshirtColor;
    if (side) design.side = side;

    if (mockupData) {
      const mockupBuffer = Buffer.from(mockupData.split(',')[1], 'base64');
      const mockupFilename = `mockup-${Date.now()}.png`;
      const mockupPath = path.join(__dirname, '../uploads/designs', mockupFilename);
      fs.writeFileSync(mockupPath, mockupBuffer);
      design.mockupUrl = `/uploads/designs/${mockupFilename}`;
    }

    if (printData) {
      const printBuffer = Buffer.from(printData.split(',')[1], 'base64');
      const printFilename = `print-${Date.now()}.png`;
      const printPath = path.join(__dirname, '../uploads/designs', printFilename);
      fs.writeFileSync(printPath, printBuffer);
      design.printFileUrl = `/uploads/designs/${printFilename}`;
    }

    await design.save();
    res.json(design);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Upload user image
router.post('/upload-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file required' });
    }

    // Create upload record in database
    const userUpload = new UserUpload({
      userId: req.user.id,
      originalFilename: req.file.originalname,
      imageUrl: `/uploads/designs/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

    await userUpload.save();

    res.json({
      uploadId: userUpload._id,
      imageUrl: `/uploads/designs/${req.file.filename}`,
      originalFilename: req.file.originalname
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
