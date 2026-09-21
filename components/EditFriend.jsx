import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFriends } from '@/contexts/FriendsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getZodiacSign } from '@/utils/zodiacSign';
import { ArrowLeft, Plus, X, ChevronDown, User, Camera, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PhotoGallery from '@/components/PhotoGallery';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

const EditFriend = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { getFriendById, updateFriend, categories, preferences: globalPreferences, addPreference, updateFriendProfilePhoto, uploadPhotoBlob } = useFriends();
  const { toast } = useToast();

  const friend = getFriendById(id);

  const [formData, setFormData] = useState(null);
  const [prefInputs, setPrefInputs] = useState({});
  const [socialInput, setSocialInput] = useState({ platform: '', username: '' });
  const [profilePreview, setProfilePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (friend) {
      setFormData({
        name: friend.name || '',
        category: friend.category || 'Outros',
        meetingPlace: friend.meetingPlace || '',
        birthday: friend.birthday || '',
        hasBirthday: !!friend.birthday,
        zodiacSign: friend.zodiacSign || '',
        address: friend.address || '',
        phone: friend.phone || '',
        socials: friend.socials || [],
        preferences: friend.preferences || {}
      });
      
      const currentProfilePhoto = friend.photos?.find(p => p.id === friend.profilePhotoId);
      if (currentProfilePhoto) {
        setProfilePreview(currentProfilePhoto.url);
      }
    }
  }, [friend]);

  if (!formData) return <div>Loading...</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'birthday' && value) {
       setFormData(prev => ({ ...prev, zodiacSign: getZodiacSign(value) }));
    }
  };

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;
    
    // Validate
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Max 5MB." });
      return;
    }

    setIsUploading(true);
    try {
      // Create path: userId/friendId-timestamp.ext
      const fileExt = file.name.split('.').pop();
      const fileName = `${friend.id}-${Date.now()}.${fileExt}`;
      
      const signedUrl = await uploadPhotoBlob(file, currentUser.id, fileName);
      
      if (signedUrl) {
         // Update Friend Record
         const newPhotoId = fileName;
         // Helper updates local state + persists
         updateFriendProfilePhoto(friend.id, signedUrl); 
         setProfilePreview(signedUrl);
         toast({ title: t('messages.successPhoto') });
      }

    } catch (error) {
      console.error("Profile upload error:", error);
      toast({ variant: "destructive", title: "Upload Failed", description: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddPreferenceItem = (catId, item) => {
    if (!item) return;
    setFormData(prev => {
      const currentList = prev.preferences[catId] || [];
      if (currentList.includes(item)) return prev;
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          [catId]: [...currentList, item]
        }
      };
    });
    setPrefInputs(prev => ({ ...prev, [catId]: { ...prev[catId], selected: '', custom: '' } }));
  };

  const handleCreateAndAddPreference = (catId, newItem) => {
    if (!newItem) return;
    addPreference(catId, newItem);
    handleAddPreferenceItem(catId, newItem);
    toast({ title: "Item created and added!" });
  };

  const handleRemovePreferenceItem = (catId, item) => {
    setFormData(prev => {
      const currentList = prev.preferences[catId] || [];
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          [catId]: currentList.filter(i => i !== item)
        }
      };
    });
  };

  const handleSocialAdd = () => {
    if (socialInput.platform && socialInput.username) {
      setFormData(prev => ({ ...prev, socials: [...prev.socials, socialInput] }));
      setSocialInput({ platform: '', username: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateFriend(id, {
        ...formData,
        birthday: formData.hasBirthday ? formData.birthday : null
    });
    toast({ title: t('messages.successUpdate') });
    navigate(`/friend/${id}`);
  };

  return (
    <div className="min-h-screen py-6 md:py-8 px-4 max-w-5xl mx-auto">
      <Helmet><title>CicloFriend - {t('app.edit')} {friend.name}</title></Helmet>
      <Button onClick={() => navigate(`/friend/${id}`)} variant="ghost" className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> {t('app.back')}
      </Button>

      <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white/90 backdrop-blur rounded-xl shadow-xl p-4 md:p-8">
         <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6">{t('app.edit')} {friend.name}</h1>
         
         <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center justify-center p-6 bg-blue-50/50 rounded-xl border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Foto de Perfil</h3>
              <div className="relative group w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md mb-4">
                 {profilePreview ? (
                    <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                        <User className="w-16 h-16" />
                    </div>
                 )}
                 <label className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${isUploading ? 'pointer-events-none opacity-100 bg-black/60' : ''}`}>
                    {isUploading ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <Camera className="w-8 h-8 text-white" />}
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoUpload} disabled={isUploading} />
                 </label>
              </div>
              
              <div className="flex gap-2">
                 <label className={`cursor-pointer px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors flex items-center gap-2 min-h-[44px] ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />} 
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoUpload} disabled={isUploading} />
                 </label>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="label">{t('friend.name')}</label>
                   <input name="name" value={formData.name} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                   <label className="label">{t('friend.category')}</label>
                   <select name="category" value={formData.category} onChange={handleChange} className="input-field">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
                
                <div>
                  <label className="flex items-center gap-2 label cursor-pointer mb-2 min-h-[44px]">
                    <input type="checkbox" checked={formData.hasBirthday} onChange={(e) => setFormData({...formData, hasBirthday: e.target.checked})} className="rounded w-5 h-5" />
                    {t('friend.addBirthday')}
                  </label>
                  {formData.hasBirthday && (
                    <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} className="input-field" />
                  )}
                </div>

                <div>
                   <label className="label">{t('friend.phone')}</label>
                   <input name="phone" value={formData.phone} onChange={handleChange} className="input-field" />
                </div>

                 <div>
                   <label className="label">{t('friend.address')}</label>
                   <input name="address" value={formData.address} onChange={handleChange} className="input-field" />
                </div>

                 <div>
                   <label className="label">{t('friend.meetingPlace')}</label>
                   <input name="meetingPlace" value={formData.meetingPlace} onChange={handleChange} className="input-field" />
                </div>
            </div>

            {/* Dynamic Preferences Section */}
            <div className="bg-blue-50/50 p-4 md:p-6 rounded-xl border border-blue-100">
               <h3 className="text-lg font-bold text-blue-900 mb-6">{t('app.preferences')}</h3>
               <div className="space-y-8">
                 {globalPreferences.map(category => (
                   <div key={category.id} className="bg-white p-4 rounded-xl shadow-sm border border-blue-100/50">
                      <h4 className="text-sm font-bold text-blue-800 mb-3 uppercase tracking-wide flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        {category.name}
                      </h4>
                      
                      {/* Selected Tags */}
                      <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
                        {formData.preferences[category.id]?.map(item => (
                          <span key={item} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                            {item}
                            <button 
                              type="button" 
                              onClick={() => handleRemovePreferenceItem(category.id, item)}
                              className="w-6 h-6 md:w-4 md:h-4 flex items-center justify-center rounded-full hover:bg-blue-200 text-blue-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="relative flex-1">
                            <select
                              className="w-full appearance-none pl-3 pr-8 py-3 md:py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white min-h-[44px]"
                              value={prefInputs[category.id]?.selected || ''}
                              onChange={(e) => setPrefInputs(prev => ({ ...prev, [category.id]: { ...prev[category.id], selected: e.target.value } }))}
                            >
                              <option value="">{t('preferences.selectOption')}</option>
                              {category.subcategories.map(opt => (
                                <option key={opt} value={opt} disabled={formData.preferences[category.id]?.includes(opt)}>{opt}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                          <Button 
                            type="button"
                            size="sm"
                            disabled={!prefInputs[category.id]?.selected}
                            onClick={() => handleAddPreferenceItem(category.id, prefInputs[category.id]?.selected)}
                            className="bg-blue-600 hover:bg-blue-700 text-white min-h-[44px] w-full sm:w-auto"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder={t('preferences.createSubcategory')}
                            className="flex-1 px-3 py-3 md:py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 min-h-[44px]"
                            value={prefInputs[category.id]?.custom || ''}
                            onChange={(e) => setPrefInputs(prev => ({ ...prev, [category.id]: { ...prev[category.id], custom: e.target.value } }))}
                          />
                           <Button 
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={!prefInputs[category.id]?.custom}
                            onClick={() => handleCreateAndAddPreference(category.id, prefInputs[category.id]?.custom)}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 min-h-[44px] w-full sm:w-auto"
                          >
                            {t('preferences.add')}
                          </Button>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
               <h3 className="font-semibold mb-4 text-blue-900">{t('friend.socials')}</h3>
               <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <input placeholder={t('friend.platform')} value={socialInput.platform} onChange={e => setSocialInput({...socialInput, platform: e.target.value})} className="input-field" />
                  <input placeholder={t('friend.username')} value={socialInput.username} onChange={e => setSocialInput({...socialInput, username: e.target.value})} className="input-field" />
                  <Button type="button" onClick={handleSocialAdd} className="min-h-[44px]"><Plus /></Button>
               </div>
               <div className="flex flex-wrap gap-2">
                  {formData.socials.map((s, idx) => (
                      <div key={idx} className="bg-white border px-3 py-1 rounded-full flex items-center gap-2">
                          <span className="font-bold text-xs">{s.platform}</span> {s.username}
                          <X className="w-4 h-4 cursor-pointer text-red-400 p-0.5" onClick={() => {
                              setFormData(prev => ({...prev, socials: prev.socials.filter((_, i) => i !== idx)}));
                          }} />
                      </div>
                  ))}
               </div>
            </div>
            
            <PhotoGallery friend={friend} isEditing={true} />

            <div className="flex flex-col sm:flex-row justify-end gap-4 border-t pt-6">
               <Button type="button" variant="ghost" onClick={() => navigate(`/friend/${id}`)} className="w-full sm:w-auto min-h-[44px]">{t('app.cancel')}</Button>
               <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto min-h-[44px]">{t('app.save')}</Button>
            </div>
         </form>
      </motion.div>
      <style>{`
        .label { display: block; font-size: 0.875rem; font-weight: 500; color: #1e3a8a; margin-bottom: 0.5rem; }
        .input-field { width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #bfdbfe; background: white; transition: all; min-height: 48px; }
        .input-field:focus { border-color: #60a5fa; outline: none; ring: 2px solid #bfdbfe; }
        @media (min-width: 768px) { .input-field { min-height: 40px; } }
      `}</style>
    </div>
  );
};

export default EditFriend;