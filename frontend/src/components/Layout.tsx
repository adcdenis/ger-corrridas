import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  Home, 
  Activity, 
  BarChart3, 
  Map,
  Menu,
  X,
  Download,
  FileText,
  ChevronDown,
  Settings
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOptionsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Itens principais do menu horizontal
  const mainNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Corridas', href: '/races', icon: Activity },
    { name: 'Estatísticas', href: '/stats', icon: BarChart3 },
    { name: 'Mapa Mental', href: '/mindmap', icon: Map },
  ];

  // Itens do dropdown Opções
  const optionsNavigation = [
    { name: 'Importar/Exportar', href: '/import-export', icon: Download },
    { name: 'Relatórios', href: '/reports', icon: FileText },
    ...(user?.role === 'admin' ? [{ name: 'Usuários', href: '/users', icon: User }] : []),
  ];

  // Todos os itens para mobile (mantém a lista completa)
  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Corridas', href: '/races', icon: Activity },
    { name: 'Estatísticas', href: '/stats', icon: BarChart3 },
    { name: 'Mapa Mental', href: '/mindmap', icon: Map },
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
      <div className="bg-gray-50 sticky top-0 z-50">
        <header className="w-4/5 mx-auto bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
          {/* Primeira linha - Menu e User Info */}
          <div className="flex items-center justify-between h-14">
            {/* Desktop Navigation - Esquerda */}
            <nav className="hidden lg:flex items-center space-x-8">
              {/* Itens principais */}
              {mainNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Dropdown Opções */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                    optionsNavigation.some(item => isActive(item.href))
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Opções
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>

                {/* Dropdown Menu */}
                {isOptionsOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      {optionsNavigation.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsOptionsOpen(false)}
                            className={`flex items-center px-4 py-2 text-sm transition-colors ${
                              isActive(item.href)
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <Icon className="h-4 w-4 mr-3" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Spacer para mobile */}
            <div className="flex-1 lg:hidden"></div>

            {/* User menu - Direita */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              {/* Avatar Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="hidden md:flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md p-1 transition-colors"
                >
                  {/* Avatar ou Iniciais */}
                  {user?.avatar ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover border border-gray-200"
                      src={user.avatar}
                      alt={user.name}
                    />
                  ) : (
                    <>
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                        {user?.name
                          ?.split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2) || '?'}
                      </div>
                      <span className="truncate max-w-32">{user?.name}</span>
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

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>         
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200 shadow-lg">
              {/* User info no mobile */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center">
                  {/* Avatar ou Iniciais */}
                  {user?.avatar ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover border border-gray-200"
                      src={user.avatar}
                      alt={user.name}
                    />
                  ) : (
                    <>
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium mr-3 flex-shrink-0">
                        {user?.name
                          ?.split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2) || '?'}
                      </div>
                      <span className="text-base font-medium text-gray-800 truncate">{user?.name}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Navigation items */}
              {allNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Botão Sair no mobile */}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-200"
              >
                <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        )}
        </header>
      </div>

      {/* Main content */}
      <main className="w-4/5 mx-auto py-4 sm:py-6 px-3 sm:px-6 lg:px-8 flex-1">
        <div className="py-4 sm:py-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="w-4/5 mx-auto py-4 px-3 sm:px-6 lg:px-8">
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