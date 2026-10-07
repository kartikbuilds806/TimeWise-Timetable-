/**
 * SmartSync: College Timetable Management System
 * NOTICE: The following records represent SAMPLE DATA exclusively intended
 * for development, unit verification, and interface demonstration.
 * No real university personnel or infrastructure is represented.
 */

import { Course, Section, Subject, Teacher, Room, TimeSlot, User } from '../types';

export const SAMPLE_USERS: User[] = [
  {
    id: 'usr-admin-1',
    username: 'admin',
    email: 'admin@college.edu',
    firstName: 'Academic',
    lastName: 'Dean',
    role: 'ROLE_ADMIN'
  },
  {
    id: 'usr-prof-sharma',
    username: 'a.sharma',
    email: 'a.sharma@college.edu',
    firstName: 'Arvind',
    lastName: 'Sharma',
    role: 'ROLE_TEACHER',
    relatedEntityId: 'tch-1'
  },
  {
    id: 'usr-student-bca-a',
    username: 'student.bca',
    email: 'student.bca3a@college.edu',
    firstName: 'Rohan',
    lastName: 'Kapoor',
    role: 'ROLE_STUDENT',
    relatedEntityId: 'sec-bca-3a'
  }
];

export const SAMPLE_COURSES: Course[] = [
  {
    id: 'crs-bca',
    code: 'BCA',
    name: 'Bachelor of Computer Applications',
    department: 'Computer Science',
    durationYears: 3,
    totalSemesters: 6,
    isActive: true
  },
  {
    id: 'crs-btech-cse',
    code: 'BTECH_CSE',
    name: 'B.Tech in Computer Science & Engineering',
    department: 'Engineering',
    durationYears: 4,
    totalSemesters: 8,
    isActive: true
  },
  {
    id: 'crs-bba',
    code: 'BBA',
    name: 'Bachelor of Business Administration',
    department: 'Management',
    durationYears: 3,
    totalSemesters: 6,
    isActive: true
  }
];

export const SAMPLE_SECTIONS: Section[] = [
  {
    id: 'sec-bca-3a',
    courseId: 'crs-bca',
    courseCode: 'BCA',
    semester: 3,
    name: 'Section A',
    academicYear: '2026-2027',
    studentCount: 45
  },
  {
    id: 'sec-bca-3b',
    courseId: 'crs-bca',
    courseCode: 'BCA',
    semester: 3,
    name: 'Section B',
    academicYear: '2026-2027',
    studentCount: 42
  },
  {
    id: 'sec-cse-3a',
    courseId: 'crs-btech-cse',
    courseCode: 'BTECH_CSE',
    semester: 3,
    name: 'CSE-3A',
    academicYear: '2026-2027',
    studentCount: 55
  }
];

export const SAMPLE_SUBJECTS: Subject[] = [
  {
    id: 'sub-bca-301',
    courseId: 'crs-bca',
    courseCode: 'BCA',
    code: 'BCA301',
    name: 'Data Structures & Algorithms',
    semester: 3,
    credits: 4,
    weeklyLectureCount: 3,
    weeklyLabCount: 1,
    requiresLab: true,
    preferredRoomType: 'COMPUTER_LAB'
  },
  {
    id: 'sub-bca-302',
    courseId: 'crs-bca',
    courseCode: 'BCA',
    code: 'BCA302',
    name: 'Database Management Systems',
    semester: 3,
    credits: 4,
    weeklyLectureCount: 3,
    weeklyLabCount: 1,
    requiresLab: true,
    preferredRoomType: 'COMPUTER_LAB'
  },
  {
    id: 'sub-bca-303',
    courseId: 'crs-bca',
    courseCode: 'BCA',
    code: 'BCA303',
    name: 'Object Oriented Programming with Java',
    semester: 3,
    credits: 4,
    weeklyLectureCount: 3,
    weeklyLabCount: 1,
    requiresLab: true,
    preferredRoomType: 'COMPUTER_LAB'
  },
  {
    id: 'sub-bca-304',
    courseId: 'crs-bca',
    courseCode: 'BCA',
    code: 'BCA304',
    name: 'Discrete Mathematics',
    semester: 3,
    credits: 3,
    weeklyLectureCount: 3,
    weeklyLabCount: 0,
    requiresLab: false,
    preferredRoomType: 'LECTURE_HALL'
  },
  {
    id: 'sub-bca-305',
    courseId: 'crs-bca',
    courseCode: 'BCA',
    code: 'BCA305',
    name: 'Computer Architecture & Organization',
    semester: 3,
    credits: 3,
    weeklyLectureCount: 3,
    weeklyLabCount: 0,
    requiresLab: false,
    preferredRoomType: 'LECTURE_HALL'
  }
];

