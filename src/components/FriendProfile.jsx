import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useFriends } from '@/contexts/FriendsContext';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Edit, Trash2, Calendar, MapPin, Phone, MessageSquare,
  StickyNote, User, ChevronDown, Network, Star, Palette, Plus,
  Sparkles, Heart, Gift, Coffee, Film, Compass, Globe
} from 'lucide-react';
import { calculateAge, formatBirthday } from '@/utils/dateUtils';
import { getZodiacSign } from '@/utils/zodiacSign';
import { calculateProfileCompletion } from '@/utils/calculateProfileCompletion';
import { useTranslation } from 'react-i18next';
import PhotoGallery from './PhotoGallery';
import DeleteConfirmation from './DeleteConfirmation';
import MeetingScheduler from './MeetingScheduler';
import MeetingsList from './MeetingsList';
import ImportantEventsManager from './ImportantEventsManager';
import ConnectionsManager from './ConnectionsManager';
import ColorPicker from './ColorPicker';

const PREF_ICONS = {
  drinks: Coffee,
  outings: Compass,
  movies: Film,
  places: MapPin,
  gifts: Gift,
};

const PREF_LABELS = {
  drinks: 'Bebidas',
  outings: 'Saídas & Rolês',
  movies: 'Filmes & Séries',
  places: 'Lugares Favoritos',
  gifts: 'Desejos de Presente',
};

const FriendProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getFriendById, updateFriend, getFriendMeetings, getFriendEvents } = useFriends();

  const [deleteModal, setDeleteModal] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'meetings', 'events', 'photos', 'connections'
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesContent, setNotesContent] = useState('');

  const friend = getFriendById(id);
  if (!friend) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <User className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Amigo não encontrado</h2>
        <p className="text-gray-500 mb-6">O amigo solicitado pode ter sido excluído ou não existe.</p>
        <Button onClick={() => navigate('/dashboard')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
          Voltar ao Painel
        </Button>
      </div>
    );
  }

  const profilePhoto = friend.photos?.find(p => p.id === friend.profilePhotoId) || friend.photos?.[0] || (friend.profilePhotoUrl ? { url: friend.profilePhotoUrl } : null);
  const age = calculateAge(friend.birthday);
  const zodiac = getZodiacSign(friend.birthday);
  const completion = calculateProfileCompletion(friend);
  const meetings = getFriendMeetings(id);
  const events = getFriendEvents(id);
  const preferences = friend.preferences || {};

  const handleSaveNotes = () => {
    updateFriend(id, { notes: notesContent });
    setIsEditingNotes(false);
  };

  const handleStartEditNotes = () => {
    setNotesContent(friend.notes || '');
    setIsEditingNotes(true);
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral & Gostos', icon: Heart },
    { id: 'meetings', label: `Encontros (${meetings.length})`, icon: Calendar },
    { id: 'events', label: `Datas Importantes (${events.length})`, icon: Star },
    { id: 'photos', label: `Fotos (${friend.photos?.length || 0})`, icon: Sparkles },
    { id: 'connections', label: `Conexões (${friend.connections?.length || 0})`, icon: Network },
  ];

  return (
    <div className="min-h-screen pb-20">
      <Helmet>
        <title>CicloFriend - {friend.name}</title>
      </Helmet>

      {/* Hero Header with customizable background gradient */}
      <div
        className="relative h-64 md:h-80 transition-all duration-700 ease-in-out shadow-inner"
        style={{ background: friend.cardBackgroundColor || 'linear-gradient(to right, #2563eb, #4f46e5, #9333ea)' }}
      >
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10 flex justify-between items-start pt-6">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-white hover:bg-white/20 backdrop-blur-sm rounded-full min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> {t('app.back')}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowColorPicker(true)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 backdrop-blur-sm rounded-full min-h-[44px]"
            >
              <Palette className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Cor do Card</span>
            </Button>
            <Button
              onClick={() => navigate(`/friend/${id}/edit`)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 backdrop-blur-sm rounded-full min-h-[44px]"
            >
              <Edit className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
            <Button
              onClick={() => setDeleteModal(true)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-red-500/30 backdrop-blur-sm rounded-full min-h-[44px]"
            >
              <Trash2 className="w-4 h-4 text-red-200" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 text-center shadow-xl border border-gray-100">
              {/* Profile Avatar */}
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-blue-50 flex items-center justify-center mx-auto">
                  {profilePhoto ? (
                    <img src={profilePhoto.url} alt={friend.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-blue-300" />
                  )}
                </div>
                {/* Profile Completion Badge */}
                <div
                  className="absolute bottom-1 right-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full px-2.5 py-0.5 text-xs font-bold shadow-md border-2 border-white"
                  title="Progresso do Perfil"
                >
                  {completion}%
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-1">{friend.name}</h1>
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100 mb-6">
                {friend.category}
              </span>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Button
                  onClick={() => setShowScheduler(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md min-h-[44px] flex items-center justify-center gap-2"
                  size="sm"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Encontro</span>
                </Button>
                <Button
                  onClick={() => navigate(`/friend/${id}/edit`)}
                  variant="outline"
                  className="w-full border-blue-200 hover:bg-blue-50 text-blue-700 rounded-xl min-h-[44px] flex items-center justify-center gap-2"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </Button>
              </div>

              {/* Personal Details */}
              <div className="space-y-4 text-left border-t border-gray-100 pt-6 text-sm">
                {friend.birthday && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Aniversário</p>
                      <p className="text-gray-800 font-semibold">{formatBirthday(friend.birthday)} {age ? `(${age} anos)` : ''}</p>
                      {zodiac && <p className="text-xs text-indigo-600 font-medium">{zodiac}</p>}
                    </div>
                  </div>
                )}

                {friend.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Telefone / WhatsApp</p>
                      <a href={`tel:${friend.phone}`} className="text-gray-800 hover:text-emerald-600 font-semibold transition-colors">
                        {friend.phone}
                      </a>
                    </div>
                  </div>
                )}

                {friend.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Endereço / Localização</p>
                      <p className="text-gray-800 font-medium">{friend.address}</p>
                    </div>
                  </div>
                )}

                {friend.meetingPlace && (
                  <div className="flex items-start gap-3">
                    <Compass className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Onde se conheceram</p>
                      <p className="text-gray-800 font-medium">{friend.meetingPlace}</p>
                    </div>
                  </div>
                )}

                {friend.socials && friend.socials.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1">Redes Sociais</p>
                      <div className="flex flex-wrap gap-2">
                        {friend.socials.map((s, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                            <span className="font-bold text-blue-600">{s.platform}:</span> {s.username}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div className="mt-6 pt-6 border-t border-gray-100 text-left">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <StickyNote className="w-4 h-4 text-amber-500" /> Notas Pessoais
                  </h3>
                  {!isEditingNotes ? (
                    <button onClick={handleStartEditNotes} className="text-xs text-blue-600 hover:underline">
                      Editar
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setIsEditingNotes(false)} className="text-xs text-gray-400 hover:text-gray-600">
                        Cancelar
                      </button>
                      <button onClick={handleSaveNotes} className="text-xs text-blue-600 font-bold hover:underline">
                        Salvar
                      </button>
                    </div>
                  )}
                </div>

                {isEditingNotes ? (
                  <textarea
                    value={notesContent}
                    onChange={(e) => setNotesContent(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-28"
                    placeholder="Escreva anotações importantes sobre seu amigo..."
                  />
                ) : (
                  <p className="text-sm text-gray-600 italic bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                    {friend.notes || 'Nenhuma anotação adicionada ainda. Clique em Editar para anotar lembretes e detalhes sobre este amigo.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Tabbed Content */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Tabs Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar bg-white/70 backdrop-blur-sm p-2 rounded-2xl border border-gray-100 shadow-sm">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isCurrent = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 min-h-[44px] ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Overview & Preferences */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-rose-500" />
                        Gostos & Preferências
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Descubra o que este amigo adora para planejar saídas perfeitas ou escolher o presente ideal.
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate(`/friend/${id}/edit`)}
                      variant="outline"
                      size="sm"
                      className="border-gray-200 rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Gerenciar
                    </Button>
                  </div>

                  {Object.keys(preferences).length === 0 || Object.values(preferences).every(arr => !arr || arr.length === 0) ? (
                    <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">Nenhuma preferência cadastrada ainda.</p>
                      <p className="text-xs text-gray-400 mt-1 mb-4">Adicione bebidas favoritas, saídas, filmes e dicas de presentes!</p>
                      <Button onClick={() => navigate(`/friend/${id}/edit`)} size="sm" className="bg-blue-600 text-white rounded-full">
                        Adicionar Preferências
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(preferences).map(([catKey, items]) => {
                        if (!items || items.length === 0) return null;
                        const IconComponent = PREF_ICONS[catKey] || Heart;
                        const label = PREF_LABELS[catKey] || catKey;

                        return (
                          <div key={catKey} className="bg-blue-50/40 rounded-2xl p-4 border border-blue-100/60">
                            <h3 className="font-bold text-sm text-blue-900 mb-3 flex items-center gap-2">
                              <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                                <IconComponent className="w-4 h-4" />
                              </div>
                              {label}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {items.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="bg-white text-gray-700 text-xs px-3 py-1.5 rounded-lg border border-blue-100 shadow-xs font-medium"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quick Next Meeting Banner */}
                {meetings.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider opacity-80">Próximo Encontro Agendado</span>
                      <h3 className="text-xl font-bold mt-1">{meetings[0].location || 'Encontro com ' + friend.name}</h3>
                      <p className="text-sm opacity-90 mt-0.5">{meetings[0].description || 'Data combinada no calendário'}</p>
                    </div>
                    <Button
                      onClick={() => setActiveTab('meetings')}
                      className="bg-white text-purple-700 hover:bg-gray-100 rounded-full font-bold shadow-md min-h-[44px]"
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab 2: Meetings */}
            {activeTab === 'meetings' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Encontros & Reuniões</h2>
                  <Button
                    onClick={() => setShowScheduler(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md min-h-[44px]"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Agendar Encontro
                  </Button>
                </div>

                {showScheduler && (
                  <div className="mb-6">
                    <MeetingScheduler
                      preselectedFriendId={id}
                      onSuccess={() => setShowScheduler(false)}
                    />
                  </div>
                )}

                <MeetingsList friendId={id} />
              </motion.div>
            )}

            {/* Tab 3: Important Events */}
            {activeTab === 'events' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                  <ImportantEventsManager friendId={id} />
                </div>
              </motion.div>
            )}

            {/* Tab 4: Photos */}
            {activeTab === 'photos' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                  <PhotoGallery friend={friend} isEditing={true} />
                </div>
              </motion.div>
            )}

            {/* Tab 5: Connections */}
            {activeTab === 'connections' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                  <ConnectionsManager friendId={id} />
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        open={deleteModal}
        friend={friend}
        onClose={() => setDeleteModal(false)}
      />

      {/* Color Picker Sheet */}
      {showColorPicker && (
        <ColorPicker
          selectedColor={friend.cardBackgroundColor}
          onSelect={(c) => updateFriend(id, { cardBackgroundColor: c })}
          onClose={() => setShowColorPicker(false)}
        />
      )}
    </div>
  );
};

export default FriendProfile;
