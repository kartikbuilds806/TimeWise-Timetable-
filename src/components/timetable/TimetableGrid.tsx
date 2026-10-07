import React, { useState, useMemo } from 'react';
import { 
  TimetableEntry, 
  TimeSlot, 
  DayOfWeek, 
  Section, 
  Teacher, 
  Room, 
  UserRole,
  TimetableConflict
} from '../../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Layers, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  Edit3, 
  Filter, 
  FlaskConical,
  GraduationCap,
  XCircle,
  UserCheck,
  Bus,
  Sparkles
} from 'lucide-react';

export type ViewScope = 'SECTION' | 'TEACHER' | 'ROOM';
export type ViewCalendar = 'WEEKLY' | 'DAILY';

interface TimetableGridProps {
  entries: TimetableEntry[];
  timeSlots: TimeSlot[];
  sections: Section[];
  teachers: Teacher[];
  rooms: Room[];
  conflicts: TimetableConflict[];
  userRole: UserRole;
  currentUserId?: string;
  onEditEntry?: (entry: TimetableEntry) => void;
  onPublishTimetable?: () => void;
  onOpenGeneratorForSection?: (sectionId: string) => void;
  timetableStatus?: string;
}

const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  entries,
  timeSlots,
  sections,
  teachers,
  rooms,
  conflicts,
  userRole,
  onEditEntry,
  onOpenGeneratorForSection,
  timetableStatus = 'PUBLISHED'
}) => {
  const [viewCalendar, setViewCalendar] = useState<ViewCalendar>('WEEKLY');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('MONDAY');
  const [viewScope, setViewScope] = useState<ViewScope>('SECTION');

  // Filter criteria
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sections.length > 0 ? sections[0].id : ''
  );
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    teachers.length > 0 ? teachers[0].id : ''
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    rooms.length > 0 ? rooms[0].id : ''
  );

  // Section Filter Controls
  const [sectionCourseFilter, setSectionCourseFilter] = useState<string>('ALL');
  const [sectionSemesterFilter, setSectionSemesterFilter] = useState<number | 'ALL'>('ALL');

  const filteredSectionsForScope = useMemo(() => {
    return sections.filter(sec => {
      const matchCourse = sectionCourseFilter === 'ALL' || sec.courseCode === sectionCourseFilter;
      const matchSem = sectionSemesterFilter === 'ALL' || sec.semester === sectionSemesterFilter;
      return matchCourse && matchSem;
    });
  }, [sections, sectionCourseFilter, sectionSemesterFilter]);

  const distinctCourses = useMemo(() => {
    return Array.from(new Set(sections.map(s => s.courseCode)));
  }, [sections]);

  const activeSection = useMemo(() => {
    return sections.find(s => s.id === selectedSectionId);
  }, [sections, selectedSectionId]);

  // Group slots by slot order
  const distinctOrders = Array.from(new Set(timeSlots.map(s => s.slotOrder))).sort((a, b) => a - b);

  // Filter entries based on the chosen Scope
  const filteredEntries = entries.filter(entry => {
    if (viewScope === 'SECTION') {
      return !selectedSectionId || entry.sectionId === selectedSectionId;
    }
    if (viewScope === 'TEACHER') {
      return !selectedTeacherId || entry.teacherId === selectedTeacherId;
    }
    if (viewScope === 'ROOM') {
      return !selectedRoomId || entry.roomId === selectedRoomId;
    }
    return true;
  });

  const getEntryAt = (day: DayOfWeek, slotOrder: number): TimetableEntry | undefined => {
    return filteredEntries.find(e => e.dayOfWeek === day && e.slotOrder === slotOrder);
  };

  const getSlotReference = (day: DayOfWeek, slotOrder: number): TimeSlot | undefined => {
    return timeSlots.find(s => s.dayOfWeek === day && s.slotOrder === slotOrder);
  };

  const getConflictForEntry = (entryId: string): TimetableConflict | undefined => {
    return conflicts.find(c => c.affectedEntryIds.includes(entryId));
  };

  const daysToDisplay = viewCalendar === 'WEEKLY' ? DAYS : [selectedDay];

  return (
    <div className="space-y-4">
      {/* Top Filter & View Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Scope selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Perspective:
          </span>

          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              id="scope-btn-section"
              type="button"
              onClick={() => setViewScope('SECTION')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewScope === 'SECTION'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Section
            </button>
            <button
              id="scope-btn-teacher"
              type="button"
              onClick={() => setViewScope('TEACHER')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewScope === 'TEACHER'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Teacher
            </button>
            <button
              id="scope-btn-room"
              type="button"
              onClick={() => setViewScope('ROOM')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewScope === 'ROOM'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Classroom/Lab
            </button>
          </div>

          {/* Context Controls when viewScope === SECTION */}
          {viewScope === 'SECTION' && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Course filter */}
              <select
                value={sectionCourseFilter}
                onChange={e => {
                  setSectionCourseFilter(e.target.value);
                  const matching = sections.filter(s => 
                    (e.target.value === 'ALL' || s.courseCode === e.target.value) &&
                    (sectionSemesterFilter === 'ALL' || s.semester === sectionSemesterFilter)
                  );
                  if (matching.length > 0) setSelectedSectionId(matching[0].id);
                }}
                className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-slate-50 font-medium text-slate-800"
              >
                <option value="ALL">All Courses</option>
                {distinctCourses.map((code: string) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>

              {/* Semester filter */}
              <select
                value={sectionSemesterFilter === 'ALL' ? 'ALL' : String(sectionSemesterFilter)}
                onChange={e => {
                  const sem = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
                  setSectionSemesterFilter(sem);
                  const matching = sections.filter(s => 
                    (sectionCourseFilter === 'ALL' || s.courseCode === sectionCourseFilter) &&
                    (sem === 'ALL' || s.semester === sem)
                  );
                  if (matching.length > 0) setSelectedSectionId(matching[0].id);
                }}
                className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-slate-50 font-medium text-slate-800"
              >
                <option value="ALL">All Semesters</option>
                <option value="1">Sem 1 (Morning)</option>
                <option value="3">Sem 3 (Afternoon)</option>
                <option value="5">Sem 5 (Afternoon)</option>
              </select>

              {/* Section dropdown */}
              <select
                id="select-section"
                value={selectedSectionId}
                onChange={e => setSelectedSectionId(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 font-semibold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              >
                {filteredSectionsForScope.map((sec: Section) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} ({sec.courseCode} Sem {sec.semester})
                  </option>
                ))}
              </select>
            </div>
          )}

          {viewScope === 'TEACHER' && (
            <select
              id="select-teacher"
              value={selectedTeacherId}
              onChange={e => setSelectedTeacherId(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            >
              {teachers.map(tch => (
                <option key={tch.id} value={tch.id}>
                  {tch.fullName} ({tch.department})
                </option>
              ))}
            </select>
          )}

          {viewScope === 'ROOM' && (
            <select
              id="select-room"
              value={selectedRoomId}
              onChange={e => setSelectedRoomId(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            >
              {rooms.map(rm => (
                <option key={rm.id} value={rm.id}>
                  {rm.roomNumber} ({rm.roomType === 'COMPUTER_LAB' ? 'Lab' : 'Hall'} - Cap: {rm.capacity})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* View Calendar mode (Weekly vs Daily) */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              id="view-weekly-btn"
              type="button"
              onClick={() => setViewCalendar('WEEKLY')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewCalendar === 'WEEKLY'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly Grid
            </button>
            <button
              id="view-daily-btn"
              type="button"
              onClick={() => setViewCalendar('DAILY')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewCalendar === 'DAILY'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Schedule
            </button>
          </div>

          {viewCalendar === 'DAILY' && (
            <select
              id="select-day"
              value={selectedDay}
              onChange={e => setSelectedDay(e.target.value as DayOfWeek)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            >
              {DAYS.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Cohort Shift & College Bus Status Banner (When viewing by Section) */}
      {viewScope === 'SECTION' && activeSection && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50/60 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              activeSection.shift === 'AFTERNOON' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
            }`}>
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{activeSection.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  activeSection.shift === 'AFTERNOON' 
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {activeSection.shift === 'AFTERNOON' ? 'Afternoon Shift (12:00 PM – 04:00 PM / 06:00 PM)' : 'Morning Shift (08:00 AM – 12:55 PM)'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {activeSection.courseCode} Semester {activeSection.semester} • {activeSection.studentCount} Students
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                <span>🚌 <strong>Bus Arrival:</strong> {activeSection.busArrival || (activeSection.semester >= 3 ? '11:00 AM' : '08:00 AM')}</span>
                <span>🚌 <strong>Bus Departure:</strong> {activeSection.busDeparture || (activeSection.semester >= 3 ? '04:00 PM & 06:00 PM' : '12:55 PM / 04:00 PM')}</span>
                <span>⏱️ <strong>Student Idle Gaps:</strong> Zero &ge; 2h gaps</span>
              </p>
            </div>
          </div>

          {userRole === 'ROLE_ADMIN' && onOpenGeneratorForSection && (
            <button
              type="button"
              onClick={() => onOpenGeneratorForSection(activeSection.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>Re-optimize / Generate Schedule</span>
            </button>
          )}
        </div>
      )}

      {/* Visual Status Legend */}
      <div className="flex flex-wrap items-center gap-3 px-1 text-xs text-slate-600">
        <span className="font-semibold text-slate-700">Status Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span>
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span>
          <span>Published</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
          <span>Changed / Rescheduled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-600"></span>
          <span>Conflict / Violation</span>
        </div>
      </div>

      {/* The Timetable Grid Table */}
      <div className="academic-subtle-card overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wider w-36 border-r border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Time Slot
                  </div>
                </th>
                {daysToDisplay.map(day => (
                  <th 
                    key={day} 
                    className="py-3 px-4 text-xs font-semibold text-slate-800 uppercase tracking-wider border-r border-slate-200 last:border-r-0 text-center min-w-[200px]"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-700" />
                      {day}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {distinctOrders.map(slotOrder => {
                // Check if this slot order is a break (e.g. Lunch Recess)
                const sampleSlot = timeSlots.find(s => s.slotOrder === slotOrder);
                const isBreak = sampleSlot?.isBreak || false;
                const timeLabel = sampleSlot ? `${sampleSlot.startTime} - ${sampleSlot.endTime}` : `Slot ${slotOrder}`;

                if (isBreak) {
                  return (
                    <tr key={`break-${slotOrder}`} className="bg-slate-100/70">
                      <td className="py-2.5 px-4 text-xs font-medium text-slate-500 border-r border-slate-200 whitespace-nowrap">
                        <div className="font-semibold text-slate-700">{sampleSlot?.breakLabel || 'Recess'}</div>
                        <div className="text-[11px] text-slate-500">{timeLabel}</div>
                      </td>
                      <td 
                        colSpan={daysToDisplay.length} 
                        className="py-2 px-4 text-center text-xs font-medium text-slate-500 tracking-wider uppercase bg-amber-50/50 border-y border-amber-100"
                      >
                        ☕ {sampleSlot?.breakLabel || 'Recess / Lunch Interval'} ({timeLabel})
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={`slot-${slotOrder}`} className="hover:bg-slate-50/50 transition-colors">
                    {/* Time Column */}
                    <td className="py-3 px-4 text-xs font-medium text-slate-700 border-r border-slate-200 align-top bg-slate-50/30 whitespace-nowrap">
                      <span className="font-semibold text-slate-900 block">Period {slotOrder}</span>
                      <span className="text-[11px] text-slate-500 block">{timeLabel}</span>
                    </td>

                    {/* Day Columns */}
                    {daysToDisplay.map(day => {
                      const entry = getEntryAt(day, slotOrder);
                      const conflict = entry ? getConflictForEntry(entry.id) : undefined;
                      const hasConflict = !!conflict;
                      const isChanged = entry?.status === 'CHANGED';
                      const isCancelled = entry?.status === 'CANCELLED';
                      const isSubstituted = entry?.status === 'SUBSTITUTED';

                      return (
                        <td 
                          key={`${day}-${slotOrder}`} 
                          className="p-2 border-r border-slate-200 last:border-r-0 align-top min-w-[200px]"
                        >
                          {entry ? (
                            <div
                              className={`p-3 rounded-xl border text-xs relative group transition-all duration-150 ${
                                isCancelled
                                  ? 'bg-rose-50/90 border-rose-300 text-rose-950 shadow-xs'
                                  : isSubstituted
                                  ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 shadow-xs'
                                  : hasConflict
                                  ? 'bg-red-50/90 border-red-300 text-red-950 shadow-xs'
                                  : isChanged
                                  ? 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-xs'
                                  : timetableStatus === 'PUBLISHED'
                                  ? 'bg-emerald-50/60 border-emerald-200/90 text-slate-900 hover:border-emerald-400'
                                  : 'bg-white border-slate-200 text-slate-900 hover:border-blue-400 shadow-xs'
                              }`}
                            >
                              {/* Top Bar with Subject & Status Badge */}
                              <div className="flex items-start justify-between gap-1 mb-1.5">
                                <div className={`font-bold text-xs tracking-tight flex items-center gap-1 ${
                                  isCancelled ? 'line-through text-rose-800' : 'text-slate-900'
                                }`}>
                                  {entry.isLab ? (
                                    <FlaskConical className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  ) : (
                                    <GraduationCap className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                                  )}
                                  <span>{entry.subjectCode}</span>
                                </div>

                                {/* Status Badge */}
                                <div className="flex items-center gap-1">
                                  {isCancelled && (
                                    <span 
                                      title={entry.cancellationNotice ? `Cancelled by ${entry.cancellationNotice.cancelledByTeacherName || entry.cancellationNotice.teacherName}: ${entry.cancellationNotice.reason}` : 'Class Cancelled'}
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white shadow-xs"
                                    >
                                      <XCircle className="w-2.5 h-2.5" />
                                      CANCELLED
                                    </span>
                                  )}
                                  {isSubstituted && (
                                    <span 
                                      title={entry.proxySubstitution ? `Proxy Faculty: ${entry.proxySubstitution.proxyTeacherName}` : 'Proxy Assigned'}
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-700 text-white shadow-xs"
                                    >
                                      <UserCheck className="w-2.5 h-2.5" />
                                      PROXY
                                    </span>
                                  )}
                                  {!isCancelled && !isSubstituted && hasConflict && (
                                    <span 
                                      title={conflict?.description}
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white shadow-xs"
                                    >
                                      <AlertTriangle className="w-2.5 h-2.5" />
                                      CONFLICT
                                    </span>
                                  )}
                                  {!isCancelled && !isSubstituted && !hasConflict && isChanged && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white shadow-xs">
                                      <RefreshCw className="w-2.5 h-2.5" />
                                      CHANGED
                                    </span>
                                  )}
                                  {!isCancelled && !isSubstituted && !hasConflict && !isChanged && (
                                    <span className="text-[10px] font-medium text-slate-500 uppercase">
                                      {entry.isLab ? 'Lab' : 'Lecture'}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Subject Full Name */}
                              <div className={`font-medium text-[11px] leading-tight mb-2 line-clamp-2 ${
                                isCancelled ? 'line-through text-rose-700' : 'text-slate-800'
                              }`}>
                                {entry.subjectName}
                              </div>

                              {/* Prominent Real Conflict Banner */}
                              {hasConflict && conflict && (
                                <div className="mb-2 p-2 rounded-lg bg-red-100/95 border border-red-300 text-[10px] text-red-950 leading-tight space-y-0.5 shadow-2xs">
                                  <div className="font-bold flex items-center gap-1 text-red-900">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                    <span>
                                      {conflict.type === 'SHIFT_TIMING_VIOLATION' 
                                        ? 'Bus & Shift Violation' 
                                        : conflict.type === 'BUS_TRANSIT_MISMATCH'
                                        ? 'Bus Timing Mismatch'
                                        : conflict.type === 'TEACHER_DOUBLE_BOOKING'
                                        ? 'Faculty Double-Booked'
                                        : conflict.type === 'ROOM_DOUBLE_BOOKING'
                                        ? 'Room Double-Booked'
                                        : conflict.type.replace(/_/g, ' ')}
                                    </span>
                                  </div>
                                  <p className="text-red-900 font-medium text-[10px] leading-tight">
                                    {conflict.description}
                                  </p>
                                  {conflict.recommendedAction && (
                                    <p className="text-red-800 italic text-[9px] pt-1 border-t border-red-200">
                                      Fix: {conflict.recommendedAction}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Cancellation Notice Banner */}
                              {isCancelled && entry.cancellationNotice && (
                                <div className="mb-2 p-1.5 rounded-lg bg-rose-100/90 border border-rose-200 text-[10px] text-rose-900 leading-tight">
                                  <div className="font-bold flex items-center justify-between">
                                    <span>Cancelled ({entry.cancellationNotice.cancellationTime || entry.cancellationNotice.cancellationNoticeTime})</span>
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-rose-200 text-rose-800 font-semibold">Before 4 PM</span>
                                  </div>
                                  <div className="italic text-rose-800 mt-0.5 line-clamp-2">"{entry.cancellationNotice.reason}"</div>
                                </div>
                              )}

                              {/* Proxy Substitution Notice Banner */}
                              {isSubstituted && entry.proxySubstitution && (
                                <div className="mb-2 p-1.5 rounded-lg bg-emerald-100/90 border border-emerald-300 text-[10px] text-emerald-950 leading-tight">
                                  <div className="font-bold flex items-center justify-between">
                                    <span className="truncate">Proxy: {entry.proxySubstitution.proxyTeacherName}</span>
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-200 text-emerald-900 font-semibold shrink-0">Assigned</span>
                                  </div>
                                  <div className="text-emerald-800 text-[9px] mt-0.5 truncate">Orig: {entry.teacherName}</div>
                                </div>
                              )}

                              {/* Details: Teacher, Room, Section */}
                              <div className="space-y-1 text-[11px] text-slate-600 border-t border-slate-200/70 pt-1.5">
                                <div className="flex items-center gap-1 text-slate-700">
                                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{entry.teacherName}</span>
                                </div>
                                
                                <div className="flex items-center justify-between text-slate-600">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="font-medium">{entry.roomNumber}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-medium px-1 rounded bg-slate-100">
                                    {entry.sectionName}
                                  </span>
                                </div>
                              </div>

                              {/* Admin Action Button for Re-scheduling / Editing */}
                              {userRole === 'ROLE_ADMIN' && onEditEntry && (
                                <button
                                  type="button"
                                  onClick={() => onEditEntry(entry)}
                                  className="mt-2 w-full flex items-center justify-center gap-1 py-1 px-2 rounded-md bg-white border border-slate-300 text-[11px] font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-xs"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Adjust Slot</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            (() => {
                              const sectionDayEntries = viewScope === 'SECTION'
                                ? entries.filter(e => e.sectionId === selectedSectionId && e.dayOfWeek === day && e.status !== 'CANCELLED')
                                : [];
                              const minSlot = sectionDayEntries.length > 0 ? Math.min(...sectionDayEntries.map(e => e.slotOrder)) : null;
                              const maxSlot = sectionDayEntries.length > 0 ? Math.max(...sectionDayEntries.map(e => e.slotOrder)) : null;
                              const isBlankGap = minSlot !== null && maxSlot !== null && slotOrder > minSlot && slotOrder < maxSlot;
                              const isMorningCohort = activeSection ? (activeSection.shift === 'MORNING' || activeSection.semester <= 2) : false;
                              const isAfternoonCohort = activeSection ? (activeSection.shift === 'AFTERNOON' || activeSection.semester >= 3) : true;

                              if (isBlankGap) {
                                return (
                                  <div className="h-24 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/70 p-2 flex flex-col items-center justify-center text-center text-xs shadow-2xs">
                                    <div className="flex items-center gap-1 text-amber-900 font-bold text-[11px]">
                                      <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                      <span>Blank Lecture Gap</span>
                                    </div>
                                    <span className="text-[10px] text-amber-800 font-semibold mt-0.5 leading-tight">
                                      Idle Campus Wait
                                    </span>
                                    <span className="text-[9px] text-amber-600 mt-0.5">
                                      Wasted student hours
                                    </span>
                                  </div>
                                );
                              }

                              if (viewScope === 'SECTION') {
                                if (isAfternoonCohort && slotOrder <= 4) {
                                  return (
                                    <div className="h-24 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-2 flex flex-col items-center justify-center text-center text-xs">
                                      <span className="text-[10px] text-slate-500 font-semibold">Pre-Shift</span>
                                      <span className="text-[9px] text-slate-400">Bus arrives 11:00 AM</span>
                                    </div>
                                  );
                                }
                                if (isMorningCohort && slotOrder >= 6) {
                                  return (
                                    <div className="h-24 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-2 flex flex-col items-center justify-center text-center text-xs">
                                      <span className="text-[10px] text-slate-500 font-semibold">Post-Shift</span>
                                      <span className="text-[9px] text-slate-400">Bus departs 12:55 PM</span>
                                    </div>
                                  );
                                }
                              }

                              return (
                                <div className="h-24 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-xs">
                                  <span className="text-[11px] font-normal">Available</span>
                                </div>
                              );
                            })()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
