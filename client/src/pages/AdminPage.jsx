import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AssetManager from '../components/Admin/AssetManager';
import OrderManager from '../components/Admin/OrderManager';

export default function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-black mb-6">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'orders'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'assets'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Asset Library
          </button>
        </div>

        {/* Content */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          {activeTab === 'orders' && <OrderManager />}
          {activeTab === 'assets' && <AssetManager />}
        </div>
      </div>
    </div>
  );
}
