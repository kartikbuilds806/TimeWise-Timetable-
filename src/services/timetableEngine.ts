/**
 * SmartSync Constraint-Based Timetable Generator & Conflict Detection Engine
 * 
 * Implements deterministic Constraint Satisfaction Problem (CSP) heuristics
 * and soft constraint optimization scoring.
 * Strictly enforces Hard Constraints (zero collisions) and evaluates Soft Penalties.
 */

import {
  Section,
  Subject,
  Teacher,
  Room,
  TimeSlot,
  TimetableEntry,
  TimetableConflict,
  TimetableVersion,
  DayOfWeek
} from '../types';

export interface GenerationConfig {
  sections: Section[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  timeSlots: TimeSlot[];
  academicYear: string;
  semesterType: 'ODD' | 'EVEN';
  allowSoftGaps?: boolean;
}

export interface GenerationResult {
  version: TimetableVersion;
  success: boolean;
  hardConflicts: TimetableConflict[];
  softPenalties: TimetableConflict[];
  summary: {
    totalLecturesScheduled: number;
    hardConflictCount: number;
    softPenaltyCount: number;
    optimizationScore: number;
  };
}

/**
 * Validates a list of timetable entries against all Hard and Soft Constraints.
 */
export function validateScheduleConstraints(
  entries: TimetableEntry[],
  teachers: Teacher[],
  rooms: Room[],
  sections: Section[],
  timeSlots: TimeSlot[],
  timetableId: string = 'tt-active'
): { hardConflicts: TimetableConflict[]; softPenalties: TimetableConflict[] } {
  const hardConflicts: TimetableConflict[] = [];
  const softPenalties: TimetableConflict[] = [];

  // Group entries by timeSlotId for concurrent collision checks
  const slotGroups: { [slotId: string]: TimetableEntry[] } = {};
  entries.forEach(entry => {
    if (!slotGroups[entry.timeSlotId]) {
      slotGroups[entry.timeSlotId] = [];
    }
    slotGroups[entry.timeSlotId].push(entry);
  });

  // Check 1: Concurrent Collision Hard Constraints
  Object.entries(slotGroups).forEach(([slotId, slotEntries]) => {
    const slot = timeSlots.find(s => s.id === slotId);
    const dayLabel = slot ? slot.dayOfWeek : 'Scheduled Slot';
    const orderLabel = slot ? `Period ${slot.slotOrder} (${slot.startTime}-${slot.endTime})` : slotId;

    // 1A. Teacher Double Booking
    const teacherMap: { [teacherId: string]: TimetableEntry[] } = {};
    slotEntries.forEach(entry => {
      if (!teacherMap[entry.teacherId]) teacherMap[entry.teacherId] = [];
      teacherMap[entry.teacherId].push(entry);
    });

    Object.entries(teacherMap).forEach(([teacherId, collisionEntries]) => {
      if (collisionEntries.length > 1) {
        const teacherName = collisionEntries[0].teacherName;
        const sectionsColliding = collisionEntries.map(e => e.sectionName).join(' & ');
        hardConflicts.push({
          id: `conf-tch-${teacherId}-${slotId}`,
          timetableId,
          type: 'TEACHER_DOUBLE_BOOKING',
          severity: 'HARD',
          category: 'COLLISION',
          teacherId,
          description: `Teacher conflict: ${teacherName} is double-booked on ${dayLabel} at ${orderLabel} across sections ${sectionsColliding}.`,
          affectedEntryIds: collisionEntries.map(e => e.id),
          involvedDay: slot?.dayOfWeek,
          involvedSlotOrder: slot?.slotOrder,
          recommendedAction: `Move one of the colliding lectures for ${teacherName} to an alternate open period.`
        });
      }
    });

    // 1B. Room Double Booking
    const roomMap: { [roomId: string]: TimetableEntry[] } = {};
    slotEntries.forEach(entry => {
      if (!roomMap[entry.roomId]) roomMap[entry.roomId] = [];
      roomMap[entry.roomId].push(entry);
    });

    Object.entries(roomMap).forEach(([roomId, collisionEntries]) => {
      if (collisionEntries.length > 1) {
        const roomNumber = collisionEntries[0].roomNumber;
        const subjectsColliding = collisionEntries.map(e => `${e.subjectCode} (${e.sectionName})`).join(' vs ');
        hardConflicts.push({
          id: `conf-rm-${roomId}-${slotId}`,
          timetableId,
          type: 'ROOM_DOUBLE_BOOKING',
          severity: 'HARD',
          category: 'COLLISION',
          description: `Room collision: ${roomNumber} is allocated to multiple simultaneous classes on ${dayLabel} at ${orderLabel}: ${subjectsColliding}.`,
          affectedEntryIds: collisionEntries.map(e => e.id),
          involvedDay: slot?.dayOfWeek,
          involvedSlotOrder: slot?.slotOrder,
          recommendedAction: `Reallocate one of the classes to an unassigned classroom with adequate seating.`
        });
      }
    });

    // 1C. Section Double Booking
    const sectionMap: { [sectionId: string]: TimetableEntry[] } = {};
    slotEntries.forEach(entry => {
      if (!sectionMap[entry.sectionId]) sectionMap[entry.sectionId] = [];
      sectionMap[entry.sectionId].push(entry);
    });

    Object.entries(sectionMap).forEach(([sectionId, collisionEntries]) => {
      if (collisionEntries.length > 1) {
        const sectionName = collisionEntries[0].sectionName;
        const subjects = collisionEntries.map(e => e.subjectName).join(' and ');
        hardConflicts.push({
          id: `conf-sec-${sectionId}-${slotId}`,
          timetableId,
          type: 'SECTION_DOUBLE_BOOKING',
          severity: 'HARD',
          category: 'COLLISION',
          sectionId,
          sectionName,
          description: `Section overlap: ${sectionName} is scheduled for multiple subjects concurrently on ${dayLabel} at ${orderLabel}: ${subjects}.`,
          affectedEntryIds: collisionEntries.map(e => e.id),
          involvedDay: slot?.dayOfWeek,
          involvedSlotOrder: slot?.slotOrder,
          recommendedAction: `Reschedule conflicting subject to an unassigned period for this cohort.`
        });
      }
    });
  });

  // Check 2: Facility Suitability, Capacity & Shift Constraints
  entries.forEach(entry => {
    const room = rooms.find(r => r.id === entry.roomId);
    const section = sections.find(s => s.id === entry.sectionId);
    const teacher = teachers.find(t => t.id === entry.teacherId);
    const slot = timeSlots.find(s => s.id === entry.timeSlotId);

    // Lab Requirement Check
    if (entry.isLab && room && room.roomType === 'LECTURE_HALL') {
      hardConflicts.push({
        id: `conf-lab-${entry.id}`,
        timetableId,
        type: 'LAB_MISMATCH',
        severity: 'HARD',
        category: 'FACILITY',
        sectionId: entry.sectionId,
        sectionName: entry.sectionName,
        courseCode: entry.courseCode,
        description: `Facility mismatch: Lab session for ${entry.subjectCode} (${entry.subjectName}) is scheduled in lecture hall ${room.roomNumber} instead of a laboratory.`,
        affectedEntryIds: [entry.id],
        involvedDay: entry.dayOfWeek,
        involvedSlotOrder: entry.slotOrder,
        recommendedAction: `Reallocate this practical session to an IT / Computer Lab (LAB1, LAB3, LAB6, or LAB7).`
      });
    }

    // Room Capacity Check
    if (room && section && section.studentCount > room.capacity) {
      hardConflicts.push({
        id: `conf-cap-${entry.id}`,
        timetableId,
        type: 'CAPACITY_EXCEEDED',
        severity: 'HARD',
        category: 'FACILITY',
        sectionId: section.id,
        sectionName: section.name,
        courseCode: section.courseCode,
        description: `Capacity exceeded: Room ${room.roomNumber} capacity (${room.capacity} seats) is insufficient for ${section.name} (${section.studentCount} students).`,
        affectedEntryIds: [entry.id],
        involvedDay: entry.dayOfWeek,
        involvedSlotOrder: entry.slotOrder,
        recommendedAction: `Shift class to a larger lecture hall (e.g., LT3, LT4, LT5 with 80 seats).`
      });
    }

    // Teacher Availability Check
    if (teacher && teacher.unavailableSlotIds.includes(entry.timeSlotId)) {
      hardConflicts.push({
        id: `conf-avail-${entry.id}`,
        timetableId,
        type: 'TEACHER_UNAVAILABLE',
        severity: 'HARD',
        category: 'WORKLOAD',
        teacherId: teacher.id,
        description: `Availability violation: ${teacher.fullName} is scheduled on ${entry.dayOfWeek} at Slot ${entry.slotOrder}, which is marked as unavailable.`,
        affectedEntryIds: [entry.id],
        involvedDay: entry.dayOfWeek,
        involvedSlotOrder: entry.slotOrder,
        recommendedAction: `Move to a time slot when ${teacher.fullName} is marked available.`
      });
    }

    // Check 2B: Cohort Shift & College Bus Timing Compliance
    // - Afternoon Shift (Sem 3, 4, 5, 6): classes start at 12:00 PM (Period 5).
    //   Morning bus arrives at 11:00 AM. Having class at Period 1-4 (08:00 - 12:00) violates transit!
    // - Morning Shift (Sem 1, 2): classes run 08:00 AM – 12:55 PM (Periods 1-5).
    if (section && entry.status !== 'CANCELLED') {
      const isAfternoonShift = section.shift === 'AFTERNOON' || section.semester >= 3;
      const isMorningShift = section.shift === 'MORNING' || section.semester <= 2;

      if (isAfternoonShift && entry.slotOrder < 5) {
        hardConflicts.push({
          id: `conf-shift-${entry.id}`,
          timetableId,
          type: 'SHIFT_TIMING_VIOLATION',
          severity: 'HARD',
          category: 'TIMING_SHIFT',
          sectionId: section.id,
          sectionName: section.name,
          courseCode: section.courseCode,
          semester: section.semester,
          description: `Shift & Bus Timing Conflict: ${section.name} (Semester ${section.semester}) is assigned to the Afternoon Shift (12:00 PM – 04:00 PM / 06:00 PM, Bus Arrival 11:00 AM). Lecture for ${entry.subjectCode} (${entry.subjectName}) is scheduled at Period ${entry.slotOrder} (${slot?.startTime || 'Morning'}) before student bus arrival.`,
          affectedEntryIds: [entry.id],
          involvedDay: entry.dayOfWeek,
          involvedSlotOrder: entry.slotOrder,
          recommendedAction: `Reschedule ${entry.subjectCode} to Afternoon Period 5–8 (12:00 PM – 04:00 PM) to align with cohort bus arrival and departure.`
        });
      } else if (isMorningShift && entry.slotOrder >= 8) {
        hardConflicts.push({
          id: `conf-shift-${entry.id}`,
          timetableId,
          type: 'SHIFT_TIMING_VIOLATION',
          severity: 'HARD',
          category: 'TIMING_SHIFT',
          sectionId: section.id,
          sectionName: section.name,
          courseCode: section.courseCode,
          semester: section.semester,
          description: `Shift Departure Conflict: ${section.name} is in the Morning Shift (08:00 AM – 12:55 PM). Lecture for ${entry.subjectCode} is scheduled late at Period ${entry.slotOrder} (${slot?.startTime || 'Late'}) after the morning bus departure.`,
          affectedEntryIds: [entry.id],
          involvedDay: entry.dayOfWeek,
          involvedSlotOrder: entry.slotOrder,
          recommendedAction: `Move lecture to morning periods (Periods 1–5: 08:00 AM – 12:55 PM).`
        });
      }
    }
  });

  // Check 3: Soft Constraints (Student Idle Gaps, Duplicate Theory, & Overloads)
  sections.forEach(section => {
    const days: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    days.forEach(day => {
      const sectionDayEntries = entries
        .filter(e => e.sectionId === section.id && e.dayOfWeek === day && e.status !== 'CANCELLED')
        .sort((a, b) => a.slotOrder - b.slotOrder);

      // Check 3A: Excessive consecutive classes without break (>3)
      if (sectionDayEntries.length > 3) {
        let consecutive = 1;
        for (let i = 1; i < sectionDayEntries.length; i++) {
          if (sectionDayEntries[i].slotOrder === sectionDayEntries[i - 1].slotOrder + 1) {
            consecutive++;
            if (consecutive >= 4) {
              softPenalties.push({
                id: `soft-consec-${section.id}-${day}`,
                timetableId,
                type: 'FACULTY_EXCESSIVE_CONSECUTIVE',
                severity: 'SOFT',
                category: 'WORKLOAD',
                sectionId: section.id,
                sectionName: section.name,
                courseCode: section.courseCode,
                semester: section.semester,
                description: `Workload Alert: ${section.name} has ${consecutive} consecutive classes on ${day} without a break period.`,
                affectedEntryIds: sectionDayEntries.slice(i - consecutive + 1, i + 1).map(e => e.id),
                involvedDay: day,
                recommendedAction: `Insert a recess slot or redistribute one lecture to another day.`
              });
              break;
            }
          } else {
            consecutive = 1;
          }
        }
      }

      // Check 3B: Student Idle Gap Penalty (2+ hours wasted sitting idle on campus)
      if (sectionDayEntries.length >= 2) {
        for (let i = 0; i < sectionDayEntries.length - 1; i++) {
          const gap = sectionDayEntries[i + 1].slotOrder - sectionDayEntries[i].slotOrder - 1;
          if (gap >= 2) {
            softPenalties.push({
              id: `soft-gap-${section.id}-${day}-${sectionDayEntries[i].slotOrder}`,
              timetableId,
              type: 'STUDENT_LONG_GAP',
              severity: 'SOFT',
              category: 'STUDENT_GAP',
              sectionId: section.id,
              sectionName: section.name,
              courseCode: section.courseCode,
              semester: section.semester,
              description: `Student Wasted Time Alert: ${section.name} has an idle gap of ${gap} periods (${gap * 55} min) on ${day} between Period ${sectionDayEntries[i].slotOrder} and Period ${sectionDayEntries[i + 1].slotOrder}. Students waste hours waiting on campus.`,
              affectedEntryIds: [sectionDayEntries[i].id, sectionDayEntries[i + 1].id],
              involvedDay: day,
              involvedSlotOrder: sectionDayEntries[i].slotOrder,
              recommendedAction: `Compress into contiguous blocks so students leave on the designated college bus.`
            });
          }
        }
      }

      // Check 3C: Duplicate Theory Subject on Same Day
      const theoryEntries = sectionDayEntries.filter(e => !e.isLab);
      const subjectCount: { [code: string]: TimetableEntry[] } = {};
      theoryEntries.forEach(e => {
        if (!subjectCount[e.subjectCode]) subjectCount[e.subjectCode] = [];
        subjectCount[e.subjectCode].push(e);
      });

      Object.entries(subjectCount).forEach(([subCode, subEntries]) => {
        if (subEntries.length > 1) {
          softPenalties.push({
            id: `soft-dup-${section.id}-${day}-${subCode}`,
            timetableId,
            type: 'DUPLICATE_SUBJECT_SAME_DAY',
            severity: 'SOFT',
            category: 'WORKLOAD',
            sectionId: section.id,
            sectionName: section.name,
            courseCode: section.courseCode,
            semester: section.semester,
            description: `Subject Distribution Alert: ${section.name} has ${subEntries.length} separate theory lectures of ${subCode} on ${day}. Spread theory subjects across different days.`,
            affectedEntryIds: subEntries.map(e => e.id),
            involvedDay: day,
            recommendedAction: `Move one lecture of ${subCode} to an alternate day with a lower class count.`
          });
        }
      });
    });
  });

  return { hardConflicts, softPenalties };
}

/**
 * Deterministic Constraint-Based Generator
 * Schedules required lectures and labs while preventing hard conflicts.
 */
export function generateTimetablePlan(config: GenerationConfig): GenerationResult {
  const { sections, subjects, teachers, rooms, timeSlots, academicYear, semesterType } = config;
  const usableSlots = timeSlots.filter(s => !s.isBreak).sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek.localeCompare(b.dayOfWeek);
    return a.slotOrder - b.slotOrder;
  });

  const scheduledEntries: TimetableEntry[] = [];
  const timetableId = `tt-${Date.now()}`;

  // Build requirements queue: for each section and subject of matching semester
  interface RequirementItem {
    section: Section;
    subject: Subject;
    isLab: boolean;
  }

  const requirements: RequirementItem[] = [];

  sections.forEach(section => {
    const sectionSubjects = subjects.filter(
      s => s.courseId === section.courseId && s.semester === section.semester
    );

    sectionSubjects.forEach(subject => {
      // Add lecture sessions
      for (let i = 0; i < subject.weeklyLectureCount; i++) {
        requirements.push({ section, subject, isLab: false });
      }
      // Add lab sessions
      for (let i = 0; i < subject.weeklyLabCount; i++) {
        requirements.push({ section, subject, isLab: true });
      }
    });
  });

  // Track occupancies
  const teacherOccupied: { [slotId: string]: Set<string> } = {};
  const roomOccupied: { [slotId: string]: Set<string> } = {};
  const sectionOccupied: { [slotId: string]: Set<string> } = {};

  const getDayUsageForSectionSubject = (sectionId: string, subjectId: string, day: DayOfWeek) => {
    return scheduledEntries.filter(
      e => e.sectionId === sectionId && e.subjectId === subjectId && e.dayOfWeek === day
    ).length;
  };

  // Assign each requirement to the best feasible slot and room
  let entryIdCounter = 1;

  requirements.forEach(req => {
    const { section, subject, isLab } = req;

    // Find a qualified teacher
    const qualifiedTeachers = teachers.filter(t => 
      t.qualifiedSubjectCodes.includes(subject.code)
    );
    const assignedTeacher = qualifiedTeachers.length > 0 
      ? qualifiedTeachers[0] 
      : teachers[0]; // fallback if qualification missing

    // Filter candidate rooms
    const candidateRooms = rooms.filter(r => {
      if (isLab) {
        return r.roomType === 'COMPUTER_LAB' || r.roomType === 'ELECTRONICS_LAB';
      }
      return r.capacity >= section.studentCount;
    });

    const chosenRoom = candidateRooms.length > 0 
      ? candidateRooms[0] 
      : (rooms.find(r => r.capacity >= section.studentCount) || rooms[0]);

    // Search for a non-conflicting time slot
    let selectedSlot: TimeSlot | null = null;
    let selectedRoom: Room = chosenRoom;

    for (const slot of usableSlots) {
      const slotId = slot.id;

      // Check section already busy
      if (sectionOccupied[slotId]?.has(section.id)) continue;

      // Check teacher already busy
      if (assignedTeacher && teacherOccupied[slotId]?.has(assignedTeacher.id)) continue;

      // Check teacher availability
      if (assignedTeacher && assignedTeacher.unavailableSlotIds.includes(slotId)) continue;

      // Try candidate rooms for this slot
      let foundAvailableRoom: Room | null = null;
      for (const room of candidateRooms) {
        if (!roomOccupied[slotId]?.has(room.id)) {
          foundAvailableRoom = room;
          break;
        }
      }

      if (foundAvailableRoom) {
        // Soft heuristic: Try not to schedule more than 1 lecture of same subject on same day
        const dayUsage = getDayUsageForSectionSubject(section.id, subject.id, slot.dayOfWeek);
        if (dayUsage >= 1 && usableSlots.length > scheduledEntries.length + 5) {
          // Keep looking if possible, else settle
          selectedSlot = slot;
          selectedRoom = foundAvailableRoom;
          continue;
        }

        selectedSlot = slot;
        selectedRoom = foundAvailableRoom;
        break;
      }
    }

    // If no perfect slot found, pick first open slot for section to avoid dropping class
    if (!selectedSlot) {
      selectedSlot = usableSlots.find(s => !sectionOccupied[s.id]?.has(section.id)) || usableSlots[0];
    }

    // Register occupancies
    if (!sectionOccupied[selectedSlot.id]) sectionOccupied[selectedSlot.id] = new Set();
    sectionOccupied[selectedSlot.id].add(section.id);

    if (assignedTeacher) {
      if (!teacherOccupied[selectedSlot.id]) teacherOccupied[selectedSlot.id] = new Set();
      teacherOccupied[selectedSlot.id].add(assignedTeacher.id);
    }

    if (!roomOccupied[selectedSlot.id]) roomOccupied[selectedSlot.id] = new Set();
    roomOccupied[selectedSlot.id].add(selectedRoom.id);

    // Push schedule entry
    scheduledEntries.push({
      id: `tte-${entryIdCounter++}`,
      timetableId,
      sectionId: section.id,
      sectionName: section.name,
      courseCode: section.courseCode,
      semester: section.semester,
      subjectId: subject.id,
      subjectCode: subject.code,
      subjectName: subject.name,
      teacherId: assignedTeacher ? assignedTeacher.id : 'unknown',
      teacherName: assignedTeacher ? assignedTeacher.fullName : 'TBD',
      roomId: selectedRoom.id,
      roomNumber: selectedRoom.roomNumber,
      roomType: selectedRoom.roomType,
      timeSlotId: selectedSlot.id,
      dayOfWeek: selectedSlot.dayOfWeek,
      slotOrder: selectedSlot.slotOrder,
      isLab,
      status: 'NORMAL'
    });
  });

  // Validate the generated schedule
  const { hardConflicts, softPenalties } = validateScheduleConstraints(
    scheduledEntries,
    teachers,
    rooms,
    sections,
    timeSlots,
    timetableId
  );

  // Soft optimization score calculation
  const totalSlotsScheduled = scheduledEntries.length;
  const hardPenaltyWeight = 30;
  const softPenaltyWeight = 5;
  const penaltyTotal = (hardConflicts.length * hardPenaltyWeight) + (softPenalties.length * softPenaltyWeight);
  const optimizationScore = Math.max(0, Math.min(100, Math.round(100 - (penaltyTotal / (totalSlotsScheduled || 1)) * 10)));

  const version: TimetableVersion = {
    id: timetableId,
    academicYear,
    semesterType,
    versionNumber: 1,
    status: hardConflicts.length === 0 ? 'GENERATED' : 'DRAFT',
    generatedAt: new Date().toISOString(),
    optimizationScore,
    hardConflictsCount: hardConflicts.length,
    softPenaltyScore: softPenalties.length,
    entries: scheduledEntries,
    conflicts: [...hardConflicts, ...softPenalties],
    changeLogs: []
  };

  return {
    version,
    success: hardConflicts.length === 0,
    hardConflicts,
    softPenalties,
    summary: {
      totalLecturesScheduled: scheduledEntries.length,
      hardConflictCount: hardConflicts.length,
      softPenaltyCount: softPenalties.length,
      optimizationScore
    }
  };
}

