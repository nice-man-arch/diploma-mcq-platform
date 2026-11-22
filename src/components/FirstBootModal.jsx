// src/components/FirstBootModal.jsx
import React, { useState } from 'react';
import { User, Trophy, ArrowRight, Award } from 'lucide-react';
import { detectStudentLocation } from '../utils/locationService';
import { saveStudentProfile } from '../utils/sessionService';

export default function FirstBootModal({ isOpen, onComplete }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name to register on the leaderboard.');
      return;
    }

    setIsSubmitting(true);

    // Silently detect IP address in background without GPS popups
    let loc = null;
    try {
      loc = await detectStudentLocation();
    } catch {
      loc = { city: 'Local Area', country: 'India', ip: 'Unknown IP', source: 'ip' };
    }

    const profile = {
      name: name.trim(),
      location: loc,
      joinedAt: new Date().toISOString()
    };

    saveStudentProfile(profile);
    localStorage.setItem('diploma_student_name', name.trim());
    setIsSubmitting(false);
    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-md border-2 border-zinc-900 dark:border-white/60 bg-white dark:bg-[#202020] text-zinc-900 dark:text-[#E3E3E3] p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-sm border border-zinc-800 dark:border-white/45 bg-amber-50 dark:bg-[#282117] mx-auto text-amber-500">
          <Trophy className="h-7 w-7" />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Join the Diploma Leaderboard
          </h2>
          <p className="text-sm text-zinc-600 dark:text-[#9B9A97] mt-2 leading-relaxed">
            Enter your name to claim your spot on the live student ranking board, track questions solved, and compete for <strong className="text-amber-600 dark:text-[#D1B280]">Rank #1</strong> across polytechnics.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-[#9B9A97] mb-2">
              Your Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500 dark:text-[#9B9A97]" />
              <input
                type="text"
                autoFocus
                required
                placeholder="e.g. Rahul Patil"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                className="w-full rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] py-2.5 pl-9 pr-3 text-sm font-semibold text-zinc-900 dark:text-white focus:border-zinc-950 dark:focus:border-white focus:outline-hidden"
              />
            </div>
            {error && (
              <p className="text-xs font-bold text-rose-700 dark:text-[#D18E84] mt-2">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-sm border border-zinc-900 dark:border-white/60 bg-zinc-900 dark:bg-white py-2.5 font-bold text-sm text-white dark:text-[#191919] hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Registering...' : 'Join Leaderboard & Start'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-xs text-zinc-500 dark:text-[#6F6E6B]">
          Your rank updates automatically as you solve MCQs and complete exams.
        </p>
      </div>
    </div>
  );
}
