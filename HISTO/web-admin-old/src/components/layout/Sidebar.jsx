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

export default function Sidebar({ open }) {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className={`${open ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col shadow-xl`}
      style={{ background: 'linear-gradient(180deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)' }}>
      
      {/* Logo */}
      <div className="p-5 border-b border-green-600">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-lg"
            style={{ background: 'linear-gradient(135deg, #FF6D00, #D84315)' }}>
            M
          </div>
          {open && (
            <div>
              <h1 className="font-black text-xl text-white tracking-wide">MYCESA</h1>
              <p className="text-green-300 text-xs">Administration</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={!open ? item.label : ''}
              className="flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group"
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, #FF6D00, #D84315)'
                  : 'transparent',
                boxShadow: isActive ? '0 4px 15px rgba(216,67,21,0.4)' : 'none',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <span className="text-xl">{item.icon}</span>
              {open && (
                <span className="text-sm font-semibold text-white">
                  {item.label}
                </span>
              )}
              {isActive && open && (
                <span className="ml-auto w-2 h-2 rounded-full bg-white"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Déconnexion */}
      <div className="p-3 border-t border-green-600">
        <button
          onClick={logout}
          className="w-full p-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2"
          style={{ background: 'rgba(255,255,255,0.1)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(216,67,21,0.8)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          <span>🚪</span>
          {open && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}