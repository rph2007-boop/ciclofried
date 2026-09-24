import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useFriends } from '@/contexts/FriendsContext';
import { Search, Plus, User, MapPin, Link as LinkIcon, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateAge } from '@/utils/dateUtils';
import DeleteConfirmation from '@/components/DeleteConfirmation';
import { useTranslation } from 'react-i18next';
import { calculateProfileCompletion } from '@/utils/calculateProfileCompletion';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    friends,
    categories,
    getFriendMeetings,
    isLoaded,
    error
  } = useFriends();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    friend: null
  });

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>;
  }

  const filteredFriends = friends.filter(friend => friend.name.toLowerCase().includes(searchTerm.toLowerCase()) && (selectedCategory === 'All' || friend.category === selectedCategory));
  
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return <>
      <Helmet>
        <title>CicloFriend - {t('app.dashboard')}</title>
      </Helmet>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-blue-900 mb-2 md:mb-3 tracking-tight">CicloFriend</h1>
            <p className="text-base md:text-lg text-gray-500 font-light max-w-xl">
              {t('dashboard.welcome', { count: friends.length })}
            </p>
          </div>
          <Button onClick={() => navigate('/add-friend')} size="lg" className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-blue-500/25 rounded-full px-8 py-6 md:py-4 transition-all duration-300 min-h-[44px]">
            <Plus className="w-5 h-5 mr-2" />
            {t('app.addFriend')}
          </Button>
        </motion.div>

        {/* Filters & Search */}
        <div className="space-y-4 md:space-y-6 mb-8 md:mb-10">
          <div className="relative w-full max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-gray-400 w-5 h-5" />
            </div>
            <input type="text" placeholder={t('app.search')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 md:py-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-sm focus:shadow-lg focus:bg-white transition-all duration-300 outline-none text-gray-700 font-medium placeholder-gray-400 min-h-[48px]" />
          </div>
          
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            <button onClick={() => setSelectedCategory('All')} className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border min-h-[44px] ${selectedCategory === 'All' ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white/50 border-gray-200 text-gray-600 hover:bg-white hover:border-blue-300 hover:text-blue-600'}`}>
              {t('dashboard.allCategories')}
            </button>
            {categories.map(cat => <button key={cat} onClick={() => setSelectedCategory(cat)} className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border min-h-[44px] ${selectedCategory === cat ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white/50 border-gray-200 text-gray-600 hover:bg-white hover:border-blue-300 hover:text-blue-600'}`}>
                {cat}
              </button>)}
          </div>
        </div>

        {/* Grid */}
        {filteredFriends.length === 0 ? <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 md:py-32 bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm">
             <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
             <p className="text-lg md:text-xl text-gray-500 font-medium">{t('messages.noData')}</p>
             <p className="text-gray-400 mt-2 text-sm">Try adding a new friend or adjusting your search.</p>
          </motion.div> : <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredFriends.map(friend => {
          const profilePhoto = friend.photos?.find(p => p.id === friend.profilePhotoId) || friend.photos?.[0];
          const completion = calculateProfileCompletion(friend);
          const connectionCount = friend.connections?.length || 0;
          const meetingCount = getFriendMeetings(friend.id).length;
          return <motion.div key={friend.id} variants={item} whileHover={{ y: -8, transition: { duration: 0.3 } }} className="group relative bg-white rounded-[2rem] shadow-elegant hover:shadow-elegant-hover transition-all duration-300 overflow-hidden cursor-pointer border border-white/50" onClick={() => navigate(`/friend/${friend.id}`)}>
                  <div className="h-32 md:h-40 relative overflow-hidden transition-colors duration-500" style={{
              background: friend.cardBackgroundColor || 'linear-gradient(to right, #2563eb, #4f46e5, #9333ea)'
            }}>
                     <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                     {/* Decorative Circles */}
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                     <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

                     {/* Profile Completion Badge */}
                     <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 text-xs text-white font-bold flex items-center gap-2 shadow-sm">
                        <div className="w-4 h-4 rounded-full border-2 border-white/70 flex items-center justify-center text-[9px]">
                           {completion}
                        </div>
                        Concluído
                     </div>
                  </div>
                  
                  <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0 relative flex flex-col h-[calc(100%-8rem)] md:h-[calc(100%-10rem)]">
                     <div className="absolute -top-10 md:-top-12 left-6 md:left-8 p-1 bg-white rounded-full shadow-lg">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white flex items-center justify-center relative">
                            {profilePhoto ? <img src={profilePhoto.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <User className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />}
                        </div>
                     </div>

                     <div className="mt-12 md:mt-16 mb-4">
                        <div className="flex justify-between items-start mb-1">
                           <h3 className="text-xl md:text-2xl font-heading font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate pr-2">{friend.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">{friend.category}</span>
                          {friend.birthday && <span className="text-xs text-gray-400 flex items-center gap-1">• {calculateAge(friend.birthday)} years old</span>}
                        </div>
                     </div>
                     
                     {friend.address && <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-6 group-hover:text-gray-700 transition-colors">
                           <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" /> 
                           <span className="truncate">{friend.address}</span>
                        </div>}

                     <div className="mt-auto pt-4 md:pt-6 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex gap-4">
                           {connectionCount > 0 && <div className="flex items-center gap-1.5 text-gray-600 text-sm font-medium" title={t('dashboard.connections')}>
                                 <LinkIcon className="w-4 h-4 text-blue-500" />
                                 {connectionCount}
                              </div>}
                           {meetingCount > 0 && <div className="flex items-center gap-1.5 text-gray-600 text-sm font-medium" title={t('dashboard.meetings')}>
                                 <Calendar className="w-4 h-4 text-purple-500" />
                                 {meetingCount}
                              </div>}
                           {connectionCount === 0 && meetingCount === 0 && <span className="text-xs text-gray-400 italic">No activity yet</span>}
                        </div>
                        
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 md:opacity-0 md:group-hover:opacity-100 md:transform md:translate-x-2 md:group-hover:translate-x-0 transition-all duration-300">
                           <ArrowRight className="w-4 h-4" />
                        </div>
                     </div>
                  </div>
                </motion.div>;
        })}
          </motion.div>}
      </div>

      <DeleteConfirmation open={deleteModal.open} friend={deleteModal.friend} onClose={() => setDeleteModal({
      open: false,
      friend: null
    })} />
    </>;
};
export default Dashboard;