import React, { useState } from 'react';
import { 
  TimetableVersion, 
  TimetableChangeLog, 
  TimetableEntry, 
  TimeSlot 
} from '../../types';
import { 
  GitCompare, 
  ArrowRight, 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Layers,
  History
} from 'lucide-react';

interface TimetableDiffViewerProps {
  currentVersion: TimetableVersion;
  timeSlots: TimeSlot[];
}

export const TimetableDiffViewer: React.FC<TimetableDiffViewerProps> = ({
  currentVersion,
  timeSlots
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'RESCHEDULE' | 'ROOM_CHANGE' | 'TEACHER_CHANGE'>('ALL');

  const changeLogs = currentVersion.changeLogs || [];

  const filteredLogs = changeLogs.filter(log => {
    if (selectedFilter === 'ALL') return true;
    return log.changeType === selectedFilter;
  });

  const roomChangesCount = changeLogs.filter(l => l.changeType === 'ROOM_CHANGE').length;
  const rescheduleCount = changeLogs.filter(l => l.changeType === 'RESCHEDULE' || l.changeType === 'TIME_CHANGE').length;
  const teacherChangesCount = changeLogs.filter(l => l.changeType === 'TEACHER_CHANGE').length;

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="academic-subtle-card p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Adjustments</span>
          <span className="text-2xl font-bold text-slate-900">{changeLogs.length}</span>
          <span className="text-[10px] text-slate-500 block">Across v{currentVersion.versionNumber}.0 history</span>
        </div>

        <div className="academic-subtle-card p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Rescheduled Slots</span>
          <span className="text-2xl font-bold text-blue-900">{rescheduleCount}</span>
          <span className="text-[10px] text-blue-700 block">Timing / Period movements</span>
        </div>

        <div className="academic-subtle-card p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Room Swaps</span>
          <span className="text-2xl font-bold text-indigo-900">{roomChangesCount}</span>
          <span className="text-[10px] text-indigo-700 block">Venue reallocations</span>
        </div>

        <div className="academic-subtle-card p-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Optimization Delta</span>
          <span className="text-2xl font-bold text-emerald-700">{currentVersion.optimizationScore}%</span>
          <span className="text-[10px] text-emerald-600 block">{currentVersion.hardConflictsCount} hard conflicts</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              selectedFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Modifications ({changeLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('RESCHEDULE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              selectedFilter === 'RESCHEDULE'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Rescheduled / Cancelled ({rescheduleCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('ROOM_CHANGE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              selectedFilter === 'ROOM_CHANGE'
                ? 'bg-indigo-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Room Swaps ({roomChangesCount})
          </button>
        </div>

        <span className="text-xs text-slate-400 flex items-center gap-1">
          <History className="w-3.5 h-3.5" />
          Immutable Academic Audit Ledger
        </span>
      </div>

      {/* Diff Log List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
            No modification events matching selected filter.
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all text-xs space-y-3 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{log.subjectName}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {log.sectionName}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900">
                    {log.changeType}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span>By: <strong>{log.changedBy}</strong></span>
                  <span>•</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Side-by-Side Diff Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                {/* Previous State */}
                <div className="p-3 rounded-lg bg-rose-50/60 border border-rose-200 space-y-1">
                  <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                    Previous Baseline
                  </span>
                  <div className="space-y-0.5 text-slate-700">
                    <p><strong>Room:</strong> {log.oldValue.roomNumber}</p>
                    <p><strong>Faculty:</strong> {log.oldValue.teacherName}</p>
                    <p><strong>Slot / Window:</strong> {log.oldValue.timeSlotText}</p>
                  </div>
                </div>

                {/* Updated State */}
                <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Updated Allocation
                  </span>
                  <div className="space-y-0.5 text-slate-900">
                    <p><strong>Room:</strong> {log.newValue.roomNumber}</p>
                    <p><strong>Faculty:</strong> {log.newValue.teacherName}</p>
                    <p><strong>Slot / Window:</strong> {log.newValue.timeSlotText}</p>
                  </div>
                </div>
              </div>

              {/* Justification / Reason */}
              {log.reason && (
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] italic">
                  <strong>Audited Justification:</strong> "{log.reason}"
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
