import { useState, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { getAssets, getCategories } from '../../services/api';

export default function AssetLibrary({ onSelectAsset }) {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    loadCategories();
    loadAssets();
  }, []);

  useEffect(() => {
    loadAssets();
  }, [selectedCategory, search]);

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
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (search) params.search = search;
      const res = await getAssets(params);
      setAssets(res.data);
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedCategoryName = () => {
    if (!selectedCategory) return 'All Categories';
    const cat = categories.find(c => c.id === selectedCategory);
    return cat ? `${cat.icon} ${cat.name}` : 'All Categories';
  };

  return (
    <div className="w-72 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-gray-200">
        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search graphics..."
            className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
          >
            <span>{getSelectedCategoryName()}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto scrollbar-hide">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                  !selectedCategory
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assets Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mb-3"></div>
            <p className="text-sm text-gray-500">Loading graphics...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">No graphics found</p>
            <p className="text-xs text-gray-500">
              {!selectedCategory && !search ? 'Admin can add graphics from the dashboard.' : 'Try a different search term.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {assets.map((asset) => (
              <button
                key={asset._id}
                onClick={() => onSelectAsset(asset)}
                className="group aspect-square rounded-xl border border-gray-200 overflow-hidden hover:border-black hover:shadow-md transition-all bg-gray-50"
                title={asset.name}
              >
                <div className="w-full h-full flex items-center justify-center p-3">
                  <img
                    src={asset.imageUrl}
                    alt={asset.name}
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
