import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['quotes', 'icons', 'patterns', 'borders', 'characters', 'seasonal']
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  imageUrl: {
    type: String,
    required: true
  },
  isPremium: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for search
assetSchema.index({ name: 'text', tags: 'text' });

export default mongoose.model('Asset', assetSchema);
