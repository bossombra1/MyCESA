import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <nav className="px-6 py-3 flex justify-between items-center shadow-md"
      style={{ background: 'white', borderBottom: '3px solid #2E7D32' }}>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 text-xl font-bold"
          style={{ color: '#2E7D32' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F1F8E9'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          ☰
        </button>
        <div>
          <h2 className="font-bold text-gray-800 text-lg">Panneau d'administration</h2>
          <p className="text-xs text-gray-400">Université MyCESA</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-700">{user?.Login_User || 'Admin'}</p>
          <p className="text-xs text-gray-400">Administrateur</p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg"
          style={{ background: 'linear-gradient(135deg, #2E7D32, #FF6D00)' }}>
          {user?.Login_User?.[0]?.toUpperCase() || 'A'}
        </div>
      </div>
    </nav>
  );
}