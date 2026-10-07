/**
 * SmartSync: College Timetable Management System
 * Core TypeScript Data Contracts & Entities
 */

export type UserRole = 'ROLE_ADMIN' | 'ROLE_TEACHER' | 'ROLE_STUDENT';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  relatedEntityId?: string; // teacherId if teacher, sectionId if student
}

export interface Course {
  id: string;
  code: string;           // e.g. 'BCA', 'BTECH_CSE', 'BBA'
  name: string;           // e.g. 'Bachelor of Computer Applications'
  department: string;
  durationYears: number;
  totalSemesters: number;
  isActive: boolean;
}

export interface Section {
  id: string;
  courseId: string;
  courseCode: string;
  semester: number;
  name: string;           // e.g. 'Section A'
  academicYear: string;   // e.g. '2026-2027'
  studentCount: number;
  shift?: 'MORNING' | 'AFTERNOON' | 'FLEXIBLE';
  shiftTimingLabel?: string;
  busArrival?: string;
  busDeparture?: string;
}

export type RoomType = 'LECTURE_HALL' | 'COMPUTER_LAB' | 'ELECTRONICS_LAB' | 'SEMINAR_HALL';

export interface Subject {
  id: string;
  courseId: string;
  courseCode: string;
  code: string;           // e.g. 'BCA301'
  name: string;           // e.g. 'Data Structures & Algorithms'
  semester: number;
  credits: number;
  weeklyLectureCount: number;
  weeklyLabCount: number;
  requiresLab: boolean;
  preferredRoomType: RoomType;
}

export interface Teacher {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  designation: string;
  maxDailyLectures: number;
  qualifiedSubjectCodes: string[];
  unavailableSlotIds: string[]; // Slot IDs when teacher cannot teach
}

export interface Room {
  id: string;
  roomNumber: string;     // e.g. 'LH-101', 'LAB-201'
  building: string;
  floorLevel: number;
  roomType: RoomType;
  capacity: number;
  isAvailable: boolean;
}

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export interface TimeSlot {
  id: string;
  dayOfWeek: DayOfWeek;
  slotOrder: number;      // 1, 2, 3, 4, 5, 6
  startTime: string;     // '09:00'
  endTime: string;       // '09:55'
  isBreak: boolean;
  breakLabel?: string;   // 'Lunch Recess'
  academicYear: string;
}

export type EntryStatus = 'NORMAL' | 'CHANGED' | 'CONFLICT' | 'PENDING' | 'CANCELLED' | 'SUBSTITUTED';
export type TimetableStatus = 'DRAFT' | 'GENERATED' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED';

export interface ProxySubstitutionRecord {
  id: string;
  entryId: string;
  originalTeacherId: string;
  originalTeacherName: string;
  proxyTeacherId: string;
  proxyTeacherName: string;
  proxyEmployeeId?: string;
  subjectCode: string;
  subjectName: string;
  sectionId: string;
  sectionName: string;
  roomNumber: string;
  dayOfWeek: DayOfWeek;
  slotOrder: number;
  timeSlotText: string;
  cancellationNoticeId?: string;
  reason: string;
  notes?: string;
  assignedBy: string;
  assignedAt: string;
  status: 'ASSIGNED' | 'CONFIRMED' | 'COMPLETED';
}

export interface GeneticAlgorithmConfig {
  populationSize: number;
  generations: number;
  mutationRate: number;
  crossoverRate: number;
  hardConstraintWeight: number;
  gapPenaltyWeight: number;
  consecutivePenaltyWeight: number;
  workloadBalanceWeight: number;
}

export interface OptimizationGenerationMetric {
  generation: number;
  bestFitness: number;
  avgFitness: number;
  hardViolations: number;
  softPenalties: number;
}

export interface OptimizationRunResult {
  runId: string;
  executedAt: string;
  durationMs: number;
  initialConflicts: number;
  finalConflicts: number;
  initialScore: number;
  finalScore: number;
  history: OptimizationGenerationMetric[];
  status: 'CONVERGED' | 'COMPLETED' | 'PARTIAL';
}

export interface TimetableDiffItem {
  id: string;
  entryId: string;
  subjectCode: string;
  subjectName: string;
  sectionName: string;
  changeType: 'SLOT_MOVED' | 'ROOM_CHANGED' | 'TEACHER_CHANGED' | 'CANCELLED' | 'SUBSTITUTED' | 'UNCHANGED';
  from: {
    day: DayOfWeek;
    slot: number;
    room: string;
    teacher: string;
    status: EntryStatus;
  };
  to: {
    day: DayOfWeek;
    slot: number;
    room: string;
    teacher: string;
    status: EntryStatus;
  };
  description: string;
}

