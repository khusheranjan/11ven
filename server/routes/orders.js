import express from 'express';
import Order from '../models/Order.js';
import Design from '../models/Design.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

const BASE_PRICE = 499; // Base price per t-shirt in INR

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { designId, color, size, quantity, shippingAddress } = req.body;

    const design = await Design.findById(designId);
    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }

    const price = BASE_PRICE * quantity;

    const order = new Order({
      userId: req.user._id,
      designId,
      color,
      size,
      quantity,
      price,
      shippingAddress
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('designId')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('designId');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all orders
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .populate('designId')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update order status
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
