import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { path: '/', label: 'Tableau de bord', icon: '📊' },
  { path: '/etudiants', label: 'Étudiants', icon: '👨‍🎓' },
  { path: '/profs', label: 'Professeurs', icon: '👨‍🏫' },
  { path: '/classes', label: 'Classes', icon: '🏫' },
  { path: '/matieres', label: 'Matières', icon: '📚' },
  { path: '/emploi', label: 'Emploi du temps', icon: '📅' },
  { path: '/notes', label: 'Notes', icon: '📝' },
  { path: '/paiements', label: 'Paiements', icon: '💳' },
  { path: '/utilisateurs', label: 'Utilisateurs', icon: '👥' },
  { path: '/notifications', label: 'Notifications', icon: '🔔' },
];

export default function Sidebar({ open }) {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className={`${open ? 'w-64' : 'w-20'} bg-dark transition-all duration-300 text-white flex flex-col`}>
      <div className="p-4 border-b border-gray-700">
        <h1 className={`font-bold text-xl ${!open && 'text-center'}`}>
          {open ? 'MYCESA' : 'M'}
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-blue-600'
                : 'hover:bg-gray-700'
            }`}
            title={!open ? item.label : ''}
          >
            <span className="text-xl">{item.icon}</span>
            {open && <span className="text-sm">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
        >
          {open ? 'Déconnexion' : '🚪'}
        </button>
      </div>
    </aside>
  );
}
