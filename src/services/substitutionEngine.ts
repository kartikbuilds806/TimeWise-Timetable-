import { Teacher, TimetableEntry, TimeSlot, DayOfWeek, ProxySubstitutionRecord } from '../types';

export interface SubstituteCandidate {
  teacher: Teacher;
  isFree: boolean;
  isSubjectQualified: boolean;
  isDepartmentMatch: boolean;
  classesToday: number;
  maxDailyLimit: number;
  suitabilityScore: number;
  reasons: string[];
}

export interface SubstitutionAnalysisResult {
  cancelledEntry: TimetableEntry;
  targetDay: DayOfWeek;
  targetSlotOrder: number;
  timeSlotText: string;
  totalFacultyEvaluated: number;
  availableSubstitutesCount: number;
  candidates: SubstituteCandidate[];
}

/**
 * Intelligent Proxy / Substitution Engine
 * Evaluates faculty availability, subject qualification, departmental alignment,
 * and daily workload balance to recommend optimal substitutes when a class is cancelled.
 */
export function analyzeSubstituteCandidates(
  cancelledEntry: TimetableEntry,
  allTeachers: Teacher[],
  allEntries: TimetableEntry[],
  timeSlots: TimeSlot[]
): SubstitutionAnalysisResult {
  const targetDay = cancelledEntry.dayOfWeek;
  const targetSlotOrder = cancelledEntry.slotOrder;
  const targetSlotId = cancelledEntry.timeSlotId;
  const origTeacherId = cancelledEntry.teacherId;
  const subjectCode = cancelledEntry.subjectCode;

  // Find time slot label
  const slot = timeSlots.find(s => s.id === targetSlotId);
  const timeSlotText = targetSlotOrder === 10 
    ? '17:00 - 17:55 (5:00 PM)' 
    : slot ? `${slot.startTime} - ${slot.endTime}` : `Slot ${targetSlotOrder}`;

  // Identify all teachers who are currently busy in another active class at this time slot
  const busyTeacherIds = new Set<string>();
  for (const ent of allEntries) {
    if (ent.status !== 'CANCELLED') {
      if (
        ent.timeSlotId === targetSlotId ||
        (ent.dayOfWeek === targetDay && ent.slotOrder === targetSlotOrder)
      ) {
        busyTeacherIds.add(ent.teacherId);
      }
    }
  }

  const candidates: SubstituteCandidate[] = [];

  for (const teacher of allTeachers) {
    // Skip the teacher who cancelled
    if (teacher.id === origTeacherId) continue;

    const isBusy = busyTeacherIds.has(teacher.id);
    const isUnavailable = teacher.unavailableSlotIds.includes(targetSlotId);

    // Calculate active classes scheduled for this teacher today
    const classesToday = allEntries.filter(
      e => e.teacherId === teacher.id && 
           e.dayOfWeek === targetDay && 
           e.status !== 'CANCELLED'
    ).length;

    const maxDaily = teacher.maxDailyLectures || 4;
    const isMaxReached = classesToday >= maxDaily;

    const isSubjectQualified = teacher.qualifiedSubjectCodes.includes(subjectCode);
    const isDepartmentMatch = 
      teacher.department.toLowerCase().includes('computer') ||
      teacher.department.toLowerCase().includes('information');

    let score = 0;
    const reasons: string[] = [];

    if (isBusy) {
      score -= 100;
      reasons.push('Busy in active lecture (Hard Concurrency Collision)');
    } else if (isUnavailable) {
      score -= 50;
      reasons.push('Unavailable during this institutional slot');
    } else if (isMaxReached) {
      score -= 30;
      reasons.push(`Reached daily maximum of ${maxDaily} classes`);
    } else {
      score += 50;
      reasons.push('Available and completely free during this period');
    }

    if (isSubjectQualified) {
      score += 35;
      reasons.push(`Qualified syllabus instructor for ${subjectCode}`);
    }

    if (isDepartmentMatch) {
      score += 20;
      reasons.push('Department of Computer Applications faculty');
    }

    // Workload spread bonus: teachers with fewer classes today get preference
    if (!isBusy && !isUnavailable) {
      score += Math.max(0, 15 - (classesToday * 3));
      reasons.push(`Current workload: ${classesToday}/${maxDaily} lectures today`);
    }

    candidates.push({
      teacher,
      isFree: !isBusy && !isUnavailable && !isMaxReached,
      isSubjectQualified,
      isDepartmentMatch,
      classesToday,
      maxDailyLimit: maxDaily,
      suitabilityScore: Math.max(0, score),
      reasons
    });
  }

  // Sort descending: highest suitability first
  candidates.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  return {
    cancelledEntry,
    targetDay,
    targetSlotOrder,
    timeSlotText,
    totalFacultyEvaluated: allTeachers.length,
    availableSubstitutesCount: candidates.filter(c => c.isFree).length,
    candidates
  };
}
