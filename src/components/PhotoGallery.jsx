import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFriends } from '@/contexts/FriendsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '../lib/customSupabaseClient.js';
import { Trash2, Star, X, Image as ImageIcon, ChevronLeft, ChevronRight, Camera, Upload, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import DeletePhotoConfirmation from './DeletePhotoConfirmation';

const PhotoGallery = ({ friend, isEditing = false }) => {
  const { t } = useTranslation();
  const { updateFriend, uploadPhotoBlob } = useFriends();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;
    setIsLoading(true);
    try {
      const fileName = `${friend.id}-${Date.now()}.${file.name.split('.').pop()}`;
      const signedUrl = await uploadPhotoBlob(file, currentUser.id, fileName);
      if (signedUrl) {
         const newPhoto = { id: fileName, url: signedUrl, date: new Date().toISOString() };
         updateFriend(friend.id, { photos: [...(friend.photos || []), newPhoto] });
         toast({ title: "Photo added!" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Upload Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2"><ImageIcon className="text-blue-600"/>{t('friend.photos')}</h3>
        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-xl text-sm min-h-[44px] flex items-center">
          {isLoading ? <Loader2 className="animate-spin mr-2"/> : <Upload className="mr-2"/>} Add Photo
          <input type="file" className="hidden" onChange={handleFileUpload} disabled={isLoading} />
        </label>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(friend.photos || []).map((photo, index) => (
          <div key={photo.id} className="aspect-square rounded-2xl overflow-hidden cursor-pointer" onClick={() => { setSelectedPhotoIndex(index); setIsViewerOpen(true); }}>
            <img src={photo.url} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
};
export default PhotoGallery;