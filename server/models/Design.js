import mongoose from 'mongoose';

const designSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    default: 'Untitled Design'
  },
  // Legacy single mockup (for backward compatibility)
  mockupUrl: {
    type: String
  },
  printFileUrl: {
    type: String
  },
  // Front side mockup and print files
  frontMockupUrl: {
    type: String
  },
  frontPrintFileUrl: {
    type: String
  },
  // Back side mockup and print files
  backMockupUrl: {
    type: String
  },
  backPrintFileUrl: {
    type: String
  },
  canvasJSON: {
    type: Object,
    required: true
  },
  tshirtColor: {
    type: String,
    default: '#ffffff'
  },
  // Flag to indicate if design has content on back
  hasBackDesign: {
    type: Boolean,
    default: false
  },
  side: {
    type: String,
    enum: ['front', 'back'],
    default: 'front'
  }
}, { timestamps: true });

export default mongoose.model('Design', designSchema);
