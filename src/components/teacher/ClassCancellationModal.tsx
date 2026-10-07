import React, { useState, useEffect } from 'react';
import { Teacher, TimetableEntry, ClassCancellationNotice } from '../../types';
import { 
  AlertTriangle, 
  Clock, 
  XCircle, 
  CheckCircle2, 
  Send, 
  BookOpen, 
  MapPin, 
  GraduationCap, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface ClassCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher;
  teacherEntries: TimetableEntry[];
  preselectedEntryId?: string;
  onConfirmCancellation: (
    entryId: string, 
    reason: string, 
    cancellationTime: string
  ) => { success: boolean; error?: string };
}

export const ClassCancellationModal: React.FC<ClassCancellationModalProps> = ({
  isOpen,
  onClose,
  teacher,
  teacherEntries,
  preselectedEntryId,
  onConfirmCancellation
}) => {
  const activeEntries = teacherEntries.filter(e => e.status !== 'CANCELLED');

  const [selectedEntryId, setSelectedEntryId] = useState<string>(
    preselectedEntryId || (activeEntries.length > 0 ? activeEntries[0].id : '')
  );

  // Default to 15:30 (3:30 PM) so it fulfills the before 4 PM rule easily during testing, but allow full editing
  const [cancellationTime, setCancellationTime] = useState<string>('15:30');
  const [reason, setReason] = useState<string>('Departmental Faculty Meeting & Curriculum Review');
  const [errorText, setErrorText] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string>('');

  useEffect(() => {
    if (preselectedEntryId) {
      setSelectedEntryId(preselectedEntryId);
    } else if (activeEntries.length > 0 && !selectedEntryId) {
      setSelectedEntryId(activeEntries[0].id);
    }
  }, [preselectedEntryId, activeEntries, selectedEntryId]);

  if (!isOpen) return null;

  const selectedEntry = teacherEntries.find(e => e.id === selectedEntryId);

  // Check 4:00 PM (16:00) policy rule
  const isBefore4PM = (timeStr: string): boolean => {
    if (!timeStr) return false;
    const parts = timeStr.split(':');
    if (parts.length < 2) return false;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    // 16:00 is 4:00 PM
    return hours < 16;
  };

  const timingValid = isBefore4PM(cancellationTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSuccessNotice('');

    if (!selectedEntryId) {
      setErrorText('Please select a class to cancel.');
      return;
    }

    if (!reason.trim()) {
      setErrorText('Please provide a specific reason for class cancellation.');
      return;
    }

    if (!timingValid) {
      setErrorText('Mandatory Policy Violation: Cancellation timing must be submitted BEFORE 4:00 PM (16:00). Notices submitted at or after 4:00 PM cannot be accepted.');
      return;
    }

    const result = onConfirmCancellation(selectedEntryId, reason, cancellationTime);
    if (!result.success) {
      setErrorText(result.error || 'Failed to cancel class.');
    } else {
      setSuccessNotice('Class cancellation notice successfully published. Affected students have been notified.');
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="cancel-class-modal"
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-red-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <XCircle className="w-5 h-5 text-red-200" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Post Class Cancellation Notice</h3>
              <p className="text-xs text-red-200">
                Official Student Notification Gateway • Policy Deadline: Before 4:00 PM
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-red-200 hover:text-white p-1 rounded-lg hover:bg-white/10 text-xs font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Policy Rule Callout */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Institutional Cancellation Rule:</strong>
              <span>
                Faculty must notify students of cancellation <strong>before 4:00 PM</strong>.
                For example, if you have a class at 5:00 PM (Period 10), students must receive the reason and timing
                before 4:00 PM so they can plan accordingly.
              </span>
            </div>
          </div>

          {errorText && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorText}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Select Class */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Scheduled Class to Cancel <span className="text-red-500">*</span>
            </label>
            {activeEntries.length === 0 ? (
              <p className="p-3 rounded-lg bg-slate-100 text-slate-600">
                You have no active teaching sessions scheduled.
              </p>
            ) : (
              <select
                id="select-class-to-cancel"
                value={selectedEntryId}
                onChange={e => setSelectedEntryId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-red-600 focus:outline-hidden"
              >
                {activeEntries.map(e => (
                  <option key={e.id} value={e.id}>
                    [{e.dayOfWeek} Period {e.slotOrder}] {e.sectionName} — {e.subjectCode} {e.subjectName} ({e.roomNumber})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Class Snapshot */}
          {selectedEntry && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                <span>{selectedEntry.sectionName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-semibold">
                  {selectedEntry.subjectCode}
                </span>
              </div>
              <div className="text-slate-600 flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {selectedEntry.dayOfWeek} (Period {selectedEntry.slotOrder})
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {selectedEntry.slotOrder === 10 ? '17:00 - 17:55 (5:00 PM)' : `Slot ${selectedEntry.slotOrder}`}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Room {selectedEntry.roomNumber}
                </span>
              </div>
            </div>
          )}

          {/* Cancellation Timing Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                Notice Submission Time <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCancellationTime('15:30')}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-medium text-slate-700"
                >
                  Set 03:30 PM (Valid)
                </button>
                <button
                  type="button"
                  onClick={() => setCancellationTime('16:15')}
                  className="px-2 py-0.5 rounded bg-red-100 hover:bg-red-200 text-[10px] font-medium text-red-700"
                >
                  Set 04:15 PM (Test Invalid)
                </button>
              </div>
            </div>

            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-cancellation-time"
                type="time"
                required
                value={cancellationTime}
                onChange={e => setCancellationTime(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl font-mono text-sm focus:outline-hidden ${
                  timingValid 
                    ? 'border-emerald-300 text-emerald-950 focus:ring-2 focus:ring-emerald-500' 
                    : 'border-red-400 text-red-950 bg-red-50/40 focus:ring-2 focus:ring-red-500'
                }`}
              />
            </div>

            {/* Live Timing Feedback */}
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
              {timingValid ? (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Timing Approved: Submitted before 4:00 PM deadline ({cancellationTime}).
                </span>
              ) : (
                <span className="text-red-700 font-semibold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  Timing Rejected: Notices must be submitted before 4:00 PM (16:00). Current: {cancellationTime}.
                </span>
              )}
            </div>
          </div>

          {/* Cancellation Reason */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Reason for Class Cancellation <span className="text-red-500">*</span>
            </label>
            <textarea
              id="textarea-cancellation-reason"
              rows={3}
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Attending mandatory Departmental Academic Committee Meeting..."
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-hidden"
            />

            {/* Quick Reason Suggestions */}
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="text-[10px] text-slate-400 font-semibold self-center">Presets:</span>
              {[
                'Departmental Faculty Meeting',
                'Curriculum Evaluation & Accreditation Duty',
                'Academic Conference Attendance',
                'Faculty Medical Emergency'
              ].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReason(preset)}
                  className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-600"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              id="btn-cancel-modal-close"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-class-cancellation"
              type="submit"
              disabled={!timingValid || activeEntries.length === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-semibold transition-all shadow-md ${
                timingValid && activeEntries.length > 0
                  ? 'bg-red-700 hover:bg-red-800 cursor-pointer'
                  : 'bg-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Confirm & Dispatch Notice</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
