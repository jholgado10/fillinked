import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

const FeedPage = React.lazy(() => import('./pages/feed/FeedPage'));
const NetworkPage = React.lazy(() => import('./pages/network/NetworkPage'));
const ProfilePage = React.lazy(() => import('./pages/profile/ProfilePage'));
const JobsPage = React.lazy(() => import('./pages/jobs/JobsPage'));
const MessagesPage = React.lazy(() => import('./pages/messages/MessagesPage'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));

export default function App() {
  const session = useAuthStore((s) => s.session);

  if (!session) {
    return (
      <React.Suspense fallback={null}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </React.Suspense>
    );
  }

  return (
    <React.Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/network" element={<NetworkPage />} />
        <Route path="/profile/:id?" element={<ProfilePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
}
