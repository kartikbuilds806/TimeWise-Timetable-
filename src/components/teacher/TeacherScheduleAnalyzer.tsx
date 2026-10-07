import React, { useState, useMemo } from 'react';
import { Teacher, TimetableEntry, TimeSlot, DayOfWeek, Section } from '../../types';
import { 
  UserCheck, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Coffee, 
  Sparkles,
  Search,
  Users,
  Zap,
  Copy,
  Check,
  Send,
  ArrowRight,
  Info,
  CalendarCheck,
  Flame,
  BadgeCheck,
  Filter
} from 'lucide-react';

interface TeacherScheduleAnalyzerProps {
  teachers: Teacher[];
  entries: TimetableEntry[];
  timeSlots: TimeSlot[];
  sections: Section[];
  currentTeacher?: Teacher;
}

interface GapDetail {
  dayOfWeek: DayOfWeek;
  slotOrder: number;
  timeSlot?: TimeSlot;
  durationMinutes: number;
  prevSubjectCode?: string;
  prevSectionName?: string;
  prevRoom?: string;
  nextSubjectCode?: string;
  nextSectionName?: string;
  nextRoom?: string;
  isMutualWithCurrentTeacher: boolean;
  isCurrentTeacherAlsoInGap: boolean;
}

export const TeacherScheduleAnalyzer: React.FC<TeacherScheduleAnalyzerProps> = ({
  teachers,
  entries,
  timeSlots,
  sections,
  currentTeacher
}) => {
  // Default to another teacher if currentTeacher is provided
  const initialTeacherId = useMemo(() => {
    if (currentTeacher && teachers.length > 1) {
      const colleague = teachers.find(t => t.id !== currentTeacher.id);
      if (colleague) return colleague.id;
    }
    return teachers[0]?.id || '';
  }, [teachers, currentTeacher]);

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(initialTeacherId);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [highlightGaps, setHighlightGaps] = useState(true);
  const [showMutualOnly, setShowMutualOnly] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [proposedSlotNotice, setProposedSlotNotice] = useState<string | null>(null);

  const teacher = teachers.find(t => t.id === selectedTeacherId) || teachers[0];

  // Distinct departments
  const departments = useMemo(() => {
    return Array.from(new Set(teachers.map(t => t.department))).filter(Boolean);
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const matchesSearch = 
        t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = departmentFilter === 'ALL' || t.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [teachers, searchQuery, departmentFilter]);

  // Entries for selected teacher
  const teacherEntries = useMemo(() => {
    return entries.filter(e => e.teacherId === teacher.id && e.status !== 'CANCELLED');
  }, [entries, teacher.id]);

  // Entries for current viewing teacher (if any)
  const currentTeacherEntries = useMemo(() => {
    if (!currentTeacher) return [];
    return entries.filter(e => e.teacherId === currentTeacher.id && e.status !== 'CANCELLED');
  }, [entries, currentTeacher]);

  const days: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const maxSlotOrder = Math.max(...timeSlots.map(s => s.slotOrder), 10);
  const slotOrders = Array.from({ length: maxSlotOrder }, (_, i) => i + 1);

  // =========================================================================
  // BLANK LECTURE GAP CALCULATION ENGINE
  // =========================================================================
  const { 
    gapsByDay, 
    allBlankGaps, 
    mutualGaps, 
    longestGapBlock, 
    dailyTeachingSpans 
  } = useMemo(() => {
    const gapsMap = new Map<DayOfWeek, GapDetail[]>();
    const allGapsList: GapDetail[] = [];
    const mutualGapsList: GapDetail[] = [];
    const spansMap = new Map<DayOfWeek, { first: number; last: number; count: number; gapCount: number }>();
    let maxContiguousGap = 0;

    days.forEach(day => {
      const dayClasses = teacherEntries
        .filter(e => e.dayOfWeek === day)
        .sort((a, b) => a.slotOrder - b.slotOrder);

      const daySlotOrders = Array.from(new Set(dayClasses.map(c => c.slotOrder))).sort((a, b) => a - b);

      if (daySlotOrders.length >= 2) {
        const firstSlot = daySlotOrders[0];
        const lastSlot = daySlotOrders[daySlotOrders.length - 1];
        const dayGaps: GapDetail[] = [];

        let currentContiguous = 0;

        for (let s = firstSlot + 1; s < lastSlot; s++) {
          if (!daySlotOrders.includes(s)) {
            currentContiguous++;
            if (currentContiguous > maxContiguousGap) {
              maxContiguousGap = currentContiguous;
            }

            const repSlot = timeSlots.find(ts => ts.dayOfWeek === day && ts.slotOrder === s);
            
            // Previous lecture
            const prev = dayClasses.filter(e => e.slotOrder < s).slice(-1)[0];
            // Next lecture
            const next = dayClasses.filter(e => e.slotOrder > s)[0];

            // Mutual check with viewing teacher
            const isViewerBusy = currentTeacherEntries.some(e => e.dayOfWeek === day && e.slotOrder === s);
            const isViewerFree = !isViewerBusy;
            
            // Is viewer also in a gap on this day?
            const viewerDayClasses = currentTeacherEntries
              .filter(e => e.dayOfWeek === day)
              .map(e => e.slotOrder)
              .sort((a, b) => a - b);
            const isViewerAlsoInGap = 
              viewerDayClasses.length >= 2 && 
              s > viewerDayClasses[0] && 
              s < viewerDayClasses[viewerDayClasses.length - 1] && 
              !viewerDayClasses.includes(s);

            const gapDetail: GapDetail = {
              dayOfWeek: day,
              slotOrder: s,
              timeSlot: repSlot,
              durationMinutes: 55,
              prevSubjectCode: prev?.subjectCode,
              prevSectionName: prev?.sectionName,
              prevRoom: prev?.roomNumber,
              nextSubjectCode: next?.subjectCode,
              nextSectionName: next?.sectionName,
              nextRoom: next?.roomNumber,
              isMutualWithCurrentTeacher: isViewerFree,
              isCurrentTeacherAlsoInGap: isViewerAlsoInGap
            };

            dayGaps.push(gapDetail);
            allGapsList.push(gapDetail);
            if (isViewerFree) {
              mutualGapsList.push(gapDetail);
            }
          } else {
            currentContiguous = 0;
          }
        }

        gapsMap.set(day, dayGaps);
        spansMap.set(day, {
          first: firstSlot,
          last: lastSlot,
          count: daySlotOrders.length,
          gapCount: dayGaps.length
        });
      } else if (daySlotOrders.length === 1) {
        gapsMap.set(day, []);
        spansMap.set(day, {
          first: daySlotOrders[0],
          last: daySlotOrders[0],
          count: 1,
          gapCount: 0
        });
      } else {
        gapsMap.set(day, []);
        spansMap.set(day, {
          first: 0,
          last: 0,
          count: 0,
          gapCount: 0
        });
      }
    });

    return {
      gapsByDay: gapsMap,
      allBlankGaps: allGapsList,
      mutualGaps: mutualGapsList,
      longestGapBlock: maxContiguousGap,
      dailyTeachingSpans: spansMap
    };
  }, [teacherEntries, currentTeacherEntries, days, timeSlots]);

  // Check for concurrency conflicts (safety check)
  const conflictsBySlot = useMemo(() => {
    const map = new Map<string, TimetableEntry[]>();
    teacherEntries.forEach(entry => {
      const list = map.get(entry.timeSlotId) || [];
      list.push(entry);
      map.set(entry.timeSlotId, list);
    });
    return map;
  }, [teacherEntries]);

  const conflictSlotIds = useMemo(() => {
    return Array.from(conflictsBySlot.entries())
      .filter(([_, list]) => list.length > 1)
      .map(([slotId]) => slotId);
  }, [conflictsBySlot]);

  // Copy coordination summary
  const handleCopyCoordinationSummary = () => {
    const lines = [
      `Academic Coordination Availability: ${teacher.fullName} (${teacher.designation})`,
      `Department: ${teacher.department} | Assigned Classes: ${teacherEntries.length} periods/week`,
      `Blank Lecture Gaps (Idle Between Classes): ${allBlankGaps.length} slots`,
      '',
      'Prime Mutual Coordination Slots (Both Faculty Free):',
      ...mutualGaps.slice(0, 6).map(g => 
        `• ${g.dayOfWeek} Period ${g.slotOrder} (${g.timeSlot ? `${g.timeSlot.startTime}-${g.timeSlot.endTime}` : ''}): Idle between ${g.prevSubjectCode || 'Class'} and ${g.nextSubjectCode || 'Class'}`
      )
    ];

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    });
  };

  const handleProposeCoordination = (gap: GapDetail) => {
    const timeStr = gap.timeSlot ? `${gap.timeSlot.startTime} - ${gap.timeSlot.endTime}` : `Slot ${gap.slotOrder}`;
    setProposedSlotNotice(
      `Coordination window request drafted for ${teacher.fullName} on ${gap.dayOfWeek} Period ${gap.slotOrder} (${timeStr}).`
    );
    setTimeout(() => setProposedSlotNotice(null), 5000);
  };

  return (
    <div className="space-y-5" id="teacher-other-timings-view">
      {/* ===================================================================== */}
      {/* 1. TOP HEADER & METRIC CONTROLS */}
      {/* ===================================================================== */}
      <div className="academic-glass-card p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-900" />
              <h2 className="text-base font-bold text-slate-900">
                Colleague Timings & Blank Lecture Gap Analyzer
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time calculation of faculty lecture windows, <strong>blank gaps between classes</strong>, and shared coordination slots
            </p>
          </div>

          {/* Key Gap Metrics Cards */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Total Assigned */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[85px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Classes</span>
              <span className="text-base font-bold text-slate-900">{teacherEntries.length}</span>
            </div>

            {/* Blank Lecture Gaps Indicator Badge */}
            <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-300 text-center min-w-[110px] relative overflow-hidden shadow-2xs">
              <div className="absolute top-1 right-1">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-amber-800 flex items-center justify-center gap-1">
                <Coffee className="w-3 h-3 text-amber-600" />
                Blank Gaps
              </span>
              <span className="text-base font-bold text-amber-900">
                {allBlankGaps.length} <span className="text-[10px] font-medium text-amber-700">periods</span>
              </span>
            </div>

            {/* Longest Contiguous Gap */}
            <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200 text-center min-w-[95px]">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Longest Gap</span>
              <span className="text-base font-bold text-amber-800">
                {longestGapBlock > 0 ? `${longestGapBlock * 55}m` : '0m'}
              </span>
            </div>

            {/* Mutual Free Windows with Current Teacher */}
            {currentTeacher && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-center min-w-[115px]">
                <span className="text-[10px] uppercase font-bold text-emerald-800 flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  Mutual Windows
                </span>
                <span className="text-base font-bold text-emerald-900">
                  {mutualGaps.length} <span className="text-[10px] font-medium text-emerald-700">prime gaps</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* TEACHER SELECTOR & FILTER CONTROLS */}
        {/* ===================================================================== */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, emp ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Visual Indicator Controls & Toggles */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => setHighlightGaps(!highlightGaps)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                highlightGaps
                  ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Coffee className="w-3.5 h-3.5 text-amber-600" />
              <span>Highlight Blank Gaps</span>
            </button>

            {currentTeacher && (
              <button
                type="button"
                onClick={() => setShowMutualOnly(!showMutualOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  showMutualOnly
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-900 shadow-2xs font-bold'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mutual Free Windows</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyCoordinationSummary}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
              title="Copy Colleague Availability to Clipboard"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Slots</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Colleague Quick Selection Pills */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0 mr-1">Faculty:</span>
          {filteredTeachers.slice(0, 10).map(t => {
            const isSelected = t.id === teacher.id;
            const isMe = currentTeacher && t.id === currentTeacher.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTeacherId(t.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-900 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t.fullName}
                {isMe && <span className="ml-1 text-[10px] opacity-75">(You)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. SELECTED FACULTY INFO BANNER & VISUAL LEGEND */}
      {/* ===================================================================== */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-950 font-bold flex items-center justify-center text-sm border border-indigo-200 shadow-2xs shrink-0">
            {teacher.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              {teacher.fullName}
              <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                {teacher.employeeId}
              </span>
              {currentTeacher && teacher.id === currentTeacher.id && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                  Your Schedule
                </span>
              )}
            </div>
            <div className="text-slate-500 text-[11px] mt-0.5">
              {teacher.designation} • {teacher.department} • Weekly load: {teacherEntries.length} classes
            </div>
          </div>
        </div>

        {/* Visual Indicators Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          {/* Busy Class */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-indigo-100 border border-indigo-300 inline-block"></span>
            <span className="text-slate-700 font-semibold">Teaching (Class Assigned)</span>
          </div>

          {/* Blank Lecture Gap (Highlight of this feature) */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-400 inline-flex items-center justify-center text-amber-700">
              <Coffee className="w-2.5 h-2.5" />
            </span>
            <span className="text-amber-900 font-bold">Blank Lecture Gap (On Campus)</span>
          </div>

          {/* Mutual Free Window */}
          {currentTeacher && (
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-400 inline-flex items-center justify-center text-emerald-700">
                <Zap className="w-2.5 h-2.5" />
              </span>
              <span className="text-emerald-900 font-bold">Mutual Free Window</span>
            </div>
          )}

          {/* Off Duty Free */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200 inline-block"></span>
            <span className="text-slate-500 font-normal">Off-Duty / Open Period</span>
          </div>
        </div>
      </div>

      {/* Feedback Toast Notification */}
      {proposedSlotNotice && (
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-300 text-indigo-950 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-indigo-700 shrink-0" />
            <span>{proposedSlotNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setProposedSlotNotice(null)}
            className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. TIMETABLE GRID WITH VISUAL BLANK GAP INDICATORS */}
      {/* ===================================================================== */}
      <div className="academic-subtle-card overflow-x-auto shadow-xs border border-slate-200">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
              <th className="p-3 text-left font-bold min-w-[125px]">
                <div>Day / Schedule</div>
                <div className="text-[10px] font-normal text-slate-500">Calculated Gaps</div>
              </th>
              {slotOrders.map(order => {
                const repSlot = timeSlots.find(s => s.slotOrder === order);
                return (
                  <th key={order} className="p-2.5 text-center font-bold min-w-[115px] border-l border-slate-200">
                    <div className="text-slate-900 font-semibold">Period {order}</div>
                    {repSlot && (
                      <div className="text-[10px] font-normal text-slate-500 font-mono">
                        {repSlot.startTime} - {repSlot.endTime}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {days.map(day => {
              const dayGaps = gapsByDay.get(day) || [];
              const daySpan = dailyTeachingSpans.get(day) || { first: 0, last: 0, count: 0, gapCount: 0 };
              const hasClassesToday = daySpan.count > 0;

              return (
                <tr key={day} className="hover:bg-slate-50/50 transition-colors">
                  {/* Day Column & Daily Gap Status Badge */}
                  <td className="p-3 font-bold text-slate-900 bg-slate-50/90 border-r border-slate-200 align-top">
                    <div className="font-bold text-slate-950 text-xs">{day}</div>
                    <div className="mt-1 flex flex-col gap-1">
                      <span className="text-[10px] font-medium text-slate-500">
                        {daySpan.count} {daySpan.count === 1 ? 'class' : 'classes'}
                      </span>
                      
                      {/* Daily Blank Gap Indicator Pill */}
                      {dayGaps.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[9.5px] font-bold">
                          <Coffee className="w-2.5 h-2.5 text-amber-700" />
                          {dayGaps.length} {dayGaps.length === 1 ? 'Gap' : 'Gaps'} ({dayGaps.length * 55}m)
                        </span>
                      ) : hasClassesToday && daySpan.count > 1 ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9.5px] font-medium">
                          ✓ Compact (0 Gaps)
                        </span>
                      ) : !hasClassesToday ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9.5px] font-medium">
                          Free Day
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {/* Slot Columns */}
                  {slotOrders.map(order => {
                    const slot = timeSlots.find(s => s.dayOfWeek === day && s.slotOrder === order);
                    const slotId = slot?.id || '';
                    const entriesInSlot = teacherEntries.filter(e => e.timeSlotId === slotId);
                    const hasConflict = entriesInSlot.length > 1;
                    const isBusy = entriesInSlot.length > 0;

                    // Gap determination
                    const isBlankGap = dayGaps.some(g => g.slotOrder === order);
                    const gapDetail = dayGaps.find(g => g.slotOrder === order);
                    
                    // Mutual coordination determination
                    const isMutualPrimeWindow = gapDetail?.isMutualWithCurrentTeacher ?? false;
                    const isCurrentTeacherAlsoFree = 
                      currentTeacher && 
                      !currentTeacherEntries.some(e => e.dayOfWeek === day && e.slotOrder === order);

                    // If showMutualOnly is activated and this slot is neither busy nor mutual, dim it
                    const isDimmed = showMutualOnly && !isMutualPrimeWindow && !isBusy;

                    // Cell styles
                    let cellBg = 'bg-white';
                    let borderHighlight = 'border-slate-200';

                    if (hasConflict) {
                      cellBg = 'bg-rose-50 text-rose-950 border-rose-300';
                    } else if (isBusy) {
                      cellBg = 'bg-indigo-50/70 text-indigo-950 border-indigo-200';
                    } else if (isBlankGap && highlightGaps) {
                      // Prominent Visual Indicator for Blank Lecture Gap
                      cellBg = isMutualPrimeWindow
                        ? 'bg-gradient-to-br from-amber-50 to-emerald-50 border-amber-300'
                        : 'bg-amber-50/80 border-amber-300';
                      borderHighlight = 'border-amber-300';
                    } else if (isCurrentTeacherAlsoFree && currentTeacher) {
                      cellBg = 'bg-emerald-50/30';
                    } else {
                      cellBg = 'bg-slate-50/40 text-slate-400';
                    }

                    return (
                      <td 
                        key={order}
                        className={`p-2 border-l ${borderHighlight} align-top transition-all ${cellBg} ${isDimmed ? 'opacity-35' : ''}`}
                      >
                        {/* 1. BUSY / TEACHING LECTURE */}
                        {isBusy ? (
                          <div className="space-y-1">
                            {entriesInSlot.map(entry => (
                              <div 
                                key={entry.id}
                                className={`p-1.5 rounded-lg text-[11px] border leading-tight ${
                                  hasConflict 
                                    ? 'bg-rose-100 border-rose-300 text-rose-950' 
                                    : entry.isLab
                                      ? 'bg-purple-50 border-purple-200 text-purple-950 shadow-2xs'
                                      : 'bg-white border-indigo-200 text-indigo-950 shadow-2xs'
                                }`}
                              >
                                <div className="font-bold flex items-center justify-between">
                                  <span className="text-indigo-950 font-bold">{entry.subjectCode}</span>
                                  <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 text-slate-700 font-mono">
                                    {entry.roomNumber}
                                  </span>
                                </div>
                                <div className="text-slate-700 text-[10px] truncate mt-0.5" title={entry.sectionName}>
                                  {entry.sectionName}
                                </div>
                                {entry.isLab && (
                                  <span className="inline-block mt-1 text-[9px] font-bold text-purple-700 px-1 rounded bg-purple-100">
                                    Practical Lab
                                  </span>
                                )}
                              </div>
                            ))}
                            {hasConflict && (
                              <div className="text-[9px] font-bold text-rose-700 flex items-center gap-0.5 mt-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" /> Overlap Collision!
                              </div>
                            )}
                          </div>
                        ) : isBlankGap && highlightGaps ? (
                          /* 2. VISUAL INDICATOR: BLANK LECTURE GAP */
                          <div className="p-2 rounded-lg bg-amber-50/90 border border-amber-300 text-amber-950 shadow-2xs space-y-1 relative group">
                            {/* Header Badge */}
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-amber-900 flex items-center gap-1 uppercase tracking-wide">
                                <Coffee className="w-3 h-3 text-amber-600" />
                                Blank Gap
                              </span>
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-200 text-amber-900 font-semibold">
                                55 min
                              </span>
                            </div>

                            {/* Gap Context Bracket (Between Previous and Next Lecture) */}
                            <div className="text-[9.5px] text-amber-800 leading-tight">
                              Idle between classes on campus:
                              <div className="font-semibold text-slate-800 text-[10px] mt-0.5 flex items-center gap-1">
                                <span className="truncate max-w-[45px]">{gapDetail?.prevSubjectCode}</span>
                                <ArrowRight className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                <span className="truncate max-w-[45px]">{gapDetail?.nextSubjectCode}</span>
                              </div>
                            </div>

                            {/* Mutual Coordination Badge */}
                            {isMutualPrimeWindow && (
                              <div className="pt-1 border-t border-amber-200/80">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-[9px]">
                                  <Zap className="w-2.5 h-2.5 text-emerald-600" />
                                  Mutual Free Slot
                                </span>
                              </div>
                            )}

                            {/* Action Button: Propose Coordination */}
                            {gapDetail && currentTeacher && (
                              <button
                                type="button"
                                onClick={() => handleProposeCoordination(gapDetail)}
                                className="w-full mt-1 py-1 rounded bg-amber-200/80 hover:bg-amber-300 text-amber-950 text-[9px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                title="Draft schedule coordination request for this slot"
                              >
                                <CalendarCheck className="w-2.5 h-2.5 text-amber-800" />
                                Coordinate Slot
                              </button>
                            )}
                          </div>
                        ) : (
                          /* 3. OFF-DUTY OR FULL DAY FREE */
                          <div className="h-full flex flex-col items-center justify-center py-2.5 text-center">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {hasClassesToday ? 'Off-Duty' : 'Open'}
                            </span>
                            {isCurrentTeacherAlsoFree && currentTeacher && (
                              <span className="text-[8.5px] text-emerald-700/80 font-medium mt-0.5">
                                Both Open
                              </span>
                            )}
                          </div>
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

      {/* ===================================================================== */}
      {/* 4. SCHEDULE COORDINATION ASSISTANT & BEST WINDOWS PANEL */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Coordination Assistant Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Optimal Coordination Windows with {teacher.fullName}
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {mutualGaps.length} Prime Slots
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Slots where <strong>{teacher.fullName}</strong> is on campus during a blank lecture gap and you are also free without class conflict:
          </p>

          {mutualGaps.length === 0 ? (
            <div className="p-3 bg-slate-50 rounded-lg text-center text-slate-500 text-[11px]">
              No overlapping blank lecture gaps found for this faculty member.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {mutualGaps.slice(0, 5).map((gap, idx) => (
                <div 
                  key={idx}
                  className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{gap.dayOfWeek} • Period {gap.slotOrder}</span>
                      {gap.timeSlot && (
                        <span className="text-[10px] font-normal text-slate-500 font-mono">
                          ({gap.timeSlot.startTime} - {gap.timeSlot.endTime})
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1.5">
                      <span className="text-amber-700 font-medium">Colleague Blank Gap:</span>
                      <span>After {gap.prevSubjectCode} ({gap.prevRoom})</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span>Before {gap.nextSubjectCode}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleProposeCoordination(gap)}
                    className="px-2.5 py-1 rounded bg-indigo-900 hover:bg-indigo-800 text-white font-semibold text-[10px] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    <Send className="w-3 h-3" />
                    <span>Select</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blank Gap Distribution & Faculty Efficiency Metrics */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Weekly Gap Analysis & Workload Compactness
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-950 flex items-center justify-between">
              <div>
                <span className="font-bold block">Total Blank Lecture Gaps:</span>
                <span className="text-[11px] text-amber-800">
                  {allBlankGaps.length} periods ({allBlankGaps.length * 55} minutes idle between lectures)
                </span>
              </div>
              <span className="text-lg font-bold text-amber-900">{allBlankGaps.length}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold block">Longest Idle Window:</span>
                <span className="text-[11px] text-slate-500">
                  Continuous periods without assigned classes
                </span>
              </div>
              <span className="text-sm font-bold text-slate-900">
                {longestGapBlock > 0 ? `${longestGapBlock} periods (${longestGapBlock * 55} min)` : '0 periods'}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-center justify-between">
              <div>
                <span className="font-bold block">Schedule Efficiency Score:</span>
                <span className="text-[11px] text-indigo-700">
                  {allBlankGaps.length <= 4 
                    ? 'High Compactness (Minimal waiting between lectures)'
                    : 'Balanced Spread (Optimal for office hours & proxy cover)'}
                </span>
              </div>
              <span className="text-sm font-bold text-indigo-900">
                {Math.max(60, 100 - allBlankGaps.length * 4)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
