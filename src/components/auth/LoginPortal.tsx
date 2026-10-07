import React, { useState } from 'react';
import { UserRole, Student, Teacher } from '../../types';
import { COLLEGE_STUDENTS, DEFAULT_STUDENT_PASSWORD, COLLEGE_TEACHERS } from '../../data/collegeTimetableData';
import { 
  GraduationCap, 
  UserCheck, 
  ShieldCheck, 
  Lock, 
  User, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Building2,
  CalendarDays
} from 'lucide-react';

interface LoginPortalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginStudent: (student: Student) => void;
  onLoginTeacher: (teacher: Teacher) => void;
  onLoginAdmin: () => void;
  initialTab?: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

export const LoginPortal: React.FC<LoginPortalProps> = ({
  isOpen,
  onClose,
  onLoginStudent,
  onLoginTeacher,
  onLoginAdmin,
  initialTab = 'STUDENT'
}) => {
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>(initialTab);

  // Student Form State
  const [studentIdInput, setStudentIdInput] = useState<string>('20240003'); // Amit Patel (BCA V SEC C)
  const [studentPasswordInput, setStudentPasswordInput] = useState<string>(DEFAULT_STUDENT_PASSWORD);
  const [studentError, setStudentError] = useState<string>('');

  // Teacher Form State
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('tch-bhawnesh-kumar');
  const [teacherPasswordInput, setTeacherPasswordInput] = useState<string>('College@123');
  const [teacherError, setTeacherError] = useState<string>('');

  if (!isOpen) return null;

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');

    const trimmedId = studentIdInput.trim();
    if (!/^\d{8}$/.test(trimmedId)) {
      setStudentError('Student ID must be exactly 8 numeric digits (e.g. 20240003).');
      return;
    }

    if (studentPasswordInput !== DEFAULT_STUDENT_PASSWORD) {
      setStudentError(`Invalid password. All college students must use the default password: ${DEFAULT_STUDENT_PASSWORD}`);
      return;
    }

    const matchedStudent = COLLEGE_STUDENTS.find(s => s.studentId === trimmedId);
    if (!matchedStudent) {
      setStudentError(`No enrolled student found with 8-digit ID: ${trimmedId}. Please check your ID or select from the college roster.`);
      return;
    }

    onLoginStudent(matchedStudent);
    if (onClose) onClose();
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError('');

    const matchedTeacher = COLLEGE_TEACHERS.find(t => t.id === selectedTeacherId);
    if (!matchedTeacher) {
      setTeacherError('Please select a valid faculty member.');
      return;
    }

    onLoginTeacher(matchedTeacher);
    if (onClose) onClose();
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginAdmin();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="login-portal-modal"
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header Branding */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <CalendarDays className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">SmartSync College Portal</h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Authentication Gateway
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5">
                Role-Based Access Control • Isolated Profiles • Secure Academic Authentication
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="mt-5 grid grid-cols-3 p-1 bg-black/25 rounded-xl border border-white/10 text-xs">
            <button
              id="tab-btn-student-login"
              type="button"
              onClick={() => { setActiveTab('STUDENT'); setStudentError(''); }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'STUDENT'
                  ? 'bg-white text-blue-900 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student</span>
            </button>

            <button
              id="tab-btn-teacher-login"
              type="button"
              onClick={() => { setActiveTab('TEACHER'); setTeacherError(''); }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'TEACHER'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Teacher</span>
            </button>

            <button
              id="tab-btn-admin-login"
              type="button"
              onClick={() => setActiveTab('ADMIN')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'ADMIN'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 bg-slate-50/50">
          {/* ======================================================== */}
          {/* STUDENT LOGIN FORM */}
          {/* ======================================================== */}
          {activeTab === 'STUDENT' && (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Student Authentication Policy:</strong>
                  <span>
                    Students log in using their registered <strong>8-digit Student ID</strong> and mandatory default password{' '}
                    <code className="px-1.5 py-0.5 rounded bg-blue-100 font-mono text-[11px] font-bold text-blue-950">
                      Moodle@123
                    </code>.
                    Students have strict access to their personal profile and section timetable only.
                  </span>
                </div>
              </div>

              {studentError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{studentError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  8-Digit Student ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-student-id"
                    type="text"
                    maxLength={8}
                    required
                    value={studentIdInput}
                    onChange={e => setStudentIdInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 20240003"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent tracking-widest"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {studentIdInput.length}/8 digits entered
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Student Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-student-password"
                    type="text"
                    required
                    value={studentPasswordInput}
                    onChange={e => setStudentPasswordInput(e.target.value)}
                    placeholder="Moodle@123"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono"
                  />
                </div>
              </div>

              {/* Quick 1-click student selection for verification */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                  Quick Select Enrolled Student:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {COLLEGE_STUDENTS.slice(0, 4).map(std => (
                    <button
                      key={std.id}
                      type="button"
                      onClick={() => {
                        setStudentIdInput(std.studentId);
                        setStudentPasswordInput(DEFAULT_STUDENT_PASSWORD);
                        setStudentError('');
                      }}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        studentIdInput === std.studentId
                          ? 'bg-blue-50 border-blue-400 text-blue-900 ring-1 ring-blue-400'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{std.fullName}</span>
                        <span className="font-mono text-[10px] text-blue-700">{std.studentId}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{std.sectionName}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-submit-student-login"
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer"
                >
                  <span>Log In as Student</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* TEACHER LOGIN FORM */}
          {/* ======================================================== */}
          {activeTab === 'TEACHER' && (
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Faculty Portal Permissions:</strong>
                  <span>
                    Teachers have exclusive access to their personal profile, teaching schedule, the ability to{' '}
                    <strong>cancel classes before 4:00 PM with notice</strong>, and an option to{' '}
                    <strong>check other teachers' timings</strong>. Teachers cannot view the student or admin panels.
                  </span>
                </div>
              </div>

              {teacherError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{teacherError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Faculty Member <span className="text-red-500">*</span>
                </label>
                <select
                  id="select-teacher-profile"
                  value={selectedTeacherId}
                  onChange={e => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-transparent font-medium"
                >
                  {COLLEGE_TEACHERS.map(tch => (
                    <option key={tch.id} value={tch.id}>
                      {tch.fullName} ({tch.employeeId}) — {tch.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Faculty Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-teacher-password"
                    type="password"
                    value={teacherPasswordInput}
                    onChange={e => setTeacherPasswordInput(e.target.value)}
                    placeholder="College@123"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Quick select highlights */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                  Featured Faculty Profiles:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedTeacherId('tch-bhawnesh-kumar')}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      selectedTeacherId === 'tch-bhawnesh-kumar'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-900 ring-1 ring-indigo-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold">Dr. Bhawnesh Kumar</div>
                    <div className="text-[11px] text-indigo-700">Java Programming (BCA V Sec C)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTeacherId('tch-abhishek-thapa')}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      selectedTeacherId === 'tch-abhishek-thapa'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-900 ring-1 ring-indigo-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold">Mr. Abhishek Thapa</div>
                    <div className="text-[11px] text-indigo-700">Foundations of Programming</div>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-submit-teacher-login"
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-900 hover:bg-indigo-800 text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer"
                >
                  <span>Log In as Faculty</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* ADMIN LOGIN FORM */}
          {/* ======================================================== */}
          {activeTab === 'ADMIN' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Academic Administrator Permissions:</strong>
                  <span>
                    Admins have full oversight across the entire college system. Admins can view both student and teacher panels,
                    generate timetables, optimize constraints, resolve conflicts, and track all cancellations and audit logs.
                  </span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Account:</span>
                  <span className="font-semibold text-slate-900">College Academic Administrator / Dean</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Access Scope:</span>
                  <span className="font-semibold text-emerald-700">Full Access (Both Student & Teacher)</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-submit-admin-login"
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer"
                >
                  <span>Log In as Academic Administrator</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
