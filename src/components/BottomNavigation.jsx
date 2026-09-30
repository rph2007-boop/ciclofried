import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Network, Plus, Calendar, Settings } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();

  // Hide on auth pages
  if (['/login', '/signup', '/forgot-password'].includes(location.pathname)) {
    return null;
  }

  const navItems = [
    { path: '/dashboard', label: 'Painel', icon: LayoutDashboard },
    { path: '/connections', label: 'Conexões', icon: Network },
    { path: '/add-friend', label: 'Adicionar', icon: Plus, isAction: true },
    { path: '/schedules', label: 'Encontros', icon: Calendar },
    { path: '/settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 shadow-lg px-2 py-1 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          if (item.isAction) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative -top-4 flex flex-col items-center group"
              >
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-active:scale-95 transition-transform p-3">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold text-gray-600 mt-0.5">
                  {item.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors min-h-[48px] ${
                isActive ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-blue-50 scale-105' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