export interface TimetableVersionComparison {
  baseVersionNumber: number;
  targetVersionNumber: number;
  totalChanges: number;
  slotsMoved: number;
  roomsChanged: number;
  teachersChanged: number;
  cancellations: number;
  substitutions: number;
  conflictDelta: number;
  diffItems: TimetableDiffItem[];
}

export interface Student {
  id: string;
  studentId: string;       // 8-digit Student ID (e.g. '20240003')
  fullName: string;
  email: string;
  courseCode: string;      // e.g. 'BCA'
  semester: number;        // e.g. 5
  sectionId: string;       // e.g. 'sec-bca-5-c'
  sectionName: string;     // e.g. "BCA V SEC 'C'"
  rollNumber: string;
  avatarInitials: string;
}

export interface ClassCancellationNotice {
  id: string;
  entryId: string;
  timetableId?: string;
  subjectCode: string;
  subjectName: string;
  sectionId: string;
  sectionName: string;
  teacherId: string;
  teacherName: string;
  cancelledByTeacherName?: string;
  timeSlotText?: string;     // e.g. "05:00 PM - 05:55 PM"
  scheduledClassTime?: string;
  dayOfWeek: DayOfWeek;
  slotOrder?: number;
  roomNumber?: string;
  reason: string;
  cancellationNoticeTime?: string; // e.g. "03:45 PM" (or 15:45)
  cancellationTime?: string;
  submittedBefore4PM?: boolean;
  policyStatus?: 'ON_TIME_ADVANCE_NOTICE' | 'LATE_NOTICE_EMERGENCY';
  createdAt?: string;
  timestamp?: string;
}

export interface TimetableEntry {
  id: string;
  timetableId: string;
  sectionId: string;
  sectionName: string;
  courseCode: string;
  semester: number;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  roomId: string;
  roomNumber: string;
  roomType: RoomType;
  timeSlotId: string;
  dayOfWeek: DayOfWeek;
  slotOrder: number;
  isLab: boolean;
  status: EntryStatus;
  changeNote?: string;
  cancellationNotice?: ClassCancellationNotice;
  proxySubstitution?: ProxySubstitutionRecord;
}

export type ConflictSeverity = 'HARD' | 'SOFT';
export type ConflictType = 
  | 'TEACHER_DOUBLE_BOOKING'
  | 'ROOM_DOUBLE_BOOKING'
  | 'SECTION_DOUBLE_BOOKING'
  | 'CAPACITY_EXCEEDED'
  | 'LAB_MISMATCH'
  | 'TEACHER_UNAVAILABLE'
  | 'STUDENT_LONG_GAP'
  | 'FACULTY_EXCESSIVE_CONSECUTIVE'
  | 'SHIFT_TIMING_VIOLATION'
  | 'BUS_TRANSIT_MISMATCH'
  | 'DUPLICATE_SUBJECT_SAME_DAY'
  | 'TEACHER_DAILY_OVERLOAD';

export type ConflictCategory = 
  | 'COLLISION' 
  | 'TIMING_SHIFT' 
  | 'STUDENT_GAP' 
  | 'BUS_TRANSIT' 
  | 'FACILITY' 
  | 'WORKLOAD';

export interface TimetableConflict {
  id: string;
  timetableId: string;
  type: ConflictType;
  severity: ConflictSeverity;
  category?: ConflictCategory;
  description: string;
  affectedEntryIds: string[];
  involvedDay?: DayOfWeek;
  involvedSlotOrder?: number;
  sectionId?: string;
  sectionName?: string;
  courseCode?: string;
  semester?: number;
  teacherId?: string;
  recommendedAction?: string;
}

export interface TimetableChangeLog {
  id: string;
  timetableId: string;
  entryId: string;
  subjectName: string;
  sectionName: string;
  changeType: 'ROOM_CHANGE' | 'TIME_CHANGE' | 'TEACHER_CHANGE' | 'RESCHEDULE';
  oldValue: {
    roomNumber: string;
    teacherName: string;
    timeSlotText: string;
  };
  newValue: {
    roomNumber: string;
    teacherName: string;
    timeSlotText: string;
  };
  reason: string;
  changedBy: string;
  timestamp: string;
}

export interface TimetableVersion {
  id: string;
  academicYear: string;
  semesterType: 'ODD' | 'EVEN';
  versionNumber: number;
  status: TimetableStatus;
  generatedAt: string;
  publishedAt?: string;
  optimizationScore: number; // 0 to 100
  hardConflictsCount: number;
  softPenaltyScore: number;
  entries: TimetableEntry[];
  conflicts: TimetableConflict[];
  changeLogs: TimetableChangeLog[];
}
