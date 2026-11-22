// src/components/AdminPanel.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  Lock, 
  User, 
  MapPin, 
  Download, 
  Trash2, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Award, 
  Clock, 
  FileText, 
  Building,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  LogOut,
  Globe
} from 'lucide-react';
import { 
  getAllStudentSessions, 
  deleteStudentSession, 
  clearAllStudentSessions, 
  exportSessionsToCSV 
} from '../utils/sessionService';
import StudentScorecardModal from './StudentScorecardModal';
import Dashboard from './Dashboard';

export default function AdminPanel({ 
  onNavigateHome,
  onLaunchPreset,
  onOpenCustomModal,
  onNavigate,
  hideLeaderboard,
  mistakeCount,
  history
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('diploma_admin_auth') === 'true';
  });

  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [examFilter, setExamFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');

  const [selectedStudentSession, setSelectedStudentSession] = useState(null);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const data = await getAllStudentSessions();
      setSessions(data);
    } catch (e) {
      console.error('Failed to load sessions:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSessions();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('diploma_admin_auth');
    if (onNavigateHome) {
      onNavigateHome();
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete test record for student "${name}"?`)) {
      await deleteStudentSession(id);
      await loadSessions();
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL student exam records? This cannot be undone.')) {
      await clearAllStudentSessions();
      await loadSessions();
    }
  };

  // Compute Metrics
  const metrics = useMemo(() => {
    const total = sessions.length;
    if (total === 0) return { total: 0, uniqueStudents: 0, avgPercentage: 0, topCity: 'None', uniqueCities: 0 };

    const uniqueNames = new Set(sessions.map(s => s.studentName?.toLowerCase()?.trim())).size;
    const avgPercentage = (sessions.reduce((acc, s) => acc + (s.percentage || 0), 0) / total).toFixed(1);

    const cityCounts = {};
    sessions.forEach(s => {
      const city = s.location?.city || 'Unknown';
      if (city && city !== 'Unknown') {
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      }
    });

    const uniqueCities = Object.keys(cityCounts).length;
    let topCity = 'N/A';
    let maxCount = 0;
    Object.entries(cityCounts).forEach(([city, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCity = `${city} (${count})`;
      }
    });

    return { total, uniqueStudents: uniqueNames, avgPercentage, topCity, uniqueCities, cityCounts };
  }, [sessions]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (s.studentName || '').toLowerCase().includes(q);
        const matchIp = (s.location?.ip || '').toLowerCase().includes(q);
        const matchCity = (s.location?.city || '').toLowerCase().includes(q);
        const matchId = (s.studentId || '').toLowerCase().includes(q);
        if (!matchName && !matchIp && !matchCity && !matchId) return false;
      }

      // Exam filter
      if (examFilter !== 'all') {
        if (examFilter === '70' && !s.examTitle?.includes('70')) return false;
        if (examFilter === '140' && !s.examTitle?.includes('140')) return false;
      }

      // Grade filter
      if (gradeFilter !== 'all') {
        if (gradeFilter === 'distinction' && (s.percentage || 0) < 75) return false;
        if (gradeFilter === 'pass' && ((s.percentage || 0) < 40 || (s.percentage || 0) >= 75)) return false;
        if (gradeFilter === 'fail' && (s.percentage || 0) >= 40) return false;
      }

      return true;
    });
  }, [sessions, searchQuery, examFilter, gradeFilter]);

  // If Not Authenticated -> Disguised Dashboard with visible /test01 command textbox!
  if (!isAuthenticated) {
    return (
      <Dashboard
        onLaunchPreset={onLaunchPreset}
        onOpenCustomModal={onOpenCustomModal}
        onNavigate={onNavigate}
        hideLeaderboard={hideLeaderboard}
        mistakeCount={mistakeCount}
        history={history}
        onAdminUnlock={() => {
          setIsAuthenticated(true);
          sessionStorage.setItem('diploma_admin_auth', 'true');
        }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8 text-zinc-900 dark:text-[#E3E3E3]">
      {/* Top Header */}
      <div className="border-b border-zinc-800 dark:border-white/45 pb-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-emerald-700 dark:text-[#85B59A]">
              <ShieldCheck className="h-4 w-4" />
              <span>ADMINISTRATOR & EXAMINER AUDIT</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight mt-1">
              Candidate IP Addresses & Test Records
            </h1>
            <p className="text-sm text-zinc-600 dark:text-[#9B9A97] mt-1">
              Audit examinee identity, raw IP addresses, and exam performance in real time.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => exportSessionsToCSV(sessions)}
              title="Download Excel/CSV Spreadsheet"
              className="rounded-sm border border-zinc-900 dark:border-white/60 bg-zinc-900 dark:bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-white dark:text-[#191919] hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={loadSessions}
              disabled={isLoading}
              title="Refresh Data"
              className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#202020] px-3 py-2 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              title="Clear all records"
              className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#202020] px-3 py-2 text-xs sm:text-sm font-semibold text-rose-700 dark:text-[#D18E84] hover:bg-rose-50 dark:hover:bg-[#3B2825] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout from Admin"
              className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#202020] px-3 py-2 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Lock</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-md border border-zinc-800 dark:border-white/50 bg-white dark:bg-[#202020] p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-[#9B9A97] flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            Total Exams Taken
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-mono font-extrabold text-zinc-900 dark:text-white">
            {metrics.total}
          </div>
        </div>

        <div className="rounded-md border border-zinc-800 dark:border-white/50 bg-white dark:bg-[#202020] p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-[#9B9A97] flex items-center gap-1.5">
            <User className="h-4 w-4 text-emerald-600 dark:text-[#85B59A]" />
            Unique Candidates
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-mono font-extrabold text-emerald-700 dark:text-[#85B59A]">
            {metrics.uniqueStudents}
          </div>
        </div>

        <div className="rounded-md border border-zinc-800 dark:border-white/50 bg-white dark:bg-[#202020] p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-[#9B9A97] flex items-center gap-1.5">
            <Award className="h-4 w-4 text-amber-600 dark:text-[#D18E84]" />
            Average Marks %
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-mono font-extrabold text-zinc-900 dark:text-white">
            {metrics.avgPercentage}%
          </div>
        </div>

        <div className="rounded-md border border-zinc-800 dark:border-white/50 bg-white dark:bg-[#202020] p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-[#9B9A97] flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-sky-600 dark:text-[#8FAFC4]" />
            Unique IP Locations
          </div>
          <div className="mt-2 text-3xl sm:text-4xl font-mono font-extrabold text-sky-700 dark:text-[#8FAFC4]">
            {metrics.uniqueCities}
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500 dark:text-[#9B9A97]" />
          <input
            type="text"
            placeholder="Search candidate name, IP address, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#202020] py-2.5 pl-9 pr-3 text-xs sm:text-sm text-zinc-900 dark:text-[#E3E3E3] focus:border-zinc-950 dark:focus:border-white focus:outline-hidden"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            className="w-full rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#202020] py-2.5 px-3 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-[#E3E3E3] focus:border-zinc-950 dark:focus:border-white focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Exam Formats</option>
            <option value="70">70 Marks Exams</option>
            <option value="140">140 Qs Drills</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="w-full rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#202020] py-2.5 px-3 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-[#E3E3E3] focus:border-zinc-950 dark:focus:border-white focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Grade Levels</option>
            <option value="distinction">Distinction (≥75%)</option>
            <option value="pass">Pass (40% - 74%)</option>
            <option value="fail">Needs Review (&lt;40%)</option>
          </select>
        </div>
      </div>

      {/* Main Students Data Table - Direct Raw IP Address Column */}
      <div className="overflow-x-auto rounded-md border border-zinc-800 dark:border-white/50 bg-white dark:bg-[#202020] shadow-xs">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-zinc-800 dark:border-white/45 text-zinc-600 dark:text-[#9B9A97] font-bold bg-zinc-50 dark:bg-[#191919]">
              <th className="py-3 px-4 font-bold">Candidate</th>
              <th className="py-3 px-4 font-bold font-mono">IP Address</th>
              <th className="py-3 px-4 font-bold">Location</th>
              <th className="py-3 px-4 font-bold">Exam</th>
              <th className="py-3 px-4 font-bold text-center">Score</th>
              <th className="py-3 px-4 font-bold text-center">Percentage</th>
              <th className="py-3 px-4 font-bold">Date & Time</th>
              <th className="py-3 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 dark:divide-white/45">
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-sm text-zinc-500 dark:text-[#9B9A97]">
                  No student test sessions found. When students take an exam, their name, IP address, and scores will appear here.
                </td>
              </tr>
            ) : (
              filteredSessions.map((s) => {
                const loc = s.location || {};
                const isDistinction = (s.percentage || 0) >= 75;
                const isPass = (s.percentage || 0) >= 40;

                return (
                  <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-[#252525] transition-colors">
                    {/* Candidate */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base">
                        {s.studentName || 'Anonymous Student'}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-[#9B9A97]">
                        {s.studentId ? `PRN: ${s.studentId}` : 'Enrolled Student'}
                      </div>
                    </td>

                    {/* Raw IP Address Display */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block rounded-xs border border-zinc-800 dark:border-white/35 bg-zinc-100 dark:bg-[#191919] px-2.5 py-1 font-mono font-bold text-xs text-zinc-900 dark:text-white shadow-2xs">
                        {loc.ip || '127.0.0.1'}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-[#E3E3E3]">
                        <MapPin className="h-3.5 w-3.5 text-rose-600 dark:text-[#D18E84] shrink-0" />
                        <span>{loc.city || 'Local Area'}</span>
                        {loc.region && <span className="text-zinc-500">, {loc.region}</span>}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-[#6F6E6B]">
                        {loc.country || 'India'}
                      </div>
                    </td>

                    {/* Exam */}
                    <td className="py-3.5 px-4 font-medium text-zinc-800 dark:text-[#E3E3E3]">
                      <div>{s.examTitle}</div>
                      <div className="text-xs text-zinc-500 font-mono">{s.totalQuestions} Questions</div>
                    </td>

                    {/* Score */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                      {s.marksObtained} / {s.maxMarks}
                    </td>

                    {/* Percentage & Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block rounded-sm px-2 py-0.5 text-xs font-mono font-bold border ${
                        isDistinction
                          ? 'border-emerald-800 dark:border-white/45 bg-emerald-100 dark:bg-[#24332C] text-emerald-900 dark:text-[#85B59A]'
                          : isPass
                          ? 'border-sky-800 dark:border-white/45 bg-sky-100 dark:bg-[#22313F] text-sky-900 dark:text-[#8FAFC4]'
                          : 'border-rose-800 dark:border-white/45 bg-rose-100 dark:bg-[#3B2825] text-rose-900 dark:text-[#D18E84]'
                      }`}>
                        {s.percentage}% {isDistinction ? '★' : ''}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs font-mono text-zinc-600 dark:text-[#9B9A97]">
                      {new Date(s.timestamp).toLocaleDateString()}
                      <div className="text-[11px] text-zinc-500">
                        {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentSession(s)}
                          title="View Complete Student Report"
                          className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#191919] p-1.5 text-zinc-700 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id, s.studentName)}
                          title="Delete Session"
                          className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#191919] p-1.5 text-zinc-600 dark:text-[#9B9A97] hover:text-rose-600 dark:hover:text-[#D18E84] transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detailed Student Scorecard Modal */}
      {selectedStudentSession && (
        <StudentScorecardModal
          session={selectedStudentSession}
          onClose={() => setSelectedStudentSession(null)}
        />
      )}
    </div>
  );
}
