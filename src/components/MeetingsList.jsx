import React, { useState } from 'react';
import { useFriends } from '@/contexts/FriendsContext';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Edit2, Trash2, Check, X, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDateTime } from '@/utils/dateUtils';
import { useToast } from '@/components/ui/use-toast';

const MeetingsList = ({ friendId }) => {
  const { t } = useTranslation();
  const { getFriendMeetings, updateMeeting, deleteMeeting } = useFriends();
  const meetings = getFriendMeetings(friendId).sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  const [editingId, setEditingId] = useState(null);
  const { toast } = useToast();

  const [editForm, setEditForm] = useState({});

  const startEdit = (meeting) => {
    setEditingId(meeting.id);
    setEditForm({
      date: meeting.datetime.split('T')[0],
      time: meeting.datetime.split('T')[1] || '',
      location: meeting.location || '',
      description: meeting.description || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = (id) => {
    if (!editForm.date) return;
    
    updateMeeting(id, {
      datetime: `${editForm.date}T${editForm.time || '00:00'}`,
      location: editForm.location,
      description: editForm.description
    });
    
    setEditingId(null);
    toast({ title: t('messages.successUpdate') });
  };

  if (meetings.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur rounded-xl p-8 text-center border border-blue-100 shadow-sm">
        <Calendar className="w-12 h-12 text-blue-200 mx-auto mb-3" />
        <p className="text-gray-500">{t('meetings.noMeetings')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {meetings.map((meeting) => {
           const isEditing = editingId === meeting.id;
           const isPast = new Date(meeting.datetime) < new Date();

           return (
             <motion.div
               key={meeting.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, height: 0 }}
               className={`rounded-xl border shadow-sm transition-all overflow-hidden ${isPast ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-100 hover:shadow-md'}`}
             >
                {isEditing ? (
                  <div className="p-4 space-y-3 bg-blue-50/50">
                     <div className="grid grid-cols-2 gap-2">
                        <input 
                           type="date" 
                           className="p-2 rounded border border-blue-200 text-sm"
                           value={editForm.date}
                           onChange={e => setEditForm({...editForm, date: e.target.value})}
                        />
                        <input 
                           type="time" 
                           className="p-2 rounded border border-blue-200 text-sm"
                           value={editForm.time}
                           onChange={e => setEditForm({...editForm, time: e.target.value})}
                        />
                     </div>
                     <input 
                        type="text" 
                        placeholder={t('meetings.location')}
                        className="w-full p-2 rounded border border-blue-200 text-sm"
                        value={editForm.location}
                        onChange={e => setEditForm({...editForm, location: e.target.value})}
                     />
                     <textarea 
                        placeholder={t('meetings.description')}
                        className="w-full p-2 rounded border border-blue-200 text-sm h-20 resize-none"
                        value={editForm.description}
                        onChange={e => setEditForm({...editForm, description: e.target.value})}
                     />
                     <div className="flex justify-end gap-2 mt-2">
                        <Button size="sm" variant="ghost" onClick={cancelEdit}><X className="w-4 h-4 mr-1" /> {t('app.cancel')}</Button>
                        <Button size="sm" onClick={() => saveEdit(meeting.id)} className="bg-blue-600 text-white"><Check className="w-4 h-4 mr-1" /> {t('app.save')}</Button>
                     </div>
                  </div>
                ) : (
                  <div className="p-4">
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-blue-900 font-semibold">
                           <Calendar className="w-4 h-4 text-blue-500" />
                           {formatDateTime(meeting.datetime)}
                        </div>
                        <div className="flex gap-1">
                           <button onClick={() => startEdit(meeting)} className="p-1.5 hover:bg-blue-50 rounded text-blue-400 hover:text-blue-600 transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                           </button>
                           <button onClick={() => deleteMeeting(meeting.id)} className="p-1.5 hover:bg-red-50 rounded text-red-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        </div>
                     </div>
                     
                     <div className="space-y-1 pl-6">
                        {meeting.location && (
                           <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {meeting.location}
                           </div>
                        )}
                        {meeting.description && (
                           <div className="flex items-start gap-2 text-sm text-gray-500 italic mt-2 bg-gray-50/50 p-2 rounded">
                              <FileText className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span className="break-words">{meeting.description}</span>
                           </div>
                        )}
                     </div>
                  </div>
                )}
             </motion.div>
           );
        })}
      </AnimatePresence>
    </div>
  );
};

export default MeetingsList;