/**
 * SmartSync: Real College Timetable Dataset
 * Extracted from official college timetable charts.
 */

import { Course, Section, Subject, Teacher, Room, TimeSlot, TimetableEntry, DayOfWeek, Student } from '../types';
import { ALL_COLLEGE_TIMETABLE_ENTRIES } from './allTeachersSchedule';
import { OPTIMIZED_COLLEGE_TIMETABLE_ENTRIES } from './optimizedCollegeSchedule';

// Standard 10 Period Time Slots matching college schedules
export const COLLEGE_TIME_SLOTS: TimeSlot[] = [];

const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const PERIOD_TIMES = [
  { order: 1, start: '08:00', end: '08:55', isBreak: false },
  { order: 2, start: '08:55', end: '09:50', isBreak: false },
  { order: 3, start: '10:10', end: '11:05', isBreak: false },
  { order: 4, start: '11:05', end: '12:00', isBreak: false },
  { order: 5, start: '12:00', end: '12:55', isBreak: false },
  { order: 6, start: '13:10', end: '14:05', isBreak: false },
  { order: 7, start: '14:05', end: '15:00', isBreak: false },
  { order: 8, start: '15:10', end: '16:05', isBreak: false },
  { order: 9, start: '16:05', end: '17:00', isBreak: false },
  { order: 10, start: '17:00', end: '17:55', isBreak: false },
];

DAYS.forEach(day => {
  const prefix = day.substring(0, 3).toLowerCase();
  PERIOD_TIMES.forEach(pt => {
    COLLEGE_TIME_SLOTS.push({
      id: `slot-${prefix}-${pt.order}`,
      dayOfWeek: day,
      slotOrder: pt.order,
      startTime: pt.start,
      endTime: pt.end,
      isBreak: pt.isBreak,
      academicYear: '2025-2026'
    });
  });
});

export const COLLEGE_COURSES: Course[] = [
  { id: 'crs-bca', code: 'BCA', name: 'Bachelor of Computer Applications', department: 'Computer Science & IT', durationYears: 3, totalSemesters: 6, isActive: true },
  { id: 'crs-bsc-it', code: 'BSc(IT)', name: 'B.Sc in Information Technology', department: 'Computer Science & IT', durationYears: 3, totalSemesters: 6, isActive: true },
  { id: 'crs-bsc-cs', code: 'BSc(CS)', name: 'B.Sc in Computer Science', department: 'Computer Science & IT', durationYears: 3, totalSemesters: 6, isActive: true },
  { id: 'crs-mca', code: 'MCA', name: 'Master of Computer Applications', department: 'Computer Applications', durationYears: 2, totalSemesters: 4, isActive: true },
  { id: 'crs-msc-it', code: 'MSc(IT)', name: 'M.Sc in Information Technology', department: 'Computer Science & IT', durationYears: 2, totalSemesters: 4, isActive: true }
];

