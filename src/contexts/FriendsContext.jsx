import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '../lib/customSupabaseClient.js';

const FriendsContext = createContext();

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
};

export const DEFAULT_CATEGORIES = ['Família', 'Estudos', 'Amigos', 'Paqueras', 'Trabalho', 'Outros'];

export const RAW_DEFAULT_PREFS = {
  drinks: ['Café', 'Cerveja', 'Vinho', 'Suco', 'Água', 'Refrigerante', 'Chá'],
  outings: ['Cinema', 'Parque', 'Jantar', 'Bar', 'Balada', 'Praia', 'Trilha', 'Museu'],
  movies: ['Ação', 'Comédia', 'Drama', 'Terror', 'Ficção Científica', 'Romance', 'Animação'],
  places: ['Shopping', 'Restaurante', 'Casa', 'Ao Ar Livre'],
  gifts: ['Livros', 'Roupas', 'Eletrônicos', 'Decoração', 'Jogos', 'Artesanato']
};

const defaultPrefsObj = [
  { id: 'drinks', name: 'Bebidas', subcategories: RAW_DEFAULT_PREFS.drinks },
  { id: 'outings', name: 'Saídas', subcategories: RAW_DEFAULT_PREFS.outings },
  { id: 'movies', name: 'Filmes', subcategories: RAW_DEFAULT_PREFS.movies },
  { id: 'places', name: 'Lugares', subcategories: RAW_DEFAULT_PREFS.places },
  { id: 'gifts', name: 'Presentes', subcategories: RAW_DEFAULT_PREFS.gifts },
];