export const SAMPLE_TEACHERS: Teacher[] = [
  {
    id: 'tch-1',
    employeeId: 'EMP-CS-101',
    fullName: 'Dr. Arvind Sharma',
    email: 'a.sharma@college.edu',
    department: 'Computer Science',
    designation: 'Professor',
    maxDailyLectures: 3,
    qualifiedSubjectCodes: ['BCA301', 'BCA303'],
    unavailableSlotIds: ['slot-fri-5']
  },
  {
    id: 'tch-2',
    employeeId: 'EMP-CS-102',
    fullName: 'Prof. Priya Nair',
    email: 'p.nair@college.edu',
    department: 'Computer Science',
    designation: 'Associate Professor',
    maxDailyLectures: 4,
    qualifiedSubjectCodes: ['BCA302'],
    unavailableSlotIds: []
  },
  {
    id: 'tch-3',
    employeeId: 'EMP-CS-103',
    fullName: 'Dr. Rajesh Verma',
    email: 'r.verma@college.edu',
    department: 'Computer Science',
    designation: 'Assistant Professor',
    maxDailyLectures: 4,
    qualifiedSubjectCodes: ['BCA303', 'BCA305'],
    unavailableSlotIds: []
  },
  {
    id: 'tch-4',
    employeeId: 'EMP-MATH-201',
    fullName: 'Prof. Sunita Rao',
    email: 's.rao@college.edu',
    department: 'Mathematics',
    designation: 'Associate Professor',
    maxDailyLectures: 3,
    qualifiedSubjectCodes: ['BCA304'],
    unavailableSlotIds: ['slot-mon-1']
  }
];

export const SAMPLE_ROOMS: Room[] = [
  {
    id: 'rm-lh-101',
    roomNumber: 'LH-101',
    building: 'Aryabhatta Block',
    floorLevel: 1,
    roomType: 'LECTURE_HALL',
    capacity: 60,
    isAvailable: true
  },
  {
    id: 'rm-lh-102',
    roomNumber: 'LH-102',
    building: 'Aryabhatta Block',
    floorLevel: 1,
    roomType: 'LECTURE_HALL',
    capacity: 60,
    isAvailable: true
  },
  {
    id: 'rm-lab-201',
    roomNumber: 'LAB-201 (CS Lab)',
    building: 'Turing Computing Center',
    floorLevel: 2,
    roomType: 'COMPUTER_LAB',
    capacity: 50,
    isAvailable: true
  },
  {
    id: 'rm-lab-202',
    roomNumber: 'LAB-202 (Systems Lab)',
    building: 'Turing Computing Center',
    floorLevel: 2,
    roomType: 'COMPUTER_LAB',
    capacity: 50,
    isAvailable: true
  }
];

const DAYS: Array<'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY'> = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY'
];

export const SAMPLE_TIME_SLOTS: TimeSlot[] = [];

DAYS.forEach((day) => {
  const dayPrefix = day.substring(0, 3).toLowerCase();
  SAMPLE_TIME_SLOTS.push(
    { id: `slot-${dayPrefix}-1`, dayOfWeek: day, slotOrder: 1, startTime: '09:00', endTime: '09:55', isBreak: false, academicYear: '2026-2027' },
    { id: `slot-${dayPrefix}-2`, dayOfWeek: day, slotOrder: 2, startTime: '10:00', endTime: '10:55', isBreak: false, academicYear: '2026-2027' },
    { id: `slot-${dayPrefix}-3`, dayOfWeek: day, slotOrder: 3, startTime: '11:00', endTime: '11:55', isBreak: false, academicYear: '2026-2027' },
    { id: `slot-${dayPrefix}-4`, dayOfWeek: day, slotOrder: 4, startTime: '12:00', endTime: '12:45', isBreak: true, breakLabel: 'Lunch Recess', academicYear: '2026-2027' },
    { id: `slot-${dayPrefix}-5`, dayOfWeek: day, slotOrder: 5, startTime: '12:45', endTime: '13:40', isBreak: false, academicYear: '2026-2027' },
    { id: `slot-${dayPrefix}-6`, dayOfWeek: day, slotOrder: 6, startTime: '13:45', endTime: '14:40', isBreak: false, academicYear: '2026-2027' }
  );
});
