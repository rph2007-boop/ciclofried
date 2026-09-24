import React, { useState } from 'react';
import { useFriends } from '@/contexts/FriendsContext';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Settings, ChevronRight, FolderPlus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const PreferencesManager = () => {
  const { t } = useTranslation();
  const { preferences, addMainCategory, deleteMainCategory, addPreference, removePreference } = useFriends();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubItem, setNewSubItem] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(preferences[0]?.id || '');
  const { toast } = useToast();

  const selectedCategory = preferences.find(c => c.id === selectedCatId);

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addMainCategory(newCategoryName.trim());
      setNewCategoryName('');
      toast({ title: t('messages.successUpdate') });
    }
  };

  const handleDeleteCategory = (id) => {
    if (window.confirm('Delete this category and all its items?')) {
      deleteMainCategory(id);
      if (selectedCatId === id) setSelectedCatId('');
    }
  };

  const handleAddSubItem = (e) => {
    e.preventDefault();
    if (newSubItem.trim() && selectedCatId) {
      addPreference(selectedCatId, newSubItem.trim());
      setNewSubItem('');
      toast({ title: t('messages.successPreference') });
    }
  };

  const handleDeleteSubItem = (catId, item) => {
    if (window.confirm('Remove this item?')) {
      removePreference(catId, item);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full min-h-[500px]">
      
      {/* Sidebar: Categories List */}
      <div className="w-full md:w-1/3 bg-white/50 backdrop-blur rounded-xl border border-blue-100 flex flex-col overflow-hidden">
        <div className="p-4 bg-blue-50/50 border-b border-blue-100">
           <h2 className="font-bold text-blue-900 flex items-center gap-2">
             <Settings className="w-4 h-4" /> {t('preferences.manageCategories')}
           </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {preferences.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between group ${
                selectedCatId === cat.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white hover:bg-blue-50 text-gray-700'
              }`}
            >
              <span className="font-medium truncate">{cat.name}</span>
              <div className="flex items-center gap-2">
                 <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCatId === cat.id ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                    {cat.subcategories.length}
                 </span>
                 <div
                   onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                   className={`p-1 rounded-md hover:bg-red-500 hover:text-white transition-colors ${selectedCatId === cat.id ? 'text-blue-200 hover:bg-blue-700' : 'text-gray-400'}`}
                 >
                    <X className="w-3 h-3" />
                 </div>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-blue-100 bg-white">
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder={t('preferences.newCategoryPlaceholder')}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Main: Subcategories */}
      <div className="flex-1 bg-white/50 backdrop-blur rounded-xl border border-blue-100 flex flex-col">
        {selectedCategory ? (
          <>
            <div className="p-6 border-b border-blue-100 bg-white/40">
              <h2 className="text-xl font-bold text-blue-900">
                {t('preferences.manageSubcategories', { category: selectedCategory.name })}
              </h2>
              <p className="text-sm text-blue-500 mt-1">
                Gerencie as opções disponíveis para esta categoria.
              </p>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                 <AnimatePresence>
                   {selectedCategory.subcategories.map((item) => (
                     <motion.div
                       key={item}
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.9 }}
                       className="bg-white p-3 rounded-lg border border-blue-100 flex items-center justify-between group hover:shadow-md transition-all"
                     >
                        <span className="text-gray-800">{item}</span>
                        <button
                          onClick={() => handleDeleteSubItem(selectedCategory.id, item)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </motion.div>
                   ))}
                 </AnimatePresence>
                 {selectedCategory.subcategories.length === 0 && (
                   <div className="col-span-full py-10 text-center text-gray-400 italic">
                      {t('messages.noData')}
                   </div>
                 )}
               </div>
            </div>

            <div className="p-6 border-t border-blue-100 bg-white/40">
              <form onSubmit={handleAddSubItem} className="flex gap-3 max-w-md">
                 <input
                   value={newSubItem}
                   onChange={(e) => setNewSubItem(e.target.value)}
                   placeholder={t('preferences.newItemPlaceholder')}
                   className="flex-1 px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                 />
                 <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                   <Plus className="w-4 h-4 mr-2" />
                   {t('preferences.add')}
                 </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
             <Settings className="w-16 h-16 mb-4 opacity-20" />
             <p>{t('preferences.selectOption')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreferencesManager;