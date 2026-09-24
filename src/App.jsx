import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FriendsProvider } from '@/contexts/FriendsContext';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import AddFriend from '@/components/AddFriend';
import FriendProfile from '@/components/FriendProfile';
import EditFriend from '@/components/EditFriend';
import FriendNetwork from '@/components/FriendNetwork';
import Settings from '@/components/Settings';
import MeetingsCalendar from '@/components/MeetingsCalendar';
import SchedulesPage from '@/components/SchedulesPage';
import usePhotoSync from '@/hooks/usePhotoSync';

// Auth Components
import LoginPage from '@/components/LoginPage';
import SignupPage from '@/components/SignupPage';
import ForgotPasswordPage from '@/components/ForgotPasswordPage';
import ProtectedRoute from '@/components/ProtectedRoute';

// Wrapper component to use hooks that depend on Context
const AppContent = () => {
  usePhotoSync(); // Hook usage

  return (
    <div className="min-h-screen font-body text-foreground bg-gray-50/30">
      <Header />
      <div className="pb-12">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes (Accessible by Auth Users OR Guests) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-friend" element={<AddFriend />} />
            <Route path="/friend/:id" element={<FriendProfile />} />
            <Route path="/friend/:id/edit" element={<EditFriend />} />
            <Route path="/connections" element={<FriendNetwork />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/meetings" element={<MeetingsCalendar />} />
            <Route path="/schedules" element={<SchedulesPage />} />
          </Route>
        </Routes>
      </div>
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <FriendsProvider>
        <AppContent />
      </FriendsProvider>
    </BrowserRouter>
  );
}

export default App;