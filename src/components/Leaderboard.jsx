// src/components/Leaderboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Award, 
  Medal, 
  Flame, 
  CheckCircle2, 
  Zap, 
  User, 
  Search,
  ArrowUpRight,
  Sparkles,
  Settings,
  EyeOff,
  HeartHandshake
} from 'lucide-react';
import { getAllStudentSessions } from '../utils/sessionService';

// Default peer scholars to populate the competitive ranking board
const INITIAL_PEER_SCHOLARS = [
  {
    name: "Aarav Sharma",
    questionsSolved: 298,
    marksObtained: 278.5,
    accuracy: 94,
    examsCount: 4,
    college: "Govt Polytechnic Pune",
    tier: "Rank 1 • Master Scholar"
  },
  {
    name: "Priya Nair",
    questionsSolved: 260,
    marksObtained: 236.0,
    accuracy: 89,
    examsCount: 3,
    college: "Karnataka Govt Polytechnic",
    tier: "Rank 2 • Grand Scholar"
  },
  {
    name: "Rohan Deshmukh",
    questionsSolved: 215,
    marksObtained: 184.0,
    accuracy: 82,
    examsCount: 3,
    college: "VJTI Polytechnic Mumbai",
    tier: "Rank 3 • Elite Scholar"
  },
  {
    name: "Sneha Kulkarni",
    questionsSolved: 175,
    marksObtained: 158.0,
    accuracy: 88,
    examsCount: 2,
    college: "Govt Polytechnic Kolhapur",
    tier: "Senior Scholar"
  },
  {
    name: "Aditya Joshi",
    questionsSolved: 140,
    marksObtained: 122.5,
    accuracy: 85,
    examsCount: 2,
    college: "Government Polytechnic Nagpur",
    tier: "Senior Scholar"
  },
  {
    name: "Kavya Reddy",
    questionsSolved: 95,
    marksObtained: 84.0,
    accuracy: 88,
    examsCount: 1,
    college: "Govt Polytechnic Hyderabad",
    tier: "Rising Scholar"
  }
];

