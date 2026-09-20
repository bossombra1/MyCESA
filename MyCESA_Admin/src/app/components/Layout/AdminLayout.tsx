import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import {
  Bell,
  BookOpen,
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  CircleDot,
  ClipboardList,
  DollarSign,
  FileText,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  School,
  Search,
  Settings,
  UserX,
  Users,
  X
} from 'lucide-react';

const navigationSections = [
  {
    name: 'Principal',
    items: [{ name: 'Tableau de bord', href: '/', icon: LayoutDashboard }]
  },
  {
    name: 'Academique',
    items: [
      { name: 'Filieres', href: '/filieres', icon: Layers },
      { name: 'Cycles', href: '/cycles', icon: CircleDot },
      { name: 'Classes', href: '/classes', icon: School },
      { name: 'Matieres', href: '/matieres', icon: BookOpen },
      { name: 'Emplois du temps', href: '/emplois-du-temps', icon: ClipboardList }
    ]
  },
  {
    name: 'Utilisateurs',
    items: [
      { name: 'Etudiants', href: '/etudiants', icon: GraduationCap },
      { name: 'Professeurs', href: '/professeurs', icon: Users }
    ]
  },
  {
    name: 'Suivi',
    items: [
      { name: 'Notes', href: '/notes', icon: FileText },
      { name: 'Absences', href: '/absences', icon: UserX },
      { name: 'Paiements', href: '/paiements', icon: DollarSign }
    ]
  },
  {
    name: 'General',
    items: [
      { name: 'Evenements', href: '/evenements', icon: Calendar },
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Utilisateurs systeme', href: '/utilisateurs', icon: Users },
      { name: 'Salles', href: '/salles', icon: Building2 },
      { name: 'Configuration', href: '/configuration', icon: Settings }
    ]
  }
];

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch (error) {
    return {};
  }
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'Principal',
    'Academique',
    'Utilisateurs',
    'Suivi',
    'General'
  ]);
  const [notifications] = useState(3);
  const user = getStoredUser();
  const displayName = user.nom || user.nom || user.email || 'Administrateur';
  const initials = `${(user.nom || 'A')?.[0] || 'A'}${(user.nom || 'A')?.[1] || 'A'}`.toUpperCase();

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionName)
        ? prev.filter(section => section !== sectionName)
        : [...prev, sectionName]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const renderNavigation = (onNavigate?: () => void) => (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="-mx-2 space-y-1">
        {navigationSections.map(section => (
          <li key={section.name}>
            <button
              type="button"
              onClick={() => toggleSection(section.name)}
              className="mt-4 mb-2 flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-400 transition-colors first:mt-0 hover:text-gray-600"
            >
              <span>{section.name}</span>
              {expandedSections.includes(section.name) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {expandedSections.includes(section.name) && (
              <ul className="space-y-1">
                {section.items.map(item => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={onNavigate}
                        className={`group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                        }`}
                      >
                        <item.icon
                          className={`h-5 w-5 shrink-0 ${
                            isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-2xl font-bold text-blue-600">MyCESA Admin</h1>
          </div>
          {renderNavigation()}
        </div>
      </aside>

      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                  <h1 className="text-2xl font-bold text-blue-600">MyCESA Admin</h1>
                </div>
                {renderNavigation(() => setSidebarOpen(false))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="h-6 w-px bg-gray-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <form className="relative flex flex-1" action="#" method="GET">
              <Search className="pointer-events-none absolute inset-y-0 left-0 ml-3 h-full w-5 text-gray-400" />
              <input
                type="search"
                placeholder="Rechercher..."
                className="block h-full w-full border-0 py-0 pl-11 pr-0 text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0 sm:text-sm"
              />
            </form>

            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button type="button" className="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {notifications}
                  </span>
                )}
              </button>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

              <div className="flex items-center gap-x-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                  {initials}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold leading-6 text-gray-900">{displayName}</p>
                  <p className="text-xs leading-5 text-gray-500">{user.role || 'Administrateur'}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  title="Se deconnecter"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
