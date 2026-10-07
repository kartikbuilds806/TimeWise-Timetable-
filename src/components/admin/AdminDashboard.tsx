import React, { useState } from 'react';
import { 
  Course, 
  Section, 
  Subject, 
  Teacher, 
  Room, 
  TimeSlot, 
  TimetableVersion, 
  TimetableEntry,
  TimetableConflict,
  TimetableChangeLog
} from '../../types';
import { TimetableGrid } from '../timetable/TimetableGrid';
import { ConflictReviewPanel } from '../timetable/ConflictReviewPanel';
import { ChangeHistoryModal } from '../timetable/ChangeHistoryModal';
import { EditEntryModal } from '../timetable/EditEntryModal';
import { GenerateTimetableModal } from './GenerateTimetableModal';
import { ResourceManagement } from './ResourceManagement';
import { TeacherScheduleAnalyzer } from '../teacher/TeacherScheduleAnalyzer';
import { ProxyManagerTab } from '../substitution/ProxyManagerTab';
import { OptimizationStudio } from '../optimization/OptimizationStudio';
import { TimetableDiffViewer } from '../versioning/TimetableDiffViewer';
import { TimetableExportModal } from '../export/TimetableExportModal';
import { 
  Calendar, 
  Layers, 
  AlertOctagon, 
  CheckCircle2, 
  History, 
  Play, 
  Sliders, 
  Sparkles, 
  Send,
  BookOpen,
  DoorOpen,
  GraduationCap,
  Users,
  UserCheck,
  Printer,
  Cpu,
  GitCompare
} from 'lucide-react';

