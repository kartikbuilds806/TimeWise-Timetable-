import React, { useState, useMemo } from 'react';
import { TimetableConflict, Section } from '../../types';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  ShieldAlert,
  CalendarCheck,
  Bus,
  Clock,
  Filter,
  Wrench,
  Check,
  ChevronRight
} from 'lucide-react';

interface ConflictReviewPanelProps {
  conflicts: TimetableConflict[];
  optimizationScore: number;
  sections?: Section[];
  onResolveConflict?: (conflictId: string) => void;
  onAutoResolveSection?: (sectionId: string) => void;
  onOpenGeneratorForSection?: (sectionId: string) => void;
}

export const ConflictReviewPanel: React.FC<ConflictReviewPanelProps> = ({
  conflicts,
  optimizationScore,
  sections = [],
  onResolveConflict,
  onAutoResolveSection,
  onOpenGeneratorForSection
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('ALL');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');

  const hardConflicts = conflicts.filter(c => c.severity === 'HARD');
  const softPenalties = conflicts.filter(c => c.severity === 'SOFT');

  // Breakdown by category
  const collisionConflicts = conflicts.filter(c => c.category === 'COLLISION' || c.type.includes('DOUBLE_BOOKING'));
  const shiftConflicts = conflicts.filter(c => c.category === 'TIMING_SHIFT' || c.type === 'SHIFT_TIMING_VIOLATION' || c.type === 'BUS_TRANSIT_MISMATCH');
  const gapConflicts = conflicts.filter(c => c.category === 'STUDENT_GAP' || c.type === 'STUDENT_LONG_GAP');
  const workloadConflicts = conflicts.filter(c => c.category === 'WORKLOAD' || c.type === 'DUPLICATE_SUBJECT_SAME_DAY' || c.type === 'FACULTY_EXCESSIVE_CONSECUTIVE');

  // Distinct courses in conflicts
  const distinctCourses = useMemo(() => {
    const set = new Set<string>();
    conflicts.forEach(c => {
      if (c.courseCode) set.add(c.courseCode);
    });
    return Array.from(set);
  }, [conflicts]);

  // Filtered conflicts
  const filteredConflicts = useMemo(() => {
    return conflicts.filter(c => {
      // Category filter
      if (selectedCategory === 'COLLISION') {
        if (c.category !== 'COLLISION' && !c.type.includes('DOUBLE_BOOKING')) return false;
      } else if (selectedCategory === 'TIMING_SHIFT') {
        if (c.category !== 'TIMING_SHIFT' && c.type !== 'SHIFT_TIMING_VIOLATION' && c.type !== 'BUS_TRANSIT_MISMATCH') return false;
      } else if (selectedCategory === 'STUDENT_GAP') {
        if (c.category !== 'STUDENT_GAP' && c.type !== 'STUDENT_LONG_GAP') return false;
      } else if (selectedCategory === 'WORKLOAD') {
        if (c.category !== 'WORKLOAD' && c.type !== 'DUPLICATE_SUBJECT_SAME_DAY' && c.type !== 'FACULTY_EXCESSIVE_CONSECUTIVE') return false;
      }

      // Course filter
      if (selectedCourseFilter !== 'ALL' && c.courseCode && c.courseCode !== selectedCourseFilter) {
        return false;
      }

      // Section filter
      if (selectedSectionFilter !== 'ALL' && c.sectionId && c.sectionId !== selectedSectionFilter) {
        return false;
      }

      return true;
    });
  }, [conflicts, selectedCategory, selectedCourseFilter, selectedSectionFilter]);

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hard Collisions Card */}
        <div className={`p-4 rounded-xl border ${
          hardConflicts.length > 0 
            ? 'bg-red-50/80 border-red-200' 
            : 'bg-emerald-50/80 border-emerald-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Hard Violations
            </span>
            {hardConflicts.length > 0 ? (
              <ShieldAlert className="w-5 h-5 text-red-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${
              hardConflicts.length > 0 ? 'text-red-700' : 'text-emerald-700'
            }`}>
              {hardConflicts.length}
            </span>
            <span className="text-[11px] text-slate-500">
              {hardConflicts.length === 0 ? 'Zero collisions or shift errors' : 'Collisions & shift violations'}
            </span>
          </div>
        </div>

        {/* Shift & Bus Schedule Timing Card */}
        <div className={`p-4 rounded-xl border ${
          shiftConflicts.length > 0 
            ? 'bg-orange-50/80 border-orange-200' 
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Shift & Bus Sync
            </span>
            <Bus className={`w-5 h-5 ${shiftConflicts.length > 0 ? 'text-orange-600' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${shiftConflicts.length > 0 ? 'text-orange-700' : 'text-slate-800'}`}>
              {shiftConflicts.length}
            </span>
            <span className="text-[11px] text-slate-500">
              {shiftConflicts.length === 0 ? '100% bus transit aligned' : 'Classes outside bus windows'}
            </span>
          </div>
        </div>

        {/* Student Idle Gaps Card */}
        <div className={`p-4 rounded-xl border ${
          gapConflicts.length > 0 
            ? 'bg-amber-50/70 border-amber-200' 
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Idle Gaps (&ge; 2h)
            </span>
            <Clock className={`w-5 h-5 ${gapConflicts.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${gapConflicts.length > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
              {gapConflicts.length}
            </span>
            <span className="text-[11px] text-slate-500">
              {gapConflicts.length === 0 ? 'Zero 2-3h wasted hours' : 'Gaps wasting student time'}
            </span>
          </div>
        </div>

        {/* Optimization Quality Metric Card */}
        <div className="p-4 rounded-xl border bg-white border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Schedule Health
            </span>
            <CalendarCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {optimizationScore}%
            </span>
            <span className="text-[11px] text-slate-500">
              Constraint satisfaction index
            </span>
          </div>
        </div>
      </div>

      {/* College Bus Transit & Shift Architecture Informational Banner */}
      <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-950 text-xs flex items-start gap-3">
        <Bus className="w-5 h-5 text-blue-800 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold flex items-center gap-2">
            <span>Institutional Shift & College Bus Rules</span>
            <span className="text-[10px] bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded font-mono font-semibold">
              Fixed Route Sync
            </span>
          </div>
          <p className="text-slate-700 leading-relaxed text-[11px]">
            • <strong>Morning Shift (Sem 1 & 2)</strong>: Classes run <strong>08:00 AM – 12:55 PM</strong> (Periods 1–5), arriving via the 08:00 AM bus and departing at 12:55 PM / 01:10 PM / 04:00 PM.<br />
            • <strong>Afternoon Shift (Sem 3, 4, 5, 6 • e.g. BCA V)</strong>: Classes start from <strong>12:00 PM</strong> (Period 5) and end by <strong>04:00 PM (16:05)</strong> or <strong>06:00 PM (18:00)</strong>, matching the 11:00 AM arrival bus and 4:00 PM / 6:00 PM departure buses.<br />
            • Classes scheduled outside a cohort’s designated shift or with 2–3 hour blank lecture gaps violate real student transit and cause wasted hours.
          </p>
        </div>
      </div>

      {/* Interactive Conflict Filters */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>

            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-blue-900 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All ({conflicts.length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('COLLISION')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === 'COLLISION'
                  ? 'bg-red-700 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Collisions ({collisionConflicts.length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('TIMING_SHIFT')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === 'TIMING_SHIFT'
                  ? 'bg-orange-700 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Shift & Bus ({shiftConflicts.length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('STUDENT_GAP')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === 'STUDENT_GAP'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Idle Gaps ({gapConflicts.length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('WORKLOAD')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === 'WORKLOAD'
                  ? 'bg-indigo-700 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Workload ({workloadConflicts.length})
            </button>
          </div>

          {/* Filter by Section dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filter Section:</span>
            <select
              value={selectedSectionFilter}
              onChange={e => setSelectedSectionFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1 bg-slate-50 font-medium text-slate-800"
            >
              <option value="ALL">All Sections</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Detailed Conflicts List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-red-600" />
            Detected Real Schedule Conflicts ({filteredConflicts.length})
          </h3>
          <span className="text-xs text-slate-500">
            {filteredConflicts.length === 0 ? 'No matching issues' : 'Click "Auto-Resolve" to re-generate into optimal shift'}
          </span>
        </div>

        {filteredConflicts.length === 0 ? (
          <div className="p-6 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-sm font-bold block">100% Conflict-Free & Optimized:</strong>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  Zero collisions across faculty and rooms. All senior cohorts (Sem 3–6) strictly synchronized to the Afternoon Shift (12:00 PM – 4:00 PM), and junior cohorts (Sem 1–2) to the Morning Shift. No 2–3 hour wasted gaps exist.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConflicts.map(conflict => {
              const isHard = conflict.severity === 'HARD';
              const isShift = conflict.category === 'TIMING_SHIFT' || conflict.type === 'SHIFT_TIMING_VIOLATION';
              const isGap = conflict.category === 'STUDENT_GAP' || conflict.type === 'STUDENT_LONG_GAP';

              return (
                <div 
                  key={conflict.id}
                  className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-3 shadow-xs transition-all ${
                    isHard
                      ? isShift
                        ? 'border-orange-300 bg-orange-50/70 text-slate-900'
                        : 'border-red-300 bg-red-50/70 text-slate-900'
                      : isGap
                      ? 'border-amber-300 bg-amber-50/60 text-slate-900'
                      : 'border-slate-300 bg-slate-50/80 text-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    {isHard ? (
                      isShift ? (
                        <Bus className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      )
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    )}

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                          isHard 
                            ? isShift ? 'bg-orange-200 text-orange-900' : 'bg-red-200 text-red-900' 
                            : 'bg-amber-200 text-amber-900'
                        }`}>
                          {conflict.type.replace(/_/g, ' ')}
                        </span>

                        {conflict.involvedDay && (
                          <span className="text-slate-600 font-semibold text-[11px]">
                            {conflict.involvedDay} {conflict.involvedSlotOrder ? `• Period ${conflict.involvedSlotOrder}` : ''}
                          </span>
                        )}

                        {conflict.sectionName && (
                          <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium text-[10px]">
                            {conflict.sectionName}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-800 leading-relaxed font-medium">
                        {conflict.description}
                      </p>

                      {conflict.recommendedAction && (
                        <div className="p-2 rounded-lg bg-white/80 border border-slate-200/80 text-[11px] text-slate-700 flex items-start gap-1.5">
                          <Wrench className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                          <span>
                            <strong>Recommended Fix:</strong> {conflict.recommendedAction}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  {conflict.sectionId && (
                    <div className="shrink-0 flex sm:flex-col items-center gap-2 sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenGeneratorForSection) {
                            onOpenGeneratorForSection(conflict.sectionId!);
                          } else if (onAutoResolveSection) {
                            onAutoResolveSection(conflict.sectionId!);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                        <span>Re-optimize Section</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
