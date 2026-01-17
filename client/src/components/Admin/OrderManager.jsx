import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/api';
import { Download, Eye, ChevronDown, ChevronUp, Image, Printer } from 'lucide-react';

const STATUS_OPTIONS = ['pending', 'paid', 'printing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-gray-200 text-gray-800',
  printing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-gray-300 text-gray-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

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

  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Order Manager</h2>

      {/* Status Filter */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1 rounded ${!statusFilter ? 'bg-black text-white' : 'bg-gray-200'}`}
        >
          All
        </button>
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1 rounded capitalize ${statusFilter === status ? 'bg-black text-white' : 'bg-gray-200'}`}
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
                <th className="text-left p-3 border w-8"></th>
                <th className="text-left p-3 border">Order ID</th>
                <th className="text-left p-3 border">Customer</th>
                <th className="text-left p-3 border">Design</th>
                <th className="text-left p-3 border">Details</th>
                <th className="text-left p-3 border">Price</th>
                <th className="text-left p-3 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <>
                  <tr key={order._id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(order._id)}>
                    <td className="p-3 border">
                      {expandedOrder === order._id ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </td>
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
                      <div className="flex gap-2">
                        {/* Front Mockup */}
                        {(order.designId?.frontMockupUrl || order.designId?.mockupUrl) && (
                          <div className="relative group">
                            <img
                              src={order.designId.frontMockupUrl || order.designId.mockupUrl}
                              alt="Front Design"
                              className="w-14 h-14 object-contain border rounded"
                            />
                            <span className="absolute bottom-0 left-0 right-0 text-[10px] text-center bg-black/50 text-white rounded-b">Front</span>
                          </div>
                        )}
                        {/* Back Mockup */}
                        {order.designId?.hasBackDesign && order.designId?.backMockupUrl && (
                          <div className="relative group">
                            <img
                              src={order.designId.backMockupUrl}
                              alt="Back Design"
                              className="w-14 h-14 object-contain border rounded"
                            />
                            <span className="absolute bottom-0 left-0 right-0 text-[10px] text-center bg-black/50 text-white rounded-b">Back</span>
                          </div>
                        )}
                      </div>
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
                    <td className="p-3 border" onClick={(e) => e.stopPropagation()}>
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
                  </tr>

                  {/* Expanded Row - Download Options */}
                  {expandedOrder === order._id && (
                    <tr key={`${order._id}-expanded`} className="bg-gray-50">
                      <td colSpan="7" className="p-4 border">
                        <div className="grid grid-cols-2 gap-6">
                          {/* Front Side Downloads */}
                          <div className="bg-white rounded-lg p-4 border">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-gray-300 text-gray-800 text-xs rounded">FRONT</span>
                              Front Side
                            </h4>
                            <div className="flex gap-3">
                              {/* Front Mockup Preview & Download */}
                              {(order.designId?.frontMockupUrl || order.designId?.mockupUrl) && (
                                <div className="flex-1">
                                  <div className="border rounded-lg overflow-hidden mb-2">
                                    <img
                                      src={order.designId.frontMockupUrl || order.designId.mockupUrl}
                                      alt="Front Mockup"
                                      className="w-full h-40 object-contain bg-gray-100"
                                    />
                                  </div>
                                  <button
                                    onClick={() => downloadFile(
                                      order.designId.frontMockupUrl || order.designId.mockupUrl,
                                      `order-${order._id.slice(-8)}-front-mockup.png`
                                    )}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
                                  >
                                    <Image className="w-4 h-4" />
                                    Download Mockup
                                  </button>
                                </div>
                              )}
                              {/* Front Print File Download */}
                              {(order.designId?.frontPrintFileUrl || order.designId?.printFileUrl) && (
                                <div className="flex-1">
                                  <div className="border rounded-lg overflow-hidden mb-2 bg-gray-800 flex items-center justify-center h-40">
                                    <div className="text-center text-white">
                                      <Printer className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                      <span className="text-xs opacity-75">Print Ready File</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => downloadFile(
                                      order.designId.frontPrintFileUrl || order.designId.printFileUrl,
                                      `order-${order._id.slice(-8)}-front-print.png`
                                    )}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                  >
                                    <Download className="w-4 h-4" />
                                    Download Print File
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Back Side Downloads */}
                          <div className={`bg-white rounded-lg p-4 border ${!order.designId?.hasBackDesign ? 'opacity-50' : ''}`}>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">BACK</span>
                              Back Side
                              {!order.designId?.hasBackDesign && (
                                <span className="text-xs text-gray-400 font-normal">(No design)</span>
                              )}
                            </h4>
                            {order.designId?.hasBackDesign ? (
                              <div className="flex gap-3">
                                {/* Back Mockup Preview & Download */}
                                {order.designId?.backMockupUrl && (
                                  <div className="flex-1">
                                    <div className="border rounded-lg overflow-hidden mb-2">
                                      <img
                                        src={order.designId.backMockupUrl}
                                        alt="Back Mockup"
                                        className="w-full h-40 object-contain bg-gray-100"
                                      />
                                    </div>
                                    <button
                                      onClick={() => downloadFile(
                                        order.designId.backMockupUrl,
                                        `order-${order._id.slice(-8)}-back-mockup.png`
                                      )}
                                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
                                    >
                                      <Image className="w-4 h-4" />
                                      Download Mockup
                                    </button>
                                  </div>
                                )}
                                {/* Back Print File Download */}
                                {order.designId?.backPrintFileUrl && (
                                  <div className="flex-1">
                                    <div className="border rounded-lg overflow-hidden mb-2 bg-gray-800 flex items-center justify-center h-40">
                                      <div className="text-center text-white">
                                        <Printer className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <span className="text-xs opacity-75">Print Ready File</span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => downloadFile(
                                        order.designId.backPrintFileUrl,
                                        `order-${order._id.slice(-8)}-back-print.png`
                                      )}
                                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                    >
                                      <Download className="w-4 h-4" />
                                      Download Print File
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                                No back design for this order
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="mt-4 bg-white rounded-lg p-4 border">
                          <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">{order.shippingAddress?.name}</p>
                            <p>{order.shippingAddress?.street}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                            <p>Phone: {order.shippingAddress?.phone}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