const RAW_COLLEGE_SECTIONS: Omit<Section, 'shift' | 'shiftTimingLabel' | 'busArrival' | 'busDeparture'>[] = [
  // BCA I
  { id: 'sec-bca-1-g1', courseId: 'crs-bca', courseCode: 'BCA', semester: 1, name: "BCA I 'G1' (NCR1)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-1-g2', courseId: 'crs-bca', courseCode: 'BCA', semester: 1, name: "BCA I 'G2' (NCR6)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-1-g3', courseId: 'crs-bca', courseCode: 'BCA', semester: 1, name: "BCA I 'G3' (NCR1)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-1-g4', courseId: 'crs-bca', courseCode: 'BCA', semester: 1, name: "BCA I 'G4' (NCR1)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-1-a1', courseId: 'crs-bca', courseCode: 'BCA', semester: 1, name: "BCA I 'A1' AI/DS", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-1-a2', courseId: 'crs-bca', courseCode: 'BCA', semester: 1, name: "BCA I 'A2' AI/DS", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-1-a3', courseId: 'crs-bca', courseCode: 'BCA', semester: 1, name: "BCA I 'A3' AI/DS", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-1-a4', courseId: 'crs-bca', courseCode: 'BCA', semester: 1, name: "BCA I 'A4' AI/DS", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-1-a5', courseId: 'crs-bca', courseCode: 'BCA', semester: 1, name: "BCA I 'A5' AI/DS (NCR1)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-1-a6', courseId: 'crs-bca', courseCode: 'BCA', semester: 1, name: "BCA I 'A6' AI/DS", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-1-a7', courseId: 'crs-bca', courseCode: 'BCA', semester: 1, name: "BCA I 'A7' AI/DS", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-1-a8', courseId: 'crs-bca', courseCode: 'BCA', semester: 1, name: "BCA I 'A8' AI/DS", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-1-a9', courseId: 'crs-bca', courseCode: 'BCA', semester: 1, name: "BCA I 'A9' AI/DS", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-1-c1', courseId: 'crs-bca', courseCode: 'BCA', semester: 1, name: "BCA I 'C1' CYBER (NCR2)", academicYear: '2025-2026', studentCount: 45 },
  { id: 'sec-bca-1-c2', courseId: 'crs-bca', courseCode: 'BCA', semester: 1, name: "BCA I 'C2' CYBER (NCR2)", academicYear: '2025-2026', studentCount: 45 },
  { id: 'sec-bsc-it-1', courseId: 'crs-bsc-it', courseCode: 'BSc(IT)', semester: 1, name: "BSc(IT) I (NCR3)", academicYear: '2025-2026', studentCount: 40 },
  { id: 'sec-bsc-cs-1', courseId: 'crs-bsc-cs', courseCode: 'BSc(CS)', semester: 1, name: "BSc(CS) I (NCR3)", academicYear: '2025-2026', studentCount: 40 },

  // BCA III
  { id: 'sec-bca-3-g1', courseId: 'crs-bca', courseCode: 'BCA', semester: 3, name: "BCA III 'G1' (CR1)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-3-g2', courseId: 'crs-bca', courseCode: 'BCA', semester: 3, name: "BCA III 'G2' (CR4)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-3-g3', courseId: 'crs-bca', courseCode: 'BCA', semester: 3, name: "BCA III 'G3' (CR5)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-3-g4', courseId: 'crs-bca', courseCode: 'BCA', semester: 3, name: "BCA III 'G4' (CR1)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-3-a1', courseId: 'crs-bca', courseCode: 'BCA', semester: 3, name: "BCA III AI/DS 'A1' (CR1)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-3-a2', courseId: 'crs-bca', courseCode: 'BCA', semester: 3, name: "BCA III AI/DS 'A2'", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-3-a3', courseId: 'crs-bca', courseCode: 'BCA', semester: 3, name: "BCA III AI/DS 'A3' (CR4)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-3-a4', courseId: 'crs-bca', courseCode: 'BCA', semester: 3, name: "BCA III AI/DS 'A4' (CR8)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-3-a5', courseId: 'crs-bca', courseCode: 'BCA', semester: 3, name: "BCA III AI/DS 'A5' (CR4)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-3-a6', courseId: 'crs-bca', courseCode: 'BCA', semester: 3, name: "BCA III AI/DS 'A6'", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-3-cyber', courseId: 'crs-bca', courseCode: 'BCA', semester: 3, name: "BCA III Cyber Security", academicYear: '2025-2026', studentCount: 45 },
  { id: 'sec-bsc-it-3', courseId: 'crs-bsc-it', courseCode: 'BSc(IT)', semester: 3, name: "BSc.IT III", academicYear: '2025-2026', studentCount: 40 },
  { id: 'sec-bsc-cs-3', courseId: 'crs-bsc-cs', courseCode: 'BSc(CS)', semester: 3, name: "BSc.CS III", academicYear: '2025-2026', studentCount: 40 },

  // BCA V
  { id: 'sec-bca-5-a', courseId: 'crs-bca', courseCode: 'BCA', semester: 5, name: "BCA V SEC 'A'", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-5-b', courseId: 'crs-bca', courseCode: 'BCA', semester: 5, name: "BCA V SEC 'B'", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-5-c', courseId: 'crs-bca', courseCode: 'BCA', semester: 5, name: "BCA V SEC 'C'", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-5-d', courseId: 'crs-bca', courseCode: 'BCA', semester: 5, name: "BCA V SEC 'D'", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-5-h', courseId: 'crs-bca', courseCode: 'BCA', semester: 5, name: "BCA V SEC 'H'", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-5-e', courseId: 'crs-bca', courseCode: 'BCA', semester: 5, name: "BCA (AI/DS) V SEC 'E'", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-5-f', courseId: 'crs-bca', courseCode: 'BCA', semester: 5, name: "BCA (AI/DS) V 'F'", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-5-g', courseId: 'crs-bca', courseCode: 'BCA', semester: 5, name: "BCA (AI/DS) V SEC 'G'", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-5-j1', courseId: 'crs-bca', courseCode: 'BCA', semester: 5, name: "BCA V SEC 'J1' (Para Medical)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-5-j2', courseId: 'crs-bca', courseCode: 'BCA', semester: 5, name: "BCA (AI/DS) V SEC 'J2'", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-bca-5-i', courseId: 'crs-bca', courseCode: 'BCA', semester: 5, name: "BCA (CS/CL) V SEC 'I'", academicYear: '2025-2026', studentCount: 45 },
  { id: 'sec-bsc-it-5', courseId: 'crs-bsc-it', courseCode: 'BSc(IT)', semester: 5, name: "BSc IT V (Para Medical)", academicYear: '2025-2026', studentCount: 40 },
  { id: 'sec-bsc-cs-5', courseId: 'crs-bsc-cs', courseCode: 'BSc(CS)', semester: 5, name: "BSc. CS V (Para Medical)", academicYear: '2025-2026', studentCount: 40 },

  // MCA I & III
  { id: 'sec-mca-1-g1', courseId: 'crs-mca', courseCode: 'MCA', semester: 1, name: "MCA I SEC 'G1' (LT3)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-mca-1-g2', courseId: 'crs-mca', courseCode: 'MCA', semester: 1, name: "MCA I SEC 'G2' (LT3)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-mca-1-g3', courseId: 'crs-mca', courseCode: 'MCA', semester: 1, name: "MCA I SEC 'G3' (LT3)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-mca-1-a1', courseId: 'crs-mca', courseCode: 'MCA', semester: 1, name: "MCA I SEC 'A1' AI/DS (LT4)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-mca-1-a2', courseId: 'crs-mca', courseCode: 'MCA', semester: 1, name: "MCA I SEC 'A2' AI/DS (LT4)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-mca-3-g1', courseId: 'crs-mca', courseCode: 'MCA', semester: 3, name: "MCA IIIrd SEC 'G1' (LT-4)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-mca-3-g2', courseId: 'crs-mca', courseCode: 'MCA', semester: 3, name: "MCA IIIrd SEC 'G2' (LT-4)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-mca-3-g3', courseId: 'crs-mca', courseCode: 'MCA', semester: 3, name: "MCA IIIrd SEC 'G3' (LT-3)", academicYear: '2025-2026', studentCount: 50 },
  { id: 'sec-mca-3-a1', courseId: 'crs-mca', courseCode: 'MCA', semester: 3, name: "MCA IIIrd SEC 'A1'", academicYear: '2025-2026', studentCount: 50 }
];

export const COLLEGE_SECTIONS: Section[] = RAW_COLLEGE_SECTIONS.map(sec => {
  const isMorning = sec.semester <= 2;
  return {
    ...sec,
    shift: isMorning ? ('MORNING' as const) : ('AFTERNOON' as const),
    shiftTimingLabel: isMorning
      ? 'Morning Shift: 08:00 AM – 12:55 PM (08:00 AM Bus Arrival)'
      : 'Afternoon Shift: 12:00 PM – 04:00 PM / 06:00 PM (11:00 AM Bus Arrival, 04:00 PM & 06:00 PM Bus Departure)',
    busArrival: isMorning ? '08:00 AM' : '11:00 AM',
    busDeparture: isMorning ? '12:55 PM / 01:10 PM / 04:00 PM' : '04:00 PM & 06:00 PM'
  };
});

export const COLLEGE_TEACHERS: Teacher[] = [
  { id: 'tch-geetika', employeeId: 'FAC-001', fullName: 'Mrs. Geetika Sharma', email: 'geetika.sharma@college.edu', department: 'Computer Applications', designation: 'Assistant Professor', maxDailyLectures: 4, qualifiedSubjectCodes: ['TBC101'], unavailableSlotIds: [] },
  { id: 'tch-abhishek-thapa', employeeId: 'FAC-002', fullName: 'Mr. Abhishek Thapa', email: 'abhishek.thapa@college.edu', department: 'Computer Applications', designation: 'Assistant Professor', maxDailyLectures: 5, qualifiedSubjectCodes: ['TBC102', 'PBC102', 'TBL102', 'PBL102', 'TBI102', 'PBI102', 'TBI301'], unavailableSlotIds: [] },
  { id: 'tch-ritu-barthwal', employeeId: 'FAC-003', fullName: 'Ms. Ritu Barthwal', email: 'ritu.barthwal@college.edu', department: 'Mathematics / CS', designation: 'Assistant Professor', maxDailyLectures: 4, qualifiedSubjectCodes: ['TBC103', 'TBL103'], unavailableSlotIds: [] },
  { id: 'tch-vibhakar-ghosh', employeeId: 'FAC-004', fullName: 'Mr. Vibhakar Ghosh', email: 'vibhakar.ghosh@college.edu', department: 'English & Humanities', designation: 'Assistant Professor', maxDailyLectures: 5, qualifiedSubjectCodes: ['TBC104', 'TBL104', 'TBI104', 'TBS104', 'TBD104', 'TBD504'], unavailableSlotIds: [] },
  { id: 'tch-shiwani-bhaskar', employeeId: 'FAC-005', fullName: 'Ms. Shiwani Bhaskar', email: 'shiwani.bhaskar@college.edu', department: 'Computer Applications', designation: 'Assistant Professor', maxDailyLectures: 5, qualifiedSubjectCodes: ['PBC101', 'PBL101', 'PBD102', 'PBD302'], unavailableSlotIds: [] },
  { id: 'tch-anukriti', employeeId: 'FAC-006', fullName: 'Ms. Anukriti', email: 'anukriti@college.edu', department: 'Mathematics', designation: 'Assistant Professor', maxDailyLectures: 5, qualifiedSubjectCodes: ['BBC111', 'CAD101'], unavailableSlotIds: [] },
  { id: 'tch-vikas-kumar', employeeId: 'FAC-007', fullName: 'Mr. Vikas Kumar', email: 'vikas.kumar@college.edu', department: 'Computer Applications', designation: 'Assistant Professor', maxDailyLectures: 5, qualifiedSubjectCodes: ['TBC102', 'PBC102', 'TBS504'], unavailableSlotIds: [] },
  { id: 'tch-abhishek-chauhan', employeeId: 'FAC-008', fullName: 'Mr. Abhishek Chauhan', email: 'abhishek.chauhan@college.edu', department: 'Mathematics / AI', designation: 'Assistant Professor', maxDailyLectures: 4, qualifiedSubjectCodes: ['TBC103', 'TBD103'], unavailableSlotIds: [] },
  { id: 'tch-ovais-bashir', employeeId: 'FAC-009', fullName: 'Dr. Ovais Bashir', email: 'ovais.bashir@college.edu', department: 'Computer Applications', designation: 'Associate Professor', maxDailyLectures: 4, qualifiedSubjectCodes: ['TBC102', 'PBC102', 'TBD102', 'PBD102', 'TBD521', 'TBL521'], unavailableSlotIds: [] },
  { id: 'tch-ayushi-rana', employeeId: 'FAC-010', fullName: 'Ms. Ayushi Rana', email: 'ayushi.rana@college.edu', department: 'Computer Applications', designation: 'Assistant Professor', maxDailyLectures: 5, qualifiedSubjectCodes: ['TBD101', 'PBD101', 'TMI104'], unavailableSlotIds: [] },
  { id: 'tch-afsar-jahan', employeeId: 'FAC-011', fullName: 'Ms. Afsar Jahan', email: 'afsar.jahan@college.edu', department: 'Computer Applications', designation: 'Assistant Professor', maxDailyLectures: 5, qualifiedSubjectCodes: ['TBD102', 'PBD102', 'TBS503'], unavailableSlotIds: [] },
  { id: 'tch-deepanshi', employeeId: 'FAC-012', fullName: 'Ms. Deepanshi', email: 'deepanshi@college.edu', department: 'AI & Data Science', designation: 'Assistant Professor', maxDailyLectures: 4, qualifiedSubjectCodes: ['TBD103'], unavailableSlotIds: [] },
  { id: 'tch-gauri-takiyar', employeeId: 'FAC-013', fullName: 'Ms. Gauri Takiyar', email: 'gauri.takiyar@college.edu', department: 'English & Soft Skills', designation: 'Assistant Professor', maxDailyLectures: 5, qualifiedSubjectCodes: ['TBD104'], unavailableSlotIds: [] },
  { id: 'tch-sangamitra', employeeId: 'FAC-014', fullName: 'Ms. Sangamitra', email: 'sangamitra@college.edu', department: 'Management & Venture', designation: 'Assistant Professor', maxDailyLectures: 4, qualifiedSubjectCodes: ['GE'], unavailableSlotIds: [] },
  { id: 'tch-aakriti-singh', employeeId: 'FAC-015', fullName: 'Ms. Aakriti Singh', email: 'aakriti.singh@college.edu', department: 'Computer Applications', designation: 'Assistant Professor', maxDailyLectures: 5, qualifiedSubjectCodes: ['TBD101', 'TBD102', 'PBD101', 'PBD102'], unavailableSlotIds: [] },
  { id: 'tch-anuj-rawat', employeeId: 'FAC-016', fullName: 'Mr. Anuj Rawat', email: 'anuj.rawat@college.edu', department: 'Computer Applications', designation: 'Assistant Professor', maxDailyLectures: 5, qualifiedSubjectCodes: ['TBD102', 'PBD102', 'TMD111'], unavailableSlotIds: [] },
  { id: 'tch-ravi-sharma', employeeId: 'FAC-017', fullName: 'Dr. Ravi Sharma', email: 'ravi.sharma@college.edu', department: 'Computer Applications', designation: 'Professor', maxDailyLectures: 4, qualifiedSubjectCodes: ['TBC301'], unavailableSlotIds: [] },
  { id: 'tch-vartika-agarwal', employeeId: 'FAC-018', fullName: 'Dr. Vartika Agarwal', email: 'vartika.agarwal@college.edu', department: 'Computer Applications', designation: 'Associate Professor', maxDailyLectures: 4, qualifiedSubjectCodes: ['TBC302', 'PBC302'], unavailableSlotIds: [] },
  { id: 'tch-sanjay-roka', employeeId: 'FAC-019', fullName: 'Dr. Sanjay Roka', email: 'sanjay.roka@college.edu', department: 'Computer Science', designation: 'Associate Professor', maxDailyLectures: 4, qualifiedSubjectCodes: ['TBC303'], unavailableSlotIds: [] },
  { id: 'tch-deepak-gaur', employeeId: 'FAC-020', fullName: 'Dr. Deepak Gaur', email: 'deepak.gaur@college.edu', department: 'Computer Applications', designation: 'Associate Professor', maxDailyLectures: 4, qualifiedSubjectCodes: ['TBC311'], unavailableSlotIds: [] },
  { id: 'tch-gunjan-mehra', employeeId: 'FAC-021', fullName: 'Ms. Gunjan Mehra', email: 'gunjan.mehra@college.edu', department: 'Computer Applications', designation: 'Assistant Professor', maxDailyLectures: 5, qualifiedSubjectCodes: ['TBC313', 'TBD303', 'PMC101'], unavailableSlotIds: [] },
  { id: 'tch-abhinav-sharma', employeeId: 'FAC-022', fullName: 'Mr. Abhinav Sharma', email: 'abhinav.sharma@college.edu', department: 'Career Success', designation: 'Assistant Professor', maxDailyLectures: 5, qualifiedSubjectCodes: ['TBC304', 'TBL304', 'TBI304', 'TBS305'], unavailableSlotIds: [] },
  { id: 'tch-krishna-kumar', employeeId: 'FAC-023', fullName: 'Mr. Krishna Kumar', email: 'krishna.kumar@college.edu', department: 'Computer Applications', designation: 'Assistant Professor', maxDailyLectures: 5, qualifiedSubjectCodes: ['PBC301', 'PBL102', 'PMD101', 'PBI502'], unavailableSlotIds: [] },
  { id: 'tch-siddhant-thapliyal', employeeId: 'FAC-024', fullName: 'Dr. Siddhant Thapliyal', email: 'siddhant.thapliyal@college.edu', department: 'Computer Science', designation: 'Associate Professor', maxDailyLectures: 4, qualifiedSubjectCodes: ['TBD301'], unavailableSlotIds: [] },
  { id: 'tch-ankur-choudhary', employeeId: 'FAC-025', fullName: 'Dr. Ankur Choudhary', email: 'ankur.choudhary@college.edu', department: 'Computer Applications', designation: 'Associate Professor', maxDailyLectures: 4, qualifiedSubjectCodes: ['TBD302'], unavailableSlotIds: [] },
  { id: 'tch-vandana-rawat', employeeId: 'FAC-026', fullName: 'Dr. Vandana Rawat', email: 'vandana.rawat@college.edu', department: 'Computer Science', designation: 'Associate Professor', maxDailyLectures: 4, qualifiedSubjectCodes: ['TBD303', 'PBD302', 'CAD501'], unavailableSlotIds: [] },
  { id: 'tch-harendra-negi', employeeId: 'FAC-027', fullName: 'Mr. H. S. Negi', email: 'hs.negi@college.edu', department: 'Computer Applications', designation: 'Assistant Professor', maxDailyLectures: 5, qualifiedSubjectCodes: ['TBC501', 'PBC501', 'TBD522', 'TBI501', 'PBS501'], unavailableSlotIds: [] },
  { id: 'tch-aditya-joshi', employeeId: 'FAC-028', fullName: 'Dr. Aditya Joshi', email: 'aditya.joshi@college.edu', department: 'Computer Applications', designation: 'Associate Professor', maxDailyLectures: 4, qualifiedSubjectCodes: ['TBC502', 'PBC502'], unavailableSlotIds: [] },
  { id: 'tch-alankrita-joshi', employeeId: 'FAC-029', fullName: 'Ms. Alankrita Joshi', email: 'alankrita.joshi@college.edu', department: 'Electronics / CS', designation: 'Assistant Professor', maxDailyLectures: 4, qualifiedSubjectCodes: ['TBC503', 'TBL503'], unavailableSlotIds: [] },
  { id: 'tch-priyansh-kumar', employeeId: 'FAC-030', fullName: 'Mr. Priyansh Kumar', email: 'priyansh.kumar@college.edu', department: 'Computer Applications', designation: 'Assistant Professor', maxDailyLectures: 5, qualifiedSubjectCodes: ['TBC522', 'TBD501', 'PBD501', 'PMD302'], unavailableSlotIds: [] },
  { id: 'tch-mohd-shuaib', employeeId: 'FAC-031', fullName: 'Mohd. Shuaib', email: 'mohd.shuaib@college.edu', department: 'Computer Applications', designation: 'Assistant Professor', maxDailyLectures: 5, qualifiedSubjectCodes: ['TBC525', 'TBD303', 'TBD102', 'TBI502', 'PBI502'], unavailableSlotIds: [] },
  { id: 'tch-bhawnesh-kumar', employeeId: 'FAC-032', fullName: 'Dr. Bhawnesh Kumar', email: 'bhawnesh.kumar@college.edu', department: 'Computer Applications', designation: 'Associate Professor', maxDailyLectures: 4, qualifiedSubjectCodes: ['TBC501', 'PBC501'], unavailableSlotIds: [] },
  { id: 'tch-rashmi-kanyal', employeeId: 'FAC-033', fullName: 'Ms. Rashmi Kanyal', email: 'rashmi.kanyal@college.edu', department: 'Computer Applications', designation: 'Assistant Professor', maxDailyLectures: 5, qualifiedSubjectCodes: ['TBI101', 'PBI101', 'BMC101', 'BMD102', 'BMD103', 'BMC301'], unavailableSlotIds: [] },
  { id: 'tch-swati-pant', employeeId: 'FAC-034', fullName: 'Ms. Swati Pant', email: 'swati.pant@college.edu', department: 'Computer Applications', designation: 'Assistant Professor', maxDailyLectures: 5, qualifiedSubjectCodes: ['TBL311', 'PBL301', 'PBL302', 'PBL501', 'PBL502', 'TBI503'], unavailableSlotIds: [] },
  { id: 'tch-utsav-kumar', employeeId: 'FAC-035', fullName: 'Mr. Utsav Kumar', email: 'utsav.kumar@college.edu', department: 'Computer Applications', designation: 'Assistant Professor', maxDailyLectures: 5, qualifiedSubjectCodes: ['TBD302', 'PBD302', 'TBI302', 'PBI301'], unavailableSlotIds: [] },
  { id: 'tch-amit-kumar', employeeId: 'FAC-036', fullName: 'Dr. Amit Kumar', email: 'amit.kumar@college.edu', department: 'Computer Applications', designation: 'Professor', maxDailyLectures: 4, qualifiedSubjectCodes: ['TMC103', 'PMC103', 'TMD103', 'PMD103'], unavailableSlotIds: [] },
  { id: 'tch-varsha-mittal', employeeId: 'FAC-037', fullName: 'Dr. Varsha Mittal', email: 'varsha.mittal@college.edu', department: 'Computer Applications', designation: 'Associate Professor', maxDailyLectures: 4, qualifiedSubjectCodes: ['TMC118', 'TMD104', 'TMD301'], unavailableSlotIds: [] },
  { id: 'tch-gagandeep-singh', employeeId: 'FAC-038', fullName: 'Mr. Gagandeep Singh', email: 'gagandeep.singh@college.edu', department: 'Computer Applications', designation: 'Assistant Professor', maxDailyLectures: 5, qualifiedSubjectCodes: ['TMC303', 'PMC303'], unavailableSlotIds: [] }
];

export const COLLEGE_ROOMS: Room[] = [
  // Classrooms
  { id: 'rm-ncr1', roomNumber: 'NCR1', building: 'New Academic Block', floorLevel: 1, roomType: 'LECTURE_HALL', capacity: 60, isAvailable: true },
  { id: 'rm-ncr2', roomNumber: 'NCR2', building: 'New Academic Block', floorLevel: 1, roomType: 'LECTURE_HALL', capacity: 60, isAvailable: true },
  { id: 'rm-ncr3', roomNumber: 'NCR3', building: 'New Academic Block', floorLevel: 1, roomType: 'LECTURE_HALL', capacity: 60, isAvailable: true },
  { id: 'rm-ncr4', roomNumber: 'NCR4', building: 'New Academic Block', floorLevel: 2, roomType: 'LECTURE_HALL', capacity: 60, isAvailable: true },
  { id: 'rm-ncr5', roomNumber: 'NCR5', building: 'New Academic Block', floorLevel: 2, roomType: 'LECTURE_HALL', capacity: 60, isAvailable: true },
  { id: 'rm-ncr6', roomNumber: 'NCR6', building: 'New Academic Block', floorLevel: 2, roomType: 'LECTURE_HALL', capacity: 60, isAvailable: true },
  { id: 'rm-cr1', roomNumber: 'CR1', building: 'Main Central Block', floorLevel: 1, roomType: 'LECTURE_HALL', capacity: 65, isAvailable: true },
  { id: 'rm-cr4', roomNumber: 'CR4', building: 'Main Central Block', floorLevel: 1, roomType: 'LECTURE_HALL', capacity: 65, isAvailable: true },
  { id: 'rm-cr5', roomNumber: 'CR5', building: 'Main Central Block', floorLevel: 2, roomType: 'LECTURE_HALL', capacity: 65, isAvailable: true },
  { id: 'rm-cr8', roomNumber: 'CR8', building: 'Main Central Block', floorLevel: 2, roomType: 'LECTURE_HALL', capacity: 65, isAvailable: true },
  { id: 'rm-cr25', roomNumber: 'CR25 (Civil)', building: 'Civil Engineering Block', floorLevel: 2, roomType: 'LECTURE_HALL', capacity: 70, isAvailable: true },
  { id: 'rm-lt3', roomNumber: 'LT3', building: 'Lecture Complex', floorLevel: 1, roomType: 'LECTURE_HALL', capacity: 80, isAvailable: true },
  { id: 'rm-lt4', roomNumber: 'LT4', building: 'Lecture Complex', floorLevel: 1, roomType: 'LECTURE_HALL', capacity: 80, isAvailable: true },
  { id: 'rm-lt5', roomNumber: 'LT5', building: 'Lecture Complex', floorLevel: 2, roomType: 'LECTURE_HALL', capacity: 80, isAvailable: true },
  { id: 'rm-lt6', roomNumber: 'LT6', building: 'Lecture Complex', floorLevel: 2, roomType: 'LECTURE_HALL', capacity: 80, isAvailable: true },
  { id: 'rm-lt7', roomNumber: 'LT7', building: 'Lecture Complex', floorLevel: 2, roomType: 'LECTURE_HALL', capacity: 80, isAvailable: true },
  { id: 'rm-lt8', roomNumber: 'LT8', building: 'Lecture Complex', floorLevel: 2, roomType: 'LECTURE_HALL', capacity: 80, isAvailable: true },
  { id: 'rm-lt9', roomNumber: 'LT9', building: 'Lecture Complex', floorLevel: 3, roomType: 'LECTURE_HALL', capacity: 80, isAvailable: true },
  { id: 'rm-lt13', roomNumber: 'LT13', building: 'Lecture Complex', floorLevel: 3, roomType: 'LECTURE_HALL', capacity: 80, isAvailable: true },
  { id: 'rm-lt15', roomNumber: 'LT15', building: 'Lecture Complex', floorLevel: 3, roomType: 'LECTURE_HALL', capacity: 80, isAvailable: true },
  { id: 'rm-para-b', roomNumber: 'PARA B', building: 'Para Medical Block', floorLevel: 1, roomType: 'LECTURE_HALL', capacity: 60, isAvailable: true },
  
  // Labs
  { id: 'rm-lab-3', roomNumber: 'LAB3', building: 'Central Computing Wing', floorLevel: 1, roomType: 'COMPUTER_LAB', capacity: 60, isAvailable: true },
  { id: 'rm-lab-6', roomNumber: 'LAB6', building: 'Central Computing Wing', floorLevel: 2, roomType: 'COMPUTER_LAB', capacity: 60, isAvailable: true },
  { id: 'rm-lab-7', roomNumber: 'LAB7', building: 'Central Computing Wing', floorLevel: 2, roomType: 'COMPUTER_LAB', capacity: 60, isAvailable: true },
  { id: 'rm-dl1', roomNumber: 'DL1 (Digital Lab 1)', building: 'Electronics Wing', floorLevel: 1, roomType: 'COMPUTER_LAB', capacity: 55, isAvailable: true },
  { id: 'rm-dl2', roomNumber: 'DL2 (Digital Lab 2)', building: 'Electronics Wing', floorLevel: 1, roomType: 'COMPUTER_LAB', capacity: 55, isAvailable: true },
  { id: 'rm-ibm-lab', roomNumber: 'IBM LAB', building: 'Advanced Software Center', floorLevel: 2, roomType: 'COMPUTER_LAB', capacity: 60, isAvailable: true },
  { id: 'rm-caad-lab', roomNumber: 'CAAD LAB', building: 'Design & Graphics Wing', floorLevel: 2, roomType: 'COMPUTER_LAB', capacity: 60, isAvailable: true },
  { id: 'rm-new-lab-1', roomNumber: 'NEW LAB 1', building: 'IT Complex', floorLevel: 1, roomType: 'COMPUTER_LAB', capacity: 60, isAvailable: true },
  { id: 'rm-param-gf', roomNumber: 'PARAM GF', building: 'Supercomputing Center', floorLevel: 0, roomType: 'COMPUTER_LAB', capacity: 60, isAvailable: true },
  { id: 'rm-param-sf', roomNumber: 'PARAM SF', building: 'Supercomputing Center', floorLevel: 1, roomType: 'COMPUTER_LAB', capacity: 60, isAvailable: true },
  { id: 'rm-ab-ff', roomNumber: 'AB FF', building: 'Academic Block', floorLevel: 1, roomType: 'COMPUTER_LAB', capacity: 50, isAvailable: true },
  { id: 'rm-ab-gf', roomNumber: 'AB GF', building: 'Academic Block', floorLevel: 0, roomType: 'COMPUTER_LAB', capacity: 50, isAvailable: true },
];

export const COLLEGE_SUBJECTS: Subject[] = [
  // BCA I
  { id: 'sub-tbc101', courseId: 'crs-bca', courseCode: 'BCA', code: 'TBC101', name: 'Computational Thinking and Fundamentals of IT', semester: 1, credits: 4, weeklyLectureCount: 4, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-tbc102', courseId: 'crs-bca', courseCode: 'BCA', code: 'TBC102', name: 'Foundations of Computer Programming', semester: 1, credits: 4, weeklyLectureCount: 4, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-tbc103', courseId: 'crs-bca', courseCode: 'BCA', code: 'TBC103', name: 'Mathematical Foundation of Computer Science', semester: 1, credits: 4, weeklyLectureCount: 4, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-tbc104', courseId: 'crs-bca', courseCode: 'BCA', code: 'TBC104', name: 'Professional English Skills', semester: 1, credits: 3, weeklyLectureCount: 3, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-ge', courseId: 'crs-bca', courseCode: 'BCA', code: 'GE', name: 'Startup Financing and Venture Development', semester: 1, credits: 3, weeklyLectureCount: 3, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-pbc101', courseId: 'crs-bca', courseCode: 'BCA', code: 'PBC101', name: 'Digital Productivity Tools Laboratory', semester: 1, credits: 2, weeklyLectureCount: 0, weeklyLabCount: 2, requiresLab: true, preferredRoomType: 'COMPUTER_LAB' },
  { id: 'sub-pbc102', courseId: 'crs-bca', courseCode: 'BCA', code: 'PBC102', name: 'Computer Programming Laboratory', semester: 1, credits: 2, weeklyLectureCount: 0, weeklyLabCount: 2, requiresLab: true, preferredRoomType: 'COMPUTER_LAB' },
  { id: 'sub-bbc111', courseId: 'crs-bca', courseCode: 'BCA', code: 'BBC111', name: 'Basic Mathematics - I', semester: 1, credits: 3, weeklyLectureCount: 3, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },

  // BCA AI/DS I
  { id: 'sub-tbd101', courseId: 'crs-bca', courseCode: 'BCA', code: 'TBD101', name: 'Computational Thinking & Fundamentals of IT', semester: 1, credits: 4, weeklyLectureCount: 4, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-tbd102', courseId: 'crs-bca', courseCode: 'BCA', code: 'TBD102', name: 'Fundamentals of Python Programming', semester: 1, credits: 4, weeklyLectureCount: 4, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-tbd103', courseId: 'crs-bca', courseCode: 'BCA', code: 'TBD103', name: 'Mathematical Foundation for AI', semester: 1, credits: 4, weeklyLectureCount: 4, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-tbd104', courseId: 'crs-bca', courseCode: 'BCA', code: 'TBD104', name: 'Professional English Skills', semester: 1, credits: 3, weeklyLectureCount: 3, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-pbd101', courseId: 'crs-bca', courseCode: 'BCA', code: 'PBD101', name: 'Digital Productivity Tools Lab', semester: 1, credits: 2, weeklyLectureCount: 0, weeklyLabCount: 2, requiresLab: true, preferredRoomType: 'COMPUTER_LAB' },
  { id: 'sub-pbd102', courseId: 'crs-bca', courseCode: 'BCA', code: 'PBD102', name: 'Fundamentals of Python Programming Lab', semester: 1, credits: 2, weeklyLectureCount: 0, weeklyLabCount: 2, requiresLab: true, preferredRoomType: 'COMPUTER_LAB' },

  // BCA III
  { id: 'sub-tbc301', courseId: 'crs-bca', courseCode: 'BCA', code: 'TBC301', name: 'Introduction to Data Structures', semester: 3, credits: 4, weeklyLectureCount: 4, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-tbc302', courseId: 'crs-bca', courseCode: 'BCA', code: 'TBC302', name: 'Introduction to Database Management System', semester: 3, credits: 4, weeklyLectureCount: 4, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-tbc303', courseId: 'crs-bca', courseCode: 'BCA', code: 'TBC303', name: 'Digital Logic Design', semester: 3, credits: 4, weeklyLectureCount: 4, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-tbc311', courseId: 'crs-bca', courseCode: 'BCA', code: 'TBC311', name: 'Foundations of Artificial Intelligence', semester: 3, credits: 3, weeklyLectureCount: 3, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-tbc313', courseId: 'crs-bca', courseCode: 'BCA', code: 'TBC313', name: 'Fundamentals of Cloud Computing', semester: 3, credits: 3, weeklyLectureCount: 3, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-tbc304', courseId: 'crs-bca', courseCode: 'BCA', code: 'TBC304', name: 'Skills for Career Success – I', semester: 3, credits: 2, weeklyLectureCount: 2, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-pbc301', courseId: 'crs-bca', courseCode: 'BCA', code: 'PBC301', name: 'Data Structures Laboratory', semester: 3, credits: 2, weeklyLectureCount: 0, weeklyLabCount: 2, requiresLab: true, preferredRoomType: 'COMPUTER_LAB' },
  { id: 'sub-pbc302', courseId: 'crs-bca', courseCode: 'BCA', code: 'PBC302', name: 'Database Management System Laboratory', semester: 3, credits: 2, weeklyLectureCount: 0, weeklyLabCount: 2, requiresLab: true, preferredRoomType: 'COMPUTER_LAB' },

  // BCA V
  { id: 'sub-tbc501', courseId: 'crs-bca', courseCode: 'BCA', code: 'TBC501', name: 'Introduction to Java Programming', semester: 5, credits: 4, weeklyLectureCount: 4, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-tbc502', courseId: 'crs-bca', courseCode: 'BCA', code: 'TBC502', name: 'Introduction to Data Mining', semester: 5, credits: 4, weeklyLectureCount: 4, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-tbc503', courseId: 'crs-bca', courseCode: 'BCA', code: 'TBC503', name: 'Introduction to Microcontrollers', semester: 5, credits: 4, weeklyLectureCount: 4, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-tbc522', courseId: 'crs-bca', courseCode: 'BCA', code: 'TBC522', name: 'Introduction to Machine Learning', semester: 5, credits: 3, weeklyLectureCount: 3, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-tbc525', courseId: 'crs-bca', courseCode: 'BCA', code: 'TBC525', name: 'Introduction to .NET Programming', semester: 5, credits: 3, weeklyLectureCount: 3, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-tbc504', courseId: 'crs-bca', courseCode: 'BCA', code: 'TBC504', name: 'Skills for Career Success – 3', semester: 5, credits: 2, weeklyLectureCount: 2, weeklyLabCount: 0, requiresLab: false, preferredRoomType: 'LECTURE_HALL' },
  { id: 'sub-pbc501', courseId: 'crs-bca', courseCode: 'BCA', code: 'PBC501', name: 'Java Programming Laboratory', semester: 5, credits: 2, weeklyLectureCount: 0, weeklyLabCount: 2, requiresLab: true, preferredRoomType: 'COMPUTER_LAB' },
  { id: 'sub-pbc502', courseId: 'crs-bca', courseCode: 'BCA', code: 'PBC502', name: 'Data Mining Laboratory', semester: 5, credits: 2, weeklyLectureCount: 0, weeklyLabCount: 2, requiresLab: true, preferredRoomType: 'COMPUTER_LAB' }
];

/**
 * Default password mandated for all enrolled college students
 */
export const DEFAULT_STUDENT_PASSWORD = 'Moodle@123';

/**
 * Verified Enrolled Students Roster with 8-digit Student IDs
 * Default password: Moodle@123
 */
export const COLLEGE_STUDENTS: Student[] = [
  {
    id: 'std-20240003',
    studentId: '20240003',
    fullName: 'Amit Patel',
    email: 'amit.patel.24@college.edu',
    courseCode: 'BCA',
    semester: 5,
    sectionId: 'sec-bca-5-c',
    sectionName: "BCA V SEC 'C'",
    rollNumber: 'BCA/2022/043',
    avatarInitials: 'AP'
  },
  {
    id: 'std-20240001',
    studentId: '20240001',
    fullName: 'Rahul Verma',
    email: 'rahul.verma.24@college.edu',
    courseCode: 'BCA',
    semester: 1,
    sectionId: 'sec-bca-1-g1',
    sectionName: "BCA I 'G1' (NCR1)",
    rollNumber: 'BCA/2024/001',
    avatarInitials: 'RV'
  },
  {
    id: 'std-20240002',
    studentId: '20240002',
    fullName: 'Priya Sharma',
    email: 'priya.sharma.24@college.edu',
    courseCode: 'BCA',
    semester: 1,
    sectionId: 'sec-bca-1-g2',
    sectionName: "BCA I 'G2' (NCR6)",
    rollNumber: 'BCA/2024/002',
    avatarInitials: 'PS'
  },
  {
    id: 'std-20240004',
    studentId: '20240004',
    fullName: 'Sneha Rawat',
    email: 'sneha.rawat.24@college.edu',
    courseCode: 'BCA',
    semester: 3,
    sectionId: 'sec-bca-3-g1',
    sectionName: "BCA III 'G1' (CR1)",
    rollNumber: 'BCA/2023/018',
    avatarInitials: 'SR'
  },
  {
    id: 'std-20240005',
    studentId: '20240005',
    fullName: 'Rohan Joshi',
    email: 'rohan.joshi.24@college.edu',
    courseCode: 'BCA',
    semester: 5,
    sectionId: 'sec-bca-5-a',
    sectionName: "BCA V SEC 'A'",
    rollNumber: 'BCA/2022/012',
    avatarInitials: 'RJ'
  },
  {
    id: 'std-20240006',
    studentId: '20240006',
    fullName: 'Ananya Negi',
    email: 'ananya.negi.24@college.edu',
    courseCode: 'MCA',
    semester: 1,
    sectionId: 'sec-mca-1-g1',
    sectionName: "MCA I SEC 'G1' (LT3)",
    rollNumber: 'MCA/2024/009',
    avatarInitials: 'AN'
  },
  {
    id: 'std-20240007',
    studentId: '20240007',
    fullName: 'Ayush Bhatt',
    email: 'ayush.bhatt.24@college.edu',
    courseCode: 'BCA',
    semester: 5,
    sectionId: 'sec-bca-5-b',
    sectionName: "BCA V SEC 'B'",
    rollNumber: 'BCA/2022/025',
    avatarInitials: 'AB'
  },
  {
    id: 'std-20240008',
    studentId: '20240008',
    fullName: 'Kavita Bisht',
    email: 'kavita.bisht.24@college.edu',
    courseCode: 'BCA',
    semester: 3,
    sectionId: 'sec-bca-3-g2',
    sectionName: "BCA III 'G2' (CR4)",
    rollNumber: 'BCA/2023/044',
    avatarInitials: 'KB'
  }
];

/**
 * Autonomous Conflict-Resolved & Optimized College Timetable
 * - Zero 2-3 hour student idle gaps
 * - 100% Conflict-Free (0 teacher, 0 room, 0 section collisions)
 * - Compact cohort shift blocks & balanced faculty workload
 * - Exact curriculum preservation: same teachers, same subjects, same sections
 */
export const COLLEGE_TIMETABLE_ENTRIES: TimetableEntry[] = OPTIMIZED_COLLEGE_TIMETABLE_ENTRIES;

/**
 * Legacy Raw Timetable (Direct from Scanned Charts)
 * Kept for side-by-side comparison to demonstrate elimination of wasted hours!
 */
export const LEGACY_RAW_TIMETABLE_ENTRIES: TimetableEntry[] = ALL_COLLEGE_TIMETABLE_ENTRIES;
