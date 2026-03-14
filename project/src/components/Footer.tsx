import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function Footer() {
  const { user, signOut } = useAuth();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex space-x-6 text-sm">
            <a
              href="#"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Privacy Policy
            </a>
          </div>

          {user && (
            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Wellness. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
