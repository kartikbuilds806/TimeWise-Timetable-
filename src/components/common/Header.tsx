import React from 'react';
import { UserRole, Student, Teacher } from '../../types';
import { 
  CalendarDays, 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  Clock, 
  Sparkles,
  BookOpen,
  LogOut,
  KeyRound,
  User,
  BadgeCheck
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTimetableStatus?: string;
  versionNumber?: number;
  academicYear: string;
  activeStudent?: Student;
  activeTeacher?: Teacher;
  onOpenLoginPortal: (tab?: 'STUDENT' | 'TEACHER' | 'ADMIN') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeTimetableStatus = 'PUBLISHED',
  versionNumber = 1,
  academicYear = '2025-2026',
  activeStudent,
  activeTeacher,
  onOpenLoginPortal
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <CalendarDays className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">SmartSync</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                  AY {academicYear}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">College Timetable Management System</p>
            </div>
          </div>

          {/* Center Status Indicators */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Timetable:</span>
              <span className={`font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded ${
                activeTimetableStatus === 'PUBLISHED' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}>
                {activeTimetableStatus}
              </span>
              <span className="text-slate-400">|</span>
              <span className="font-medium text-slate-700">v{versionNumber}.0</span>
            </div>
          </div>

          {/* Right Role Console & User Identity */}
          <div className="flex items-center gap-3">
            {/* 1. STUDENT LOGGED IN: Strictly student identity, NO access to teacher or admin panels */}
            {currentRole === 'ROLE_STUDENT' && (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs">
                  <div className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-[10px]">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-slate-900 block leading-tight">
                      {activeStudent?.fullName || 'Enrolled Student'}
                    </span>
                    <span className="text-[10px] text-blue-800 font-mono">
                      ID: {activeStudent?.studentId || '20240003'} • {activeStudent?.sectionName || "BCA V 'C'"}
                    </span>
                  </div>
                </div>

                <button
                  id="header-switch-account-student"
                  type="button"
                  onClick={() => onOpenLoginPortal('STUDENT')}
                  title="Switch User / Sign In"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Switch Account</span>
                </button>
              </div>
            )}

            {/* 2. TEACHER LOGGED IN: Strictly faculty identity, NO access to student or admin panels */}
            {currentRole === 'ROLE_TEACHER' && (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs">
                  <div className="w-6 h-6 rounded-full bg-indigo-900 text-white flex items-center justify-center font-bold text-[10px]">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-slate-900 block leading-tight">
                      {activeTeacher?.fullName || 'Faculty Member'}
                    </span>
                    <span className="text-[10px] text-indigo-800 font-mono">
                      {activeTeacher?.employeeId || 'FAC-026'} • {activeTeacher?.department || 'Computer Science'}
                    </span>
                  </div>
                </div>

                <button
                  id="header-switch-account-teacher"
                  type="button"
                  onClick={() => onOpenLoginPortal('TEACHER')}
                  title="Switch User / Sign In"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Switch Account</span>
                </button>
              </div>
            )}

            {/* 3. ADMIN LOGGED IN: Full oversight across both student and teacher */}
            {currentRole === 'ROLE_ADMIN' && (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
                  <span>Admin Mode (All Access)</span>
                </div>

                {/* Admin Role Preview Console (Admin can see both student and teacher) */}
                <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    id="role-btn-admin"
                    type="button"
                    onClick={() => onRoleChange('ROLE_ADMIN')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-blue-900 shadow-xs border border-slate-200"
                  >
                    <ShieldCheck className="w-3 h-3 text-blue-700" />
                    <span>Admin</span>
                  </button>

                  <button
                    id="role-btn-teacher-preview"
                    type="button"
                    onClick={() => onRoleChange('ROLE_TEACHER')}
                    title="Inspect Teacher View"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    <UserCheck className="w-3 h-3 text-indigo-700" />
                    <span className="hidden sm:inline">Teacher View</span>
                  </button>

                  <button
                    id="role-btn-student-preview"
                    type="button"
                    onClick={() => onRoleChange('ROLE_STUDENT')}
                    title="Inspect Student View"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    <GraduationCap className="w-3 h-3 text-emerald-700" />
                    <span className="hidden sm:inline">Student View</span>
                  </button>
                </div>

                <button
                  id="header-open-login-portal-admin"
                  type="button"
                  onClick={() => onOpenLoginPortal('ADMIN')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden md:inline">Sign In Gateway</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
