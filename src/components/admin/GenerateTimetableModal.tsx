import React, { useState, useMemo } from 'react';
import { Section, Subject, Teacher, Room, TimeSlot, TimetableEntry } from '../../types';
import { 
  Play, 
  X, 
  Layers, 
  CheckCircle2, 
  Bus, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Filter, 
  Sparkles,
  BookOpen,
  Users,
  Check,
  RotateCcw
} from 'lucide-react';

interface GenerateTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: Section[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  timeSlots: TimeSlot[];
  existingEntries: TimetableEntry[];
  initialSelectedSectionId?: string;
  onGenerateFull: (academicYear: string, semesterType: 'ODD' | 'EVEN') => void;
  onGenerateSection: (
    targetSectionIds: string[],
    shiftPreference?: 'MORNING' | 'AFTERNOON' | 'FLEXIBLE',
    academicYear?: string,
    semesterType?: 'ODD' | 'EVEN'
  ) => void;
  isGenerating?: boolean;
}

export const GenerateTimetableModal: React.FC<GenerateTimetableModalProps> = ({
  isOpen,
  onClose,
  sections,
  subjects,
  teachers,
  rooms,
  timeSlots,
  existingEntries,
  initialSelectedSectionId,
  onGenerateFull,
  onGenerateSection,
  isGenerating = false
}) => {
  if (!isOpen) return null;

  // Generator Mode: Targeted (recommended by user) vs Whole College
  const [genMode, setGenMode] = useState<'TARGETED' | 'FULL'>('TARGETED');

  // Academic Term
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [semesterType, setSemesterType] = useState<'ODD' | 'EVEN'>('ODD');

  // Course & Semester Filter
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<number | 'ALL'>('ALL');

  // Selected Section IDs (supports single or multi-section generation)
  const defaultSectionId = initialSelectedSectionId || (sections.length > 0 ? sections[0].id : '');
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>(
    defaultSectionId ? [defaultSectionId] : []
  );

  // Shift & Bus Timing Preference
  const initialSection = sections.find(s => s.id === defaultSectionId);
  const defaultShift = initialSection 
    ? (initialSection.shift || (initialSection.semester <= 2 ? 'MORNING' : 'AFTERNOON'))
    : 'AFTERNOON';

  const [shiftPreference, setShiftPreference] = useState<'MORNING' | 'AFTERNOON' | 'FLEXIBLE'>(defaultShift);

  // Constraint Toggles
  const [enforceZeroGaps, setEnforceZeroGaps] = useState(true);
  const [protectExistingSchedules, setProtectExistingSchedules] = useState(true);
  const [preventDuplicateTheory, setPreventDuplicateTheory] = useState(true);

  // Distinct courses
  const distinctCourses = useMemo(() => {
    const set = new Set(sections.map(s => s.courseCode));
    return Array.from(set);
  }, [sections]);

  // Filtered sections according to Course & Semester
  const filteredSections = useMemo(() => {
    return sections.filter(sec => {
      const matchCourse = selectedCourseCode === 'ALL' || sec.courseCode === selectedCourseCode;
      const matchSem = selectedSemester === 'ALL' || sec.semester === selectedSemester;
      return matchCourse && matchSem;
    });
  }, [sections, selectedCourseCode, selectedSemester]);

  // When user clicks a section in the list
  const handleToggleSection = (sectionId: string) => {
    if (selectedSectionIds.includes(sectionId)) {
      if (selectedSectionIds.length > 1) {
        setSelectedSectionIds(selectedSectionIds.filter(id => id !== sectionId));
      }
    } else {
      setSelectedSectionIds([...selectedSectionIds, sectionId]);
    }
  };

  const handleSelectAllFiltered = () => {
    const ids = filteredSections.map(s => s.id);
    setSelectedSectionIds(ids);
  };

  const handleSelectSingleOnly = (sectionId: string) => {
    setSelectedSectionIds([sectionId]);
    const sec = sections.find(s => s.id === sectionId);
    if (sec) {
      setShiftPreference(sec.shift || (sec.semester <= 2 ? 'MORNING' : 'AFTERNOON'));
    }
  };

  // Selected Section Details
  const selectedSectionsList = useMemo(() => {
    return sections.filter(s => selectedSectionIds.includes(s.id));
  }, [sections, selectedSectionIds]);

  // Calculate lecture requirements for selected section(s)
  const targetRequirements = useMemo(() => {
    const reqs: { subjectCode: string; subjectName: string; teacherName: string; count: number; isLab: boolean }[] = [];
    selectedSectionIds.forEach(secId => {
      const secOldEntries = existingEntries.filter(e => e.sectionId === secId);
      if (secOldEntries.length > 0) {
        const groupMap = new Map<string, { subjectCode: string; subjectName: string; teacherName: string; count: number; isLab: boolean }>();
        secOldEntries.forEach(e => {
          const key = `${e.subjectCode}|${e.isLab ? 'LAB' : 'THEORY'}|${e.teacherName}`;
          if (!groupMap.has(key)) {
            groupMap.set(key, {
              subjectCode: e.subjectCode,
              subjectName: e.subjectName,
              teacherName: e.teacherName,
              count: 0,
              isLab: e.isLab
            });
          }
          groupMap.get(key)!.count++;
        });
        groupMap.forEach(item => reqs.push(item));
      }
    });
    return reqs;
  }, [selectedSectionIds, existingEntries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (genMode === 'FULL') {
      onGenerateFull(academicYear, semesterType);
      onClose();
    } else {
      if (selectedSectionIds.length === 0) return;
      onGenerateSection(selectedSectionIds, shiftPreference, academicYear, semesterType);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-900 text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Autonomous Timetable Generator</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                  Course & Section Selector
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Constraint-satisfaction scheduling • Student shift & bus timing synchronization
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4.5 text-xs">
          {/* Generation Scope Mode Selector */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
              Generation Scope
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setGenMode('TARGETED')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  genMode === 'TARGETED'
                    ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-500'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-xs ${genMode === 'TARGETED' ? 'text-blue-950' : 'text-slate-800'}`}>
                    Targeted Course & Section
                  </span>
                  {genMode === 'TARGETED' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Select specific course, semester & section. Protects existing college classes while solving all conflicts.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setGenMode('FULL')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  genMode === 'FULL'
                    ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-500'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-xs ${genMode === 'FULL' ? 'text-blue-950' : 'text-slate-800'}`}>
                    Institutional Full Term
                  </span>
                  {genMode === 'FULL' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Regenerate timetable across all 42 sections, all 38 faculty members, and all lecture halls simultaneously.
                </p>
              </button>
            </div>
          </div>

          {/* TARGETED SELECTION PANELS */}
          {genMode === 'TARGETED' && (
            <div className="space-y-4">
              {/* Course & Semester Filter Bar */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                  Step 1: Filter by Course & Semester
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Academic Course
                    </label>
                    <select
                      value={selectedCourseCode}
                      onChange={e => setSelectedCourseCode(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 font-medium"
                    >
                      <option value="ALL">All Academic Courses</option>
                      {distinctCourses.map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Semester Level
                    </label>
                    <select
                      value={selectedSemester === 'ALL' ? 'ALL' : String(selectedSemester)}
                      onChange={e => setSelectedSemester(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 font-medium"
                    >
                      <option value="ALL">All Semesters</option>
                      <option value="1">Semester 1 (Morning Shift)</option>
                      <option value="3">Semester 3 (Afternoon Shift)</option>
                      <option value="5">Semester 5 (Afternoon Shift • BCA V SEC C)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Select Target Section */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Step 2: Choose Cohort Section(s) to Schedule ({filteredSections.length} available)
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="text-[11px] text-blue-700 font-semibold hover:underline cursor-pointer"
                  >
                    Select All {filteredSections.length} Sections
                  </button>
                </div>

                {/* Section selection scrollbox */}
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-1 bg-white border border-slate-200 rounded-lg">
                  {filteredSections.map(sec => {
                    const isSelected = selectedSectionIds.includes(sec.id);
                    const isMorning = sec.semester <= 2;
                    return (
                      <div
                        key={sec.id}
                        onClick={() => handleToggleSection(sec.id)}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-300 text-blue-950 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by parent onClick
                            className="rounded text-blue-900 pointer-events-none"
                          />
                          <span>{sec.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({sec.courseCode} Sem {sec.semester} • {sec.studentCount} students)
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            isMorning ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {isMorning ? 'Morning Shift' : 'Afternoon Shift (12 PM)'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSingleOnly(sec.id);
                            }}
                            className="text-[10px] text-slate-400 hover:text-blue-700 px-1 hover:underline"
                          >
                            Only
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-[11px] text-slate-600">
                  Selected <strong className="text-slate-900">{selectedSectionIds.length}</strong> section(s):{' '}
                  <span className="text-blue-900 font-medium">
                    {selectedSectionsList.map(s => s.name).join(', ') || 'None selected'}
                  </span>
                </div>
              </div>

              {/* Step 3: Student Timing & Bus Schedule Window */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                  Step 3: Student Timing & College Bus Synchronization
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Afternoon Shift */}
                  <div
                    onClick={() => setShiftPreference('AFTERNOON')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      shiftPreference === 'AFTERNOON'
                        ? 'border-indigo-600 bg-indigo-50/80 shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
                        <Bus className="w-4 h-4 text-indigo-700" />
                        Afternoon Shift (12:00 PM – 4:00 PM / 6:00 PM)
                      </span>
                      {shiftPreference === 'AFTERNOON' && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      • Arrival Bus: <strong>11:00 AM</strong> (Classes start 12:00 PM / Period 5)<br />
                      • Departure Bus: <strong>4:00 PM (16:05) & 6:00 PM (18:00)</strong><br />
                      • Zero classes before 12:00 PM • Standard for Sem 3, 4, 5, 6
                    </p>
                  </div>

                  {/* Morning Shift */}
                  <div
                    onClick={() => setShiftPreference('MORNING')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      shiftPreference === 'MORNING'
                        ? 'border-amber-600 bg-amber-50/80 shadow-xs ring-1 ring-amber-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                        <Bus className="w-4 h-4 text-amber-700" />
                        Morning Shift (08:00 AM – 12:55 PM)
                      </span>
                      {shiftPreference === 'MORNING' && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      • Arrival Bus: <strong>08:00 AM</strong> (Classes start 08:00 AM / Period 1)<br />
                      • Departure Bus: <strong>12:55 PM / 01:10 PM / 04:00 PM</strong><br />
                      • Zero late afternoon stranded classes • Standard for Sem 1, 2
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4: Optimization Constraints & Quality Guarantees */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                  Optimization Constraints & Conflict Resolvers
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enforceZeroGaps}
                      onChange={e => setEnforceZeroGaps(e.target.checked)}
                      className="rounded text-blue-900"
                    />
                    <div>
                      <strong className="text-slate-900 block">Strict Zero 2-3h Gaps</strong>
                      <span className="text-slate-500 text-[10px]">Packs classes into compact contiguous blocks</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={protectExistingSchedules}
                      onChange={e => setProtectExistingSchedules(e.target.checked)}
                      className="rounded text-blue-900"
                    />
                    <div>
                      <strong className="text-slate-900 block">Lock Other Cohort Schedules</strong>
                      <span className="text-slate-500 text-[10px]">Zero collisions with existing college teachers</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preventDuplicateTheory}
                      onChange={e => setPreventDuplicateTheory(e.target.checked)}
                      className="rounded text-blue-900"
                    />
                    <div>
                      <strong className="text-slate-900 block">Even Subject Distribution</strong>
                      <span className="text-slate-500 text-[10px]">Max 1 theory of same subject per day</span>
                    </div>
                  </label>

                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="text-[10px]">
                      Practical laboratory sessions will be scheduled in designated Computer Labs.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FULL GENERATION PANEL */}
          {genMode === 'FULL' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Academic Session
                  </label>
                  <select
                    value={academicYear}
                    onChange={e => setAcademicYear(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-800 font-medium"
                  >
                    <option value="2026-2027">2026-2027 (Current)</option>
                    <option value="2027-2028">2027-2028 (Upcoming)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Semester Term
                  </label>
                  <select
                    value={semesterType}
                    onChange={e => setSemesterType(e.target.value as 'ODD' | 'EVEN')}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-800 font-medium"
                  >
                    <option value="ODD">ODD Semesters (Sem 1, 3, 5)</option>
                    <option value="EVEN">EVEN Semesters (Sem 2, 4, 6)</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-slate-600 text-[11px]">
                <span className="font-bold text-slate-800 uppercase tracking-wider block">
                  Institutional Resource Inventory
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>• Active Sections: <strong className="text-slate-900">{sections.length}</strong></div>
                  <div>• Qualified Faculty: <strong className="text-slate-900">{teachers.length}</strong></div>
                  <div>• Classrooms & Labs: <strong className="text-slate-900">{rooms.length}</strong></div>
                  <div>• Weekly Slots: <strong className="text-slate-900">{timeSlots.filter(s => !s.isBreak).length}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {genMode === 'TARGETED' 
                ? `Ready to generate schedule for ${selectedSectionIds.length} section(s)`
                : `Ready to regenerate entire institution schedule`}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating || (genMode === 'TARGETED' && selectedSectionIds.length === 0)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {isGenerating 
                    ? 'Running Optimization Engine...' 
                    : genMode === 'TARGETED'
                    ? `Generate Schedule (${selectedSectionIds.length} Section${selectedSectionIds.length > 1 ? 's' : ''})`
                    : 'Execute Full Timetable Generator'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
