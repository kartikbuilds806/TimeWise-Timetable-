import React, { useState } from 'react';
import { 
  Section, 
  TimetableEntry, 
  TimeSlot, 
  TimetableChangeLog,
  DayOfWeek,
  Student,
  ClassCancellationNotice
} from '../../types';
import { TimetableGrid } from '../timetable/TimetableGrid';
import { 
  Calendar, 
  Clock, 
  GraduationCap, 
  MapPin, 
  User, 
  BellRing, 
  Sparkles,
  FlaskConical,
  MessageSquare,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  ShieldAlert,
  Info,
  BadgeCheck,
  Bus
} from 'lucide-react';

interface StudentDashboardProps {
  student: Student;
  section: Section;
  entries: TimetableEntry[];
  timeSlots: TimeSlot[];
  changeLogs: TimetableChangeLog[];
  cancellationNotices?: ClassCancellationNotice[];
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  section,
  entries,
  timeSlots,
  changeLogs,
  cancellationNotices = []
}) => {
  const [activeTab, setActiveTab] = useState<'WEEKLY' | 'TODAY' | 'MESSAGES' | 'PROFILE'>('WEEKLY');

  // Filter entries strictly for this student's section only
  const sectionEntries = entries.filter(e => e.sectionId === student.sectionId);

  // Today's classes (defaulting to MONDAY for college academic review)
  const currentDay: DayOfWeek = 'MONDAY';
  const todayEntries = sectionEntries
    .filter(e => e.dayOfWeek === currentDay)
    .sort((a, b) => a.slotOrder - b.slotOrder);

  // Notices for this student's section
  // Either passed from root or embedded in cancelled timetable entries
  const directCancelledEntries = sectionEntries.filter(
    e => e.status === 'CANCELLED' && e.cancellationNotice
  );

  const allSectionNotices: ClassCancellationNotice[] = [
    ...cancellationNotices.filter(n => n.sectionId === student.sectionId),
    ...directCancelledEntries.map(e => e.cancellationNotice!)
  ].filter((notice, idx, arr) => arr.findIndex(n => n.id === notice.id) === idx);

  const sectionChanges = changeLogs.filter(log => log.sectionName === section.name);

  // Urgent active notice for today
  const urgentTodayNotice = allSectionNotices.find(n => n.dayOfWeek === currentDay);

  return (
    <div className="space-y-6">
      {/* Student Personal Profile Card (Strictly Isolated - No access to other students or faculty) */}
      <div 
        id="student-personal-profile-card"
        className="academic-glass-card p-5 border-l-4 border-l-blue-900"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-blue-950 text-white flex items-center justify-center font-bold text-xl shadow-md border border-blue-800 shrink-0">
              {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{student.fullName}</h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <BadgeCheck className="w-3 h-3 text-emerald-600" />
                  Moodle Verified
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                  ID: {student.studentId}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Roll No: <span className="font-mono text-slate-900 font-semibold">{student.rollNumber}</span> • {student.courseCode} Semester {student.semester} ({student.sectionName})
              </p>
              <p className="text-[11px] text-slate-400">
                {student.email} • Student Academic Access Only
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[85px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Classes</span>
              <span className="text-lg font-bold text-slate-900">{todayEntries.length}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[85px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Weekly Periods</span>
              <span className="text-lg font-bold text-blue-900">{sectionEntries.length}</span>
            </div>
            <button
              id="btn-open-messages-tab"
              type="button"
              onClick={() => setActiveTab('MESSAGES')}
              className={`p-2.5 rounded-xl border text-center min-w-[95px] transition-all cursor-pointer ${
                allSectionNotices.length > 0
                  ? 'bg-rose-50 border-rose-300 text-rose-900 hover:bg-rose-100'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span className="text-[10px] uppercase font-bold block text-slate-500">Notices</span>
              <span className="text-lg font-bold flex items-center justify-center gap-1 text-rose-700">
                <BellRing className="w-4 h-4" />
                {allSectionNotices.length}
              </span>
            </button>
          </div>
        </div>

        {/* Student Cohort Shift & College Bus Status */}
        <div className="mt-3.5 p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${student.semester >= 3 ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'bg-amber-100 text-amber-900 border border-amber-200'}`}>
              <Bus className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">
                  {student.semester >= 3 ? 'Afternoon Shift: 12:00 PM – 04:00 PM / 06:00 PM' : 'Morning Shift: 08:00 AM – 12:55 PM'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${student.semester >= 3 ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'}`}>
                  {student.semester >= 3 ? 'Bus-Synchronized (11 AM - 4 PM / 6 PM)' : 'Morning Bus Sync'}
                </span>
              </div>
              <span className="text-[11px] text-slate-600 block mt-0.5">
                🚌 <strong>Bus Arrival:</strong> {student.semester >= 3 ? '11:00 AM (Classes start at 12:00 PM)' : '08:00 AM'} • 🚌 <strong>Departure Bus:</strong> {student.semester >= 3 ? '04:00 PM (16:05) & 06:00 PM (18:00)' : '12:55 PM / 04:00 PM'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
              Zero &ge; 2h Idle Gaps
            </span>
          </div>
        </div>

        {/* URGENT CLASS CANCELLATION BANNER (Immediately alerts student if class is cancelled) */}
        {urgentTodayNotice && (
          <div 
            id="urgent-cancellation-alert-banner"
            className="mt-4 p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-600 text-white">
                    Class Cancelled Notice
                  </span>
                  <span className="text-xs font-mono font-semibold text-rose-800">
                    Notice Sent: {urgentTodayNotice.cancellationTime} (Before 4:00 PM Policy)
                  </span>
                </div>
                <h4 className="text-sm font-bold text-rose-950 mt-1">
                  {urgentTodayNotice.subjectCode} — {urgentTodayNotice.subjectName} has been CANCELLED by {urgentTodayNotice.cancelledByTeacherName}
                </h4>
                <p className="text-xs text-rose-800 mt-0.5">
                  <strong>Scheduled Timing:</strong> {urgentTodayNotice.scheduledClassTime} ({urgentTodayNotice.dayOfWeek}) • <strong>Reason:</strong> "{urgentTodayNotice.reason}"
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('MESSAGES')}
              className="px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-xs transition-colors shrink-0 self-start sm:self-center cursor-pointer"
            >
              View Full Notice
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs">
        <button
          id="student-tab-weekly"
          type="button"
          onClick={() => setActiveTab('WEEKLY')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'WEEKLY'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          My Section Timetable
        </button>

        <button
          id="student-tab-today"
          type="button"
          onClick={() => setActiveTab('TODAY')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'TODAY'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          Today's Classes ({currentDay})
        </button>

        <button
          id="student-tab-messages"
          type="button"
          onClick={() => setActiveTab('MESSAGES')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'MESSAGES'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Messages & Cancellation Notices
          {allSectionNotices.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white">
              {allSectionNotices.length}
            </span>
          )}
        </button>

        <button
          id="student-tab-profile"
          type="button"
          onClick={() => setActiveTab('PROFILE')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'PROFILE'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          My Personal Profile
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: WEEKLY CLASS SCHEDULE */}
      {/* ======================================================== */}
      {activeTab === 'WEEKLY' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Displaying official weekly schedule for <strong>{student.sectionName}</strong> ({student.courseCode} Sem {student.semester})
            </span>
            <span className="text-slate-400 italic text-[11px]">
              * Cancelled classes are marked in red with notice details
            </span>
          </div>

          <TimetableGrid
            entries={sectionEntries}
            timeSlots={timeSlots}
            sections={[section]}
            teachers={[]} // Students cannot view teacher directories
            rooms={[]}
            conflicts={[]}
            userRole="ROLE_STUDENT"
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: TODAY'S CLASSES */}
      {/* ======================================================== */}
      {activeTab === 'TODAY' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Today's Class Schedule ({currentDay})</h3>
            <span className="text-xs text-slate-500">Chronological academic sequence</span>
          </div>

          <div className="space-y-2.5">
            {todayEntries.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                No classes scheduled for {currentDay}.
              </div>
            ) : (
              todayEntries.map(entry => {
                const slot = timeSlots.find(s => s.id === entry.timeSlotId);
                const isCancelled = entry.status === 'CANCELLED';

                return (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isCancelled
                        ? 'bg-rose-50/90 border-rose-300 text-rose-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-900 shadow-xs hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 border ${
                        isCancelled
                          ? 'bg-rose-100 text-rose-900 border-rose-200'
                          : 'bg-blue-50 text-blue-900 border-blue-100'
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
                          <span className={`font-medium ${isCancelled ? 'line-through text-rose-800' : 'text-slate-800'}`}>
                            {entry.subjectName}
                          </span>
                          {entry.isLab && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-semibold flex items-center gap-1">
                              <FlaskConical className="w-3 h-3" /> Lab
                            </span>
                          )}
                          {isCancelled && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> CANCELLED
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-slate-500 mt-1 text-[11px]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {slot ? `${slot.startTime} - ${slot.endTime}` : (entry.slotOrder === 10 ? '17:00 - 17:55 (5:00 PM)' : `Slot ${entry.slotOrder}`)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {entry.teacherName}
                          </span>
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <MapPin className="w-3 h-3 text-blue-600" />
                            Room {entry.roomNumber}
                          </span>
                        </div>

                        {/* Cancellation note if cancelled */}
                        {isCancelled && entry.cancellationNotice && (
                          <div className="mt-2 p-2 rounded-lg bg-rose-100 border border-rose-200 text-rose-900 text-[11px]">
                            <strong>Notice from {entry.teacherName}:</strong> "{entry.cancellationNotice.reason}"
                            <span className="block text-[10px] text-rose-700 mt-0.5">
                              Dispatched at {entry.cancellationNotice.cancellationTime} (Before 4:00 PM deadline)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-xs border ${
                        isCancelled
                          ? 'bg-rose-200/70 text-rose-900 border-rose-300'
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        <MapPin className="w-3.5 h-3.5 text-blue-700" />
                        {entry.roomNumber}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MESSAGES & NOTICES SECTION */}
      {/* ======================================================== */}
      {activeTab === 'MESSAGES' && (
        <div className="space-y-4" id="student-messages-section">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-900" />
                <span>Class Cancellation & Academic Messages</span>
              </h3>
              <p className="text-xs text-slate-500">
                Official notices dispatched by faculty members before the 4:00 PM deadline.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-900">
              {allSectionNotices.length} Notice(s)
            </span>
          </div>

          {allSectionNotices.length === 0 ? (
            <div className="p-10 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">All Scheduled Classes are Active</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No class cancellations have been registered by faculty for {student.sectionName}. All lectures and practicals will proceed as timetabled.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {allSectionNotices.map(notice => (
                <div 
                  key={notice.id}
                  className="p-5 rounded-2xl bg-white border-2 border-rose-300 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white font-bold text-xs flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        CLASS CANCELLED
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        {notice.subjectCode} — {notice.subjectName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified: Sent at {notice.cancellationTime} (Before 4 PM)
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {notice.dayOfWeek}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Faculty</span>
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-700" />
                        {notice.cancelledByTeacherName}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Scheduled Timing</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        {notice.scheduledClassTime} ({notice.dayOfWeek})
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Section Cohort</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                        {notice.sectionName}
                      </span>
                    </div>
                  </div>

                  {/* Teacher's Reason */}
                  <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-950">
                    <span className="font-bold block text-rose-900 mb-0.5">Faculty Reason for Cancellation:</span>
                    <p className="italic">"{notice.reason}"</p>
                  </div>

                  {(() => {
                    const linkedEntry = sectionEntries.find(e => e.id === notice.entryId);
                    if (linkedEntry?.status === 'SUBSTITUTED' && linkedEntry.proxySubstitution) {
                      return (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            <span>Proxy Faculty Confirmed: {linkedEntry.proxySubstitution.proxyTeacherName}</span>
                          </div>
                          <p className="text-[11px] text-emerald-800 mt-1">
                            Class will proceed under proxy instruction in Room {linkedEntry.roomNumber}. "{linkedEntry.proxySubstitution.reason}"
                          </p>
                        </div>
                      );
                    }
                    return (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-slate-400" />
                        <span>Students of {notice.sectionName} are not required to report to the lecture room for this slot unless a proxy is assigned.</span>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}

          {/* Schedule Change Notices from Admin */}
          {sectionChanges.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Room / Time Re-scheduling Notices ({sectionChanges.length})
              </h4>
              <div className="space-y-2">
                {sectionChanges.map(log => (
                  <div key={log.id} className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{log.subjectName}</span>
                      <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-[11px] text-slate-700">
                      Room moved from <strong>{log.oldValue.roomNumber}</strong> to <strong>{log.newValue.roomNumber}</strong>.
                    </div>
                    {log.reason && (
                      <div className="text-[10px] text-slate-500 italic">"{log.reason}"</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: MY PERSONAL PROFILE */}
      {/* ======================================================== */}
      {activeTab === 'PROFILE' && (
        <div className="academic-glass-card p-6 space-y-5" id="student-profile-view">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold text-2xl shadow-md">
              {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{student.fullName}</h3>
              <p className="text-xs text-slate-500">
                Official Enrolled Student • {student.sectionName}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">8-Digit Student ID</span>
              <span className="font-mono text-sm font-bold text-blue-900 tracking-wider">{student.studentId}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">College Roll Number</span>
              <span className="font-mono text-sm font-bold text-slate-900">{student.rollNumber}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Enrolled Degree Program</span>
              <span className="text-sm font-bold text-slate-900">{student.courseCode} (Bachelor of Computer Applications)</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Semester & Cohort Section</span>
              <span className="text-sm font-bold text-blue-900">Semester {student.semester} — {student.sectionName}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Official Student Email</span>
              <span className="text-sm font-medium text-slate-800">{student.email}</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Default Portal Password</span>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-950 inline-block">
                Moodle@123
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Student Privacy & Data Boundary Policy:</strong>
              <span>
                As an enrolled student, your academic portal provides exclusive access to your own personal profile, 
                course timetable, and official faculty cancellation notices. You cannot view other students' records,
                faculty private directories, or academic administrative tools.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
