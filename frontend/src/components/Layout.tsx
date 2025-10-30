import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  Home, 
  BarChart3, 
  GitBranch,
  Download,
  FileText,
  Trophy
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { getCopyright, getVersionInfo } from '../utils/version';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Todos os itens de navegação (sempre visíveis)
  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Corridas', href: '/races', icon: Trophy },
    { name: 'Estatísticas', href: '/stats', icon: BarChart3 },
    { name: 'Mapa Mental', href: '/mindmap', icon: GitBranch },
    { name: 'Importar/Exportar', href: '/import-export', icon: Download },
    { name: 'Relatórios', href: '/reports', icon: FileText },
    ...(user?.role === 'admin' ? [{ name: 'Usuários', href: '/users', icon: User }] : []),
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full lg:w-4/5 mx-auto px-3 sm:px-6 lg:px-8">
          <div>
            {/* Primeira linha - Menu e User Info */}
            <div className="flex items-center justify-between h-16 sm:h-14">
              {/* Navigation - Sempre visível */}
              <nav className="flex items-center space-x-1 sm:space-x-2 lg:space-x-8 flex-1 overflow-x-auto scrollbar-hide">
                {/* Todos os itens de navegação */}
                {allNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 sm:px-2 pt-1 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap min-w-0 ${
                        isActive(item.href)
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                      <span className="hidden sm:inline truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* User menu - Direita */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                {/* Avatar Dropdown */}
                <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md p-1 transition-colors"
                >
                  {/* Avatar ou Iniciais */}
                  {user?.avatar ? (
                    <img
                      className="h-6 w-6 sm:h-8 sm:w-8 rounded-full object-cover border border-gray-200"
                      src={user.avatar}
                      alt={user.name}
                    />
                  ) : (
                    <>
                      <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs sm:text-sm font-medium">
                        {user?.name
                          ?.split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2) || '?'}
                      </div>
                      <span className="hidden md:inline truncate max-w-32">{user?.name}</span>
                    </>
                  )}
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <div className="font-medium">{user?.name}</div>
                        <div className="text-gray-500">{user?.email}</div>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </header>

      {/* Main content */}
      <main className="w-full lg:w-4/5 mx-auto py-4 sm:py-6 px-3 sm:px-6 lg:px-8 flex-1">
        <div className="py-4 sm:py-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="w-full lg:w-4/5 mx-auto py-4 px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="text-sm text-gray-500">
              {getCopyright()}
            </div>
            <div className="text-sm text-gray-400">
              {getVersionInfo()}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};