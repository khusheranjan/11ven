import { useState, useEffect, useRef } from 'react';
import { getAssets, getCategories, uploadAsset, deleteAsset } from '../../services/api';

export default function AssetManager() {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const fileInputRef = useRef(null);

  const [newAsset, setNewAsset] = useState({
    name: '',
    category: 'quotes',
    tags: '',
    isPremium: false
  });

  useEffect(() => {
    loadCategories();
    loadAssets();
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadAssets = async () => {
    setLoading(true);
    try {
      const params = selectedCategory ? { category: selectedCategory } : {};
      const res = await getAssets(params);
      setAssets(res.data);
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current?.files[0];
    if (!file) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('name', newAsset.name);
      formData.append('category', newAsset.category);
      formData.append('tags', newAsset.tags);
      formData.append('isPremium', newAsset.isPremium);

      await uploadAsset(formData);
      setNewAsset({ name: '', category: 'quotes', tags: '', isPremium: false });
      fileInputRef.current.value = '';
      loadAssets();
    } catch (err) {
      console.error('Failed to upload asset:', err);
      alert('Failed to upload asset');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      await deleteAsset(id);
      loadAssets();
    } catch (err) {
      console.error('Failed to delete asset:', err);
      alert('Failed to delete asset');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Asset Manager</h2>

      {/* Upload Form */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium mb-3">Upload New Asset</h3>
        <form onSubmit={handleUpload} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input
              type="text"
              required
              value={newAsset.name}
              onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Category</label>
            <select
              value={newAsset.category}
              onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={newAsset.tags}
              onChange={(e) => setNewAsset({ ...newAsset, tags: e.target.value })}
              placeholder="funny, motivational, cool"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Image File</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Asset'}
            </button>
          </div>
        </form>
      </div>

      {/* Filter by Category */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 py-1 rounded ${!selectedCategory ? 'bg-black text-white' : 'bg-gray-200'}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded ${selectedCategory === cat.id ? 'bg-black text-white' : 'bg-gray-200'}`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      {loading ? (
        <div className="text-center py-8">Loading assets...</div>
      ) : assets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No assets found. Upload some!</div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {assets.map((asset) => (
            <div key={asset._id} className="border rounded-lg p-3 relative group">
              <img
                src={asset.imageUrl}
                alt={asset.name}
                className="w-full h-24 object-contain mb-2"
              />
              <p className="font-medium text-sm truncate">{asset.name}</p>
              <p className="text-xs text-gray-500">{asset.category}</p>
              <button
                onClick={() => handleDelete(asset._id)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
