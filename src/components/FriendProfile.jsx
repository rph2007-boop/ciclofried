import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useFriends } from '@/contexts/FriendsContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '../lib/customSupabaseClient.js';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, Phone, MessageSquare, StickyNote, User, ChevronDown, Network, Star, Palette } from 'lucide-react';
import { calculateAge, formatBirthday } from '@/utils/dateUtils';
import { useTranslation } from 'react-i18next';
import PhotoGallery from './PhotoGallery';
import DeleteConfirmation from './DeleteConfirmation';
import MeetingScheduler from './MeetingScheduler';
import MeetingsList from './MeetingsList';
import ImportantEventsManager from './ImportantEventsManager';
import ConnectionsManager from './ConnectionsManager';
import ColorPicker from './ColorPicker';

const FriendProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getFriendById, updateFriend } = useFriends();
  const [deleteModal, setDeleteModal] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesContent, setNotesContent] = useState('');

  const friend = getFriendById(id);
  if (!friend) return <div className="p-8 text-center text-gray-500">Friend not found</div>;

  const profilePhoto = friend.photos?.find(p => p.id === friend.profilePhotoId) || friend.photos?.[0];
  const age = calculateAge(friend.birthday);

  return (
    <div className="min-h-screen pb-20">
      <Helmet><title>CicloFriend - {friend.name}</title></Helmet>
      <div 
        className="relative h-64 md:h-80 transition-all duration-700 ease-in-out"
        style={{ background: friend.cardBackgroundColor || 'linear-gradient(to right, #2563eb, #4f46e5, #9333ea)' }}
      >
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10 flex justify-between items-start pt-6">
            <Button onClick={() => navigate('/')} variant="ghost" className="text-white min-h-[44px]">
              <ArrowLeft className="w-5 h-5 mr-2" /> {t('app.back')}
            </Button>
            <Button onClick={() => setShowColorPicker(true)} variant="ghost" size="sm" className="text-white min-h-[44px]">
               <Palette className="w-4 h-4 mr-2" />
               <span className="hidden sm:inline">Customize Card</span>
            </Button>
         </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white rounded-3xl p-8 text-center shadow-lg">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-blue-50 mb-4">
                  {profilePhoto ? <img src={profilePhoto.url} className="w-full h-full object-cover" /> : <User className="w-16 h-16 mx-auto mt-8 text-gray-300" />}
                </div>
                <h1 className="text-2xl font-bold">{friend.name}</h1>
                <p className="text-blue-600 font-medium">{friend.category}</p>
                <div className="mt-8 space-y-4 text-left">
                  {friend.phone && <div className="flex gap-4"><Phone className="text-green-500"/><p>{friend.phone}</p></div>}
                  {friend.address && <div className="flex gap-4"><MapPin className="text-blue-500"/><p>{friend.address}</p></div>}
                </div>
             </div>
          </div>
          <div className="lg:col-span-8 space-y-10">
             <PhotoGallery friend={friend} isEditing={true} />
             <ConnectionsManager friendId={id} />
          </div>
        </div>
      </div>
      <DeleteConfirmation open={deleteModal} friend={friend} onClose={() => setDeleteModal(false)} />
      {showColorPicker && <ColorPicker selectedColor={friend.cardBackgroundColor} onSelect={(c) => updateFriend(id, { cardBackgroundColor: c })} onClose={() => setShowColorPicker(false)} />}
    </div>
  );
};
export default FriendProfile;