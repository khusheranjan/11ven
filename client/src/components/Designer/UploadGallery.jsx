import { useState, useEffect, useRef } from 'react';
import { uploadImage, getUserUploads, deleteUpload, removeBackground } from '../../services/api';

export default function UploadGallery({ canvasRef }) {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processingIds, setProcessingIds] = useState(new Set());
  const fileInputRef = useRef(null);

  // Fetch user uploads on mount
  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const res = await getUserUploads({ limit: 50 });
      setUploads(res.data.uploads || []);
    } catch (err) {
      console.error('Failed to fetch uploads:', err);
    } finally {
      setLoading(false);
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

      // Add the new upload to the state
      await fetchUploads(); // Refresh the list

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

  const handleAddToCanvas = (imageUrl) => {
    if (canvasRef.current) {
      canvasRef.current.addImage(imageUrl);
    }
  };

  const handleRemoveBackground = async (uploadId) => {
    setProcessingIds(prev => new Set([...prev, uploadId]));

    try {
      const res = await removeBackground(uploadId);

      // Update the upload in state
      setUploads(prevUploads =>
        prevUploads.map(upload =>
          upload._id === uploadId
            ? { ...upload, processedImageUrl: res.data.processedImageUrl, backgroundRemoved: true }
            : upload
        )
      );

      // Optionally add processed image to canvas
      if (res.data.processedImageUrl && canvasRef.current) {
        canvasRef.current.addImage(res.data.processedImageUrl);
      }
    } catch (err) {
      console.error('Failed to remove background:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.error || 'Failed to remove background';

      // Show user-friendly error message
      if (errorMsg.includes('REMOVE_BG_API_KEY')) {
        alert('Background removal is not configured. Please add your remove.bg API key to the server .env file.\n\nGet a free API key at: https://www.remove.bg/api');
      } else {
        alert(`Background removal failed: ${errorMsg}`);
      }
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(uploadId);
        return newSet;
      });
    }
  };

  const handleDeleteUpload = async (uploadId) => {
    if (!confirm('Are you sure you want to delete this upload?')) return;

    try {
      await deleteUpload(uploadId);
      setUploads(prevUploads => prevUploads.filter(u => u._id !== uploadId));
    } catch (err) {
      console.error('Failed to delete upload:', err);
      alert('Failed to delete upload');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Upload Button */}
      <div className="p-4 border-b border-gray-200">
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
          className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 transition-all flex flex-col items-center gap-2"
        >
          <svg
            className="w-10 h-10"
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
            {uploading ? 'Uploading...' : 'Upload Image'}
          </span>
          <span className="text-xs text-gray-500">PNG, JPG, SVG</span>
        </button>
      </div>

      {/* Gallery Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">My Uploads ({uploads.length})</h3>
      </div>

      {/* Gallery Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-2 text-sm text-gray-500">Loading uploads...</p>
            </div>
          </div>
        ) : uploads.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-3 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm font-medium">No uploads yet</p>
              <p className="text-xs mt-1">Upload an image to get started</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {uploads.map((upload) => (
              <div
                key={upload._id}
                className="relative group border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
              >
                {/* Image Preview */}
                <div
                  className="aspect-square bg-gray-50 cursor-pointer relative overflow-hidden"
                  onClick={() => handleAddToCanvas(upload.processedImageUrl || upload.imageUrl)}
                >
                  <img
                    src={upload.processedImageUrl || upload.imageUrl}
                    alt={upload.originalFilename}
                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EError%3C/text%3E%3C/svg%3E';
                    }}
                  />

                  {/* Background Removed Badge */}
                  {upload.backgroundRemoved && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      No BG
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 bg-black bg-opacity-50 px-3 py-1 rounded">
                      Add to Canvas
                    </span>
                  </div>
                </div>

                {/* Action Buttons - On one line */}
                <div className="p-2 flex gap-1">
                  {/* Remove Background Button */}
                  {!upload.backgroundRemoved ? (
                    <button
                      onClick={() => handleRemoveBackground(upload._id)}
                      disabled={processingIds.has(upload._id)}
                      className="flex-1 px-2 py-1.5 bg-purple-500 text-white text-xs font-medium rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                      title="Remove background"
                    >
                      {processingIds.has(upload._id) ? (
                        <div className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      )}
                    </button>
                  ) : (
                    <div className="flex-1 px-2 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded text-center">
                      ✓ No BG
                    </div>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteUpload(upload._id)}
                    className="flex-1 px-2 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Filename Tooltip */}
                <div className="px-2 pb-2">
                  <p className="text-xs text-gray-500 truncate" title={upload.originalFilename}>
                    {upload.originalFilename}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="p-4 bg-blue-50 border-t border-blue-100">
        <p className="text-xs font-medium text-blue-900 mb-1.5">Tips:</p>
        <ul className="space-y-0.5 text-xs text-blue-700">
          <li>• Click image to add to canvas</li>
          <li>• Remove background for clean designs</li>
          <li>• Use PNG for transparent backgrounds</li>
        </ul>
      </div>
    </div>
  );
}