export default function Leaderboard({ 
  currentStudentName, 
  onLaunchExam, 
  isOptedOut = false,
  onOpenSettings 
}) {
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getAllStudentSessions().then(data => {
      if (data && Array.isArray(data)) {
        setSessions(data);
      }
    });
  }, []);

  // Compute live ranking table combining peer scholars and actual student sessions
  const rankings = useMemo(() => {
    const studentStats = new Map();
    const currKey = currentStudentName ? currentStudentName.toLowerCase().trim() : '';

    // 1. Seed with peer scholars
    INITIAL_PEER_SCHOLARS.forEach(p => {
      const pKey = p.name.toLowerCase().trim();
      const isCurr = !isOptedOut && currKey && pKey === currKey;
      studentStats.set(pKey, {
        name: p.name,
        questionsSolved: p.questionsSolved,
        marksObtained: p.marksObtained,
        accuracy: p.accuracy,
        examsCount: p.examsCount,
        college: p.college,
        isCurrentUser: isCurr
      });
    });

    // 2. Aggregate from recorded student sessions
    sessions.forEach(s => {
      const name = s.studentName ? s.studentName.trim() : 'Anonymous';
      const key = name.toLowerCase();

      // If current student has opted out, exclude their sessions from public leaderboard
      if (isOptedOut && currKey && key === currKey) {
        return;
      }

      const existing = studentStats.get(key) || {
        name,
        questionsSolved: 0,
        marksObtained: 0,
        accuracy: 0,
        examsCount: 0,
        college: s.college || 'Polytechnic Student',
        isCurrentUser: !isOptedOut && currKey && key === currKey
      };

      existing.questionsSolved += (s.totalQuestions || 0);
      existing.marksObtained += (s.marksObtained || 0);
      existing.examsCount += 1;
      existing.accuracy = existing.examsCount > 0 
        ? Math.round(((existing.accuracy * (existing.examsCount - 1)) + (s.accuracy || 80)) / existing.examsCount)
        : (s.accuracy || 80);

      studentStats.set(key, existing);
    });

    // 3. Ensure current student is listed if not opted out
    if (!isOptedOut && currKey && !studentStats.has(currKey)) {
      studentStats.set(currKey, {
        name: currentStudentName,
        questionsSolved: 0,
        marksObtained: 0,
        accuracy: 0,
        examsCount: 0,
        college: "Your Institution",
        isCurrentUser: true
      });
    }

    // If opted out, ensure current student is completely removed if seed matched
    if (isOptedOut && currKey) {
      studentStats.delete(currKey);
    }

    // 4. Sort by Questions Solved desc, then Marks Obtained desc
    const sorted = Array.from(studentStats.values()).sort((a, b) => {
      if (b.questionsSolved !== a.questionsSolved) {
        return b.questionsSolved - a.questionsSolved;
      }
      return b.marksObtained - a.marksObtained;
    });

    return sorted.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  }, [sessions, currentStudentName, isOptedOut]);

  const filteredRankings = useMemo(() => {
    if (!searchQuery.trim()) return rankings;
    const q = searchQuery.toLowerCase();
    return rankings.filter(r => 
      r.name.toLowerCase().includes(q) || 
      (r.college || '').toLowerCase().includes(q)
    );
  }, [rankings, searchQuery]);

  const topThree = rankings.slice(0, 3);
  const currentUserRank = rankings.find(r => r.isCurrentUser);

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8 text-zinc-900 dark:text-[#E3E3E3]">
      {/* Header */}
      <div className="border-b border-zinc-800 dark:border-white/45 pb-6 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-amber-700 dark:text-[#D1B280]">
              <Trophy className="h-4 w-4" />
              <span>DIPLOMA HALL OF FAME</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mt-1">
              Top Scholar Leaderboard
            </h1>
            <p className="text-sm text-zinc-600 dark:text-[#9B9A97] mt-1 leading-relaxed">
              Real-time rankings based on total questions solved, exam scores, and accuracy across polytechnics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#202020] px-3 py-2 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#282828] transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Leaderboard & Privacy Settings"
              >
                <Settings className="h-4 w-4" />
                <span>Opt-out / Settings</span>
              </button>
            )}

            {onLaunchExam && (
              <button
                type="button"
                onClick={onLaunchExam}
                className="rounded-sm border border-zinc-900 dark:border-white/60 bg-zinc-900 dark:bg-white px-4 py-2 text-xs sm:text-sm font-bold text-white dark:text-[#191919] hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Zap className="h-4 w-4 text-amber-400 fill-current" />
                <span>Solve Questions to Rank Up</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mindful Private Study Mode Notice (If student opted out of comparison) */}
      {isOptedOut && (
        <div className="rounded-md border border-emerald-800/50 dark:border-white/50 bg-emerald-500/10 dark:bg-[#24332C]/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <HeartHandshake className="h-5 w-5 text-emerald-600 dark:text-[#85B59A] shrink-0" />
            <div>
              <div className="text-sm font-bold text-zinc-900 dark:text-white">
                Private Study Mode Active
              </div>
              <div className="text-xs text-zinc-600 dark:text-[#9B9A97]">
                Your name and scores are completely hidden from this leaderboard. You are preparing quietly at your own pace without peer pressure.
              </div>
            </div>
          </div>
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-xs font-semibold text-emerald-700 dark:text-[#85B59A] hover:underline cursor-pointer shrink-0"
            >
              Adjust in Settings →
            </button>
          )}
        </div>
      )}

      {/* Current Student's Rank Card (if registered) */}
      {currentUserRank && (
        <div className="rounded-md border-2 border-amber-600 dark:border-amber-400 bg-amber-50/60 dark:bg-[#2A2318] p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-amber-500 text-white font-mono font-black text-xl shadow-xs">
              #{currentUserRank.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-white">
                  {currentUserRank.name} (You)
                </span>
                <span className="rounded-xs border border-amber-700 bg-amber-100 dark:bg-[#3E3220] px-2 py-0.5 text-xs font-bold text-amber-800 dark:text-[#D1B280]">
                  Your Standing
                </span>
              </div>
              <div className="text-xs text-zinc-600 dark:text-[#9B9A97]">
                {currentUserRank.questionsSolved === 0 
                  ? "Take an exam or instant practice session to register your first points!" 
                  : `${currentUserRank.questionsSolved} questions solved • ${currentUserRank.accuracy}% accuracy`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="text-xs font-bold text-zinc-500 uppercase">Questions Solved</div>
              <div className="text-2xl font-mono font-extrabold text-zinc-900 dark:text-white">
                {currentUserRank.questionsSolved}
              </div>
            </div>
            <div className="border-l border-zinc-300 dark:border-zinc-700 pl-4">
              <div className="text-xs font-bold text-zinc-500 uppercase">Total Marks</div>
              <div className="text-2xl font-mono font-extrabold text-amber-600 dark:text-[#D1B280]">
                {currentUserRank.marksObtained}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topThree.map((scholar, idx) => {
          const medals = [
            { label: "1st Place", badge: "🥇 Rank #1", bg: "border-amber-500 bg-amber-50/40 dark:bg-[#262017]" },
            { label: "2nd Place", badge: "🥈 Rank #2", bg: "border-zinc-400 bg-zinc-50/40 dark:bg-[#202020]" },
            { label: "3rd Place", badge: "🥉 Rank #3", bg: "border-amber-700/60 bg-amber-50/20 dark:bg-[#221B17]" },
          ];
          const m = medals[idx] || medals[0];

          return (
            <div
              key={scholar.name}
              className={`rounded-md border-2 ${m.bg} p-5 space-y-3 relative overflow-hidden shadow-xs`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-extrabold text-xs tracking-wider uppercase text-zinc-700 dark:text-[#D1B280]">
                  {m.badge}
                </span>
                <span className="rounded-xs border border-zinc-800 dark:border-white/30 px-1.5 py-0.5 text-[10px] font-mono font-bold text-zinc-600 dark:text-[#9B9A97]">
                  {scholar.accuracy}% ACC
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white truncate">
                  {scholar.name} {scholar.isCurrentUser ? '(You)' : ''}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-[#9B9A97] truncate mt-0.5">
                  {scholar.college}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div>
                  <div className="text-zinc-500">Solved</div>
                  <div className="font-mono font-bold text-base text-zinc-900 dark:text-white">
                    {scholar.questionsSolved} Qs
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-zinc-500">Total Score</div>
                  <div className="font-mono font-bold text-base text-amber-600 dark:text-[#D1B280]">
                    {scholar.marksObtained} pts
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500 dark:text-[#9B9A97]" />
        <input
          type="text"
          placeholder="Search scholar by student name or institution..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#202020] py-2.5 pl-9 pr-3 text-xs sm:text-sm text-zinc-900 dark:text-[#E3E3E3] focus:border-zinc-950 dark:focus:border-white focus:outline-hidden"
        />
      </div>

      {/* Main Leaderboard Table */}
      <div className="overflow-x-auto rounded-md border border-zinc-800 dark:border-white/50 bg-white dark:bg-[#202020] shadow-xs">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-zinc-800 dark:border-white/45 text-zinc-600 dark:text-[#9B9A97] font-bold bg-zinc-50 dark:bg-[#191919]">
              <th className="py-3 px-4 font-bold text-center w-16">Rank</th>
              <th className="py-3 px-4 font-bold">Candidate Scholar</th>
              <th className="py-3 px-4 font-bold text-center">Questions Solved</th>
              <th className="py-3 px-4 font-bold text-center">Total Marks</th>
              <th className="py-3 px-4 font-bold text-center">Accuracy</th>
              <th className="py-3 px-4 font-bold text-right">Tests Taken</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 dark:divide-white/45">
            {filteredRankings.map((student) => {
              const isFirst = student.rank === 1;
              const isSecond = student.rank === 2;
              const isThird = student.rank === 3;

              return (
                <tr
                  key={student.name}
                  className={`transition-colors ${
                    student.isCurrentUser
                      ? 'bg-amber-100/50 dark:bg-[#2B2317] font-semibold'
                      : 'hover:bg-zinc-50 dark:hover:bg-[#252525]'
                  }`}
                >
                  {/* Rank */}
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-sm sm:text-base">
                    {isFirst ? '🥇 #1' : isSecond ? '🥈 #2' : isThird ? '🥉 #3' : `#${student.rank}`}
                  </td>

                  {/* Candidate */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base">
                        {student.name}
                      </span>
                      {student.isCurrentUser && (
                        <span className="rounded-xs border border-amber-700 bg-amber-100 dark:bg-[#362D1F] px-1.5 py-0.2 text-[10px] font-bold text-amber-800 dark:text-[#D1B280]">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-[#9B9A97]">
                      {student.college}
                    </div>
                  </td>

                  {/* Questions Solved */}
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                    {student.questionsSolved} Qs
                  </td>

                  {/* Total Marks */}
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-sm sm:text-base text-amber-600 dark:text-[#D1B280]">
                    {student.marksObtained}
                  </td>

                  {/* Accuracy */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="rounded-sm border border-zinc-800 dark:border-white/30 bg-zinc-100 dark:bg-[#191919] px-2 py-0.5 text-xs font-mono font-bold">
                      {student.accuracy}%
                    </span>
                  </td>

                  {/* Tests Taken */}
                  <td className="py-3.5 px-4 text-right font-mono text-zinc-600 dark:text-[#9B9A97]">
                    {student.examsCount} {student.examsCount === 1 ? 'Exam' : 'Exams'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
