import { useState, useRef } from 'react';
import { uploadImage } from '../../services/api';
import TextStylePanel from './TextStylePanel';
import UploadGallery from './UploadGallery';

export default function Toolbar({ canvasRef, showOnlyUpload = false, showOnlyText = false, selectedObject = null, tshirtColor = '#ffffff' }) {
  const [textInput, setTextInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleAddText = () => {
    if (textInput.trim() && canvasRef.current) {
      canvasRef.current.addText(textInput);
      setTextInput('');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadImage(formData);
      if (canvasRef.current) {
        canvasRef.current.addImage(res.data.imageUrl);
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = () => {
    if (canvasRef.current) {
      canvasRef.current.deleteSelected();
    }
  };

  // Show only upload section
  if (showOnlyUpload) {
    return <UploadGallery canvasRef={canvasRef} />;
  }

  // Show only text section
  if (showOnlyText) {
    return (
      <TextStylePanel
        canvasRef={canvasRef}
        selectedObject={selectedObject}
        tshirtColor={tshirtColor}
      />
    );
  }

  // Show full toolbar (default - not used in new layout)
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Design Tools</h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Text Tool */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Add Text</label>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter text..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
            />
            <button
              onClick={handleAddText}
              className="w-full px-4 py-2.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Add Text
            </button>
          </div>
        </div>

        {/* Upload Image */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Upload Your Image</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-black hover:bg-gray-50 hover:text-black disabled:opacity-50 transition-all flex flex-col items-center gap-2"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-sm font-medium">
              {uploading ? 'Uploading...' : 'Click to upload'}
            </span>
          </button>
        </div>

        {/* Delete Button */}
        <div>
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete Selected
          </button>
        </div>
      </div>
    </div>
  );
}
