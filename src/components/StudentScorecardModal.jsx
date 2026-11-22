// src/components/StudentScorecardModal.jsx
import React from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Award, 
  Check, 
  AlertCircle,
  ExternalLink,
  Printer
} from 'lucide-react';

export default function StudentScorecardModal({ session, onClose }) {
  if (!session) return null;

  const loc = session.location || {};
  const mapsUrl = loc.latitude && loc.longitude 
    ? `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}` 
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-md border-2 border-zinc-900 dark:border-white/60 bg-white dark:bg-[#202020] text-zinc-900 dark:text-[#E3E3E3] p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 dark:border-white/45 pb-4">
          <div>
            <div className="text-xs font-mono font-bold text-zinc-500 dark:text-[#9B9A97]">
              EXAMINER AUDIT REPORT • ID: {session.id}
            </div>
            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-[#E3E3E3] mt-1">
              {session.studentName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm border border-zinc-800 dark:border-white/45 p-1.5 text-zinc-600 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#282828] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Student Profile & Verified Location Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          {/* Student Info */}
          <div className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] p-4 space-y-2">
            <div className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-[#9B9A97] flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Candidate Profile
            </div>
            <div className="space-y-1">
              <div><strong className="text-zinc-900 dark:text-white">Name:</strong> {session.studentName}</div>
              {session.studentId && <div><strong className="text-zinc-900 dark:text-white">Roll/PRN:</strong> {session.studentId}</div>}
              {session.college && <div><strong className="text-zinc-900 dark:text-white">College:</strong> {session.college}</div>}
              <div><strong className="text-zinc-900 dark:text-white">Date:</strong> {new Date(session.timestamp).toLocaleString()}</div>
            </div>
          </div>

          {/* Test Location Info */}
          <div className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] p-4 space-y-2">
            <div className="font-bold text-xs uppercase tracking-wider text-rose-600 dark:text-[#D18E84] flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Test Origin & Location
            </div>
            <div className="space-y-1">
              <div><strong className="text-zinc-900 dark:text-white">City/Region:</strong> {loc.city || 'Unknown'}{loc.region ? `, ${loc.region}` : ''}</div>
              <div><strong className="text-zinc-900 dark:text-white">Country:</strong> {loc.country || 'India'}</div>
              {loc.ip && <div><strong className="text-zinc-900 dark:text-white">IP Address:</strong> <span className="font-mono">{loc.ip}</span></div>}
              {loc.latitude && loc.longitude && (
                <div className="pt-1 flex items-center justify-between">
                  <span className="font-mono text-xs text-zinc-500">
                    {loc.latitude}°, {loc.longitude}°
                  </span>
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-[#8FAFC4] hover:underline"
                    >
                      <span>View Map</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Score & Metrics Strip */}
        <div className="mt-5 rounded-md border border-zinc-800 dark:border-white/50 bg-zinc-100 dark:bg-[#202020] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-zinc-500 dark:text-[#9B9A97]">Exam Attempted</div>
              <div className="text-base font-bold text-zinc-900 dark:text-white">{session.examTitle}</div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-mono font-extrabold text-zinc-900 dark:text-white">
                {session.marksObtained}
              </span>
              <span className="text-sm font-mono text-zinc-500 dark:text-[#6F6E6B]">
                / {session.maxMarks} Marks ({session.percentage}%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 mt-4 border-t border-zinc-800 dark:border-white/30 text-center text-xs sm:text-sm">
            <div>
              <div className="font-bold text-emerald-700 dark:text-[#85B59A] text-lg font-mono">{session.correctCount}</div>
              <div className="text-zinc-500">Correct</div>
            </div>
            <div>
              <div className="font-bold text-rose-700 dark:text-[#D18E84] text-lg font-mono">{session.wrongCount}</div>
              <div className="text-zinc-500">Wrong</div>
            </div>
            <div>
              <div className="font-bold text-zinc-900 dark:text-white text-lg font-mono">
                {Math.floor((session.timeTakenSeconds || 0) / 60)}m {((session.timeTakenSeconds || 0) % 60)}s
              </div>
              <div className="text-zinc-500">Time Taken</div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex justify-end gap-3 border-t border-zinc-800 dark:border-white/45 pt-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#191919] px-4 py-2 font-semibold text-xs sm:text-sm text-zinc-700 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print Student Scorecard</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-zinc-900 dark:border-white/60 bg-zinc-900 dark:bg-white px-5 py-2 font-bold text-xs sm:text-sm text-white dark:text-[#191919] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
