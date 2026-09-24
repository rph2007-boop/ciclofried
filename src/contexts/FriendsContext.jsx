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

const DEFAULT_CATEGORIES = ['Família', 'Estudos', 'Amigos', 'Paqueras', 'Trabalho', 'Outros'];

const RAW_DEFAULT_PREFS = {
  drinks: ['Café', 'Cerveja', 'Vinho', 'Suco', 'Água', 'Refrigerante', 'Chá'],
  outings: ['Cinema', 'Parque', 'Jantar', 'Bar', 'Balada', 'Praia', 'Trilha', 'Museu'],
  movies: ['Ação', 'Comédia', 'Drama', 'Terror', 'Ficção Científica', 'Romance', 'Animação'],
  places: ['Shopping', 'Restaurante', 'Casa', 'Ao Ar Livre'],
  gifts: ['Livros', 'Roupas', 'Eletrônicos', 'Decoração', 'Jogos', 'Artesanato']
};

const mapFriendFromDB = (f) => {
  if (!f) return null;
  return {
    ...f,
    cardBackgroundColor: f.card_background_color || f.cardBackgroundColor,
    meetingPlace: f.meeting_place || f.meetingPlace,
    profilePhotoId: f.profile_photo_id || f.profilePhotoId,
    createdAt: f.created_at || f.createdAt,
    updatedAt: f.updated_at || f.updatedAt,
    socials: f.socials || [],
    preferences: f.preferences || {},
    photos: f.photos || [],
    connections: f.connections || [],
    card_background_color: undefined,
    meeting_place: undefined,
    profile_photo_id: undefined,
    created_at: undefined,
    updated_at: undefined
  };
};

const mapFriendToDB = (data) => {
  const mapped = { ...data };
  if (mapped.cardBackgroundColor !== undefined) {
    mapped.card_background_color = mapped.cardBackgroundColor;
    delete mapped.cardBackgroundColor;
  }
  if (mapped.meetingPlace !== undefined) {
    mapped.meeting_place = mapped.meetingPlace;
    delete mapped.meetingPlace;
  }
  if (mapped.profilePhotoId !== undefined) {
    mapped.profile_photo_id = mapped.profilePhotoId;
    delete mapped.profilePhotoId;
  }
  if (mapped.createdAt !== undefined) {
    mapped.created_at = mapped.createdAt;
    delete mapped.createdAt;
  }
  if (mapped.updatedAt !== undefined) {
    mapped.updated_at = mapped.updatedAt;
    delete mapped.updatedAt;
  }
  return {
    id: mapped.id,
    user_id: mapped.user_id,
    name: mapped.name,
    category: mapped.category,
    birthday: mapped.birthday,
    phone: mapped.phone,
    address: mapped.address,
    meeting_place: mapped.meeting_place,
    notes: mapped.notes,
    card_background_color: mapped.card_background_color,
    socials: mapped.socials,
    preferences: mapped.preferences,
    photos: mapped.photos,
    profile_photo_id: mapped.profile_photo_id,
    connections: mapped.connections,
    created_at: mapped.created_at,
    updated_at: new Date().toISOString()
  };
};

const mapMeetingFromDB = (m) => ({
  ...m,
  friendId: m.friend_id || m.friendId,
  createdAt: m.created_at || m.createdAt,
  updatedAt: m.updated_at || m.updatedAt,
  friend_id: undefined,
  created_at: undefined,
  updated_at: undefined
});

const mapMeetingToDB = (data) => {
  const mapped = { ...data };
  if (mapped.friendId !== undefined) {
    mapped.friend_id = mapped.friendId;
    delete mapped.friendId;
  }
  if (mapped.createdAt !== undefined) {
    mapped.created_at = mapped.createdAt;
    delete mapped.createdAt;
  }
  if (mapped.updatedAt !== undefined) {
    mapped.updated_at = mapped.updatedAt;
    delete mapped.updatedAt;
  }
  return mapped;
};

const mapEventFromDB = (e) => ({
  ...e,
  friendId: e.friend_id || e.friendId,
  createdAt: e.created_at || e.createdAt,
  friend_id: undefined,
  created_at: undefined
});

const mapEventToDB = (data) => {
  const mapped = { ...data };
  if (mapped.friendId !== undefined) {
    mapped.friend_id = mapped.friendId;
    delete mapped.friendId;
  }
  if (mapped.createdAt !== undefined) {
    mapped.created_at = mapped.createdAt;
    delete mapped.createdAt;
  }
  return mapped;
};

