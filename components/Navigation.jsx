import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Home, Network, Plus, Menu, X, Calendar, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: t('app.dashboard'), icon: Home },
    { path: '/connections', label: t('app.network'), icon: Network },
    { path: '/schedules', label: t('app.schedules'), icon: Calendar },
    { path: '/settings', label: t('app.settings'), icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800 hidden sm:block">
              CicloFiend
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                variant="ghost"
                className={`relative h-10 px-4 transition-all duration-300 rounded-full font-medium ${
                  isActive(item.path) 
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-transparent'
                }`}
              >
                <item.icon className={`w-4 h-4 mr-2 transition-transform duration-300 ${isActive(item.path) ? 'scale-110' : ''}`} />
                {item.label}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 border-2 border-blue-100 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Button>
            ))}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigate('/add-friend')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-blue-500/25 ml-4 rounded-full px-6 transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden lg:inline">{t('app.addFriend')}</span>
              </Button>
            </motion.div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-blue-50 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-xl"
          >
            <div className="px-4 py-6 space-y-3">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  variant="ghost"
                  className={`w-full justify-start h-12 rounded-xl text-base ${
                    isActive(item.path) 
                      ? 'bg-blue-50 text-blue-600 font-semibold' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Button>
              ))}
              <Button
                 onClick={() => {
                    navigate('/add-friend');
                    setMobileMenuOpen(false);
                 }}
                 variant="ghost"
                 className="w-full justify-start h-12 rounded-xl text-base text-gray-600 hover:bg-gray-50"
              >
                 <Plus className="w-5 h-5 mr-3" />
                 {t('app.addFriend')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;