const SEED_FRIENDS = [
  {
    id: 'friend-1',
    name: 'Beatriz Lima',
    category: 'Amigos',
    birthday: '1998-05-14',
    phone: '(11) 98765-4321',
    address: 'Vila Madalena, São Paulo - SP',
    meetingPlace: 'Faculdade de Design',
    notes: 'Adora café especial, museus e cinema cult. Sempre topa ir ao parque aos domingos.',
    cardBackgroundColor: 'linear-gradient(to right, #2563eb, #4f46e5, #9333ea)',
    profilePhotoId: 'photo-b1',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    photos: [
      { id: 'photo-b1', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80', date: '2026-01-10T10:00:00Z' },
      { id: 'photo-b2', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80', date: '2026-02-14T14:30:00Z' }
    ],
    socials: [
      { platform: 'Instagram', username: '@bialima_' },
      { platform: 'LinkedIn', username: 'beatrizlima' }
    ],
    preferences: {
      drinks: ['Café', 'Vinho'],
      outings: ['Cinema', 'Parque', 'Jantar'],
      movies: ['Animação', 'Drama'],
      gifts: ['Livros', 'Artesanato'],
      places: ['Cafeterias', 'Parques']
    },
    connections: ['friend-2', 'friend-3', 'friend-5'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'friend-2',
    name: 'Carlos Eduardo Santos',
    category: 'Trabalho',
    birthday: '1994-11-28',
    phone: '(11) 97654-3210',
    address: 'Pinheiros, São Paulo - SP',
    meetingPlace: 'Empresa de Tecnologia (TechLab)',
    notes: 'Engenheiro de software sênior. Fã de jogos de tabuleiro, churrasco e ficção científica.',
    cardBackgroundColor: 'linear-gradient(to right, #059669, #10b981, #34d399)',
    profilePhotoId: 'photo-c1',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    photos: [
      { id: 'photo-c1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', date: '2026-01-15T12:00:00Z' }
    ],
    socials: [
      { platform: 'GitHub', username: 'cadusantos' },
      { platform: 'LinkedIn', username: 'carlos-santos-dev' }
    ],
    preferences: {
      drinks: ['Cerveja', 'Café'],
      outings: ['Bar', 'Trilha'],
      movies: ['Ficção Científica', 'Ação'],
      gifts: ['Eletrônicos', 'Jogos'],
      places: ['Restaurante', 'Casa']
    },
    connections: ['friend-1', 'friend-4'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'friend-3',
    name: 'Mariana Oliveira',
    category: 'Família',
    birthday: '2000-08-09',
    phone: '(21) 99887-6655',
    address: 'Botafogo, Rio de Janeiro - RJ',
    meetingPlace: 'Prima querida',
    notes: 'Estudante de medicina. Ama praia, trilhas ao ar livre e cachorros.',
    cardBackgroundColor: 'linear-gradient(to right, #ea580c, #f97316, #fbbf24)',
    profilePhotoId: 'photo-m1',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    photos: [
      { id: 'photo-m1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', date: '2026-01-20T16:00:00Z' }
    ],
    socials: [
      { platform: 'Instagram', username: '@mari_oliveira' }
    ],
    preferences: {
      drinks: ['Suco', 'Água', 'Chá'],
      outings: ['Praia', 'Trilha', 'Restaurante'],
      movies: ['Comédia', 'Romance'],
      gifts: ['Roupas', 'Decoração']
    },
    connections: ['friend-1'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'friend-4',
    name: 'Lucas Mendes',
    category: 'Estudos',
    birthday: '1997-03-22',
    phone: '(19) 98123-4567',
    address: 'Cambuí, Campinas - SP',
    meetingPlace: 'Grupo de Pesquisa em IA',
    notes: 'Toca violão clássico e adora acampamentos de fim de semana.',
    cardBackgroundColor: 'linear-gradient(to right, #db2777, #ec4899, #f472b6)',
    profilePhotoId: 'photo-l1',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    photos: [
      { id: 'photo-l1', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', date: '2026-02-01T11:00:00Z' }
    ],
    socials: [
      { platform: 'Instagram', username: '@lucasmendes_music' }
    ],
    preferences: {
      drinks: ['Chá', 'Café'],
      outings: ['Ao Ar Livre', 'Museu'],
      movies: ['Drama', 'Terror'],
      gifts: ['Livros', 'Jogos']
    },
    connections: ['friend-2'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'friend-5',
    name: 'Juliana Rocha',
    category: 'Paqueras',
    birthday: '1999-07-15',
    phone: '(11) 99112-3344',
    address: 'Jardins, São Paulo - SP',
    meetingPlace: 'Festa de aniversário da Beatriz',
    notes: 'Arquiteta e fotógrafa urbana. Gosta de galerias de arte e vinhos.',
    cardBackgroundColor: 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)',
    profilePhotoId: 'photo-j1',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    photos: [
      { id: 'photo-j1', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80', date: '2026-02-10T18:00:00Z' }
    ],
    socials: [
      { platform: 'Instagram', username: '@jurocha.arq' }
    ],
    preferences: {
      drinks: ['Vinho', 'Café'],
      outings: ['Jantar', 'Balada', 'Museu'],
      movies: ['Romance', 'Ficção Científica'],
      gifts: ['Decoração', 'Artesanato']
    },
    connections: ['friend-1'],
    createdAt: new Date().toISOString()
  }
];

const SEED_MEETINGS = [
  {
    id: 'meeting-1',
    friendId: 'friend-1',
    datetime: '2026-10-06T15:30',
    location: 'Café Santo Grão - Oscar Freire',
    description: 'Planejar viagem de férias e conversar sobre novo emprego',
    createdAt: new Date().toISOString()
  },
  {
    id: 'meeting-2',
    friendId: 'friend-2',
    datetime: '2026-10-12T19:00',
    location: 'Bar do Juarez - Pinheiros',
    description: 'Comemoração da promoção e happy hour de tecnologia',
    createdAt: new Date().toISOString()
  },
  {
    id: 'meeting-3',
    friendId: 'friend-3',
    datetime: '2026-10-18T10:30',
    location: 'Parque do Ibirapuera',
    description: 'Piquenique em família e caminhada matinal com os cachorros',
    createdAt: new Date().toISOString()
  }
];

const SEED_EVENTS = [
  {
    id: 'event-1',
    friendId: 'friend-1',
    title: 'Aniversário de Formatura',
    date: '2026-12-18',
    description: 'Comemoração de 4 anos de formados em Design',
    createdAt: new Date().toISOString()
  },
  {
    id: 'event-2',
    friendId: 'friend-3',
    title: 'Formatura de Medicina',
    date: '2026-11-20',
    description: 'Cerimônia oficial de colação de grau no Theatro Municipal',
    createdAt: new Date().toISOString()
  },
  {
    id: 'event-3',
    friendId: 'friend-2',
    title: 'Churrasco de Aniversário',
    date: '2026-11-28',
    description: 'Churrasco de comemoração dos 32 anos na casa do Cadu',
    createdAt: new Date().toISOString()
  }
];

const mapFriendFromDB = (f) => {
  if (!f) return null;
  return {
    ...f,
    cardBackgroundColor: f.card_background_color || f.cardBackgroundColor,
    meetingPlace: f.meeting_place || f.meetingPlace,
    profilePhotoId: f.profile_photo_id || f.profilePhotoId,
    profilePhotoUrl: f.profile_photo_url || f.profilePhotoUrl,
    createdAt: f.created_at || f.createdAt,
    updatedAt: f.updated_at || f.updatedAt,
    socials: f.socials || [],
    preferences: f.preferences || {},
    photos: f.photos || [],
    connections: f.connections || [],
  };
};

const mapFriendToDB = (data) => {
  const mapped = { ...data };
  return {
    id: mapped.id,
    user_id: mapped.user_id,
    name: mapped.name,
    category: mapped.category,
    birthday: mapped.birthday,
    phone: mapped.phone,
    address: mapped.address,
    meeting_place: mapped.meetingPlace || mapped.meeting_place,
    notes: mapped.notes,
    card_background_color: mapped.cardBackgroundColor || mapped.card_background_color,
    socials: mapped.socials || [],
    preferences: mapped.preferences || {},
    photos: mapped.photos || [],
    profile_photo_id: mapped.profilePhotoId || mapped.profile_photo_id,
    profile_photo_url: mapped.profilePhotoUrl || mapped.profile_photo_url,
    connections: mapped.connections || [],
    created_at: mapped.createdAt || mapped.created_at,
    updated_at: new Date().toISOString()
  };
};

export const FriendsProvider = ({ children }) => {
  const { isGuest, currentUser, syncTrigger } = useAuth();
  const { toast } = useToast();

  const [friends, setFriends] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [preferences, setPreferences] = useState(defaultPrefsObj);
  const [meetings, setMeetings] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);

  const isOnline = useRef(navigator.onLine);
  const getStorageKey = (key) => isGuest ? `guest_${key}` : key;

  // Load initial data
  useEffect(() => {
    try {
      if (isGuest || !currentUser) {
        const storedFriends = localStorage.getItem(getStorageKey('friends'));
        const storedMeetings = localStorage.getItem(getStorageKey('meetings'));
        const storedEvents = localStorage.getItem(getStorageKey('events'));
        const storedCategories = localStorage.getItem(getStorageKey('categories'));
        const storedPreferences = localStorage.getItem(getStorageKey('preferences'));

        const initialFriends = storedFriends ? JSON.parse(storedFriends) : SEED_FRIENDS;
        const initialMeetings = storedMeetings ? JSON.parse(storedMeetings) : SEED_MEETINGS;
        const initialEvents = storedEvents ? JSON.parse(storedEvents) : SEED_EVENTS;
        const initialCategories = storedCategories ? JSON.parse(storedCategories) : DEFAULT_CATEGORIES;
        const initialPreferences = storedPreferences ? JSON.parse(storedPreferences) : defaultPrefsObj;

        // Save seed data to localStorage so it stays initialized
        if (!storedFriends) localStorage.setItem(getStorageKey('friends'), JSON.stringify(initialFriends));
        if (!storedMeetings) localStorage.setItem(getStorageKey('meetings'), JSON.stringify(initialMeetings));
        if (!storedEvents) localStorage.setItem(getStorageKey('events'), JSON.stringify(initialEvents));
        if (!storedCategories) localStorage.setItem(getStorageKey('categories'), JSON.stringify(initialCategories));
        if (!storedPreferences) localStorage.setItem(getStorageKey('preferences'), JSON.stringify(initialPreferences));

        setFriends(initialFriends);
        setMeetings(initialMeetings);
        setEvents(initialEvents);
        setCategories(initialCategories);
        setPreferences(initialPreferences);
        setIsLoaded(true);
      } else if (currentUser) {
        fetchSupabaseData();
      }
    } catch (err) {
      console.error("Error loading local data:", err);
      // Fallback
      setFriends(SEED_FRIENDS);
      setMeetings(SEED_MEETINGS);
      setEvents(SEED_EVENTS);
      setCategories(DEFAULT_CATEGORIES);
      setPreferences(defaultPrefsObj);
      setIsLoaded(true);
    }
  }, [isGuest, currentUser, syncTrigger]);

  const saveLocalState = (key, data) => {
    try {
      localStorage.setItem(getStorageKey(key), JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  };

  const persist = async (action, payload) => {
    if (isGuest || !currentUser) return;
    try {
      await executeSupabaseAction(action, payload);
    } catch (err) {
      console.error('Supabase action error:', err);
    }
  };

  const executeSupabaseAction = async (action, payload) => {
    if (isGuest || !currentUser) return;
    const { table, data, type, id } = payload;
    let dbData = { ...data };
    if (table === 'friends') dbData = mapFriendToDB(dbData);
    dbData.user_id = currentUser.id;
    if (type === 'INSERT') await supabase.from(table).insert(dbData);
    else if (type === 'UPDATE') await supabase.from(table).update(dbData).eq('id', id).eq('user_id', currentUser.id);
    else if (type === 'DELETE') await supabase.from(table).delete().eq('id', id).eq('user_id', currentUser.id);
  };

  const fetchSupabaseData = async () => {
    if (!currentUser || isGuest) return;
    setIsSyncing(true);
    try {
      const [fData, mData, eData, sData] = await Promise.all([
        supabase.from('friends').select('*'),
        supabase.from('meetings').select('*'),
        supabase.from('events').select('*'),
        supabase.from('user_settings').select('*').maybeSingle()
      ]);
      if (fData.data && fData.data.length > 0) {
        setFriends(fData.data.map(mapFriendFromDB));
      } else {
        setFriends(SEED_FRIENDS);
      }
      setMeetings(mData.data || SEED_MEETINGS);
      setEvents(eData.data || SEED_EVENTS);
      if (sData?.data) {
        setCategories(sData.data.friend_categories || DEFAULT_CATEGORIES);
        setPreferences(sData.data.preference_structures || defaultPrefsObj);
      }
      setIsLoaded(true);
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to local:", err);
      const storedFriends = localStorage.getItem(getStorageKey('friends'));
      setFriends(storedFriends ? JSON.parse(storedFriends) : SEED_FRIENDS);
      setMeetings(SEED_MEETINGS);
      setEvents(SEED_EVENTS);
      setIsLoaded(true);
    } finally {
      setIsSyncing(false);
    }
  };

  // Convert uploaded photos to base64 Data URLs so they persist offline & in localStorage!
  const uploadPhotoBlob = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(file);
    });
  };

  // --- Friend Operations ---
  const addFriend = (friendData) => {
    const newFriend = {
      ...friendData,
      id: friendData.id || `friend-${Date.now()}`,
      connections: friendData.connections || [],
      photos: friendData.photos || [],
      preferences: friendData.preferences || {},
      socials: friendData.socials || [],
      cardBackgroundColor: friendData.cardBackgroundColor || 'linear-gradient(to right, #2563eb, #4f46e5, #9333ea)',
      createdAt: new Date().toISOString()
    };
    setFriends(prev => {
      const updated = [newFriend, ...prev];
      saveLocalState('friends', updated);
      return updated;
    });
    persist('INSERT', { table: 'friends', data: newFriend, type: 'INSERT' });
    return newFriend;
  };

  const updateFriend = (id, updatedData) => {
    setFriends(prev => {
      const updated = prev.map(f => f.id === id ? { ...f, ...updatedData, updatedAt: new Date().toISOString() } : f);
      saveLocalState('friends', updated);
      return updated;
    });
    persist('UPDATE', { table: 'friends', data: updatedData, type: 'UPDATE', id });
  };

  const deleteFriend = (id) => {
    setFriends(prev => {
      // Remove friend and clear references in other friends' connections
      const updated = prev
        .filter(f => f.id !== id)
        .map(f => ({
          ...f,
          connections: (f.connections || []).filter(cId => cId !== id)
        }));
      saveLocalState('friends', updated);
      return updated;
    });

    // Also delete meetings and events associated with this friend
    setMeetings(prev => {
      const updated = prev.filter(m => m.friendId !== id);
      saveLocalState('meetings', updated);
      return updated;
    });
    setEvents(prev => {
      const updated = prev.filter(e => e.friendId !== id);
      saveLocalState('events', updated);
      return updated;
    });

    persist('DELETE', { table: 'friends', type: 'DELETE', id });
  };

  const getFriendById = (id) => friends.find(f => f.id === id);

  const updateFriendProfilePhoto = (friendId, photoUrl) => {
    const photoId = `photo-${Date.now()}`;
    const newPhoto = { id: photoId, url: photoUrl, date: new Date().toISOString() };
    setFriends(prev => {
      const updated = prev.map(f => {
        if (f.id === friendId) {
          const currentPhotos = f.photos || [];
          return {
            ...f,
            profilePhotoId: photoId,
            profilePhotoUrl: photoUrl,
            photos: [newPhoto, ...currentPhotos]
          };
        }
        return f;
      });
      saveLocalState('friends', updated);
      return updated;
    });
  };

  // --- Meeting Operations ---
  const getFriendMeetings = (friendId) => {
    return meetings.filter(m => m.friendId === friendId);
  };

  const addMeeting = (meetingData) => {
    const newMeeting = {
      ...meetingData,
      id: meetingData.id || `meeting-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setMeetings(prev => {
      const updated = [...prev, newMeeting];
      saveLocalState('meetings', updated);
      return updated;
    });
    persist('INSERT', { table: 'meetings', data: newMeeting, type: 'INSERT' });
    return newMeeting;
  };

  const updateMeeting = (id, updatedData) => {
    setMeetings(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, ...updatedData, updatedAt: new Date().toISOString() } : m);
      saveLocalState('meetings', updated);
      return updated;
    });
    persist('UPDATE', { table: 'meetings', data: updatedData, type: 'UPDATE', id });
  };

  const deleteMeeting = (id) => {
    setMeetings(prev => {
      const updated = prev.filter(m => m.id !== id);
      saveLocalState('meetings', updated);
      return updated;
    });
    persist('DELETE', { table: 'meetings', type: 'DELETE', id });
  };

  // --- Event Operations ---
  const getFriendEvents = (friendId) => {
    return events.filter(e => e.friendId === friendId);
  };

  const addImportantEvent = (eventData) => {
    const newEvent = {
      ...eventData,
      id: eventData.id || `event-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setEvents(prev => {
      const updated = [...prev, newEvent];
      saveLocalState('events', updated);
      return updated;
    });
    persist('INSERT', { table: 'events', data: newEvent, type: 'INSERT' });
    return newEvent;
  };

  const updateImportantEvent = (id, updatedData) => {
    setEvents(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, ...updatedData } : e);
      saveLocalState('events', updated);
      return updated;
    });
    persist('UPDATE', { table: 'events', data: updatedData, type: 'UPDATE', id });
  };

  const deleteImportantEvent = (id) => {
    setEvents(prev => {
      const updated = prev.filter(e => e.id !== id);
      saveLocalState('events', updated);
      return updated;
    });
    persist('DELETE', { table: 'events', type: 'DELETE', id });
  };

  // --- Connections Operations ---
  const getConnectedFriends = (friendId) => {
    const friend = friends.find(f => f.id === friendId);
    if (!friend || !friend.connections) return [];
    return friends.filter(f => friend.connections.includes(f.id));
  };

  const addConnection = (friend1Id, friend2Id) => {
    if (!friend1Id || !friend2Id || friend1Id === friend2Id) return;
    setFriends(prev => {
      const updated = prev.map(f => {
        if (f.id === friend1Id) {
          const conns = f.connections || [];
          if (!conns.includes(friend2Id)) return { ...f, connections: [...conns, friend2Id] };
        }
        if (f.id === friend2Id) {
          const conns = f.connections || [];
          if (!conns.includes(friend1Id)) return { ...f, connections: [...conns, friend1Id] };
        }
        return f;
      });
      saveLocalState('friends', updated);
      return updated;
    });
  };

  const removeConnection = (friend1Id, friend2Id) => {
    setFriends(prev => {
      const updated = prev.map(f => {
        if (f.id === friend1Id) {
          return { ...f, connections: (f.connections || []).filter(cId => cId !== friend2Id) };
        }
        if (f.id === friend2Id) {
          return { ...f, connections: (f.connections || []).filter(cId => cId !== friend1Id) };
        }
        return f;
      });
      saveLocalState('friends', updated);
      return updated;
    });
  };

  // --- Categories Operations ---
  const addCategory = (categoryName) => {
    if (!categoryName || categories.includes(categoryName)) return;
    setCategories(prev => {
      const updated = [...prev, categoryName];
      saveLocalState('categories', updated);
      return updated;
    });
  };

  const deleteCategory = (categoryName) => {
    setCategories(prev => {
      const updated = prev.filter(c => c !== categoryName);
      saveLocalState('categories', updated);
      return updated;
    });
  };

  // --- Preferences Operations ---
  const addMainCategory = (name) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (preferences.some(p => p.id === id)) return;
    setPreferences(prev => {
      const updated = [...prev, { id, name, subcategories: [] }];
      saveLocalState('preferences', updated);
      return updated;
    });
  };

  const deleteMainCategory = (id) => {
    setPreferences(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveLocalState('preferences', updated);
      return updated;
    });
  };

  const addPreference = (categoryId, item) => {
    setPreferences(prev => {
      const updated = prev.map(p => {
        if (p.id === categoryId) {
          const sub = p.subcategories || [];
          if (!sub.includes(item)) return { ...p, subcategories: [...sub, item] };
        }
        return p;
      });
      saveLocalState('preferences', updated);
      return updated;
    });
  };

  const removePreference = (categoryId, item) => {
    setPreferences(prev => {
      const updated = prev.map(p => {
        if (p.id === categoryId) {
          return { ...p, subcategories: (p.subcategories || []).filter(s => s !== item) };
        }
        return p;
      });
      saveLocalState('preferences', updated);
      return updated;
    });
  };

  return (
    <FriendsContext.Provider value={{
      friends,
      categories,
      meetings,
      preferences,
      events,
      isLoaded,
      error,
      isSyncing,
      offlineQueue,
      fetchSupabaseData,
      uploadPhotoBlob,
      addFriend,
      updateFriend,
      deleteFriend,
      getFriendById,
      updateFriendProfilePhoto,
      getFriendMeetings,
      addMeeting,
      updateMeeting,
      deleteMeeting,
      getFriendEvents,
      addImportantEvent,
      updateImportantEvent,
      deleteImportantEvent,
      getConnectedFriends,
      addConnection,
      removeConnection,
      addCategory,
      deleteCategory,
      addMainCategory,
      deleteMainCategory,
      addPreference,
      removePreference
    }}>
      {children}
    </FriendsContext.Provider>
  );
};
