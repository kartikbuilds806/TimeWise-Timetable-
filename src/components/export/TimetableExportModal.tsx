import React, { useState } from 'react';
import { 
  TimetableEntry, 
  Section, 
  Teacher, 
  TimeSlot, 
  Course 
} from '../../types';
import { exportTimetableToCSV, triggerPrintTimetable } from '../../services/timetableExporter';
import { 
  X, 
  Printer, 
  FileSpreadsheet, 
  FileText, 
  CalendarDays, 
  Download, 
  Building2, 
  CheckCircle2, 
  Award, 
  Clock, 
  MapPin, 
  Sparkles 
} from 'lucide-react';

interface TimetableExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: TimetableEntry[];
  sections: Section[];
  teachers: Teacher[];
  timeSlots: TimeSlot[];
  academicYear: string;
  versionNumber: number;
}

export const TimetableExportModal: React.FC<TimetableExportModalProps> = ({
  isOpen,
  onClose,
  entries,
  sections,
  teachers,
  timeSlots,
  academicYear,
  versionNumber
}) => {
  const [exportScope, setExportScope] = useState<'ALL' | 'SECTION' | 'TEACHER'>('SECTION');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(sections[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');

  if (!isOpen) return null;

  // Filter entries based on scope
  const targetEntries = entries.filter(e => {
    if (exportScope === 'SECTION') return e.sectionId === selectedSectionId;
    if (exportScope === 'TEACHER') return e.teacherId === selectedTeacherId;
    return true;
  });

  const selectedSection = sections.find(s => s.id === selectedSectionId);
  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

  const scopeTitle = exportScope === 'SECTION'
    ? `Class Timetable: ${selectedSection?.name || 'Selected Section'}`
    : exportScope === 'TEACHER'
    ? `Faculty Workload Schedule: ${selectedTeacher?.fullName || 'Selected Faculty'}`
    : `Institutional Master Timetable (All Cohorts)`;

  const handleExportCSV = () => {
    const filename = `SmartSync_${exportScope}_Timetable_v${versionNumber}.csv`;
    exportTimetableToCSV(targetEntries, timeSlots, filename);
  };

  const handlePrint = () => {
    triggerPrintTimetable();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <Printer className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Official Timetable Publication & Export Center
              </h2>
              <p className="text-xs text-slate-500">
                Generate print-ready institutional documents or download standardized CSV datasets
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Target Scope Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div 
              onClick={() => setExportScope('SECTION')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                exportScope === 'SECTION'
                  ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                <FileText className="w-4 h-4 text-blue-700" />
                Section Timetable
              </div>
              <p className="text-slate-500 text-[11px]">Export a specific cohort (e.g. BCA V Sec C) for student notice boards.</p>
            </div>

            <div 
              onClick={() => setExportScope('TEACHER')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                exportScope === 'TEACHER'
                  ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                <Printer className="w-4 h-4 text-blue-700" />
                Faculty Individual Schedule
              </div>
              <p className="text-slate-500 text-[11px]">Generate verified teaching workload dossier for individual faculty.</p>
            </div>

            <div 
              onClick={() => setExportScope('ALL')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                exportScope === 'ALL'
                  ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                <FileSpreadsheet className="w-4 h-4 text-blue-700" />
                Full Institution Master Sheet
              </div>
              <p className="text-slate-500 text-[11px]">Export all courses, sections, and venues in a single consolidated report.</p>
            </div>
          </div>

          {/* Granular Dropdowns */}
          {exportScope === 'SECTION' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
              <label className="font-bold text-slate-700 shrink-0">Select Target Cohort:</label>
              <select
                value={selectedSectionId}
                onChange={e => setSelectedSectionId(e.target.value)}
                className="w-full sm:w-72 p-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {sections.map(sec => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} ({sec.courseCode} Sem {sec.semester} - {sec.studentCount} students)
                  </option>
                ))}
              </select>
            </div>
          )}

          {exportScope === 'TEACHER' && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
              <label className="font-bold text-slate-700 shrink-0">Select Faculty Member:</label>
              <select
                value={selectedTeacherId}
                onChange={e => setSelectedTeacherId(e.target.value)}
                className="w-full sm:w-72 p-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {teachers.map(tch => (
                  <option key={tch.id} value={tch.id}>
                    {tch.fullName} ({tch.employeeId} - {tch.designation})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Printable Document Preview */}
          <div className="border border-slate-300 rounded-xl p-6 bg-white shadow-inner space-y-4 print:p-0 print:border-none">
            {/* Letterhead */}
            <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Building2 className="w-5 h-5 text-blue-900" />
                <h1 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                  College of Computer Applications & Technology
                </h1>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Academic Timetable Office • Academic Year {academicYear} • Official Publication
              </p>
              <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                {scopeTitle}
              </h2>
              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400">
                <span>Version: v{versionNumber}.0 (Official)</span>
                <span>•</span>
                <span>Generated Date: {new Date().toLocaleDateString()}</span>
                <span>•</span>
                <span>Total Classes: {targetEntries.length}</span>
              </div>
            </div>

            {/* Timetable Snippet Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                    <th className="p-1.5 text-left font-bold">Day</th>
                    <th className="p-1.5 text-left font-bold">Slot</th>
                    <th className="p-1.5 text-left font-bold">Subject Code & Name</th>
                    <th className="p-1.5 text-left font-bold">Section</th>
                    <th className="p-1.5 text-left font-bold">Faculty</th>
                    <th className="p-1.5 text-left font-bold">Room</th>
                    <th className="p-1.5 text-left font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {targetEntries.slice(0, 10).map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50">
                      <td className="p-1.5 font-semibold text-slate-800">{entry.dayOfWeek}</td>
                      <td className="p-1.5 font-mono">P{entry.slotOrder}</td>
                      <td className="p-1.5 font-medium text-slate-900">
                        {entry.subjectCode}: {entry.subjectName}
                      </td>
                      <td className="p-1.5">{entry.sectionName}</td>
                      <td className="p-1.5 font-medium text-slate-800">
                        {entry.status === 'SUBSTITUTED' && entry.proxySubstitution
                          ? `${entry.proxySubstitution.proxyTeacherName} (Proxy)`
                          : entry.teacherName}
                      </td>
                      <td className="p-1.5 font-mono font-semibold">{entry.roomNumber}</td>
                      <td className="p-1.5">
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                          entry.status === 'CANCELLED' 
                            ? 'bg-rose-100 text-rose-800'
                            : entry.status === 'SUBSTITUTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {targetEntries.length > 10 && (
                <p className="text-[10px] text-center text-slate-400 mt-2 italic">
                  Showing 10 of {targetEntries.length} scheduled class sessions. Full matrix included in print/CSV export.
                </p>
              )}
            </div>

            {/* Official Signature Verification Blocks */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 text-center text-[10px] text-slate-600">
              <div className="border-t border-slate-400 pt-1">
                <span className="font-bold text-slate-900 block">Timetable Coordinator</span>
                <span>Department of Computer Applications</span>
              </div>
              <div className="border-t border-slate-400 pt-1">
                <span className="font-bold text-slate-900 block">Head of Department (HOD)</span>
                <span>Verified Curriculum Compliance</span>
              </div>
              <div className="border-t border-slate-400 pt-1">
                <span className="font-bold text-slate-900 block">Dean of Academic Affairs</span>
                <span>Institutional Seal & Approval</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export CSV (Excel)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Timetable / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
