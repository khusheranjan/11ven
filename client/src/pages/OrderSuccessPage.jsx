import { Link } from 'react-router-dom';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center max-w-md">
        <div className="text-6xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-black mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. We'll start printing your custom t-shirt right away!
        </p>
        <div className="space-y-3">
          <Link
            to="/orders"
            className="block w-full px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            View My Orders
          </Link>
          <Link
            to="/"
            className="block w-full px-6 py-2 border border-black text-black rounded-md hover:bg-gray-50"
          >
            Create Another Design
          </Link>
        </div>
      </div>
    </div>
  );
}
