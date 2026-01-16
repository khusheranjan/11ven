import mongoose from 'mongoose';

const UserUploadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  processedImageUrl: {
    type: String,
    default: null
  },
  backgroundRemoved: {
    type: Boolean,
    default: false
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Add indexes for performance
UserUploadSchema.index({ userId: 1, createdAt: -1 });
UserUploadSchema.index({ userId: 1, backgroundRemoved: 1 });

export default mongoose.model('UserUpload', UserUploadSchema);
