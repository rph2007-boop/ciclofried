import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Users, LogOut, User, Menu, X, Settings, Plus, LayoutDashboard, Network, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import GuestModeIndicator from './GuestModeIndicator';

const Header = () => {
  const {
    currentUser,
    logout,
    isGuest,
    endGuestSession
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    t
  } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    if (isGuest) {
      endGuestSession();
      navigate('/login');
    } else {
      await logout();
      navigate('/login');
    }
    setIsMobileMenuOpen(false);
  };
  
  const isActive = path => location.pathname === path;
  
  if (['/login', '/signup', '/forgot-password'].includes(location.pathname)) {
    return null;
  }
  
  const navItems = [{
    path: '/dashboard',
    label: t('app.dashboard'),
    icon: LayoutDashboard
  }, {
    path: '/connections',
    label: t('app.network'),
    icon: Network
  }, {
    path: '/schedules',
    label: t('app.schedules'),
    icon: Calendar
  }, {
    path: '/settings',
    label: t('app.settings'),
    icon: Settings
  }];

  return <>
      <GuestModeIndicator />
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading font-bold text-lg sm:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800">CicloFriend</span>
            </div>

            {currentUser && <nav className="hidden md:flex items-center gap-1">
                {navItems.map(item => <Link key={item.path} to={item.path} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isActive(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>)}
              </nav>}

            <div className="flex items-center gap-3">
              {currentUser ? <>
                  <Button onClick={() => navigate('/add-friend')} className="hidden sm:flex bg-gray-900 text-white hover:bg-black rounded-full px-5 shadow-md hover:shadow-lg transition-all" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('app.addFriend')}
                  </Button>
                  
                  <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200 ml-3">
                    <div className="flex flex-col items-end">
                       <span className="text-xs font-semibold text-gray-900">
                          {isGuest ? 'Visitante' : currentUser.email?.split('@')[0]}
                       </span>
                       <span className="text-[10px] text-gray-500">
                          {isGuest ? 'Modo Teste' : 'Free Plan'}
                       </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full min-w-[44px] min-h-[44px]">
                      <LogOut className="w-5 h-5" />
                    </Button>
                  </div>

                  <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </> : <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => navigate('/login')} className="min-w-[44px] min-h-[44px]">Login</Button>
                  <Button onClick={() => navigate('/signup')} className="min-w-[44px] min-h-[44px]">Sign Up</Button>
                </div>}
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && currentUser && <motion.div initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: 'auto'
      }} exit={{
        opacity: 0,
        height: 0
      }} className="md:hidden bg-white border-b border-gray-100 overflow-hidden absolute w-full z-50 shadow-xl">
            <div className="px-4 py-4 space-y-3">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-4">
                 <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    <User className="w-5 h-5" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                        {isGuest ? 'Visitante (Modo Teste)' : currentUser.email}
                    </p>
                    <p className="text-xs text-gray-500">Logged In</p>
                 </div>
              </div>

              {navItems.map(item => <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors min-h-[48px] ${isActive(item.path) ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>)}
              
              <Link to="/add-friend" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 min-h-[48px]">
                 <Plus className="w-5 h-5" />
                 {t('app.addFriend')}
              </Link>

              <div className="border-t border-gray-100 pt-3 mt-3">
                <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors min-h-[48px]">
                  <LogOut className="w-5 h-5" />
                  {isGuest ? 'Sair do Modo Teste' : 'Logout'}
                </button>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </>;
};
export default Header;