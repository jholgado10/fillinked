import React from 'react';
import { useParams } from 'react-router-dom';

export default function ProfilePage() {
  const { id } = useParams();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Profile' : 'My Profile'}</h1>
      <p className="text-gray-400">Profile coming soon…</p>
    </div>
  );
}
