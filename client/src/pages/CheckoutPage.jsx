import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDesign, createOrder, createPayment, verifyPayment } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const BASE_PRICE = 499;

export default function CheckoutPage() {
  const { designId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [address, setAddress] = useState({
    name: user?.name || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  useEffect(() => {
    loadDesign();
  }, [designId]);

  const loadDesign = async () => {
    try {
      const res = await getDesign(designId);
      setDesign(res.data);
    } catch (err) {
      console.error('Failed to load design:', err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (field) => (e) => {
    setAddress({ ...address, [field]: e.target.value });
  };

  const handlePayment = async () => {
    // Validate address
    const requiredFields = ['name', 'street', 'city', 'state', 'pincode', 'phone'];
    const missingFields = requiredFields.filter(f => !address[f]);
    if (missingFields.length > 0) {
      alert('Please fill in all address fields');
      return;
    }

    setProcessing(true);
    try {
      // Create order
      const orderRes = await createOrder({
        designId,
        color: design.tshirtColor,
        size,
        quantity,
        shippingAddress: address
      });

      // Create payment order
      const paymentRes = await createPayment(orderRes.data._id);

      // Test mode - skip Razorpay popup
      if (paymentRes.data.testMode) {
        await verifyPayment({
          razorpay_order_id: paymentRes.data.orderId,
          testMode: true
        });
        navigate('/order-success');
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: paymentRes.data.key,
        amount: paymentRes.data.amount,
        currency: paymentRes.data.currency,
        name: 'TshirtPrint',
        description: 'Custom T-Shirt Order',
        order_id: paymentRes.data.orderId,
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            navigate('/order-success');
          } catch (err) {
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: address.name,
          email: user?.email,
          contact: address.phone
        },
        theme: {
          color: '#4f46e5'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Payment failed:', err);
      alert('Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const totalPrice = BASE_PRICE * quantity;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        <div className="grid grid-cols-2 gap-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            {/* Design Preview */}
            {design?.mockupUrl && (
              <div className="mb-4">
                <img
                  src={design.mockupUrl}
                  alt="Design preview"
                  className="w-full max-w-xs mx-auto border rounded"
                />
              </div>
            )}

            {/* T-shirt Color */}
            <div className="mb-4">
              <span className="text-gray-600">Color: </span>
              <span
                className="inline-block w-6 h-6 rounded-full border align-middle ml-2"
                style={{ backgroundColor: design?.tshirtColor }}
              />
            </div>

            {/* Size */}
            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Size:</label>
              <div className="flex gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-4 py-2 border rounded ${
                      size === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:border-indigo-500'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Quantity:</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border rounded text-xl"
                >
                  -
                </button>
                <span className="text-xl font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border rounded text-xl"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-lg">
                <span>Price per item:</span>
                <span>₹{BASE_PRICE}</span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-2">
                <span>Total:</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={address.name}
                  onChange={handleAddressChange('name')}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Street Address</label>
                <input
                  type="text"
                  value={address.street}
                  onChange={handleAddressChange('street')}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">City</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={handleAddressChange('city')}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">State</label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={handleAddressChange('state')}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={handleAddressChange('pincode')}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone</label>
                  <input
                    type="text"
                    value={address.phone}
                    onChange={handleAddressChange('phone')}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full mt-6 px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {processing ? 'Processing...' : `Pay ₹${totalPrice}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
