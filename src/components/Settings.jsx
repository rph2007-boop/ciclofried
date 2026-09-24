import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useFriends } from '@/contexts/FriendsContext';
import { useAuth } from '@/contexts/AuthContext';
import CategoriesManager from '@/components/CategoriesManager';
import PreferencesManager from '@/components/PreferencesManager';
import { Tag, Settings as SettingsIcon, RefreshCw, Cloud, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Settings = () => {
  const { t } = useTranslation();
  const { fetchSupabaseData, isSyncing, offlineQueue } = useFriends();
  const { currentUser, isGuest } = useAuth();
  const [activeTab, setActiveTab] = useState('categories');

  const handleSync = () => {
    fetchSupabaseData();
  };

  return (
    <>
      <Helmet>
        <title>CicloFriend - {t('app.settings')}</title>
      </Helmet>

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-blue-900">{t('app.settings')}</h1>
            <p className="text-blue-600 mt-1 md:mt-2 text-sm md:text-base">Gerencie categorias e preferências do sistema</p>
          </motion.div>

          {!isGuest && (
            <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto justify-between md:justify-start bg-blue-50 md:bg-transparent p-3 md:p-0 rounded-lg">
               <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Database className="w-4 h-4" />
                  <span>Status: {isSyncing ? 'Sincronizando...' : 'Online'}</span>
               </div>
               {offlineQueue.length > 0 && (
                 <span className="text-xs text-amber-600 font-bold">{offlineQueue.length} alterações pendentes</span>
               )}
               <Button 
                 onClick={handleSync} 
                 disabled={isSyncing}
                 variant="outline"
                 className="flex items-center gap-2 border-blue-200 hover:bg-blue-50 text-blue-700 min-h-[44px]"
               >
                 <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                 {isSyncing ? 'Sincronizando...' : 'Sincronizar Dados'}
               </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
           <div className="flex gap-4 border-b border-blue-200 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('categories')}
                className={`pb-3 px-4 font-medium flex items-center gap-2 transition-colors relative whitespace-nowrap min-h-[44px] ${activeTab === 'categories' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
              >
                <Tag className="w-4 h-4" />
                {t('categories.title')}
                {activeTab === 'categories' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
              </button>
              <button 
                onClick={() => setActiveTab('preferences')}
                className={`pb-3 px-4 font-medium flex items-center gap-2 transition-colors relative whitespace-nowrap min-h-[44px] ${activeTab === 'preferences' ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
              >
                <SettingsIcon className="w-4 h-4" />
                {t('preferences.title')}
                {activeTab === 'preferences' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
              </button>
           </div>

           <motion.div
             key={activeTab}
             initial={{ opacity: 0, x: 10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.2 }}
           >
             {activeTab === 'categories' && <CategoriesManager />}
             {activeTab === 'preferences' && <PreferencesManager />}
           </motion.div>
        </div>
      </div>
    </>
  );
};

export default Settings;