import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { path: '/', label: 'Tableau de bord', icon: '📊' },
  { path: '/etudiants', label: 'Étudiants', icon: '🎓' },
  { path: '/profs', label: 'Professeurs', icon: '👨‍🏫' },
  { path: '/classes', label: 'Classes', icon: '🏫' },
  { path: '/matieres', label: 'Matières', icon: '📚' },
  { path: '/emploi', label: 'Emploi du temps', icon: '📅' },
  { path: '/notes', label: 'Notes', icon: '📝' },
  { path: '/paiements', label: 'Paiements', icon: '💳' },
  { path: '/utilisateurs', label: 'Utilisateurs', icon: '👥' },
  { path: '/notifications', label: 'Notifications', icon: '🔔' },
  { path: '/absences', label: 'Absences', icon: '📋' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="flex flex-col shadow-lg relative z-10"
      style={{ background: 'linear-gradient(90deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)' }}>

      
      <div className="px-6 py-3 flex justify-between items-center bg-white" style={{ borderBottom: '1px solid rgba(46, 125, 50, 0.1)' }}>
        {/* Left Side: Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-lg text-white"
            style={{ background: 'linear-gradient(135deg, #FF6D00, #D84315)' }}>
            M
          </div>
          <div>
            <h1 className="font-black text-xl text-gray-800 tracking-wide leading-tight">MYCESA</h1>
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Administration</p>
          </div>
        </div>

        {/* Right Side: User Menu & Logout */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800">{user?.Login_User || 'Admin'}</p>
              <p className="text-xs font-semibold text-green-600">Administrateur</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md border-2 border-green-500"
              style={{ background: 'linear-gradient(135deg, #2E7D32, #1B5E20)' }}>
              {user?.Login_User?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
          <div className="h-8 w-px bg-gray-200"></div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
          >
            <span className="text-lg">🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Bottom Side: Navigation Links */}
      <div className="px-6 py-0 flex items-center space-x-1 overflow-x-auto hide-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 px-4 py-3 border-b-4 transition-all whitespace-nowrap group`}
              style={{
                borderColor: isActive ? '#FF6D00' : 'transparent',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span className="text-lg opacity-90 group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-green-50 group-hover:text-white'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}