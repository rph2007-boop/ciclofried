import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFriends } from '@/contexts/FriendsContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Network, Plus, Search, Trash2, List, Link as LinkIcon, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FriendNetwork = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { friends, addConnection, removeConnection } = useFriends();
  const { toast } = useToast();
  
  // Default to graph view as requested
  const [viewMode, setViewMode] = useState('graph'); // 'list' (Visual List/Grid) or 'graph' (Canvas)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // States for adding new connection
  const [friendA, setFriendA] = useState('');
  const [friendB, setFriendB] = useState('');

  // Check for pre-selected friend from URL
  const initialFriendId = searchParams.get('friendId');

  useEffect(() => {
    if (initialFriendId) {
      setFriendA(initialFriendId);
      setIsAddModalOpen(true);
    }
  }, [initialFriendId]);

  // Graph states
  const canvasRef = useRef(null);
  const [hoveredFriend, setHoveredFriend] = useState(null);
  const [positions, setPositions] = useState({});

  // Compute all unique connections (edges)
  const allConnections = useMemo(() => {
    const edges = [];
    const processed = new Set();

    friends.forEach(friend => {
      friend.connections.forEach(connId => {
        // Create a unique key for the pair (sorted IDs)
        const pairKey = [friend.id, connId].sort().join('-');
        if (!processed.has(pairKey)) {
          const connectedFriend = friends.find(f => f.id === connId);
          if (connectedFriend) {
            edges.push({
              id: pairKey,
              friend1: friend,
              friend2: connectedFriend
            });
            processed.add(pairKey);
          }
        }
      });
    });
    return edges;
  }, [friends]);

  const filteredConnections = allConnections.filter(edge => 
    edge.friend1.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    edge.friend2.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddConnection = () => {
    if (!friendA || !friendB) return;
    if (friendA === friendB) {
      toast({ title: t('messages.errorSelf'), variant: "destructive" });
      return;
    }
    
    // Check duplicate
    const exists = allConnections.some(edge => 
      (edge.friend1.id === friendA && edge.friend2.id === friendB) || 
      (edge.friend1.id === friendB && edge.friend2.id === friendA)
    );

    if (exists) {
      toast({ title: t('messages.errorDuplicate'), variant: "destructive" });
      return;
    }

    addConnection(friendA, friendB);
    toast({ title: t('messages.successConnection') });
    
    // Only reset if not in pre-selected mode
    if (!initialFriendId) {
       setFriendA('');
    }
    setFriendB('');
    setIsAddModalOpen(false);
  };

  const handleDeleteConnection = (f1Id, f2Id) => {
    if (confirm(t('connections.confirmRemove'))) {
      removeConnection(f1Id, f2Id);
      toast({ title: t('messages.successDisconnection') });
    }
  };

  // --- Graph Effect ---
  useEffect(() => {
    if (viewMode !== 'graph') return;
    
    const canvas = canvasRef.current;
    if (!canvas || friends.length === 0) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    const newPositions = {};
    friends.forEach((friend, index) => {
      const angle = (index / friends.length) * 2 * Math.PI - Math.PI / 2;
      newPositions[friend.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    setPositions(newPositions);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      friends.forEach(friend => {
        const pos1 = newPositions[friend.id];
        if (!pos1) return;

        friend.connections.forEach(connId => {
          const pos2 = newPositions[connId];
          if (!pos2) return;

          const isHighlighted = hoveredFriend?.id === friend.id || hoveredFriend?.id === connId;

          ctx.beginPath();
          ctx.moveTo(pos1.x, pos1.y);
          ctx.lineTo(pos2.x, pos2.y);
          ctx.strokeStyle = isHighlighted ? '#3b82f6' : '#cbd5e1'; // darker gray for normal
          ctx.lineWidth = isHighlighted ? 4 : 2; // Thicker lines as requested
          ctx.stroke();
        });
      });

      // Draw nodes
      friends.forEach(friend => {
        const pos = newPositions[friend.id];
        if (!pos) return;

        const isHovered = hoveredFriend?.id === friend.id;
        const nodeRadius = 24;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
        ctx.fillStyle = isHovered ? '#60a5fa' : '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Initials
        ctx.fillStyle = isHovered ? '#ffffff' : '#1e40af';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initial = friend.name.charAt(0).toUpperCase();
        ctx.fillText(initial, pos.x, pos.y);

        // Label
        ctx.fillStyle = '#1e40af';
        ctx.font = '12px sans-serif';
        ctx.fillText(friend.name, pos.x, pos.y + nodeRadius + 15);
      });
    };

    draw();
  }, [friends, hoveredFriend, viewMode]);

  const handleCanvasMove = (e) => {
    if (viewMode !== 'graph') return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let foundFriend = null;
    for (const friend of friends) {
      const pos = positions[friend.id];
      if (!pos) continue;
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      if (distance <= 30) {
        foundFriend = friend;
        break;
      }
    }
    setHoveredFriend(foundFriend);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Helmet>
        <title>CicloFriend - {t('connections.pageTitle')}</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
         <div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900 flex items-center gap-3">
               <Network className="w-8 h-8 text-blue-600" />
               {t('connections.title')}
            </h1>
            <p className="text-blue-600 mt-1 text-sm md:text-base">{t('connections.totalConnections')}: {allConnections.length}</p>
         </div>

         <div className="flex gap-2 w-full md:w-auto">
            <div className="flex bg-white rounded-lg p-1 border border-blue-200 shadow-sm">
               <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all flex items-center gap-2 min-h-[44px] ${viewMode === 'list' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-400 hover:text-blue-500'}`}
                  title="Lista"
               >
                  <List className="w-5 h-5" />
                  <span className="text-sm hidden sm:inline">Lista</span>
               </button>
               <button 
                  onClick={() => setViewMode('graph')}
                  className={`p-2 rounded-md transition-all flex items-center gap-2 min-h-[44px] ${viewMode === 'graph' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-400 hover:text-blue-500'}`}
                  title="Grafo"
               >
                  <Network className="w-5 h-5" />
                  <span className="text-sm hidden sm:inline">Grafo</span>
               </button>
            </div>
            
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white flex-1 md:flex-none min-h-[44px]">
               <Plus className="w-4 h-4 mr-2" /> {t('connections.add')}
            </Button>
         </div>
      </div>

      {/* Add Connection Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
           <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
              >
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-blue-900">{t('connections.add')}</h2>
                    <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
                       <X className="w-6 h-6" />
                    </button>
                 </div>
                 
                 <div className="space-y-4">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">{t('connections.selectFriend1')}</label>
                       <select 
                          className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[44px] ${initialFriendId ? 'bg-gray-100' : ''}`}
                          value={friendA}
                          onChange={e => setFriendA(e.target.value)}
                          disabled={!!initialFriendId}
                       >
                          <option value="">{t('app.search')}</option>
                          {friends.map(f => (
                             <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                       </select>
                    </div>

                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">{t('connections.selectFriend2')}</label>
                       <select 
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[44px]"
                          value={friendB}
                          onChange={e => setFriendB(e.target.value)}
                          disabled={!friendA}
                       >
                          <option value="">{t('app.search')}</option>
                          {friends.filter(f => f.id !== friendA).map(f => (
                             <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                       </select>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                       <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} className="min-h-[44px]">{t('app.cancel')}</Button>
                       <Button onClick={handleAddConnection} disabled={!friendA || !friendB} className="bg-blue-600 text-white min-h-[44px]">{t('app.save')}</Button>
                    </div>
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-blue-100 overflow-hidden min-h-[500px]">
         {viewMode === 'list' && (
            <div className="p-4 md:p-6">
               <div className="relative mb-6 max-w-md">
                  <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                  <input 
                     type="text" 
                     placeholder={t('connections.searchPlaceholder')}
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  />
               </div>

               {filteredConnections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {filteredConnections.map((edge) => (
                        <motion.div 
                           key={edge.id}
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="flex items-center justify-between p-4 rounded-xl bg-white border border-blue-100 hover:shadow-md transition-shadow group"
                        >
                           <div className="flex items-center flex-1 gap-2">
                              {/* Friend 1 */}
                              <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate(`/friend/${edge.friend1.id}`)}>
                                 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs overflow-hidden border border-blue-200">
                                    {edge.friend1.photos?.[0] ? <img src={edge.friend1.photos[0].url} className="w-full h-full object-cover" /> : edge.friend1.name.charAt(0)}
                                 </div>
                                 <span className="text-xs font-medium mt-1 text-center max-w-[60px] truncate">{edge.friend1.name.split(' ')[0]}</span>
                              </div>

                              <div className="flex-1 h-px bg-blue-200 mx-2 relative">
                                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-50 rounded-full p-1">
                                    <LinkIcon className="w-3 h-3 text-blue-400" />
                                 </div>
                              </div>

                              {/* Friend 2 */}
                              <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate(`/friend/${edge.friend2.id}`)}>
                                 <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs overflow-hidden border border-indigo-200">
                                    {edge.friend2.photos?.[0] ? <img src={edge.friend2.photos[0].url} className="w-full h-full object-cover" /> : edge.friend2.name.charAt(0)}
                                 </div>
                                 <span className="text-xs font-medium mt-1 text-center max-w-[60px] truncate">{edge.friend2.name.split(' ')[0]}</span>
                              </div>
                           </div>
                           
                           <button 
                              onClick={() => handleDeleteConnection(edge.friend1.id, edge.friend2.id)}
                              className="ml-3 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </motion.div>
                     ))}
                  </div>
               ) : (
                  <div className="text-center py-20">
                     <Network className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                     <p className="text-gray-500 font-medium">{t('messages.noData')}</p>
                     {allConnections.length === 0 && (
                        <p className="text-sm text-blue-400 mt-2">{t('connections.noConnections')}</p>
                     )}
                  </div>
               )}
            </div>
         )}

         {viewMode === 'graph' && (
            <div className="relative w-full h-[600px] bg-slate-50 overflow-hidden touch-none">
               {friends.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                     {t('dashboard.noFriends')}
                  </div>
               ) : (
                  <canvas
                     ref={canvasRef}
                     onMouseMove={handleCanvasMove}
                     onMouseLeave={() => setHoveredFriend(null)}
                     className="w-full h-full cursor-move"
                  />
               )}
               <div className="absolute bottom-4 right-4 bg-white/90 p-2 rounded text-xs text-gray-500 pointer-events-none border shadow-sm">
                  {friends.length} {t('dashboard.connections')} • {allConnections.length} Links
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default FriendNetwork;