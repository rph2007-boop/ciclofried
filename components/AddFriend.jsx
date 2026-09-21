import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useFriends } from '@/contexts/FriendsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getZodiacSign } from '@/utils/zodiacSign';
import { ArrowLeft, UserPlus, Plus, X, ChevronDown, Camera, Star, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AddFriend = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addFriend, uploadPhotoBlob, categories, preferences: globalPreferences, addPreference } = useFriends();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [hasBirthday, setHasBirthday] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Amigos',
    meetingPlace: '',
    birthday: '',
    zodiacSign: '',
    address: '',
    phone: '',
    socials: [],
    preferences: {}
  });

  const [prefInputs, setPrefInputs] = useState({});
  const [socialInput, setSocialInput] = useState({ platform: '', username: '' });
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const handleSocialAdd = () => {
    if (socialInput.platform && socialInput.username) {
      setFormData(prev => ({
        ...prev,
        socials: [...prev.socials, socialInput]
      }));
      setSocialInput({ platform: '', username: '' });
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

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setIsSaving(true);
    let uploadedPhotoUrl = null;
    let photoData = [];
    let profilePhotoId = null;
    
    // Generate friend ID early to use in photo path
    const friendId = Date.now().toString();

    try {
      // 1. Upload photo if exists
      if (photoFile && currentUser) {
        // Construct filename: friendId-timestamp.ext
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${friendId}-${Date.now()}.${fileExt}`;
        
        // Upload to user's root folder with friend-specific filename
        uploadedPhotoUrl = await uploadPhotoBlob(photoFile, currentUser.id, fileName);
        
        if (uploadedPhotoUrl) {
          const newPhotoId = fileName; // Use filename as ID for consistency
          photoData = [{
             id: newPhotoId, 
             url: uploadedPhotoUrl, 
             date: new Date().toISOString() 
          }];
          profilePhotoId = newPhotoId;
        }
      } else if (photoFile) {
         // Guest mode fallback
         uploadedPhotoUrl = await uploadPhotoBlob(photoFile);
         if (uploadedPhotoUrl) {
            photoData = [{ id: 'guest-photo', url: uploadedPhotoUrl, date: new Date().toISOString() }];
            profilePhotoId = 'guest-photo';
         }
      }

      // 2. Save friend data with photo reference
      addFriend({
        ...formData,
        id: friendId,
        birthday: hasBirthday ? formData.birthday : null,
        photos: photoData,
        profilePhotoId: profilePhotoId
      });

      toast({ title: t('messages.successAdd') });
      navigate('/');
    } catch (error) {
      console.error("Error saving friend:", error);
      toast({ 
        variant: "destructive", 
        title: "Erro ao salvar", 
        description: "Ocorreu um erro ao salvar o amigo. Tente novamente." 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'birthday' && value) {
      setFormData(prev => ({ ...prev, zodiacSign: getZodiacSign(value) }));
    }
  };

  return (
    <div className="min-h-screen py-8 md:py-12 px-4 max-w-4xl mx-auto">
      <Helmet><title>CicloFriend - {t('app.addFriend')}</title></Helmet>
      
      <Button onClick={() => navigate('/')} variant="ghost" className="mb-4 md:mb-6 hover:bg-white/50">
        <ArrowLeft className="w-4 h-4 mr-2" /> {t('app.back')}
      </Button>

      <motion.div 
        initial={{opacity:0, y:20}} 
        animate={{opacity:1, y:0}} 
        className="glass-card rounded-3xl p-6 md:p-12"
      >
        <div className="text-center mb-8 md:mb-10">
           <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-2">{t('app.addFriend')}</h1>
           <p className="text-sm md:text-base text-gray-500">Expanda seu CicloFriend adicionando uma nova conexão.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
          
          {/* Photo Upload - Centered */}
          <div className="flex flex-col items-center justify-center">
             <div className="relative group w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-white border-4 border-white shadow-xl mb-4">
                {photoUrl ? (
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full bg-blue-50 text-blue-200">
                        <UserPlus className="w-12 h-12 md:w-16 md:h-16" />
                    </div>
                )}
                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-8 h-8 text-white mb-1" />
                    <span className="text-white text-xs font-bold uppercase tracking-wider">Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
             </div>
             <p className="text-sm text-gray-400 font-medium">Foto de Perfil</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="col-span-1 md:col-span-2">
               <label className="input-label">{t('friend.name')}</label>
               <input required name="name" value={formData.name} onChange={handleChange} className="input-field text-lg font-semibold" placeholder="Nome Completo" />
            </div>
            
            <div>
              <label className="input-label">{t('friend.category')}</label>
              <div className="relative">
                <select name="category" value={formData.category} onChange={handleChange} className="input-field appearance-none">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
               <label className="input-label">{t('friend.phone')}</label>
               <input name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="+1 (555) 000-0000" />
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="flex items-center gap-3">
                  <div className="relative flex items-center min-h-[44px]">
                     <input type="checkbox" id="hasBirthday" checked={hasBirthday} onChange={(e) => setHasBirthday(e.target.checked)} className="w-6 h-6 md:w-5 md:h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 mr-3" />
                     <label htmlFor="hasBirthday" className="text-sm font-medium text-gray-700 cursor-pointer">{t('friend.addBirthday')}</label>
                  </div>
               </div>
               
               {hasBirthday && (
                  <div className="flex flex-col md:flex-row gap-4">
                     <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} className="input-field w-full" />
                     <div className="relative w-full">
                        <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-purple-600 font-bold z-10">{t('friend.zodiac')}</label>
                        <input value={formData.zodiacSign} readOnly className="input-field bg-purple-50 text-purple-900 border-purple-100" />
                     </div>
                  </div>
               )}
            </div>

            <div className="md:col-span-2">
               <label className="input-label">{t('friend.address')}</label>
               <input name="address" value={formData.address} onChange={handleChange} className="input-field" placeholder="Endereço, Cidade, País" />
            </div>

             <div className="md:col-span-2">
               <label className="input-label">{t('friend.meetingPlace')}</label>
               <input name="meetingPlace" value={formData.meetingPlace} onChange={handleChange} className="input-field" placeholder="Onde vocês se conheceram?" />
            </div>
          </div>

          {/* Dynamic Preferences Section */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
             <h3 className="text-xl font-heading font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                {t('app.preferences')}
             </h3>
             <div className="space-y-8">
               {globalPreferences.map(category => (
                 <div key={category.id} className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{category.name}</h4>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.preferences[category.id]?.map(item => (
                        <span key={item} className="inline-flex items-center gap-1 pl-3 pr-2 py-1.5 bg-gray-100 text-gray-800 text-sm rounded-lg font-medium group">
                          {item}
                          <button 
                            type="button" 
                            onClick={() => handleRemovePreferenceItem(category.id, item)}
                            className="w-8 h-8 md:w-5 md:h-5 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4 md:w-3 md:h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                       <div className="relative flex-1">
                          <select
                            className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all min-h-[48px]"
                            value={prefInputs[category.id]?.selected || ''}
                            onChange={(e) => setPrefInputs(prev => ({ ...prev, [category.id]: { ...prev[category.id], selected: e.target.value } }))}
                          >
                            <option value="">{t('preferences.selectOption')}</option>
                            {category.subcategories.map(opt => (
                              <option key={opt} value={opt} disabled={formData.preferences[category.id]?.includes(opt)}>{opt}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <Button 
                          type="button"
                          disabled={!prefInputs[category.id]?.selected}
                          onClick={() => handleAddPreferenceItem(category.id, prefInputs[category.id]?.selected)}
                          className="bg-gray-900 text-white hover:bg-black rounded-xl min-h-[48px] w-full sm:w-auto"
                        >
                          <Plus className="w-5 h-5 md:w-4 md:h-4 mr-2 sm:mr-0" />
                          <span className="sm:hidden">{t('app.add')}</span>
                        </Button>
                    </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Social Media */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
             <label className="input-label mb-4 block">{t('friend.socials')}</label>
             <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input 
                    placeholder="Platforma (ex: Instagram)" 
                    value={socialInput.platform} 
                    onChange={e => setSocialInput({...socialInput, platform: e.target.value})} 
                    className="input-field flex-1"
                />
                <input 
                    placeholder="Usuário / URL" 
                    value={socialInput.username} 
                    onChange={e => setSocialInput({...socialInput, username: e.target.value})} 
                    className="input-field flex-1"
                />
                <Button type="button" onClick={handleSocialAdd} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl sm:aspect-square p-0 w-full sm:w-12 h-12 flex items-center justify-center">
                    <Plus className="w-5 h-5 sm:w-4 sm:h-4 mr-2 sm:mr-0" />
                    <span className="sm:hidden">{t('app.add')}</span>
                </Button>
             </div>
             <div className="flex flex-wrap gap-2">
                {formData.socials.map((s, idx) => (
                    <div key={idx} className="bg-white px-4 py-2 rounded-xl shadow-sm text-sm flex items-center gap-3 text-gray-700 border border-gray-100">
                        <span className="font-bold text-blue-600">{s.platform}:</span> {s.username}
                        <button type="button" onClick={() => {
                            setFormData(prev => ({...prev, socials: prev.socials.filter((_, i) => i !== idx)}));
                        }} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                           <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
             </div>
          </div>
          
          <div className="pt-6">
            <Button disabled={isSaving} type="submit" className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl rounded-2xl transition-all hover:scale-[1.01]">
               {isSaving ? (
                 <>
                   <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                   Salvando...
                 </>
               ) : t('app.save')}
            </Button>
          </div>
        </form>
      </motion.div>
      
      <style>{`
        .input-label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem; letter-spacing: 0.01em; }
        .input-field { width: 100%; padding: 0.875rem 1rem; border-radius: 0.75rem; border: 1px solid #e5e7eb; background: #ffffff; transition: all 0.2s; color: #1f2937; min-height: 48px; }
        .input-field:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        .input-field::placeholder { color: #9ca3af; }
        @media (min-width: 640px) { .input-field { min-height: 40px; } }
      `}</style>
    </div>
  );
};

export default AddFriend;