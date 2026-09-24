import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useFriends } from '@/contexts/FriendsContext';
import { formatDateTime } from '@/utils/dateUtils';
import { Search, Calendar, Filter, MapPin, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SchedulesPage = () => {
  const { t } = useTranslation();
  const { meetings, getFriendById } = useFriends();
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  // Simulated fetch delay to show loading state as requested
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Prepare data with Friend details
  const enrichedMeetings = meetings.map(meeting => {
    const friend = getFriendById(meeting.friendId);
    return {
      ...meeting,
      friendName: friend ? friend.name : 'Unknown',
      friendId: friend ? friend.id : null,
      friendPhoto: friend?.photos?.find(p => p.id === friend.profilePhotoId)?.url || null,
      type: meeting.description || 'Geral' 
    };
  });

  // Extract unique types for filter dropdown
  const uniqueTypes = ['All', ...new Set(enrichedMeetings.map(m => m.type))].filter(Boolean);

  // Apply filters
  const filteredMeetings = enrichedMeetings.filter(meeting => {
    const matchesSearch = meeting.friendName.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (dateFrom) {
        matchesDate = matchesDate && new Date(meeting.datetime) >= new Date(dateFrom);
    }
    if (dateTo) {
        // Add one day to include the end date fully
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(meeting.datetime) <= endDate;
    }

    const matchesType = selectedType === 'All' || meeting.type === selectedType;

    return matchesSearch && matchesDate && matchesType;
  });

  // Sort by date ascending
  const sortedMeetings = filteredMeetings.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Carregando agendamentos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 md:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Helmet>
        <title>CicloFriend - {t('schedules.pageTitle')}</title>
      </Helmet>

      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2">{t('schedules.pageTitle')}</h1>
        <p className="text-sm md:text-base text-gray-500">Visualize e gerencie todos os seus compromissos do CicloFriend.</p>
      </div>

      {/* Filters Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 mb-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder={t('schedules.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all min-h-[44px]"
                />
            </div>

            {/* Date From */}
            <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-500 mb-1 ml-1">{t('schedules.dateFrom')}</span>
                <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none min-h-[44px]"
                />
            </div>

            {/* Date To */}
            <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-500 mb-1 ml-1">{t('schedules.dateTo')}</span>
                <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none min-h-[44px]"
                />
            </div>

            {/* Type Filter */}
            <div className="relative">
                <span className="text-xs font-semibold text-gray-500 mb-1 ml-1 block">{t('schedules.filterType')}</span>
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none appearance-none bg-white min-h-[44px]"
                >
                    {uniqueTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <Filter className="absolute right-3 top-9 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
        </div>
        
        {(searchQuery || dateFrom || dateTo || selectedType !== 'All') && (
            <div className="mt-4 flex justify-end">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                        setSearchQuery('');
                        setDateFrom('');
                        setDateTo('');
                        setSelectedType('All');
                    }}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 min-h-[44px]"
                >
                    Limpar Filtros
                </Button>
            </div>
        )}
      </motion.div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {sortedMeetings.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                            <th className="p-4 font-semibold whitespace-nowrap">{t('schedules.colFriend')}</th>
                            <th className="p-4 font-semibold whitespace-nowrap">{t('schedules.colDate')}</th>
                            <th className="p-4 font-semibold whitespace-nowrap">{t('schedules.colTime')}</th>
                            <th className="p-4 font-semibold whitespace-nowrap">{t('schedules.colType')}</th>
                            <th className="p-4 font-semibold whitespace-nowrap">{t('schedules.colLocation')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {sortedMeetings.map((meeting) => (
                            <motion.tr 
                                key={meeting.id} 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hover:bg-blue-50/50 transition-colors group"
                            >
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200 text-blue-600 font-bold flex-shrink-0">
                                            {meeting.friendPhoto ? (
                                                <img src={meeting.friendPhoto} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5" />
                                            )}
                                        </div>
                                        <span className="font-semibold text-gray-900 whitespace-nowrap">{meeting.friendName}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-blue-400" />
                                        {formatDateTime(meeting.datetime).split(' ')[0]}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600 font-medium whitespace-nowrap">
                                    {formatDateTime(meeting.datetime).split(' ')[1]}
                                </td>
                                <td className="p-4">
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200 truncate max-w-[150px] inline-block">
                                        {meeting.type}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
                                        <span className="truncate max-w-[200px] block">{meeting.location || '-'}</span>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <Calendar className="w-16 h-16 text-gray-200 mb-4" />
                <h3 className="text-xl font-bold text-gray-400">{t('schedules.noSchedules')}</h3>
                <p className="text-gray-400 mt-2">Tente ajustar seus filtros ou adicione um novo encontro.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SchedulesPage;