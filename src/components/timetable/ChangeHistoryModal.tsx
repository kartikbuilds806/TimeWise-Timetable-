import React from 'react';
import { TimetableChangeLog } from '../../types';
import { History, ArrowRight, User, Clock, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ChangeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  changeLogs: TimetableChangeLog[];
  currentVersion: number;
}

export const ChangeHistoryModal: React.FC<ChangeHistoryModalProps> = ({
  isOpen,
  onClose,
  changeLogs,
  currentVersion
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-900">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Timetable Change History & Audit Log
              </h2>
              <p className="text-xs text-slate-500">
                Active Version v{currentVersion}.0 — Tracking all room swaps, rescheduling, and modifications
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {changeLogs.length === 0 ? (
            <div className="text-center py-10 px-4">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No Timetable Modifications Recorded</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                The current timetable matches the baseline generated schedule without any manual room swaps or time adjustments.
              </p>
            </div>
          ) : (
            changeLogs.map(log => (
              <div 
                key={log.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">
                      {log.subjectName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold text-[10px]">
                      {log.sectionName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-100 text-amber-800">
                      {log.changeType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Old vs New Comparison Cards (Rule 11 requirement) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-red-50/60 border border-red-200/80">
                    <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block mb-1">
                      Previous Schedule
                    </span>
                    <div className="space-y-0.5 text-slate-700">
                      <div><strong className="text-slate-900">Room:</strong> {log.oldValue.roomNumber}</div>
                      <div><strong className="text-slate-900">Faculty:</strong> {log.oldValue.teacherName}</div>
                      <div><strong className="text-slate-900">Slot:</strong> {log.oldValue.timeSlotText}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                      New Schedule
                    </span>
                    <div className="space-y-0.5 text-slate-700">
                      <div><strong className="text-slate-900">Room:</strong> {log.newValue.roomNumber}</div>
                      <div><strong className="text-slate-900">Faculty:</strong> {log.newValue.teacherName}</div>
                      <div><strong className="text-slate-900">Slot:</strong> {log.newValue.timeSlotText}</div>
                    </div>
                  </div>
                </div>

                {/* Audit Attribution */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Changed by: <strong>{log.changedBy}</strong></span>
                  </div>
                  {log.reason && (
                    <span className="italic text-slate-600">
                      Note: "{log.reason}"
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};
