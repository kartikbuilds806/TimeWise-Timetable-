import React, { useState, useMemo } from 'react';
import { 
  TimetableEntry, 
  Teacher, 
  TimeSlot, 
  Section, 
  ProxySubstitutionRecord 
} from '../../types';
import { 
  analyzeSubstituteCandidates, 
  SubstituteCandidate 
} from '../../services/substitutionEngine';
import { 
  X, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  MapPin, 
  Calendar, 
  Sparkles, 
  ChevronRight,
  ShieldAlert,
  Search,
  BookOpen
} from 'lucide-react';

interface ProxySubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cancelledEntry: TimetableEntry;
  allTeachers: Teacher[];
  allEntries: TimetableEntry[];
  timeSlots: TimeSlot[];
  onConfirmProxyAssignment: (
    entryId: string,
    proxyTeacher: Teacher,
    reason: string,
    notes?: string
  ) => void;
}

export const ProxySubstitutionModal: React.FC<ProxySubstitutionModalProps> = ({
  isOpen,
  onClose,
  cancelledEntry,
  allTeachers,
  allEntries,
  timeSlots,
  onConfirmProxyAssignment
}) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [assignmentReason, setAssignmentReason] = useState<string>('Faculty class cancellation emergency coverage');
  const [proxyNotes, setProxyNotes] = useState<string>('Follow designated syllabus topic in assigned laboratory/lecture hall.');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Analyze candidates using substitution engine
  const analysis = useMemo(() => {
    return analyzeSubstituteCandidates(cancelledEntry, allTeachers, allEntries, timeSlots);
  }, [cancelledEntry, allTeachers, allEntries, timeSlots]);

  const filteredCandidates = useMemo(() => {
    if (!searchFilter.trim()) return analysis.candidates;
    const query = searchFilter.toLowerCase();
    return analysis.candidates.filter(c => 
      c.teacher.fullName.toLowerCase().includes(query) ||
      c.teacher.employeeId.toLowerCase().includes(query) ||
      c.teacher.department.toLowerCase().includes(query)
    );
  }, [analysis, searchFilter]);

  if (!isOpen) return null;

  const selectedCandidate = analysis.candidates.find(c => c.teacher.id === selectedTeacherId);

  const handleConfirm = () => {
    if (!selectedCandidate) return;
    onConfirmProxyAssignment(
      cancelledEntry.id,
      selectedCandidate.teacher,
      assignmentReason,
      proxyNotes
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Assign Proxy Faculty (Substitute Teacher)
              </h2>
              <p className="text-xs text-slate-500">
                SmartSync Phase 3 Intelligent Proxy Recommendation Engine
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Cancelled Session Info Card */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-950 text-sm flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Cancelled Session Requiring Coverage
              </span>
              <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-rose-200 text-rose-900">
                Slot {cancelledEntry.slotOrder} • {analysis.timeSlotText}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Subject</span>
                <span className="font-semibold text-slate-900">{cancelledEntry.subjectCode}: {cancelledEntry.subjectName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Section</span>
                <span className="font-semibold text-slate-900">{cancelledEntry.sectionName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Original Faculty</span>
                <span className="font-semibold text-slate-900">{cancelledEntry.teacherName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Scheduled Venue</span>
                <span className="font-semibold text-slate-900">Room {cancelledEntry.roomNumber}</span>
              </div>
            </div>

            {cancelledEntry.cancellationNotice && (
              <div className="pt-1 text-[11px] text-rose-800 border-t border-rose-200/60 flex items-center justify-between">
                <span>
                  <strong>Cancellation Reason:</strong> "{cancelledEntry.cancellationNotice.reason}"
                </span>
                <span className="text-[10px] text-slate-500">
                  Notified at: {cancelledEntry.cancellationNotice.cancellationTime || cancelledEntry.cancellationNotice.cancellationNoticeTime || '15:30'}
                </span>
              </div>
            )}
          </div>

          {/* Engine Summary Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-700 shrink-0" />
              <span className="text-blue-900 text-xs">
                Evaluated <strong>{analysis.totalFacultyEvaluated}</strong> teachers: <strong>{analysis.availableSubstitutesCount}</strong> faculty are free with 0 clashes during this slot.
              </span>
            </div>
            <div className="relative w-full sm:w-56 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Search teacher by name..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Candidate Teacher List */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              Recommended Free Faculty Members (Ranked by Suitability):
            </label>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredCandidates.map(cand => {
                const isSelected = selectedTeacherId === cand.teacher.id;
                const isFree = cand.isFree;

                return (
                  <div
                    key={cand.teacher.id}
                    onClick={() => {
                      if (isFree) setSelectedTeacherId(cand.teacher.id);
                    }}
                    className={`p-3 rounded-xl border transition-all text-xs flex items-center justify-between gap-3 ${
                      !isFree
                        ? 'opacity-50 bg-slate-100 border-slate-200 cursor-not-allowed'
                        : isSelected
                        ? 'bg-emerald-50 border-emerald-500 shadow-xs cursor-pointer ring-2 ring-emerald-500'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 cursor-pointer shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        !isFree
                          ? 'bg-slate-200 text-slate-500'
                          : isSelected
                          ? 'bg-emerald-700 text-white'
                          : 'bg-blue-100 text-blue-900'
                      }`}>
                        {cand.teacher.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{cand.teacher.fullName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {cand.teacher.employeeId}
                          </span>
                          {cand.suitabilityScore >= 70 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                              Top Match
                            </span>
                          )}
                          {cand.isSubjectQualified && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800">
                              Subject Qualified
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                          <span>{cand.teacher.designation}</span>
                          <span>•</span>
                          <span>Dept: {cand.teacher.department}</span>
                          <span>•</span>
                          <span className={cand.classesToday >= cand.maxDailyLimit ? 'text-amber-700 font-bold' : ''}>
                            Workload today: {cand.classesToday}/{cand.maxDailyLimit} classes
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap gap-1">
                          {cand.reasons.slice(0, 2).map((r, i) => (
                            <span key={i} className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isFree ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-bold text-emerald-700">
                            {cand.suitabilityScore} pts
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isSelected ? 'Selected' : 'Select'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200">
                          Unavailable / Busy
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Proxy Assignment Form */}
          {selectedCandidate && (
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-3">
              <h3 className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Confirm Assignment for {selectedCandidate.teacher.fullName} ({selectedCandidate.teacher.designation})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Coverage Directive / Reason:</label>
                  <input
                    type="text"
                    value={assignmentReason}
                    onChange={e => setAssignmentReason(e.target.value)}
                    className="w-full p-2 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Instructions for Students & Proxy Faculty:</label>
                  <input
                    type="text"
                    value={proxyNotes}
                    onChange={e => setProxyNotes(e.target.value)}
                    className="w-full p-2 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
                  />
                </div>
              </div>

              <p className="text-[11px] text-emerald-800">
                <strong>Notification Broadcast:</strong> An official proxy notice will immediately be dispatched to the {cancelledEntry.sectionName} students' message section and updated on the teacher's schedule.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!selectedCandidate}
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Confirm & Dispatch Proxy Assignment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
