import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <button
        onClick={onMenuClick}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        ☰
      </button>

      <div className="flex items-center space-x-4">
        <span className="text-gray-600">👤 {user?.Login_User || 'Admin'}</span>
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
          {user?.Login_User?.[0]?.toUpperCase() || 'A'}
        </div>
      </div>
    </nav>
  );
}
