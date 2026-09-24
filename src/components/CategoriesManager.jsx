import React, { useState } from 'react';
import { useFriends } from '@/contexts/FriendsContext';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';

const CategoriesManager = () => {
  const { t } = useTranslation();
  const { categories, addCategory, deleteCategory } = useFriends();
  const [newCategory, setNewCategory] = useState('');
  const { toast } = useToast();

  const handleAdd = (e) => {
    e.preventDefault();
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
      toast({ title: t('messages.successUpdate') });
    }
  };

  const handleDelete = (cat) => {
    if (window.confirm(t('categories.deleteConfirm'))) {
      deleteCategory(cat);
    }
  };

  const defaultCats = ['Família', 'Estudos', 'Amigos', 'Paqueras', 'Trabalho', 'Outros'];

  return (
    <div className="bg-white/50 backdrop-blur rounded-xl shadow-sm border border-blue-100 p-6">
      <h2 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
        <Tag className="w-5 h-5 text-blue-600" />
        {t('categories.title')}
      </h2>

      <form onSubmit={handleAdd} className="flex gap-4 mb-8">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder={t('categories.name')}
          className="flex-1 px-4 py-2 rounded-lg bg-white border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
        />
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          {t('categories.add')}
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <div key={cat} className="bg-white rounded-lg p-3 border border-blue-50 flex items-center justify-between group hover:shadow-md transition-all">
            <span className="font-medium text-blue-900">{cat}</span>
            <div className="flex items-center gap-2">
              {defaultCats.includes(cat) ? (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  {t('categories.default')}
                </span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(cat)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 h-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesManager;