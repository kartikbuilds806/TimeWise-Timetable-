import React, { useState } from 'react';
import { 
  Teacher, 
  TimetableEntry, 
  TimeSlot, 
  TimetableChangeLog,
  Subject,
  Section,
  ClassCancellationNotice
} from '../../types';
import { TimetableGrid } from '../timetable/TimetableGrid';
import { TeacherScheduleAnalyzer } from './TeacherScheduleAnalyzer';
import { ClassCancellationModal } from './ClassCancellationModal';
import { TimetableExportModal } from '../export/TimetableExportModal';
import { 
  Calendar, 
  BookOpen, 
  Users, 
  Clock, 
  BellRing, 
  AlertCircle,
  GraduationCap,
  Sparkles,
  MapPin,
  UserCheck,
  XCircle,
  AlertTriangle,
  Send,
  Search,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Printer
} from 'lucide-react';

interface TeacherDashboardProps {
  teacher: Teacher;
  entries: TimetableEntry[];
  timeSlots: TimeSlot[];
  changeLogs: TimetableChangeLog[];
  subjects: Subject[];
  sections: Section[];
  allTeachers: Teacher[];
  onCancelClass: (
    entryId: string, 
    reason: string, 
    cancellationTime: string
  ) => { success: boolean; error?: string };
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacher,
  entries,
  timeSlots,
  changeLogs,
  subjects,
  sections,
  allTeachers,
  onCancelClass
}) => {
  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'CLASSES' | 'COLLEAGUES' | 'CHANGES'>('SCHEDULE');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [cancellationTargetEntryId, setCancellationTargetEntryId] = useState<string | undefined>(undefined);

  // Entries for this specific teacher
  const teacherEntries = entries.filter(e => e.teacherId === teacher.id);
  const activeEntries = teacherEntries.filter(e => e.status !== 'CANCELLED');
  const cancelledEntries = teacherEntries.filter(e => e.status === 'CANCELLED');
  const proxyAssignments = entries.filter(e => e.proxySubstitution?.proxyTeacherId === teacher.id);

  const teacherChangeLogs = changeLogs.filter(log => 
    log.oldValue.teacherName.includes(teacher.fullName) || 
    log.newValue.teacherName.includes(teacher.fullName)
  );

  // Group teaching load
  const assignedSubjectCodes = Array.from(new Set(teacherEntries.map(e => e.subjectCode)));
  const assignedSections = Array.from(new Set(teacherEntries.map(e => e.sectionName)));

  const handleOpenCancelModal = (entryId?: string) => {
    setCancellationTargetEntryId(entryId);
    setIsCancelModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Faculty Profile Overview Card (Strictly Isolated to Logged-in Faculty) */}
      <div 
        id="teacher-personal-profile-card"
        className="academic-glass-card p-5 border-l-4 border-l-indigo-900"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-indigo-950 text-white flex items-center justify-center font-bold text-xl shadow-md border border-indigo-800 shrink-0">
              {teacher.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{teacher.fullName}</h2>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200">
                  {teacher.employeeId}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Faculty Portal
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {teacher.designation} • Department of {teacher.department}
              </p>
              <p className="text-[11px] text-slate-400">
                {teacher.email} • Verified College Faculty Member
              </p>
            </div>
          </div>

          {/* Quick Metrics & Cancellation CTA */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[85px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Weekly Classes</span>
              <span className="text-lg font-bold text-slate-900">{teacherEntries.length}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[85px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Sections</span>
              <span className="text-lg font-bold text-indigo-900">{assignedSections.length}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[85px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Cancelled</span>
              <span className={`text-lg font-bold ${cancelledEntries.length > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                {cancelledEntries.length}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center min-w-[85px]">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Proxy Duties</span>
              <span className="text-lg font-bold text-emerald-700">{proxyAssignments.length}</span>
            </div>

            {/* Print Workload Schedule */}
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Printer className="w-4 h-4 text-blue-700" />
              <span>Print Workload</span>
            </button>

            {/* Cancel Class Action Button */}
            <button
              id="btn-open-cancel-class-modal"
              type="button"
              onClick={() => handleOpenCancelModal()}
              className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs shadow-md transition-all cursor-pointer shrink-0"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Class (Before 4 PM)</span>
            </button>
          </div>
        </div>

        {/* Proxy Assignment Notification Banner */}
        {proxyAssignments.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Assigned Substitute Faculty:</strong> You are designated as proxy faculty for {proxyAssignments.map(p => `${p.subjectCode} (${p.sectionName}, ${p.dayOfWeek} Slot ${p.slotOrder})`).join(', ')}.
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">
              Official Coverage
            </span>
          </div>
        )}

        {/* Change / Alert banner */}
        {teacherChangeLogs.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Timetable Notice:</strong> You have {teacherChangeLogs.length} schedule modification notice(s) on your courses.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('CHANGES')}
              className="font-bold underline text-[11px] text-amber-800 hover:text-amber-950"
            >
              Review Notice
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs">
        <button
          id="teacher-tab-schedule"
          type="button"
          onClick={() => setActiveTab('SCHEDULE')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'SCHEDULE'
              ? 'border-indigo-900 text-indigo-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          My Teaching Schedule
        </button>

        <button
          id="teacher-tab-classes"
          type="button"
          onClick={() => setActiveTab('CLASSES')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'CLASSES'
              ? 'border-indigo-900 text-indigo-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          My Classes & Cancellation Manager
          {cancelledEntries.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white">
              {cancelledEntries.length} Cancelled
            </span>
          )}
        </button>

        <button
          id="teacher-tab-colleagues"
          type="button"
          onClick={() => setActiveTab('COLLEAGUES')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'COLLEAGUES'
              ? 'border-indigo-900 text-indigo-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Other Teacher Timings & Blank Gaps
        </button>

        <button
          id="teacher-tab-changes"
          type="button"
          onClick={() => setActiveTab('CHANGES')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'CHANGES'
              ? 'border-indigo-900 text-indigo-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BellRing className="w-4 h-4" />
          Change Notices ({teacherChangeLogs.length})
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: TEACHING SCHEDULE GRID */}
      {/* ======================================================== */}
      {activeTab === 'SCHEDULE' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Personal teaching timetable for <strong>{teacher.fullName}</strong> ({teacher.designation})
            </span>
            <span className="text-slate-400 italic text-[11px]">
              * Cancelled classes are highlighted with notice reasons
            </span>
          </div>

          <TimetableGrid
            entries={teacherEntries}
            timeSlots={timeSlots}
            sections={sections}
            teachers={[teacher]}
            rooms={[]}
            conflicts={[]}
            userRole="ROLE_TEACHER"
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MY CLASSES & CANCELLATION MANAGER */}
      {/* ======================================================== */}
      {activeTab === 'CLASSES' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Class Cancellation Protocol:</strong>
              <span>
                To cancel a class session, you must submit your cancellation reason and timing <strong>BEFORE 4:00 PM</strong>.
                For example, if you have a class at 5:00 PM (such as Dr. Bhawnesh Kumar's Java class for BCA V Sec C), you must
                issue the notice before 4:00 PM. Once submitted, the notice and reason will immediately appear in the students'
                Messages section.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Assigned Teaching Sessions ({teacherEntries.length})</h3>
            <button
              type="button"
              onClick={() => handleOpenCancelModal()}
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel a Class</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {teacherEntries.map(entry => {
              const isCancelled = entry.status === 'CANCELLED';
              const slot = timeSlots.find(s => s.id === entry.timeSlotId);

              return (
                <div
                  key={entry.id}
                  className={`p-4 rounded-xl border text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all ${
                    isCancelled
                      ? 'bg-rose-50/90 border-rose-300 shadow-xs text-rose-950'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start md:items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 border ${
                      isCancelled
                        ? 'bg-rose-100 text-rose-900 border-rose-200'
                        : 'bg-indigo-50 text-indigo-900 border-indigo-100'
                    }`}>
                      <span className="text-[9px] uppercase font-bold">Slot</span>
                      <span className="text-sm leading-none">{entry.slotOrder}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${isCancelled ? 'line-through text-rose-900' : 'text-slate-900'}`}>
                          {entry.subjectCode}
                        </span>
                        <span className="text-slate-400">|</span>
                        <span className={`font-semibold ${isCancelled ? 'line-through text-rose-800' : 'text-slate-800'}`}>
                          {entry.subjectName}
                        </span>
                        {isCancelled ? (
                          <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> CANCELLED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-slate-500 mt-1 text-[11px]">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {entry.dayOfWeek}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {entry.slotOrder === 10 ? '17:00 - 17:55 (5:00 PM)' : slot ? `${slot.startTime} - ${slot.endTime}` : `Slot ${entry.slotOrder}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-blue-600" />
                          {entry.sectionName}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          Room {entry.roomNumber}
                        </span>
                      </div>

                      {/* If cancelled, show notice details */}
                      {isCancelled && entry.cancellationNotice && (
                        <div className="mt-2 p-2.5 rounded-lg bg-rose-100/90 border border-rose-200 text-rose-950 text-[11px] space-y-1">
                          <div className="flex items-center justify-between font-semibold text-rose-900">
                            <span>Notice Reason: "{entry.cancellationNotice.reason}"</span>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-200">
                              Dispatched at {entry.cancellationNotice.cancellationTime}
                            </span>
                          </div>
                          <span className="text-[10px] text-rose-700 block">
                            Status: Students of {entry.sectionName} have been notified in their message section.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {!isCancelled ? (
                      <button
                        type="button"
                        onClick={() => handleOpenCancelModal(entry.id)}
                        className="px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 text-red-800 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Cancel This Class</span>
                      </button>
                    ) : (
                      <span className="text-xs text-rose-700 font-bold px-3 py-1.5 rounded-lg bg-rose-100 border border-rose-200">
                        Notice Active in Student App
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CHECK OTHER TEACHERS' TIMING */}
      {/* ======================================================== */}
      {activeTab === 'COLLEAGUES' && (
        <div className="space-y-4" id="teacher-colleagues-analyzer-view">
          <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs text-indigo-950 flex items-start gap-2.5">
            <UserCheck className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Other Teacher Timings & Blank Gap Coordination:</strong>
              <span>
                Inspect other faculty members' schedules with automatic calculation of <strong>blank lecture gaps</strong> (idle periods between classes on campus) and <strong>mutual free windows</strong> to efficiently plan proxy substitution, joint labs, and departmental syncs.
              </span>
            </div>
          </div>

          <TeacherScheduleAnalyzer
            teachers={allTeachers}
            entries={entries}
            timeSlots={timeSlots}
            sections={sections}
            currentTeacher={teacher}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: RECENT SCHEDULE MODIFICATIONS */}
      {/* ======================================================== */}
      {activeTab === 'CHANGES' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Schedule Adjustments</h3>
            <span className="text-xs text-slate-500">Official timetable administrative modifications</span>
          </div>

          {teacherChangeLogs.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
              No modifications recorded for your assigned teaching schedule.
            </div>
          ) : (
            teacherChangeLogs.map(log => (
              <div key={log.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{log.subjectName} ({log.sectionName})</span>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-slate-400 block uppercase font-bold text-[9px]">Was</span>
                    <span>{log.oldValue.roomNumber} • {log.oldValue.timeSlotText}</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-emerald-700 block uppercase font-bold text-[9px]">Now</span>
                    <span className="font-semibold text-slate-900">{log.newValue.roomNumber} • {log.newValue.timeSlotText}</span>
                  </div>
                </div>
                {log.reason && (
                  <p className="text-slate-600 text-[11px] italic">Reason: "{log.reason}"</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Class Cancellation Modal */}
      {isCancelModalOpen && (
        <ClassCancellationModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          teacher={teacher}
          teacherEntries={teacherEntries}
          preselectedEntryId={cancellationTargetEntryId}
          onConfirmCancellation={onCancelClass}
        />
      )}

      {/* Faculty Workload Export / Print Modal */}
      <TimetableExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        entries={entries}
        sections={sections}
        teachers={allTeachers}
        timeSlots={timeSlots}
        academicYear="2026-2027"
        versionNumber={1}
      />
    </div>
  );
};
