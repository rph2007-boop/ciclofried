import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFriends } from '@/contexts/FriendsContext';
import { supabase } from '../lib/customSupabaseClient.js';

const usePhotoSync = () => {
  const { currentUser } = useAuth();
  const { friends, updateFriend } = useFriends();

  useEffect(() => {
    if (!currentUser) return;

    const syncPhotos = async () => {
      try {
        const { data: files } = await supabase.storage
          .from('photos')
          .list(currentUser.id);

        if (!files || files.length === 0) return;

        const photosByFriend = {};

        files.forEach(file => {
          const parts = file.name.split('-');
          if (parts.length > 1) {
             const friendId = parts[0];
             if (friendId && friendId.length > 0) {
                 if (!photosByFriend[friendId]) photosByFriend[friendId] = [];
                 
                 const filePath = `${currentUser.id}/${file.name}`;
                 const { data: urlData } = supabase.storage.from('photos').getPublicUrl(filePath);
                 
                 if (urlData?.publicUrl) {
                    photosByFriend[friendId].push({
                        id: file.name,
                        url: urlData.publicUrl,
                        date: file.created_at,
                        storagePath: filePath
                    });
                 }
             }
          }
        });

        for (const friend of friends) {
           const foundPhotos = photosByFriend[friend.id];
           if (foundPhotos && foundPhotos.length > 0) {
              const currentIds = new Set(friend.photos?.map(p => p.id));
              const newIds = new Set(foundPhotos.map(p => p.id));
              
              let hasChanges = currentIds.size !== newIds.size;
              if (!hasChanges) {
                 for (let id of newIds) if (!currentIds.has(id)) hasChanges = true;
              }

              if (hasChanges) {
                  updateFriend(friend.id, { photos: foundPhotos });
              }
           }
        }

      } catch (error) {
        console.error("Photo sync error:", error);
      }
    };

    syncPhotos();
    const interval = setInterval(syncPhotos, 5 * 60 * 1000);
    return () => clearInterval(interval);

  }, [currentUser?.id, friends.length]);
};

export default usePhotoSync;