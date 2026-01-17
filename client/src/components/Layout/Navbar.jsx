import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-black">
              11ven
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                {!isAdmin && (
                  <>
                    <Link to="/design" className="text-gray-700 hover:text-black transition-colors">
                      Design
                    </Link>
                    <Link to="/orders" className="text-gray-700 hover:text-black transition-colors">
                      My Orders
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <Link to="/admin" className="text-gray-700 hover:text-black transition-colors">
                    Admin
                  </Link>
                )}
                <span className="text-gray-300">|</span>
                <span className="text-gray-700">{user.name}</span>
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-black transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-black transition-colors">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
