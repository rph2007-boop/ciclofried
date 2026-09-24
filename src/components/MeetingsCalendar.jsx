import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFriends } from '@/contexts/FriendsContext';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from '@/utils/dateUtils';
import { Calendar, MapPin, Trash2, User, Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MeetingScheduler from './MeetingScheduler';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

const MeetingsCalendar = () => {
  const { t } = useTranslation();
  const { meetings, deleteMeeting, getFriendById } = useFriends();
  const location = useLocation();

  // Parse friendId from query params or state
  const queryParams = new URLSearchParams(location.search);
  const initialFriendId = queryParams.get('friendId') || location.state?.friendId || null;

  const [filterName, setFilterName] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  const sortedMeetings = [...meetings].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  const now = new Date();

  // Apply filters
  const filteredMeetings = sortedMeetings.filter(meeting => {
    const friend = getFriendById(meeting.friendId);
    if (!friend) return false;
    
    const matchesName = friend.name.toLowerCase().includes(filterName.toLowerCase());
    const matchesDate = filterDate ? meeting.datetime.startsWith(filterDate) : true;
    
    return matchesName && matchesDate;
  });
  
  const upcoming = filteredMeetings.filter(m => new Date(m.datetime) >= now);
  const past = filteredMeetings.filter(m => new Date(m.datetime) < now);

  const clearFilters = () => {
    setFilterName('');
    setFilterDate('');
  };

  const MeetingCard = ({ meeting, isPast }) => {
    const friend = getFriendById(meeting.friendId);
    if (!friend) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-xl border ${isPast ? 'bg-gray-50 border-gray-200 opacity-70' : 'bg-white border-blue-100 shadow-md'} mb-3`}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isPast ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
              {new Date(meeting.datetime).getDate()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                {friend.name}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDateTime(meeting.datetime)}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => deleteMeeting(meeting.id)} className="text-red-400 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        {(meeting.location || meeting.description) && (
          <div className="mt-3 pl-14 space-y-1 text-sm text-gray-600">
            {meeting.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {meeting.location}
              </div>
            )}
            {meeting.description && <p className="italic">"{meeting.description}"</p>}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <>
      <Helmet>
        <title>CicloFiend - {t('meetings.title')}</title>
      </Helmet>
      <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col lg:flex-row gap-8">
        {/* Scheduler Section */}
        <div className="lg:w-1/3">
          <MeetingScheduler preselectedFriendId={initialFriendId} />
        </div>

        {/* List Section */}
        <div className="lg:w-2/3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-blue-900">{t('meetings.upcoming')}</h2>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Filtrar por nome"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="w-full md:w-40 pl-9 pr-3 py-2 rounded-lg border border-blue-200 text-sm focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="relative flex-1 md:flex-none">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 rounded-lg border border-blue-200 text-sm focus:ring-2 focus:ring-blue-200"
                />
              </div>
              {(filterName || filterDate) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 hover:text-red-500">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {upcoming.length > 0 ? (
              upcoming.map(m => <MeetingCard key={m.id} meeting={m} isPast={false} />)
            ) : (
              <div className="text-gray-500 bg-blue-50 p-8 rounded-xl text-center border border-blue-100">
                <p className="font-medium">
                  {(filterName || filterDate) ? "Nenhum encontro encontrado com estes filtros." : t('meetings.noMeetings')}
                </p>
                {(filterName || filterDate) && (
                  <Button variant="link" onClick={clearFilters} className="text-blue-600 mt-2">
                    Limpar filtros
                  </Button>
                )}
              </div>
            )}
          </div>

          {past.length > 0 && (
            <>
              <h2 className="text-xl font-bold text-gray-500 mb-4 mt-8 border-t pt-8">{t('meetings.past')}</h2>
              <div className="space-y-4">
                {past.map(m => <MeetingCard key={m.id} meeting={m} isPast={true} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MeetingsCalendar;