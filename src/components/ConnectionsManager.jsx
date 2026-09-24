import React, { useState } from 'react';
import { useFriends } from '@/contexts/FriendsContext';
import { Button } from '@/components/ui/button';
import { Network, Plus, X, UserPlus, Check, Search, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const ConnectionsManager = ({ friendId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { friends, getConnectedFriends, addConnection, removeConnection } = useFriends();
  const { toast } = useToast();
  
  const connectedFriends = getConnectedFriends(friendId);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [removeConfirmId, setRemoveConfirmId] = useState(null);

  // Friends available to connect (not self, not already connected)
  const availableFriends = friends.filter(f => 
    f.id !== friendId && 
    !connectedFriends.some(cf => cf.id === f.id) &&
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelection = (id) => {
    setSelectedToAdd(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleAddConnections = () => {
    selectedToAdd.forEach(id => addConnection(friendId, id));
    setSelectedToAdd([]);
    setIsAdding(false);
    setSearchQuery('');
    toast({ title: t('messages.successConnection') });
  };

  const handleRemove = (id) => {
    removeConnection(friendId, id);
    setRemoveConfirmId(null);
    toast({ title: t('messages.successDisconnection') });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
         <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            {t('connections.title')}
            <span className="bg-blue-100 text-blue-600 text-xs py-0.5 px-2 rounded-full ml-2">
               {connectedFriends.length}
            </span>
         </h3>
         <div className="flex gap-2">
            {!isAdding && (
                <>
                <Button size="sm" onClick={() => navigate(`/connections?friendId=${friendId}`)} className="bg-blue-600 text-white hover:bg-blue-700 border-none">
                   <Network className="w-4 h-4 mr-1" /> Nova Conexão
                </Button>
                <Button size="sm" onClick={() => setIsAdding(true)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none" title="Adicionar Rápido">
                   <UserPlus className="w-4 h-4" />
                </Button>
                </>
            )}
         </div>
      </div>

      <AnimatePresence>
         {isAdding && (
            <motion.div 
               initial={{ opacity: 0, height: 0 }} 
               animate={{ opacity: 1, height: 'auto' }} 
               exit={{ opacity: 0, height: 0 }}
               className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4 overflow-hidden"
            >
               <h4 className="text-sm font-bold text-blue-800 mb-3">{t('connections.select')}</h4>
               
               <div className="relative mb-3">
                 <Search className="absolute left-3 top-2.5 text-blue-300 w-4 h-4" />
                 <input 
                    type="text" 
                    placeholder={t('app.search')} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                 />
               </div>

               {availableFriends.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto mb-4 p-1 custom-scrollbar">
                     {availableFriends.map(f => (
                        <div 
                           key={f.id} 
                           onClick={() => toggleSelection(f.id)}
                           className={`p-2 rounded-lg cursor-pointer border flex items-center gap-2 transition-all ${selectedToAdd.includes(f.id) ? 'bg-blue-500 text-white border-blue-600 shadow-md' : 'bg-white border-blue-100 hover:border-blue-300'}`}
                        >
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${selectedToAdd.includes(f.id) ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}`}>
                              {f.photos && f.photos.length > 0 ? (
                                 <img src={f.photos.find(p => p.id === f.profilePhotoId)?.url || f.photos[0].url} className="w-full h-full rounded-full object-cover" />
                              ) : f.name.charAt(0)}
                           </div>
                           <span className="text-sm truncate font-medium">{f.name}</span>
                        </div>
                     ))}
                  </div>
               ) : (
                  <p className="text-sm text-gray-500 italic mb-4 text-center py-2">{t('app.noData')}</p>
               )}

               <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}><X className="w-4 h-4 mr-1" /> {t('app.cancel')}</Button>
                  <Button size="sm" onClick={handleAddConnections} disabled={selectedToAdd.length === 0} className="bg-blue-600 text-white"><Check className="w-4 h-4 mr-1" /> {t('app.save')}</Button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {connectedFriends.length > 0 ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {connectedFriends.map(f => (
               <motion.div 
                  key={f.id}
                  layout
                  className={`bg-white p-3 rounded-xl border shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow ${removeConfirmId === f.id ? 'border-red-200 bg-red-50' : 'border-blue-100'}`}
               >
                  {removeConfirmId === f.id ? (
                     <div className="w-full flex flex-col items-center text-center p-1">
                        <AlertTriangle className="w-6 h-6 text-red-500 mb-2" />
                        <p className="text-xs font-bold text-red-800 mb-2">{t('connections.confirmRemove')}</p>
                        <div className="flex gap-2">
                           <Button size="xs" variant="ghost" className="h-7 text-xs" onClick={() => setRemoveConfirmId(null)}>{t('app.cancel')}</Button>
                           <Button size="xs" variant="destructive" className="h-7 text-xs bg-red-500 hover:bg-red-600" onClick={() => handleRemove(f.id)}>{t('connections.remove')}</Button>
                        </div>
                     </div>
                  ) : (
                     <>
                        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => navigate(`/friend/${f.id}`)}>
                           <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                              {f.photos && f.photos.length > 0 ? (
                                 <img src={f.photos.find(p => p.id === f.profilePhotoId)?.url || f.photos[0].url} className="w-full h-full object-cover" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">{f.name.charAt(0)}</div>
                              )}
                           </div>
                           <div className="min-w-0">
                              <p className="font-bold text-gray-800 text-sm truncate">{f.name}</p>
                              <p className="text-xs text-blue-500 truncate">{f.category}</p>
                           </div>
                        </div>
                        <button onClick={() => setRemoveConfirmId(f.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                           <X className="w-4 h-4" />
                        </button>
                     </>
                  )}
               </motion.div>
            ))}
         </div>
      ) : (
         !isAdding && (
            <div className="text-center py-8 bg-blue-50/50 rounded-xl border border-dashed border-blue-200">
               <p className="text-gray-400 italic">{t('connections.noConnections')}</p>
            </div>
         )
      )}
    </div>
  );
};

export default ConnectionsManager;