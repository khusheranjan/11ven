import { Link } from 'react-router-dom';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
        <div className="text-6xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-green-600 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. We'll start printing your custom t-shirt right away!
        </p>
        <div className="space-y-3">
          <Link
            to="/orders"
            className="block w-full px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            View My Orders
          </Link>
          <Link
            to="/"
            className="block w-full px-6 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50"
          >
            Create Another Design
          </Link>
        </div>
      </div>
    </div>
  );
}
