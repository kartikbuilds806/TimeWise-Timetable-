import React, { useState } from 'react';
import { 
  TimetableEntry, 
  Teacher, 
  TimeSlot, 
  Section, 
  ProxySubstitutionRecord 
} from '../../types';
import { ProxySubstitutionModal } from './ProxySubstitutionModal';
import { 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Sparkles, 
  Send, 
  UserX,
  FileCheck,
  ShieldCheck,
  Search,
  BookOpen
} from 'lucide-react';

interface ProxyManagerTabProps {
  entries: TimetableEntry[];
  allTeachers: Teacher[];
  timeSlots: TimeSlot[];
  sections: Section[];
  onAssignProxy: (
    entryId: string,
    proxyTeacher: Teacher,
    reason: string,
    notes?: string
  ) => void;
  userRole?: 'ROLE_ADMIN' | 'ROLE_TEACHER';
}

export const ProxyManagerTab: React.FC<ProxyManagerTabProps> = ({
  entries,
  allTeachers,
  timeSlots,
  sections,
  onAssignProxy,
  userRole = 'ROLE_ADMIN'
}) => {
  const [selectedEntryForProxy, setSelectedEntryForProxy] = useState<TimetableEntry | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'UNCOVERED' | 'SUBSTITUTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all cancelled and substituted entries
  const cancelledEntries = entries.filter(e => e.status === 'CANCELLED');
  const substitutedEntries = entries.filter(e => e.status === 'SUBSTITUTED');
  const allProxyRelevant = entries.filter(e => e.status === 'CANCELLED' || e.status === 'SUBSTITUTED');

  const filteredEntries = allProxyRelevant.filter(entry => {
    if (filterType === 'UNCOVERED' && entry.status !== 'CANCELLED') return false;
    if (filterType === 'SUBSTITUTED' && entry.status !== 'SUBSTITUTED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSub = entry.subjectCode.toLowerCase().includes(q) || entry.subjectName.toLowerCase().includes(q);
      const matchSec = entry.sectionName.toLowerCase().includes(q);
      const matchTeach = entry.teacherName.toLowerCase().includes(q) || 
        (entry.proxySubstitution?.proxyTeacherName.toLowerCase().includes(q) ?? false);
      return matchSub || matchSec || matchTeach;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="academic-subtle-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cancelled Classes</span>
            <span className="text-xl font-bold text-slate-900">{cancelledEntries.length}</span>
            <span className="text-[10px] text-rose-600 block">Pending emergency proxy</span>
          </div>
        </div>

        <div className="academic-subtle-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Proxy Coverage</span>
            <span className="text-xl font-bold text-emerald-700">{substitutedEntries.length}</span>
            <span className="text-[10px] text-emerald-600 block">Assigned substitute faculty</span>
          </div>
        </div>

        <div className="academic-subtle-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Coverage Ratio</span>
            <span className="text-xl font-bold text-blue-900">
              {allProxyRelevant.length > 0 
                ? `${Math.round((substitutedEntries.length / allProxyRelevant.length) * 100)}%` 
                : '100%'}
            </span>
            <span className="text-[10px] text-slate-500 block">Automated conflict-checked</span>
          </div>
        </div>
      </div>

      {/* Action & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Sessions ({allProxyRelevant.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('UNCOVERED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'UNCOVERED'
                ? 'bg-rose-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Needs Proxy ({cancelledEntries.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('SUBSTITUTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'SUBSTITUTED'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Proxy Assigned ({substitutedEntries.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search subject, teacher, section..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-800 text-sm">All Class Sessions Fully Staffed</p>
            <p className="text-slate-400 mt-1">There are currently no cancelled sessions requiring proxy substitution.</p>
          </div>
        ) : (
          filteredEntries.map(entry => {
            const isSubstituted = entry.status === 'SUBSTITUTED';
            const slot = timeSlots.find(s => s.id === entry.timeSlotId);
            const timeText = entry.slotOrder === 10 ? '17:00 - 17:55 (5:00 PM)' : slot ? `${slot.startTime} - ${slot.endTime}` : `Slot ${entry.slotOrder}`;

            return (
              <div
                key={entry.id}
                className={`p-4 rounded-xl border transition-all text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSubstituted
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-rose-50/70 border-rose-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{entry.subjectCode}</span>
                    <span className="text-slate-400">|</span>
                    <span className="font-semibold text-slate-800">{entry.subjectName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {entry.sectionName}
                    </span>
                    {isSubstituted ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        PROXY ASSIGNED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        REQUIRES PROXY
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-slate-600 text-[11px]">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {entry.dayOfWeek}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-slate-700">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {timeText}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      Room {entry.roomNumber}
                    </span>
                    <span>
                      Original Faculty: <strong>{entry.teacherName}</strong>
                    </span>
                  </div>

                  {/* If Cancelled, show cancellation reason */}
                  {entry.cancellationNotice && !isSubstituted && (
                    <div className="p-2.5 rounded-lg bg-rose-100 border border-rose-200 text-[11px] text-rose-950">
                      <span><strong>Cancellation Reason:</strong> "{entry.cancellationNotice.reason}"</span>
                      <span className="ml-2 text-rose-800 text-[10px]">(Notice given at {entry.cancellationNotice.cancellationTime || entry.cancellationNotice.cancellationNoticeTime})</span>
                    </div>
                  )}

                  {/* If Substituted, show Proxy Teacher details */}
                  {isSubstituted && entry.proxySubstitution && (
                    <div className="p-2.5 rounded-lg bg-emerald-100 border border-emerald-300 text-[11px] text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-emerald-900">
                          Substitute Faculty: {entry.proxySubstitution.proxyTeacherName}
                        </span>
                        <p className="text-emerald-800 text-[10px] mt-0.5">
                          Directives: "{entry.proxySubstitution.reason}"
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 self-start sm:self-center">
                        Assigned by {entry.proxySubstitution.assignedBy}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action CTA */}
                <div className="shrink-0 self-end md:self-center">
                  {!isSubstituted ? (
                    <button
                      type="button"
                      onClick={() => setSelectedEntryForProxy(entry)}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Find & Assign Proxy</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedEntryForProxy(entry)}
                      className="px-3 py-1.5 rounded-lg border border-emerald-400 bg-white hover:bg-emerald-50 text-emerald-800 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Change Proxy</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Trigger */}
      {selectedEntryForProxy && (
        <ProxySubstitutionModal
          isOpen={!!selectedEntryForProxy}
          onClose={() => setSelectedEntryForProxy(null)}
          cancelledEntry={selectedEntryForProxy}
          allTeachers={allTeachers}
          allEntries={entries}
          timeSlots={timeSlots}
          onConfirmProxyAssignment={onAssignProxy}
        />
      )}
    </div>
  );
};
