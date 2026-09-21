import React, { useState } from 'react';
import { useFriends } from '@/contexts/FriendsContext';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Check, X, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

// Defined outside to prevent re-mounting on every render (which causes focus loss)
const EventForm = ({ form, setForm, onCancel, onSave, t }) => (
  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-4 animate-in fade-in slide-in-from-top-2">
     <div className="space-y-3">
        <input 
           className="w-full p-2 rounded border border-yellow-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
           placeholder={t('events.nameLabel')}
           value={form.title}
           onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
        />
        <input 
           type="date"
           className="w-full p-2 rounded border border-yellow-300 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
           value={form.date}
           onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
        />
        <textarea 
           className="w-full p-2 rounded border border-yellow-300 text-sm h-16 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
           placeholder={t('events.descLabel')}
           value={form.description}
           onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
        />
        <div className="flex justify-end gap-2">
           <Button size="sm" variant="ghost" onClick={onCancel} className="hover:bg-yellow-100 text-yellow-800"><X className="w-4 h-4 mr-1" /> {t('app.cancel')}</Button>
           <Button size="sm" onClick={onSave} className="bg-yellow-500 hover:bg-yellow-600 text-white border-none"><Check className="w-4 h-4 mr-1" /> {t('app.save')}</Button>
        </div>
     </div>
  </div>
);

const ImportantEventsManager = ({ friendId }) => {
  const { t } = useTranslation();
  const { getFriendEvents, addImportantEvent, updateImportantEvent, deleteImportantEvent } = useFriends();
  const events = getFriendEvents(friendId).sort((a, b) => new Date(a.date) - new Date(b.date));
  const { toast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({ title: '', date: '', description: '' });

  const resetForm = () => setForm({ title: '', date: '', description: '' });

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    resetForm();
  };

  const startEdit = (event) => {
    setEditingId(event.id);
    setIsAdding(false);
    setForm({
      title: event.title,
      date: event.date,
      description: event.description || ''
    });
  };

  const handleSave = () => {
    if (!form.title || !form.date) {
      toast({ title: t('messages.errorValidation'), variant: "destructive" });
      return;
    }

    if (isAdding) {
      addImportantEvent({ ...form, friendId });
      setIsAdding(false);
      toast({ title: t('messages.successEvent') });
    } else if (editingId) {
      updateImportantEvent(editingId, form);
      setEditingId(null);
      toast({ title: t('messages.successUpdate') });
    }
    resetForm();
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    resetForm();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
         <h3 className="font-bold text-lg text-yellow-700 flex items-center gap-2">
            <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
            {t('events.title')}
         </h3>
         {!isAdding && !editingId && (
            <Button size="sm" variant="outline" onClick={startAdd} className="border-yellow-300 text-yellow-700 hover:bg-yellow-50">
               <Plus className="w-4 h-4 mr-1" /> {t('events.add')}
            </Button>
         )}
      </div>

      {isAdding && (
        <EventForm 
          form={form} 
          setForm={setForm} 
          onCancel={handleCancel} 
          onSave={handleSave} 
          t={t} 
        />
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {events.length > 0 ? events.map(event => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
               {editingId === event.id ? (
                  <EventForm 
                    form={form} 
                    setForm={setForm} 
                    onCancel={handleCancel} 
                    onSave={handleSave} 
                    t={t} 
                  />
               ) : (
                  <div className="bg-white border-l-4 border-l-yellow-400 rounded-r-xl shadow-sm p-4 flex justify-between items-start hover:shadow-md transition-shadow">
                     <div>
                        <h4 className="font-bold text-gray-800">{event.title}</h4>
                        <p className="text-sm text-yellow-600 font-medium mb-1">{new Date(event.date).toLocaleDateString()}</p>
                        {event.description && <p className="text-sm text-gray-600 italic">{event.description}</p>}
                     </div>
                     <div className="flex gap-1 ml-4">
                        <button onClick={() => startEdit(event)} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-500">
                           <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteImportantEvent(event.id)} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500">
                           <Trash2 className="w-3.5 h-3.5" />
                        </button>
                     </div>
                  </div>
               )}
            </motion.div>
          )) : (
             !isAdding && (
               <div className="text-center py-6 text-gray-400 italic bg-yellow-50/30 rounded-xl border border-dashed border-yellow-200">
                  {t('events.noEvents')}
               </div>
             )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ImportantEventsManager;