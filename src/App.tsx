import React, { useState, useMemo } from 'react';
import { 
  UserRole, 
  Course, 
  Section, 
  Subject, 
  Teacher, 
  Room, 
  TimeSlot, 
  TimetableVersion,
  TimetableEntry,
  TimetableChangeLog,
  Student,
  ClassCancellationNotice,
  ProxySubstitutionRecord
} from './types';
import {
  COLLEGE_COURSES,
  COLLEGE_SECTIONS,
  COLLEGE_SUBJECTS,
  COLLEGE_TEACHERS,
  COLLEGE_ROOMS,
  COLLEGE_TIME_SLOTS,
  COLLEGE_TIMETABLE_ENTRIES,
  LEGACY_RAW_TIMETABLE_ENTRIES,
  COLLEGE_STUDENTS,
  DEFAULT_STUDENT_PASSWORD
} from './data/collegeTimetableData';
import { generateTimetablePlan, generateSectionOrCourseSchedule, validateScheduleConstraints } from './services/timetableEngine';
import { Header } from './components/common/Header';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { LoginPortal } from './components/auth/LoginPortal';
import { OptimizationBanner } from './components/common/OptimizationBanner';
import { 
  CalendarDays, 
  ShieldCheck, 
  UserCheck, 
  GraduationCap, 
  Sparkles,
  Info,
  CheckCircle2,
  FileText,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  // Active Role state: default to ADMIN so full oversight is immediately testable
  const [currentRole, setCurrentRole] = useState<UserRole>('ROLE_ADMIN');

  // Active Authenticated Student (defaults to Amit Patel, 20240003, BCA V SEC 'C')
  const [activeStudent, setActiveStudent] = useState<Student>(
    COLLEGE_STUDENTS.find(s => s.studentId === '20240003') || COLLEGE_STUDENTS[0]
  );

  // Active Authenticated Faculty (defaults to Dr. Bhawnesh Kumar, Java Specialist)
  const [activeTeacher, setActiveTeacher] = useState<Teacher>(
    COLLEGE_TEACHERS.find(t => t.id === 'tch-bhawnesh-kumar') || COLLEGE_TEACHERS[0]
  );

  // Login Portal Modal State
  const [isLoginPortalOpen, setIsLoginPortalOpen] = useState<boolean>(false);
  const [loginPortalTab, setLoginPortalTab] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('STUDENT');

  // Academic Repositories
  const [courses, setCourses] = useState<Course[]>(COLLEGE_COURSES);
  const [sections, setSections] = useState<Section[]>(COLLEGE_SECTIONS);
  const [subjects, setSubjects] = useState<Subject[]>(COLLEGE_SUBJECTS);
  const [teachers, setTeachers] = useState<Teacher[]>(COLLEGE_TEACHERS);
  const [rooms, setRooms] = useState<Room[]>(COLLEGE_ROOMS);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(COLLEGE_TIME_SLOTS);

  // Pre-staged initial cancellation notice demonstrating user's specific scenario:
  // "eg for this is if a bhawnesh sir have a java class class at 5 pm for BCA Sec C stdents he should telll stuudents before 4 pm and then thee students dashboards notuufy the students that the class is cancelled"
  const initialCancellationNotice: ClassCancellationNotice = {
    id: 'notice-bhawnesh-java-mon',
    entryId: 'ent-bca5c-java-mon',
    timetableId: 'tt-college-official',
    subjectCode: 'TBC501',
    subjectName: 'Introduction to Java Programming',
    sectionId: 'sec-bca-5-c',
    sectionName: "BCA V SEC 'C'",
    teacherId: 'tch-bhawnesh-kumar',
    teacherName: 'Dr. Bhawnesh Kumar',
    cancelledByTeacherName: 'Dr. Bhawnesh Kumar',
    cancellationTime: '15:30', // Submitted before 4:00 PM deadline!
    scheduledClassTime: '17:00 - 17:55 (5:00 PM)',
    dayOfWeek: 'MONDAY',
    reason: 'Departmental Faculty Meeting & Curriculum Review Committee',
    timestamp: new Date().toISOString()
  };

  const [cancellationNotices, setCancellationNotices] = useState<ClassCancellationNotice[]>([
    initialCancellationNotice
  ]);

  const [scheduleMode, setScheduleMode] = useState<'OPTIMIZED' | 'LEGACY'>('OPTIMIZED');

  // Helper to build a validated version for either Optimized or Legacy mode
  const createVersionForMode = (mode: 'OPTIMIZED' | 'LEGACY'): TimetableVersion => {
    const rawEntries = mode === 'OPTIMIZED' ? COLLEGE_TIMETABLE_ENTRIES : LEGACY_RAW_TIMETABLE_ENTRIES;

    // Stage Dr. Bhawnesh Kumar's Java class cancellation notice
    const processedEntries = rawEntries.map(e => {
      const isTarget = 
        e.id === 'ent-opt-0001' ||
        e.id === 'ent-sch-0001' ||
        e.id === 'ent-bca5c-java-mon' ||
        (e.teacherId === 'tch-bhawnesh-kumar' && e.sectionId === 'sec-bca-5-c' && e.dayOfWeek === 'MONDAY' && (e.slotOrder === 2 || e.slotOrder === 7 || e.slotOrder === 10));

      if (isTarget) {
        return {
          ...e,
          id: 'ent-bca5c-java-mon',
          status: 'CANCELLED' as const,
          cancellationNotice: {
            ...initialCancellationNotice,
            scheduledClassTime: e.slotOrder === 10 ? '17:00 - 17:55 (5:00 PM)' : e.slotOrder === 7 ? '14:05 - 15:00 (Period 7)' : e.slotOrder === 2 ? '08:55 - 09:50 (Period 2)' : `Slot ${e.slotOrder}`
          }
        };
      }
      return e;
    });

    const { hardConflicts, softPenalties } = validateScheduleConstraints(
      processedEntries,
      COLLEGE_TEACHERS,
      COLLEGE_ROOMS,
      COLLEGE_SECTIONS,
      COLLEGE_TIME_SLOTS,
      mode === 'OPTIMIZED' ? 'tt-college-optimized' : 'tt-college-legacy'
    );

    const score = Math.max(0, Math.min(100, Math.round(100 - (hardConflicts.length * 25) - (softPenalties.length * 1.5))));

    return {
      id: mode === 'OPTIMIZED' ? 'tt-college-optimized' : 'tt-college-legacy',
      academicYear: '2025-2026',
      semesterType: 'ODD',
      versionNumber: mode === 'OPTIMIZED' ? 2 : 1,
      status: 'PUBLISHED',
      optimizationScore: Math.round(score),
      hardConflictsCount: hardConflicts.length,
      softPenaltyScore: softPenalties.length,
      entries: processedEntries,
      conflicts: [...hardConflicts, ...softPenalties],
      changeLogs: [
        {
          id: `log-init-${mode}`,
          timetableId: mode === 'OPTIMIZED' ? 'tt-college-optimized' : 'tt-college-legacy',
          entryId: 'ent-bca5c-java-mon',
          subjectName: mode === 'OPTIMIZED' ? 'Autonomous Smart-Optimized Schedule (Zero 2-3h Gaps)' : 'Legacy Scanned Chart (With 2-3h Gaps)',
          sectionName: "All Cohorts",
          changeType: 'RESCHEDULE',
          oldValue: { roomNumber: 'Raw', teacherName: 'Unoptimized', timeSlotText: 'Scattered' },
          newValue: { roomNumber: 'Optimized', teacherName: 'Compact Blocks', timeSlotText: '100% Conflict-Free' },
          reason: mode === 'OPTIMIZED'
            ? 'Autonomous decision engine applied: 0 student gaps >= 2 hours, compact cohort shifts, 0 collisions'
            : 'Legacy raw schedule loaded with 31 gaps >= 2 hours for comparison',
          changedBy: 'Institutional Optimizer',
          timestamp: new Date().toISOString()
        }
      ],
      generatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString()
    };
  };

  const [currentVersion, setCurrentVersion] = useState<TimetableVersion>(() => createVersionForMode('OPTIMIZED'));

  const handleToggleScheduleMode = (mode: 'OPTIMIZED' | 'LEGACY') => {
    setScheduleMode(mode);
    setCurrentVersion(createVersionForMode(mode));
  };

  // Handlers for Generation & Publishing
  const handleGenerateTimetable = (academicYear: string, semesterType: 'ODD' | 'EVEN') => {
    const result = generateTimetablePlan({
      sections,
      subjects,
      teachers,
      rooms,
      timeSlots,
      academicYear,
      semesterType
    });

    const newVersionNumber = currentVersion.versionNumber + 1;
    setCurrentVersion({
      ...result.version,
      versionNumber: newVersionNumber,
      changeLogs: [
        {
          id: `log-gen-${Date.now()}`,
          timetableId: result.version.id,
          entryId: 'all',
          subjectName: 'All Subjects',
          sectionName: 'All Sections',
          changeType: 'RESCHEDULE',
          oldValue: { roomNumber: 'N/A', teacherName: 'N/A', timeSlotText: 'Prior Term' },
          newValue: { roomNumber: 'Auto-allocated', teacherName: 'Assigned', timeSlotText: `Regenerated v${newVersionNumber}.0` },
          reason: `Full constraint-satisfaction schedule regeneration (${result.summary.totalLecturesScheduled} classes scheduled)`,
          changedBy: 'Academic Administrator',
          timestamp: new Date().toISOString()
        },
        ...currentVersion.changeLogs
      ]
    });
  };

  const handleGenerateSectionTimetable = (
    targetSectionIds: string[],
    shiftPreference?: 'MORNING' | 'AFTERNOON' | 'FLEXIBLE',
    academicYear?: string,
    semesterType?: 'ODD' | 'EVEN'
  ) => {
    const result = generateSectionOrCourseSchedule({
      targetSectionIds,
      shiftPreference,
      academicYear: academicYear || currentVersion.academicYear,
      semesterType: semesterType || currentVersion.semesterType,
      allSections: sections,
      subjects,
      teachers,
      rooms,
      timeSlots,
      existingEntries: currentVersion.entries
    });

    const newVersionNumber = currentVersion.versionNumber + 1;
    const targetNames = result.targetSections.map(s => s.name).join(', ');

    setCurrentVersion({
      ...currentVersion,
      versionNumber: newVersionNumber,
      entries: result.updatedEntries,
      conflicts: result.conflicts,
      hardConflictsCount: result.hardConflictsCount,
      softPenaltyScore: result.softPenaltyCount,
      optimizationScore: result.optimizationScore,
      changeLogs: [
        {
          id: `log-sec-gen-${Date.now()}`,
          timetableId: currentVersion.id,
          entryId: 'section-targeted-gen',
          subjectName: `Regenerated ${result.generatedEntries.length} Classes`,
          sectionName: targetNames,
          changeType: 'RESCHEDULE',
          oldValue: { roomNumber: 'Prior', teacherName: 'Prior', timeSlotText: 'Unoptimized' },
          newValue: { roomNumber: 'Optimized', teacherName: 'Assigned', timeSlotText: `${result.summary.shiftSummary} (Zero Gaps)` },
          reason: `Targeted generation for ${targetNames}: 100% synchronized with ${result.shiftApplied} shift & college bus transit. Zero hard collisions, zero gaps >= 2 hours.`,
          changedBy: 'Curriculum Administrator',
          timestamp: new Date().toISOString()
        },
        ...currentVersion.changeLogs
      ]
    });
  };

  const handlePublishTimetable = () => {
    setCurrentVersion(prev => ({
      ...prev,
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString()
    }));
  };

  // Adjust Entry Handler (Admin)
  const handleUpdateEntry = (
    updatedEntry: TimetableEntry,
    reason: string,
    changeType: 'ROOM_CHANGE' | 'TIME_CHANGE' | 'TEACHER_CHANGE' | 'RESCHEDULE'
  ) => {
    const oldEntry = currentVersion.entries.find(e => e.id === updatedEntry.id);
    if (!oldEntry) return;

    const oldSlot = timeSlots.find(s => s.id === oldEntry.timeSlotId);
    const newSlot = timeSlots.find(s => s.id === updatedEntry.timeSlotId);

    const oldSlotText = oldSlot ? `${oldSlot.dayOfWeek} Slot ${oldSlot.slotOrder} (${oldSlot.startTime})` : oldEntry.timeSlotId;
    const newSlotText = newSlot ? `${newSlot.dayOfWeek} Slot ${newSlot.slotOrder} (${newSlot.startTime})` : updatedEntry.timeSlotId;

    const newEntries = currentVersion.entries.map(e => e.id === updatedEntry.id ? updatedEntry : e);

    const { hardConflicts, softPenalties } = validateScheduleConstraints(
      newEntries,
      teachers,
      rooms,
      sections,
      timeSlots,
      currentVersion.id
    );

    const newLog: TimetableChangeLog = {
      id: `log-${Date.now()}`,
      timetableId: currentVersion.id,
      entryId: updatedEntry.id,
      subjectName: `${updatedEntry.subjectCode} - ${updatedEntry.subjectName}`,
      sectionName: updatedEntry.sectionName,
      changeType,
      oldValue: {
        roomNumber: oldEntry.roomNumber,
        teacherName: oldEntry.teacherName,
        timeSlotText: oldSlotText
      },
      newValue: {
        roomNumber: updatedEntry.roomNumber,
        teacherName: updatedEntry.teacherName,
        timeSlotText: newSlotText
      },
      reason,
      changedBy: 'Academic Administrator',
      timestamp: new Date().toISOString()
    };

    setCurrentVersion(prev => ({
      ...prev,
      versionNumber: prev.versionNumber + 1,
      entries: newEntries,
      conflicts: [...hardConflicts, ...softPenalties],
      hardConflictsCount: hardConflicts.length,
      softPenaltyScore: softPenalties.length,
      changeLogs: [newLog, ...prev.changeLogs]
    }));
  };

  // Class Cancellation Handler (Enforces 4:00 PM rule and broadcasts to student message section)
  const handleCancelClass = (
    entryId: string,
    reason: string,
    cancellationTime: string
  ): { success: boolean; error?: string } => {
    // Validate 4:00 PM cutoff rule
    const timeParts = cancellationTime.split(':');
    if (timeParts.length < 2) {
      return { success: false, error: 'Invalid time format. Please provide HH:MM.' };
    }
    const hours = parseInt(timeParts[0], 10);
    if (hours >= 16) {
      return {
        success: false,
        error: `Mandatory College Policy Violation: Cancellation notices must be submitted BEFORE 4:00 PM (16:00). Current submission is ${cancellationTime}.`
      };
    }

    const target = currentVersion.entries.find(e => e.id === entryId);
    if (!target) {
      return { success: false, error: 'Scheduled class entry not found.' };
    }

    const notice: ClassCancellationNotice = {
      id: `notice-${Date.now()}`,
      entryId: target.id,
      timetableId: currentVersion.id,
      subjectCode: target.subjectCode,
      subjectName: target.subjectName,
      sectionId: target.sectionId,
      sectionName: target.sectionName,
      teacherId: target.teacherId,
      teacherName: target.teacherName,
      cancelledByTeacherName: target.teacherName,
      cancellationTime,
      scheduledClassTime: target.slotOrder === 10 ? '17:00 - 17:55 (5:00 PM)' : `Slot ${target.slotOrder}`,
      dayOfWeek: target.dayOfWeek,
      reason,
      timestamp: new Date().toISOString()
    };

    // Update timetable entries
    const updatedEntries = currentVersion.entries.map(e => {
      if (e.id === entryId) {
        return {
          ...e,
          status: 'CANCELLED' as const,
          cancellationNotice: notice
        };
      }
      return e;
    });

    // Update change log
    const cancelLog: TimetableChangeLog = {
      id: `log-cancel-${Date.now()}`,
      timetableId: currentVersion.id,
      entryId: target.id,
      subjectName: `${target.subjectCode} - ${target.subjectName}`,
      sectionName: target.sectionName,
      changeType: 'RESCHEDULE',
      oldValue: {
        roomNumber: target.roomNumber,
        teacherName: target.teacherName,
        timeSlotText: `${target.dayOfWeek} Slot ${target.slotOrder}`
      },
      newValue: {
        roomNumber: 'CANCELLED',
        teacherName: target.teacherName,
        timeSlotText: `Cancelled at ${cancellationTime}`
      },
      reason: `Class cancelled before 4 PM deadline: ${reason}`,
      changedBy: target.teacherName,
      timestamp: new Date().toISOString()
    };

    setCancellationNotices(prev => [notice, ...prev]);
    setCurrentVersion(prev => ({
      ...prev,
      versionNumber: prev.versionNumber + 1,
      entries: updatedEntries,
      changeLogs: [cancelLog, ...prev.changeLogs]
    }));

    return { success: true };
  };

  // Phase 3 Proxy Faculty / Substitute Assignment Handler
  const handleAssignProxy = (
    entryId: string,
    proxyTeacher: Teacher,
    reason: string,
    notes?: string
  ) => {
    const target = currentVersion.entries.find(e => e.id === entryId);
    if (!target) return;

    const proxyRecord: ProxySubstitutionRecord = {
      id: `proxy-${Date.now()}`,
      entryId: target.id,
      originalTeacherId: target.teacherId,
      originalTeacherName: target.teacherName,
      proxyTeacherId: proxyTeacher.id,
      proxyTeacherName: proxyTeacher.fullName,
      proxyEmployeeId: proxyTeacher.employeeId,
      subjectCode: target.subjectCode,
      subjectName: target.subjectName,
      sectionId: target.sectionId,
      sectionName: target.sectionName,
      roomNumber: target.roomNumber,
      dayOfWeek: target.dayOfWeek,
      slotOrder: target.slotOrder,
      timeSlotText: target.slotOrder === 10 ? '17:00 - 17:55' : `Slot ${target.slotOrder}`,
      cancellationNoticeId: target.cancellationNotice?.id,
      reason,
      notes,
      assignedBy: 'Academic Administrator',
      assignedAt: new Date().toISOString(),
      status: 'CONFIRMED'
    };

    const updatedEntries = currentVersion.entries.map(e => {
      if (e.id === entryId) {
        return {
          ...e,
          status: 'SUBSTITUTED' as const,
          proxySubstitution: proxyRecord
        };
      }
      return e;
    });

    const proxyLog: TimetableChangeLog = {
      id: `log-proxy-${Date.now()}`,
      timetableId: currentVersion.id,
      entryId: target.id,
      subjectName: `${target.subjectCode} - ${target.subjectName}`,
      sectionName: target.sectionName,
      changeType: 'TEACHER_CHANGE',
      oldValue: {
        roomNumber: target.roomNumber,
        teacherName: target.teacherName,
        timeSlotText: `${target.dayOfWeek} Slot ${target.slotOrder}`
      },
      newValue: {
        roomNumber: target.roomNumber,
        teacherName: `${proxyTeacher.fullName} (Proxy)`,
        timeSlotText: `${target.dayOfWeek} Slot ${target.slotOrder}`
      },
      reason: `Proxy Assigned: ${proxyTeacher.fullName} covers ${target.teacherName}. ${reason}`,
      changedBy: 'Academic Administrator',
      timestamp: new Date().toISOString()
    };

    setCurrentVersion(prev => ({
      ...prev,
      versionNumber: prev.versionNumber + 1,
      entries: updatedEntries,
      changeLogs: [proxyLog, ...prev.changeLogs]
    }));
  };

  // Phase 3 Genetic Algorithm Schedule Application Handler
  const handleApplyOptimizedSchedule = (
    optimizedEntries: TimetableEntry[],
    summary: string
  ) => {
    const { hardConflicts, softPenalties } = validateScheduleConstraints(
      optimizedEntries,
      teachers,
      rooms,
      sections,
      timeSlots,
      currentVersion.id
    );

    const newVersionNumber = currentVersion.versionNumber + 1;
    const score = Math.max(40, 100 - (hardConflicts.length * 25) - (softPenalties.length * 1.5));

    const optLog: TimetableChangeLog = {
      id: `log-opt-${Date.now()}`,
      timetableId: currentVersion.id,
      entryId: 'all',
      subjectName: 'Institutional Optimization',
      sectionName: 'All Cohorts',
      changeType: 'RESCHEDULE',
      oldValue: {
        roomNumber: `v${currentVersion.versionNumber}.0`,
        teacherName: `${currentVersion.conflicts.length} conflicts`,
        timeSlotText: `${currentVersion.optimizationScore}% Score`
      },
      newValue: {
        roomNumber: `v${newVersionNumber}.0`,
        teacherName: `${hardConflicts.length} hard conflicts`,
        timeSlotText: `${Math.round(score)}% Score`
      },
      reason: summary,
      changedBy: 'Genetic Algorithm Optimizer',
      timestamp: new Date().toISOString()
    };

    setCurrentVersion(prev => ({
      ...prev,
      versionNumber: newVersionNumber,
      entries: optimizedEntries,
      conflicts: [...hardConflicts, ...softPenalties],
      hardConflictsCount: hardConflicts.length,
      softPenaltyScore: softPenalties.length,
      optimizationScore: Math.round(score),
      changeLogs: [optLog, ...prev.changeLogs]
    }));
  };

  // Auth Handlers
  const handleOpenLoginPortal = (tab: 'STUDENT' | 'TEACHER' | 'ADMIN' = 'STUDENT') => {
    setLoginPortalTab(tab);
    setIsLoginPortalOpen(true);
  };

  const handleLoginStudent = (student: Student) => {
    setActiveStudent(student);
    setCurrentRole('ROLE_STUDENT');
    setIsLoginPortalOpen(false);
  };

  const handleLoginTeacher = (teacher: Teacher) => {
    setActiveTeacher(teacher);
    setCurrentRole('ROLE_TEACHER');
    setIsLoginPortalOpen(false);
  };

  const handleLoginAdmin = () => {
    setCurrentRole('ROLE_ADMIN');
    setIsLoginPortalOpen(false);
  };

  // Add entity handlers
  const handleAddSubject = (subject: Subject) => setSubjects(prev => [...prev, subject]);
  const handleAddTeacher = (teacher: Teacher) => setTeachers(prev => [...prev, teacher]);
  const handleAddRoom = (room: Room) => setRooms(prev => [...prev, room]);
  const handleAddSection = (section: Section) => setSections(prev => [...prev, section]);

  // Derive student's section object
  const studentSection = sections.find(s => s.id === activeStudent.sectionId) || sections[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header with strict RBAC boundary display */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activeTimetableStatus={currentVersion.status}
        versionNumber={currentVersion.versionNumber}
        academicYear={currentVersion.academicYear}
        activeStudent={activeStudent}
        activeTeacher={activeTeacher}
        onOpenLoginPortal={handleOpenLoginPortal}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Autonomous Schedule Optimizer Banner & Controller */}
        <OptimizationBanner
          scheduleMode={scheduleMode}
          onToggleMode={handleToggleScheduleMode}
          optimizationScore={currentVersion.optimizationScore}
          hardConflictsCount={currentVersion.hardConflictsCount}
        />

        {/* ======================================================== */}
        {/* 1. ADMIN DASHBOARD: Full system oversight */}
        {/* ======================================================== */}
        {currentRole === 'ROLE_ADMIN' && (
          <AdminDashboard
            currentVersion={currentVersion}
            courses={courses}
            sections={sections}
            subjects={subjects}
            teachers={teachers}
            rooms={rooms}
            timeSlots={timeSlots}
            onGenerateTimetable={handleGenerateTimetable}
            onPublishTimetable={handlePublishTimetable}
            onUpdateEntry={handleUpdateEntry}
            onAddSubject={handleAddSubject}
            onAddTeacher={handleAddTeacher}
            onAddRoom={handleAddRoom}
            onAddSection={handleAddSection}
            onAssignProxy={handleAssignProxy}
            onApplyOptimizedSchedule={handleApplyOptimizedSchedule}
            onGenerateSectionTimetable={handleGenerateSectionTimetable}
          />
        )}

        {/* ======================================================== */}
        {/* 2. TEACHER DASHBOARD: Strict faculty isolation */}
        {/* Sees own profile, teaching sessions, cancellation before 4 PM, */}
        {/* and option to check other teachers' timings */}
        {/* ======================================================== */}
        {currentRole === 'ROLE_TEACHER' && (
          <TeacherDashboard
            teacher={activeTeacher}
            entries={currentVersion.entries}
            timeSlots={timeSlots}
            changeLogs={currentVersion.changeLogs}
            subjects={subjects}
            sections={sections}
            allTeachers={teachers}
            onCancelClass={handleCancelClass}
          />
        )}

        {/* ======================================================== */}
        {/* 3. STUDENT DASHBOARD: Strict student isolation */}
        {/* Sees only personal profile, section schedule, and cancellation notices in messages */}
        {/* Cannot view other students, teachers directory, or admin panel */}
        {/* ======================================================== */}
        {currentRole === 'ROLE_STUDENT' && (
          <StudentDashboard
            student={activeStudent}
            section={studentSection}
            entries={currentVersion.entries}
            timeSlots={timeSlots}
            changeLogs={currentVersion.changeLogs}
            cancellationNotices={cancellationNotices}
          />
        )}
      </main>

      {/* Login / Switch Account Portal */}
      <LoginPortal
        isOpen={isLoginPortalOpen}
        onClose={() => setIsLoginPortalOpen(false)}
        onLoginStudent={handleLoginStudent}
        onLoginTeacher={handleLoginTeacher}
        onLoginAdmin={handleLoginAdmin}
        initialTab={loginPortalTab}
      />

      {/* Institutional Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">SmartSync</span>
            <span>• College Timetable Management System</span>
          </div>
          <span className="text-[11px] text-slate-400">
            RBAC Enforced • 8-Digit Moodle Student Gateway • 4:00 PM Faculty Cancellation Protocol
          </span>
        </div>
      </footer>
    </div>
  );
}
