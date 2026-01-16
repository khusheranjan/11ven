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
  mockupUrl: {
    type: String
  },
  printFileUrl: {
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
  side: {
    type: String,
    enum: ['front', 'back'],
    default: 'front'
  }
}, { timestamps: true });

export default mongoose.model('Design', designSchema);