interface AdminDashboardProps {
  currentVersion: TimetableVersion;
  courses: Course[];
  sections: Section[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  timeSlots: TimeSlot[];
  onGenerateTimetable: (academicYear: string, semesterType: 'ODD' | 'EVEN') => void;
  onPublishTimetable: () => void;
  onUpdateEntry: (
    updatedEntry: TimetableEntry,
    reason: string,
    changeType: 'ROOM_CHANGE' | 'TIME_CHANGE' | 'TEACHER_CHANGE' | 'RESCHEDULE'
  ) => void;
  onAddSubject: (subject: Subject) => void;
  onAddTeacher: (teacher: Teacher) => void;
  onAddRoom: (room: Room) => void;
  onAddSection: (section: Section) => void;
  onAssignProxy?: (
    entryId: string,
    proxyTeacher: Teacher,
    reason: string,
    notes?: string
  ) => void;
  onApplyOptimizedSchedule?: (
    optimizedEntries: TimetableEntry[],
    summary: string
  ) => void;
  onGenerateSectionTimetable?: (
    targetSectionIds: string[],
    shiftPreference?: 'MORNING' | 'AFTERNOON' | 'FLEXIBLE',
    academicYear?: string,
    semesterType?: 'ODD' | 'EVEN'
  ) => void;
}

type AdminView = 'TIMETABLE' | 'OPTIMIZER' | 'SUBSTITUTIONS' | 'AUDIT_DIFF' | 'CONFLICTS' | 'TEACHER_TIMING' | 'RESOURCES';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentVersion,
  courses,
  sections,
  subjects,
  teachers,
  rooms,
  timeSlots,
  onGenerateTimetable,
  onPublishTimetable,
  onUpdateEntry,
  onAddSubject,
  onAddTeacher,
  onAddRoom,
  onAddSection,
  onAssignProxy,
  onApplyOptimizedSchedule,
  onGenerateSectionTimetable
}) => {
  const [activeView, setActiveView] = useState<AdminView>('TIMETABLE');
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [preselectedSectionIdForGenerator, setPreselectedSectionIdForGenerator] = useState<string | undefined>(undefined);

  const handleOpenGeneratorForSection = (sectionId: string) => {
    setPreselectedSectionIdForGenerator(sectionId);
    setIsGenerateOpen(true);
  };

  const hardConflictsCount = currentVersion.conflicts.filter(c => c.severity === 'HARD').length;
  const isPublished = currentVersion.status === 'PUBLISHED';
  const cancelledCount = currentVersion.entries.filter(e => e.status === 'CANCELLED').length;
  const substitutedCount = currentVersion.entries.filter(e => e.status === 'SUBSTITUTED').length;

  return (
    <div className="space-y-6">
      {/* Top Academic Status & Quick Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Card */}
        <div className="academic-subtle-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Timetable Status
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
              isPublished 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              v{currentVersion.versionNumber}.0 {currentVersion.status}
            </span>
          </div>
          <div className="mt-2 text-lg font-bold text-slate-900">
            {isPublished ? 'Published Schedule' : 'Generated Draft'}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isPublished ? 'Visible to all teachers & students' : 'Under administrative evaluation'}
          </p>
        </div>

        {/* Conflicts Card */}
        <div className="academic-subtle-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hard Violations
            </span>
            <AlertOctagon className={`w-4 h-4 ${
              hardConflictsCount > 0 ? 'text-red-600' : 'text-emerald-600'
            }`} />
          </div>
          <div className={`mt-2 text-lg font-bold ${
            hardConflictsCount > 0 ? 'text-red-700' : 'text-emerald-700'
          }`}>
            {hardConflictsCount} Conflicts
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {hardConflictsCount === 0 ? 'All hard constraints satisfied' : 'Requires review before publish'}
          </p>
        </div>

        {/* Feasibility Score */}
        <div className="academic-subtle-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Optimization Score
            </span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-lg font-bold text-slate-900">
            {currentVersion.optimizationScore}%
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Balanced soft constraint score
          </p>
        </div>

        {/* Academic Inventory */}
        <div className="academic-subtle-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Academic Resources
            </span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-lg font-bold text-slate-900">
            {sections.length} Sec • {teachers.length} Fac
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {subjects.length} Subjects in {rooms.length} Venues
          </p>
        </div>
      </div>

      {/* Main Admin Action Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left Views */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveView('TIMETABLE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeView === 'TIMETABLE'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-blue-700" />
            Timetable Matrix
          </button>

          <button
            type="button"
            onClick={() => setActiveView('OPTIMIZER')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeView === 'OPTIMIZER'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            GA Optimizer
          </button>

          <button
            type="button"
            onClick={() => setActiveView('SUBSTITUTIONS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeView === 'SUBSTITUTIONS'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Proxy Substitutions</span>
            {cancelledCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                {cancelledCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveView('AUDIT_DIFF')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeView === 'AUDIT_DIFF'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5 text-indigo-600" />
            Version Audit
          </button>

          <button
            type="button"
            onClick={() => setActiveView('CONFLICTS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeView === 'CONFLICTS'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertOctagon className={`w-3.5 h-3.5 ${
              hardConflictsCount > 0 ? 'text-red-600' : 'text-slate-500'
            }`} />
            Conflicts ({currentVersion.conflicts.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveView('TEACHER_TIMING')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeView === 'TEACHER_TIMING'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-700" />
            Faculty Timing
          </button>

          <button
            type="button"
            onClick={() => setActiveView('RESOURCES')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeView === 'RESOURCES'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-700" />
            Resources
          </button>
        </div>

        {/* Right Execution Buttons */}
        <div className="flex items-center gap-2">
          {/* Print / Export Button */}
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-blue-700" />
            <span>Print / Export</span>
          </button>

          {/* History Button */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Audit History ({currentVersion.changeLogs.length})</span>
          </button>

          {/* Generate Button */}
          <button
            type="button"
            onClick={() => setIsGenerateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Generate Schedule</span>
          </button>

          {/* Publish Button */}
          {!isPublished && (
            <button
              type="button"
              onClick={onPublishTimetable}
              disabled={hardConflictsCount > 0}
              title={hardConflictsCount > 0 ? 'Resolve all hard conflicts before publishing' : 'Publish timetable to students and faculty'}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Approve & Publish</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary View Content */}
      {activeView === 'TIMETABLE' && (
        <TimetableGrid
          entries={currentVersion.entries}
          timeSlots={timeSlots}
          sections={sections}
          teachers={teachers}
          rooms={rooms}
          conflicts={currentVersion.conflicts}
          userRole="ROLE_ADMIN"
          onEditEntry={(entry) => setEditingEntry(entry)}
          onOpenGeneratorForSection={handleOpenGeneratorForSection}
          timetableStatus={currentVersion.status}
        />
      )}

      {activeView === 'OPTIMIZER' && (
        <OptimizationStudio
          entries={currentVersion.entries}
          sections={sections}
          subjects={subjects}
          teachers={teachers}
          rooms={rooms}
          timeSlots={timeSlots}
          onApplyOptimizedSchedule={(optEntries, summary) => {
            if (onApplyOptimizedSchedule) {
              onApplyOptimizedSchedule(optEntries, summary);
            }
          }}
        />
      )}

      {activeView === 'SUBSTITUTIONS' && (
        <ProxyManagerTab
          entries={currentVersion.entries}
          allTeachers={teachers}
          timeSlots={timeSlots}
          sections={sections}
          onAssignProxy={(entryId, proxyTeacher, reason, notes) => {
            if (onAssignProxy) {
              onAssignProxy(entryId, proxyTeacher, reason, notes);
            }
          }}
          userRole="ROLE_ADMIN"
        />
      )}

      {activeView === 'AUDIT_DIFF' && (
        <TimetableDiffViewer
          currentVersion={currentVersion}
          timeSlots={timeSlots}
        />
      )}

      {activeView === 'CONFLICTS' && (
        <ConflictReviewPanel
          conflicts={currentVersion.conflicts}
          optimizationScore={currentVersion.optimizationScore}
          sections={sections}
          onOpenGeneratorForSection={handleOpenGeneratorForSection}
          onAutoResolveSection={(sectionId) => {
            if (onGenerateSectionTimetable) {
              onGenerateSectionTimetable([sectionId]);
            }
          }}
        />
      )}

      {activeView === 'TEACHER_TIMING' && (
        <TeacherScheduleAnalyzer
          teachers={teachers}
          entries={currentVersion.entries}
          timeSlots={timeSlots}
          sections={sections}
        />
      )}

      {activeView === 'RESOURCES' && (
        <ResourceManagement
          courses={courses}
          sections={sections}
          subjects={subjects}
          teachers={teachers}
          rooms={rooms}
          timeSlots={timeSlots}
          onAddSubject={onAddSubject}
          onAddTeacher={onAddTeacher}
          onAddRoom={onAddRoom}
          onAddSection={onAddSection}
        />
      )}

      {/* Generator Modal */}
      <GenerateTimetableModal
        isOpen={isGenerateOpen}
        onClose={() => {
          setIsGenerateOpen(false);
          setPreselectedSectionIdForGenerator(undefined);
        }}
        sections={sections}
        subjects={subjects}
        teachers={teachers}
        rooms={rooms}
        timeSlots={timeSlots}
        existingEntries={currentVersion.entries}
        initialSelectedSectionId={preselectedSectionIdForGenerator}
        onGenerateFull={(ay, st) => {
          onGenerateTimetable(ay, st);
          setIsGenerateOpen(false);
        }}
        onGenerateSection={(targetSecIds, shiftPref, ay, st) => {
          if (onGenerateSectionTimetable) {
            onGenerateSectionTimetable(targetSecIds, shiftPref, ay, st);
          }
          setIsGenerateOpen(false);
        }}
      />

      {/* Change History Audit Modal */}
      <ChangeHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        changeLogs={currentVersion.changeLogs}
        currentVersion={currentVersion.versionNumber}
      />

      {/* Adjust / Edit Slot Modal */}
      <EditEntryModal
        entry={editingEntry}
        teachers={teachers}
        rooms={rooms}
        timeSlots={timeSlots}
        onClose={() => setEditingEntry(null)}
        onSave={(updatedEntry, reason, changeType) => {
          onUpdateEntry(updatedEntry, reason, changeType);
        }}
      />

      {/* Official Timetable Publication & Export Modal */}
      <TimetableExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        entries={currentVersion.entries}
        sections={sections}
        teachers={teachers}
        timeSlots={timeSlots}
        academicYear={currentVersion.academicYear}
        versionNumber={currentVersion.versionNumber}
      />
    </div>
  );
};
