import React, { useState } from 'react';
import { api } from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/auth/magic-link', { email });
    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Check your email</h2>
          <p className="text-gray-500">We sent a magic link to <strong>{email}</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8 w-full max-w-sm">
        <h1 className="text-3xl font-bold text-blue-700 mb-1">FilLinked</h1>
        <p className="text-gray-500 mb-6 text-sm">Filipino healthcare professional network</p>
        <input
          type="email"
          className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-700 text-white rounded-lg py-3 font-semibold text-sm hover:bg-blue-800 transition"
        >
          Continue with Email
        </button>
      </form>
    </div>
  );
}
