import React, { useState, useEffect } from 'react';
import { useFriends } from '@/contexts/FriendsContext';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, MapPin, AlignLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';

const MeetingScheduler = ({ preselectedFriendId = null, onSuccess = () => {} }) => {
  const { t } = useTranslation();
  const { friends, addMeeting } = useFriends();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    friendId: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    if (preselectedFriendId) {
      setFormData(prev => ({ ...prev, friendId: preselectedFriendId }));
    }
  }, [preselectedFriendId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.friendId || !formData.date) {
      toast({ title: t('messages.errorValidation'), variant: "destructive" });
      return;
    }

    addMeeting({
      ...formData,
      datetime: `${formData.date}T${formData.time || '00:00'}`, 
      notes: formData.description 
    });

    toast({ title: t('messages.successMeeting') });
    
    if (!preselectedFriendId) {
       setFormData({ friendId: '', date: '', time: '', location: '', description: '' });
    } else {
       setFormData(prev => ({ ...prev, date: '', time: '', location: '', description: '' }));
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-4 md:p-6 border border-blue-100">
      <h2 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
        <CalendarIcon className="w-5 h-5" />
        {t('meetings.schedule')}
      </h2>

      <div className="space-y-4">
        {!preselectedFriendId && (
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">{t('meetings.with')}</label>
            <select
              value={formData.friendId}
              onChange={(e) => setFormData({...formData, friendId: e.target.value})}
              className="w-full px-4 py-3 md:py-2 rounded-lg bg-white border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px] md:min-h-[40px]"
            >
              <option value="">Selecione um amigo</option>
              {friends.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">{t('meetings.date')}</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-3 md:py-2 rounded-lg bg-white border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px] md:min-h-[40px]"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">{t('meetings.time')}</label>
            <div className="relative">
              <Clock className="absolute left-3 top-3.5 md:top-2.5 text-blue-400 w-4 h-4" />
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full pl-10 pr-4 py-3 md:py-2 rounded-lg bg-white border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px] md:min-h-[40px]"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">{t('meetings.location')}</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 md:top-2.5 text-blue-400 w-4 h-4" />
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full pl-10 pr-4 py-3 md:py-2 rounded-lg bg-white border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px] md:min-h-[40px]"
              placeholder="Ex: Café Central"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-1">{t('meetings.description')}</label>
          <div className="relative">
            <AlignLeft className="absolute left-3 top-3 md:top-2.5 text-blue-400 w-4 h-4" />
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full pl-10 pr-4 py-3 md:py-2 rounded-lg bg-white border border-blue-200 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md min-h-[48px] md:min-h-[44px]">
          {t('meetings.schedule')}
        </Button>
      </div>
    </form>
  );
};

export default MeetingScheduler;