export interface TargetedGenerationConfig {
  targetSectionIds: string[];
  shiftPreference?: 'MORNING' | 'AFTERNOON' | 'FLEXIBLE';
  academicYear?: string;
  semesterType?: 'ODD' | 'EVEN';
  allSections: Section[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  timeSlots: TimeSlot[];
  existingEntries: TimetableEntry[];
}

export interface TargetedGenerationResult {
  updatedEntries: TimetableEntry[];
  generatedEntries: TimetableEntry[];
  targetSections: Section[];
  shiftApplied: 'MORNING' | 'AFTERNOON' | 'FLEXIBLE';
  conflicts: TimetableConflict[];
  hardConflictsCount: number;
  softPenaltyCount: number;
  optimizationScore: number;
  summary: {
    totalLecturesScheduled: number;
    hardConflictCount: number;
    softPenaltyCount: number;
    optimizationScore: number;
    shiftSummary: string;
    sectionsCovered: string[];
  };
}

/**
 * Targeted Course & Section Timetable Generator
 * Generates an optimized, conflict-free, shift-and-bus-synchronized schedule
 * specifically for the selected course section(s) while locking and respecting
 * all other cohorts' existing schedules.
 */
export function generateSectionOrCourseSchedule(config: TargetedGenerationConfig): TargetedGenerationResult {
  const {
    targetSectionIds,
    shiftPreference,
    academicYear = '2026-2027',
    semesterType = 'ODD',
    allSections,
    subjects,
    teachers,
    rooms,
    timeSlots,
    existingEntries
  } = config;

  const targetSections = allSections.filter(s => targetSectionIds.includes(s.id));
  const lockedEntries = existingEntries.filter(e => !targetSectionIds.includes(e.sectionId));
  const days: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  // Build occupancy tracking from locked entries of OTHER sections
  const teacherOccupied = new Map<string, Set<string>>();
  const roomOccupied = new Map<string, Set<string>>();
  const sectionOccupied = new Map<string, Set<string>>();

  function markOccupied(day: DayOfWeek, slotOrder: number, teacherId: string, sectionId: string, roomId: string) {
    const key = `${day}_${slotOrder}`;
    if (!teacherOccupied.has(key)) teacherOccupied.set(key, new Set());
    if (!roomOccupied.has(key)) roomOccupied.set(key, new Set());
    if (!sectionOccupied.has(key)) sectionOccupied.set(key, new Set());

    teacherOccupied.get(key)!.add(teacherId);
    roomOccupied.get(key)!.add(roomId);
    sectionOccupied.get(key)!.add(sectionId);
  }

  function isSlotFree(day: DayOfWeek, slotOrder: number, teacherId: string, sectionId: string, roomId: string): boolean {
    const key = `${day}_${slotOrder}`;
    if (teacherOccupied.get(key)?.has(teacherId)) return false;
    if (sectionOccupied.get(key)?.has(sectionId)) return false;
    if (roomOccupied.get(key)?.has(roomId)) return false;
    return true;
  }

  // Pre-fill occupancies from locked entries
  lockedEntries.forEach(e => {
    markOccupied(e.dayOfWeek, e.slotOrder, e.teacherId, e.sectionId, e.roomId);
  });

  const labRooms = rooms.filter(r => r.roomType === 'COMPUTER_LAB' || r.roomType === 'ELECTRONICS_LAB');
  const lectureRooms = rooms.filter(r => r.roomType === 'LECTURE_HALL');

  const newlyGeneratedEntries: TimetableEntry[] = [];
  let entryCounter = Date.now();

  // Process each target section
  targetSections.forEach(section => {
    // Determine effective shift for this section
    const effectiveShift: 'MORNING' | 'AFTERNOON' | 'FLEXIBLE' = shiftPreference 
      ? shiftPreference 
      : (section.shift || (section.semester <= 2 ? 'MORNING' : 'AFTERNOON'));

    const allowedSlotOrders = effectiveShift === 'AFTERNOON'
      ? [5, 6, 7, 8, 9, 10] // 12:00 PM – 16:05 PM / 17:55 PM (11:00 AM Bus Arrival, 04:00 PM & 06:00 PM Bus Departure)
      : effectiveShift === 'MORNING'
      ? [1, 2, 3, 4, 5]     // 08:00 AM – 12:55 PM (08:00 AM Bus Arrival)
      : [1, 2, 3, 4, 5, 6, 7, 8];

    // Extract requirements for this section
    interface SchedUnit {
      unitId: string;
      subjectId: string;
      subjectCode: string;
      subjectName: string;
      teacherId: string;
      teacherName: string;
      isLab: boolean;
      isDoublePeriod: boolean;
      preferredRoomNumber?: string;
    }

    const units: SchedUnit[] = [];
    const sectionOldEntries = existingEntries.filter(e => e.sectionId === section.id);

    if (sectionOldEntries.length > 0) {
      // Group by subject and teacher
      const groupMap = new Map<string, {
        subjectId: string;
        subjectCode: string;
        subjectName: string;
        teacherId: string;
        teacherName: string;
        isLab: boolean;
        preferredRoomNumber?: string;
        count: number;
      }>();

      sectionOldEntries.forEach(e => {
        const key = `${e.subjectCode}|${e.isLab ? 'LAB' : 'THEORY'}|${e.teacherId}`;
        if (!groupMap.has(key)) {
          groupMap.set(key, {
            subjectId: e.subjectId,
            subjectCode: e.subjectCode,
            subjectName: e.subjectName,
            teacherId: e.teacherId,
            teacherName: e.teacherName,
            isLab: e.isLab,
            preferredRoomNumber: e.roomNumber,
            count: 0
          });
        }
        groupMap.get(key)!.count++;
      });

      groupMap.forEach(item => {
        if (item.isLab) {
          const pairs = Math.floor(item.count / 2);
          const rem = item.count % 2;
          for (let i = 0; i < pairs; i++) {
            units.push({ ...item, isDoublePeriod: true, unitId: `unit-${section.id}-${item.subjectCode}-lab-${i}` });
          }
          for (let i = 0; i < rem; i++) {
            units.push({ ...item, isDoublePeriod: false, unitId: `unit-${section.id}-${item.subjectCode}-singlelab-${i}` });
          }
        } else {
          for (let i = 0; i < item.count; i++) {
            units.push({ ...item, isDoublePeriod: false, unitId: `unit-${section.id}-${item.subjectCode}-lec-${i}` });
          }
        }
      });
    } else {
      // Fallback from subjects catalog
      const secSubjects = subjects.filter(s => s.courseId === section.courseId && s.semester === section.semester);
      secSubjects.forEach(s => {
        const qualified = teachers.filter(t => t.qualifiedSubjectCodes.includes(s.code));
        const tch = qualified[0] || teachers[0];
        for (let i = 0; i < s.weeklyLectureCount; i++) {
          units.push({
            unitId: `unit-${section.id}-${s.code}-lec-${i}`,
            subjectId: s.id,
            subjectCode: s.code,
            subjectName: s.name,
            teacherId: tch.id,
            teacherName: tch.fullName,
            isLab: false,
            isDoublePeriod: false
          });
        }
        for (let i = 0; i < s.weeklyLabCount; i += 2) {
          units.push({
            unitId: `unit-${section.id}-${s.code}-lab-${i}`,
            subjectId: s.id,
            subjectCode: s.code,
            subjectName: s.name,
            teacherId: tch.id,
            teacherName: tch.fullName,
            isLab: true,
            isDoublePeriod: true
          });
        }
      });
    }

    // Sort: double period labs first, then theory
    units.sort((a, b) => {
      if (a.isDoublePeriod && !b.isDoublePeriod) return -1;
      if (!a.isDoublePeriod && b.isDoublePeriod) return 1;
      if (a.isLab && !b.isLab) return -1;
      if (!a.isLab && b.isLab) return 1;
      return 0;
    });

    // Schedule units with strict zero-gap & shift satisfaction heuristics
    const sectionDaySlots = new Map<string, number[]>();
    const sectionDaySubjects = new Map<string, string[]>();
    const teacherDaySlots = new Map<string, number[]>();

    units.forEach(unit => {
      const candidateRooms = unit.isLab ? labRooms : lectureRooms;
      let bestChoice: { day: DayOfWeek; slot: number; room: Room } | null = null;
      let bestScore = Infinity;

      for (const day of days) {
        const secDayKey = `${section.id}_${day}`;
        const currentSecSlots = sectionDaySlots.get(secDayKey) || [];
        const currentSecSubjects = sectionDaySubjects.get(secDayKey) || [];

        // Avoid overloaded day for section (> 4 classes)
        if (unit.isDoublePeriod && currentSecSlots.length >= 3) continue;
        if (!unit.isDoublePeriod && currentSecSlots.length >= 4) continue;

        // Teacher daily overload check (> 4 classes)
        const tchDayKey = `${unit.teacherId}_${day}`;
        const currentTchSlots = teacherDaySlots.get(tchDayKey) || [];
        if (currentTchSlots.length >= 4) continue;

        // Disallow duplicate theory of same subject on same day
        if (!unit.isLab && currentSecSubjects.includes(unit.subjectCode)) continue;

        for (const slot of allowedSlotOrders) {
          const isSlot2Valid = unit.isDoublePeriod;
          const slot2 = slot + 1;
          if (isSlot2Valid && !allowedSlotOrders.includes(slot2)) continue;

          for (const room of candidateRooms) {
            if (!isSlotFree(day, slot, unit.teacherId, section.id, room.id)) continue;
            if (isSlot2Valid && !isSlotFree(day, slot2, unit.teacherId, section.id, room.id)) continue;

            // Score: lower is better
            let score = 0;

            // Student Compactness Score (Zero Gaps):
            if (currentSecSlots.length > 0) {
              const allSlots = [...currentSecSlots, slot, ...(isSlot2Valid ? [slot2] : [])];
              const minS = Math.min(...allSlots);
              const maxS = Math.max(...allSlots);
              const gap = (maxS - minS + 1) - allSlots.length;

              if (gap === 0) {
                score += 0; // Perfect compact consecutive block!
              } else if (gap === 1) {
                score += 25; // Small 1-period lunch gap
              } else {
                score += gap * 2000; // Heavy penalty for gaps >= 2h
              }
            }

            // Teacher gap penalty:
            if (currentTchSlots.length > 0) {
              const allT = [...currentTchSlots, slot, ...(isSlot2Valid ? [slot2] : [])];
              const minT = Math.min(...allT);
              const maxT = Math.max(...allT);
              const tGap = (maxT - minT + 1) - allT.length;
              if (tGap > 1) score += tGap * 30;
            }

            // Room preference bonus
            if (unit.preferredRoomNumber && room.roomNumber === unit.preferredRoomNumber) {
              score -= 10;
            }

            if (score < bestScore) {
              bestScore = score;
              bestChoice = { day, slot, room };
            }
          }
        }
      }

      if (bestChoice) {
        const { day, slot, room } = bestChoice;
        const slotsToSchedule = unit.isDoublePeriod ? [slot, slot + 1] : [slot];

        slotsToSchedule.forEach(s => {
          markOccupied(day, s, unit.teacherId, section.id, room.id);

          const secDayKey = `${section.id}_${day}`;
          const currentSecSlots = sectionDaySlots.get(secDayKey) || [];
          currentSecSlots.push(s);
          currentSecSlots.sort((a, b) => a - b);
          sectionDaySlots.set(secDayKey, currentSecSlots);

          const currentSecSubjects = sectionDaySubjects.get(secDayKey) || [];
          currentSecSubjects.push(unit.subjectCode);
          sectionDaySubjects.set(secDayKey, currentSecSubjects);

          const tchDayKey = `${unit.teacherId}_${day}`;
          const currentTchSlots = teacherDaySlots.get(tchDayKey) || [];
          currentTchSlots.push(s);
          currentTchSlots.sort((a, b) => a - b);
          teacherDaySlots.set(tchDayKey, currentTchSlots);

          const slotRef = timeSlots.find(ts => ts.dayOfWeek === day && ts.slotOrder === s);
          const timeSlotId = slotRef ? slotRef.id : `slot-${day.substring(0, 3).toLowerCase()}-${s}`;

          newlyGeneratedEntries.push({
            id: `ent-tgt-${entryCounter++}`,
            timetableId: 'tt-college-optimized',
            sectionId: section.id,
            sectionName: section.name,
            courseCode: section.courseCode,
            semester: section.semester,
            subjectId: unit.subjectId,
            subjectCode: unit.subjectCode,
            subjectName: unit.subjectName,
            teacherId: unit.teacherId,
            teacherName: unit.teacherName,
            roomId: room.id,
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            timeSlotId,
            dayOfWeek: day,
            slotOrder: s,
            isLab: unit.isLab,
            status: 'NORMAL'
          });
        });
      }
    });
  });

  const mergedEntries = [...lockedEntries, ...newlyGeneratedEntries];

  // Validate the combined schedule
  const { hardConflicts, softPenalties } = validateScheduleConstraints(
    mergedEntries,
    teachers,
    rooms,
    allSections,
    timeSlots,
    'tt-college-optimized'
  );

  const appliedShiftName = shiftPreference || (targetSections[0]?.shift || 'AFTERNOON');
  const shiftSummary = appliedShiftName === 'AFTERNOON'
    ? 'Afternoon Shift: 12:00 PM – 04:00 PM / 06:00 PM (11:00 AM Bus Arrival & 04:00 PM / 06:00 PM Bus Departure)'
    : appliedShiftName === 'MORNING'
    ? 'Morning Shift: 08:00 AM – 12:55 PM (08:00 AM Bus Arrival)'
    : 'Flexible Full Day Schedule';

  const optimizationScore = Math.max(0, Math.min(100, Math.round(100 - (hardConflicts.length * 25) - (softPenalties.length * 1.5))));

  return {
    updatedEntries: mergedEntries,
    generatedEntries: newlyGeneratedEntries,
    targetSections,
    shiftApplied: appliedShiftName,
    conflicts: [...hardConflicts, ...softPenalties],
    hardConflictsCount: hardConflicts.length,
    softPenaltyCount: softPenalties.length,
    optimizationScore,
    summary: {
      totalLecturesScheduled: newlyGeneratedEntries.length,
      hardConflictCount: hardConflicts.length,
      softPenaltyCount: softPenalties.length,
      optimizationScore,
      shiftSummary,
      sectionsCovered: targetSections.map(s => s.name)
    }
  };
}
