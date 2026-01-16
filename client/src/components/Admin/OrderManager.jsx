import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/api';

const STATUS_OPTIONS = ['pending', 'paid', 'printing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  printing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await getAllOrders(params);
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update order status');
    }
  };

  const downloadPrintFile = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Order Manager</h2>

      {/* Status Filter */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1 rounded ${!statusFilter ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
        >
          All
        </button>
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1 rounded capitalize ${statusFilter === status ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-8">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No orders found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-3 border">Order ID</th>
                <th className="text-left p-3 border">Customer</th>
                <th className="text-left p-3 border">Design</th>
                <th className="text-left p-3 border">Details</th>
                <th className="text-left p-3 border">Price</th>
                <th className="text-left p-3 border">Status</th>
                <th className="text-left p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 border">
                    <span className="font-mono text-sm">#{order._id.slice(-8).toUpperCase()}</span>
                    <div className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-3 border">
                    <div className="font-medium">{order.userId?.name}</div>
                    <div className="text-sm text-gray-500">{order.userId?.email}</div>
                  </td>
                  <td className="p-3 border">
                    {order.designId?.mockupUrl && (
                      <img
                        src={order.designId.mockupUrl}
                        alt="Design"
                        className="w-16 h-16 object-contain border rounded"
                      />
                    )}
                  </td>
                  <td className="p-3 border">
                    <div>Size: {order.size}</div>
                    <div>Qty: {order.quantity}</div>
                    <div className="flex items-center gap-1">
                      Color: <span
                        className="w-4 h-4 rounded-full border inline-block"
                        style={{ backgroundColor: order.color }}
                      />
                    </div>
                  </td>
                  <td className="p-3 border font-semibold">₹{order.price}</td>
                  <td className="p-3 border">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`px-2 py-1 rounded ${STATUS_COLORS[order.status]}`}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 border">
                    {order.designId?.printFileUrl && (
                      <button
                        onClick={() => downloadPrintFile(order.designId.printFileUrl)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Download Print
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
