// src/components/StudentIdentificationModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Building, 
  Hash, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { detectStudentLocation } from '../utils/locationService';
import { getSavedStudentProfile, saveStudentProfile } from '../utils/sessionService';

export default function StudentIdentificationModal({
  isOpen,
  onClose,
  onConfirmStudent,
  examTitle = 'Diploma Science Examination'
}) {
  if (!isOpen) return null;

  const saved = getSavedStudentProfile() || {};
  const [name, setName] = useState(saved.name || '');
  const [rollNo, setRollNo] = useState(saved.rollNo || '');
  const [college, setCollege] = useState(saved.college || '');
  const [location, setLocation] = useState(saved.location || null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const loc = await detectStudentLocation();
      setLocation(loc);
    } catch (e) {
      console.warn('Location detection failed:', e);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  useEffect(() => {
    if (!location) {
      fetchLocation();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your full name to proceed with the test.');
      return;
    }

    const finalLocation = isEditingLocation && customCity.trim()
      ? {
          city: customCity.trim(),
          region: location?.region || '',
          country: location?.country || 'India',
          latitude: location?.latitude || null,
          longitude: location?.longitude || null,
          ip: location?.ip || 'Manual Entry',
          source: 'manual',
          displayText: `${customCity.trim()}, ${location?.country || 'India'}`
        }
      : location || {
          city: 'Local Campus',
          region: '',
          country: 'India',
          displayText: 'Local Campus'
        };

    const profile = {
      name: name.trim(),
      rollNo: rollNo.trim(),
      college: college.trim(),
      location: finalLocation
    };

    saveStudentProfile(profile);
    onConfirmStudent(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-md border-2 border-zinc-900 dark:border-white/60 bg-white dark:bg-[#202020] text-zinc-900 dark:text-[#E3E3E3] p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 dark:border-white/45 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 dark:text-[#9B9A97]">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-[#85B59A]" />
              <span>STUDENT VERIFICATION</span>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-[#E3E3E3]">
              Candidate Exam Entry
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm border border-zinc-800 dark:border-white/45 p-1.5 text-zinc-600 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#282828] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#9B9A97] mt-3">
          Preparing to launch <strong className="text-zinc-900 dark:text-white font-bold">{examTitle}</strong>. Your name and verified testing location will be recorded on your scorecard and the examiner dashboard.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-sm border border-rose-800 dark:border-white/50 bg-rose-50 dark:bg-[#3B2825] text-xs font-semibold text-rose-800 dark:text-[#D18E84] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Student Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-[#9B9A97] mb-1.5">
              Candidate Full Name <span className="text-rose-600 dark:text-[#D18E84]">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500 dark:text-[#9B9A97]" />
              <input
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] py-2.5 pl-9 pr-3 text-sm text-zinc-900 dark:text-[#E3E3E3] font-medium focus:border-zinc-950 dark:focus:border-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Roll Number & College */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-[#9B9A97] mb-1.5">
                Roll No / PRN
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 h-4 w-4 text-zinc-500 dark:text-[#9B9A97]" />
                <input
                  type="text"
                  placeholder="e.g. DIP-ME-042"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] py-2.5 pl-9 pr-3 text-sm text-zinc-900 dark:text-[#E3E3E3] font-medium focus:border-zinc-950 dark:focus:border-white focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-[#9B9A97] mb-1.5">
                Polytechnic / College
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-zinc-500 dark:text-[#9B9A97]" />
                <input
                  type="text"
                  placeholder="e.g. Govt Polytechnic"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] py-2.5 pl-9 pr-3 text-sm text-zinc-900 dark:text-[#E3E3E3] font-medium focus:border-zinc-950 dark:focus:border-white focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Live Location Verification Box */}
          <div className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-50 dark:bg-[#191919] p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-zinc-600 dark:text-[#9B9A97] flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-rose-600 dark:text-[#D18E84]" />
                Test Location Verification
              </span>
              <button
                type="button"
                onClick={fetchLocation}
                disabled={isDetectingLocation}
                className="text-[11px] font-semibold text-zinc-600 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                <span>Re-detect</span>
              </button>
            </div>

            {isDetectingLocation ? (
              <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-[#9B9A97] py-1">
                <div className="h-3.5 w-3.5 rounded-full border-2 border-zinc-900 dark:border-white border-t-transparent animate-spin" />
                <span>Acquiring GPS / network location coordinates...</span>
              </div>
            ) : location ? (
              <div className="space-y-1.5 pt-0.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-[#E3E3E3] flex items-center gap-1.5">
                    <span>{location.city || 'Detected Area'}</span>
                    {location.region && <span className="text-zinc-500 font-normal">, {location.region}</span>}
                    {location.country && <span className="text-zinc-500 font-normal">({location.country})</span>}
                  </div>

                  <span className={`rounded-xs border px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                    location.source === 'gps'
                      ? 'border-emerald-800 dark:border-white/45 bg-emerald-100 dark:bg-[#24332C] text-emerald-900 dark:text-[#85B59A]'
                      : 'border-sky-800 dark:border-white/45 bg-sky-100 dark:bg-[#22313F] text-sky-900 dark:text-[#8FAFC4]'
                  }`}>
                    {location.source === 'gps' ? 'GPS High Precision' : 'Network Geo-IP'}
                  </span>
                </div>

                {location.latitude && location.longitude && (
                  <div className="text-[11px] font-mono text-zinc-500 dark:text-[#6F6E6B]">
                    Lat: {location.latitude.toFixed(4)}°, Long: {location.longitude.toFixed(4)}°
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-zinc-500 dark:text-[#9B9A97]">
                Location detection ready.
              </div>
            )}

            {/* Manual Edit City Toggle */}
            <div className="pt-1 text-right">
              <button
                type="button"
                onClick={() => setIsEditingLocation(!isEditingLocation)}
                className="text-[11px] text-zinc-500 dark:text-[#9B9A97] hover:underline cursor-pointer"
              >
                {isEditingLocation ? 'Cancel manual city' : 'Edit city manually'}
              </button>
            </div>

            {isEditingLocation && (
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Type city manually (e.g. Nagpur, Maharashtra)"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  className="w-full rounded-sm border border-zinc-800 dark:border-white/45 bg-white dark:bg-[#242424] py-1.5 px-3 text-xs text-zinc-900 dark:text-[#E3E3E3] focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800 dark:border-white/45">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-zinc-800 dark:border-white/45 bg-zinc-100 dark:bg-[#191919] px-4 py-2 font-semibold text-xs sm:text-sm text-zinc-700 dark:text-[#9B9A97] hover:text-zinc-900 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-sm border border-zinc-900 dark:border-white/60 bg-zinc-900 dark:bg-[#E3E3E3] px-6 py-2 font-bold text-xs sm:text-sm text-white dark:text-[#191919] hover:bg-zinc-800 dark:hover:bg-white transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Begin Examination</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