export const FriendsProvider = ({ children }) => {
  const { isGuest, currentUser, syncTrigger } = useAuth();
  const { toast } = useToast();
  
  const [friends, setFriends] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [preferences, setPreferences] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);

  const isOnline = useRef(navigator.onLine);
  const getStorageKey = (key) => isGuest ? `guest_${key}` : key;

  const defaultPrefsObj = [
    { id: 'drinks', name: 'Bebidas', subcategories: RAW_DEFAULT_PREFS.drinks },
    { id: 'outings', name: 'Saídas', subcategories: RAW_DEFAULT_PREFS.outings },
    { id: 'movies', name: 'Filmes', subcategories: RAW_DEFAULT_PREFS.movies },
    { id: 'places', name: 'Lugares', subcategories: RAW_DEFAULT_PREFS.places },
    { id: 'gifts', name: 'Presentes', subcategories: RAW_DEFAULT_PREFS.gifts },
  ];

  useEffect(() => {
    const handleOnline = () => {
      isOnline.current = true;
      processQueue();
    };
    const handleOffline = () => {
      isOnline.current = false;
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const savedQueue = localStorage.getItem('offline_queue');
    if (savedQueue) setOfflineQueue(JSON.parse(savedQueue));
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  const addToQueue = (action, payload) => {
    setOfflineQueue(prev => [...prev, { action, payload, timestamp: Date.now() }]);
  };

  const processQueue = async () => {
    if (offlineQueue.length === 0) return;
    setIsSyncing(true);
    const queue = [...offlineQueue];
    setOfflineQueue([]); 
    for (const item of queue) {
      try {
        await executeSupabaseAction(item.action, item.payload);
      } catch (err) {
        setOfflineQueue(prev => [...prev, item]);
      }
    }
    setIsSyncing(false);
  };

  const executeSupabaseAction = async (action, payload) => {
    if (isGuest || !currentUser) return; 
    const { table, data, type, id } = payload;
    let dbData = { ...data };
    if (table === 'friends') dbData = mapFriendToDB(dbData);
    else if (table === 'meetings') dbData = mapMeetingToDB(dbData);
    else if (table === 'events') dbData = mapEventToDB(dbData);
    dbData.user_id = currentUser.id;
    if (type === 'INSERT') await supabase.from(table).insert(dbData);
    else if (type === 'UPDATE') await supabase.from(table).update(dbData).eq('id', id).eq('user_id', currentUser.id);
    else if (type === 'DELETE') await supabase.from(table).delete().eq('id', id).eq('user_id', currentUser.id);
    else if (type === 'UPSERT') await supabase.from(table).upsert(dbData);
  };

  const fetchSupabaseData = async () => {
    if (!currentUser || isGuest) return;
    setIsSyncing(true);
    try {
      const [fData, mData, eData, sData] = await Promise.all([
        supabase.from('friends').select('*'),
        supabase.from('meetings').select('*'),
        supabase.from('events').select('*'),
        supabase.from('user_settings').select('*').single()
      ]);
      setFriends((fData.data || []).map(mapFriendFromDB));
      setMeetings((mData.data || []).map(mapMeetingFromDB));
      setEvents((eData.data || []).map(mapEventFromDB));
      if (sData.data) {
        setCategories(sData.data.friend_categories || DEFAULT_CATEGORIES);
        setPreferences(sData.data.preference_structures || defaultPrefsObj);
      }
      setIsLoaded(true);
    } catch (err) {
      setError("Falha ao carregar dados.");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isGuest) {
      setFriends(JSON.parse(localStorage.getItem(getStorageKey('friends'))) || []);
      setMeetings(JSON.parse(localStorage.getItem(getStorageKey('meetings'))) || []);
      setEvents(JSON.parse(localStorage.getItem(getStorageKey('events'))) || []);
      setCategories(JSON.parse(localStorage.getItem(getStorageKey('categories'))) || DEFAULT_CATEGORIES);
      setPreferences(JSON.parse(localStorage.getItem('guest_preferences')) || defaultPrefsObj);
      setIsLoaded(true);
    } else if (currentUser) {
      fetchSupabaseData();
    }
  }, [isGuest, currentUser, syncTrigger]);

  const persist = async (action, payload) => {
    if (isGuest) return;
    try {
      await executeSupabaseAction(action, payload);
    } catch (err) {
      if (!navigator.onLine) addToQueue(action, payload);
    }
  };

  const uploadPhotoBlob = async (file, path, customFileName) => {
    if (isGuest || !currentUser) return URL.createObjectURL(file);
    const fileExt = file.name.split('.').pop();
    const fileName = customFileName || `${Math.random()}.${fileExt}`;
    const filePath = `${path || currentUser.id}/${fileName}`;
    await supabase.storage.from('photos').upload(filePath, file);
    const { data } = supabase.storage.from('photos').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const addFriend = (friendData) => {
    const newFriend = { ...friendData, id: friendData.id || Date.now().toString(), connections: [], createdAt: new Date().toISOString() };
    setFriends(prev => [...prev, newFriend]);
    persist('INSERT', { table: 'friends', data: newFriend, type: 'INSERT' });
    return newFriend;
  };

  const updateFriend = (id, updatedData) => {
    setFriends(prev => prev.map(f => f.id === id ? { ...f, ...updatedData } : f));
    persist('UPDATE', { table: 'friends', data: updatedData, type: 'UPDATE', id });
  };

  const deleteFriend = (id) => {
    setFriends(prev => prev.filter(f => f.id !== id));
    persist('DELETE', { table: 'friends', type: 'DELETE', id });
  };

  return (
    <FriendsContext.Provider value={{
      friends, categories, meetings, preferences, events,
      isLoaded, error, isSyncing, offlineQueue,
      fetchSupabaseData, uploadPhotoBlob,
      addFriend, updateFriend, deleteFriend,
      getFriendById: (id) => friends.find(f => f.id === id)
    }}>
      {children}
    </FriendsContext.Provider>
  );
};