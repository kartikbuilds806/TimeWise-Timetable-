import React, { useState } from 'react';
import { 
  Course, 
  Section, 
  Subject, 
  Teacher, 
  Room, 
  TimeSlot 
} from '../../types';
import { 
  BookOpen, 
  Users, 
  BookMarked, 
  GraduationCap, 
  DoorOpen, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle,
  FlaskConical
} from 'lucide-react';

interface ResourceManagementProps {
  courses: Course[];
  sections: Section[];
  subjects: Subject[];
  teachers: Teacher[];
  rooms: Room[];
  timeSlots: TimeSlot[];
  onAddSubject: (subject: Subject) => void;
  onAddTeacher: (teacher: Teacher) => void;
  onAddRoom: (room: Room) => void;
  onAddSection: (section: Section) => void;
}

type TabType = 'COURSES' | 'SECTIONS' | 'SUBJECTS' | 'TEACHERS' | 'ROOMS' | 'TIMESLOTS';

export const ResourceManagement: React.FC<ResourceManagementProps> = ({
  courses,
  sections,
  subjects,
  teachers,
  rooms,
  timeSlots,
  onAddSubject,
  onAddTeacher,
  onAddRoom,
  onAddSection
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('SUBJECTS');

  // Simple Add Modals or Inline forms state
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState<Partial<Subject>>({
    courseCode: 'BCA',
    code: '',
    name: '',
    semester: 3,
    credits: 4,
    weeklyLectureCount: 3,
    weeklyLabCount: 0,
    requiresLab: false,
    preferredRoomType: 'LECTURE_HALL'
  });

  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({
    employeeId: '',
    fullName: '',
    email: '',
    department: 'Computer Science',
    designation: 'Assistant Professor',
    maxDailyLectures: 4,
    qualifiedSubjectCodes: []
  });

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.code || !newSubject.name) return;
    const course = courses.find(c => c.code === newSubject.courseCode) || courses[0];
    const created: Subject = {
      id: `sub-${Date.now()}`,
      courseId: course.id,
      courseCode: course.code,
      code: newSubject.code.toUpperCase(),
      name: newSubject.name,
      semester: Number(newSubject.semester) || 3,
      credits: Number(newSubject.credits) || 4,
      weeklyLectureCount: Number(newSubject.weeklyLectureCount) || 3,
      weeklyLabCount: Number(newSubject.weeklyLabCount) || 0,
      requiresLab: !!newSubject.requiresLab,
      preferredRoomType: newSubject.requiresLab ? 'COMPUTER_LAB' : 'LECTURE_HALL'
    };
    onAddSubject(created);
    setShowAddSubject(false);
    setNewSubject({
      courseCode: 'BCA',
      code: '',
      name: '',
      semester: 3,
      credits: 4,
      weeklyLectureCount: 3,
      weeklyLabCount: 0,
      requiresLab: false,
      preferredRoomType: 'LECTURE_HALL'
    });
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.fullName || !newTeacher.employeeId) return;
    const created: Teacher = {
      id: `tch-${Date.now()}`,
      employeeId: newTeacher.employeeId,
      fullName: newTeacher.fullName,
      email: newTeacher.email || `${newTeacher.employeeId.toLowerCase()}@college.edu`,
      department: newTeacher.department || 'Computer Science',
      designation: newTeacher.designation || 'Assistant Professor',
      maxDailyLectures: Number(newTeacher.maxDailyLectures) || 4,
      qualifiedSubjectCodes: newTeacher.qualifiedSubjectCodes || ['BCA301'],
      unavailableSlotIds: []
    };
    onAddTeacher(created);
    setShowAddTeacher(false);
    setNewTeacher({
      employeeId: '',
      fullName: '',
      email: '',
      department: 'Computer Science',
      designation: 'Assistant Professor',
      maxDailyLectures: 4,
      qualifiedSubjectCodes: []
    });
  };

  return (
    <div className="space-y-5">
      {/* Sub-navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('SUBJECTS')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'SUBJECTS'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookMarked className="w-4 h-4" />
          Subjects ({subjects.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TEACHERS')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'TEACHERS'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Teachers ({teachers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ROOMS')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'ROOMS'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          Classrooms & Labs ({rooms.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COURSES')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'COURSES'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Courses ({courses.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SECTIONS')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'SECTIONS'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Sections ({sections.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TIMESLOTS')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'TIMESLOTS'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          Time Slots ({timeSlots.length})
        </button>
      </div>

      {/* TAB 1: SUBJECTS */}
      {activeTab === 'SUBJECTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Curriculum Subjects</h3>
              <p className="text-xs text-slate-500">Defines weekly lecture and lab counts, credits, and facility needs</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddSubject(!showAddSubject)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Subject
            </button>
          </div>

          {/* Add Subject Inline Form */}
          {showAddSubject && (
            <form onSubmit={handleCreateSubject} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
              <div className="font-semibold text-slate-800">Add Academic Subject</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BCA306"
                    value={newSubject.code}
                    onChange={e => setNewSubject({ ...newSubject, code: e.target.value })}
                    className="w-full border border-slate-300 rounded-md p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Web Technologies"
                    value={newSubject.name}
                    onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-md p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Course</label>
                  <select
                    value={newSubject.courseCode}
                    onChange={e => setNewSubject({ ...newSubject, courseCode: e.target.value })}
                    className="w-full border border-slate-300 rounded-md p-2 bg-white"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.code}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={newSubject.semester}
                    onChange={e => setNewSubject({ ...newSubject, semester: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-md p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Weekly Lectures</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newSubject.weeklyLectureCount}
                    onChange={e => setNewSubject({ ...newSubject, weeklyLectureCount: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-md p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Weekly Labs</label>
                  <input
                    type="number"
                    min="0"
                    max="3"
                    value={newSubject.weeklyLabCount}
                    onChange={e => setNewSubject({ ...newSubject, weeklyLabCount: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-md p-2 bg-white"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSubject.requiresLab}
                      onChange={e => setNewSubject({ ...newSubject, requiresLab: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600"
                    />
                    <span className="text-slate-700 font-medium">Requires Lab Facility</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubject(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-900 text-white rounded-md font-semibold"
                >
                  Save Subject
                </button>
              </div>
            </form>
          )}

          {/* Subjects Table */}
          <div className="academic-subtle-card overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Code</th>
                  <th className="py-2.5 px-4 font-semibold">Subject Title</th>
                  <th className="py-2.5 px-4 font-semibold">Course / Sem</th>
                  <th className="py-2.5 px-4 font-semibold">Lectures/Wk</th>
                  <th className="py-2.5 px-4 font-semibold">Labs/Wk</th>
                  <th className="py-2.5 px-4 font-semibold">Facility Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subjects.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{sub.code}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{sub.name}</td>
                    <td className="py-2.5 px-4 text-slate-600">{sub.courseCode} (Sem {sub.semester})</td>
                    <td className="py-2.5 px-4 text-slate-700">{sub.weeklyLectureCount} lectures</td>
                    <td className="py-2.5 px-4 text-slate-700">
                      {sub.weeklyLabCount > 0 ? (
                        <span className="text-indigo-700 font-semibold">{sub.weeklyLabCount} sessions</span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      {sub.requiresLab ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                          <FlaskConical className="w-3 h-3" /> Computer Lab
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          Lecture Hall
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TEACHERS */}
      {activeTab === 'TEACHERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Faculty Members</h3>
              <p className="text-xs text-slate-500">Qualified subjects, daily maximum lectures, and availability</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddTeacher(!showAddTeacher)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Faculty
            </button>
          </div>

          {/* Add Teacher Form */}
          {showAddTeacher && (
            <form onSubmit={handleCreateTeacher} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
              <div className="font-semibold text-slate-800">Add Faculty Member</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP-CS-105"
                    value={newTeacher.employeeId}
                    onChange={e => setNewTeacher({ ...newTeacher, employeeId: e.target.value })}
                    className="w-full border border-slate-300 rounded-md p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Alok Nath"
                    value={newTeacher.fullName}
                    onChange={e => setNewTeacher({ ...newTeacher, fullName: e.target.value })}
                    className="w-full border border-slate-300 rounded-md p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    placeholder="Computer Science"
                    value={newTeacher.department}
                    onChange={e => setNewTeacher({ ...newTeacher, department: e.target.value })}
                    className="w-full border border-slate-300 rounded-md p-2 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeacher(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-900 text-white rounded-md font-semibold"
                >
                  Save Faculty
                </button>
              </div>
            </form>
          )}

          {/* Teachers Table */}
          <div className="academic-subtle-card overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Employee ID</th>
                  <th className="py-2.5 px-4 font-semibold">Faculty Name</th>
                  <th className="py-2.5 px-4 font-semibold">Department</th>
                  <th className="py-2.5 px-4 font-semibold">Designation</th>
                  <th className="py-2.5 px-4 font-semibold">Max Daily Classes</th>
                  <th className="py-2.5 px-4 font-semibold">Qualified Subjects</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {teachers.map(tch => (
                  <tr key={tch.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-bold text-slate-700">{tch.employeeId}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{tch.fullName}</td>
                    <td className="py-2.5 px-4 text-slate-600">{tch.department}</td>
                    <td className="py-2.5 px-4 text-slate-600">{tch.designation}</td>
                    <td className="py-2.5 px-4 text-slate-700">{tch.maxDailyLectures} / day</td>
                    <td className="py-2.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {tch.qualifiedSubjectCodes.map(code => (
                          <span key={code} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                            {code}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ROOMS */}
      {activeTab === 'ROOMS' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Physical Rooms & Laboratories</h3>
            <p className="text-xs text-slate-500">Seating capacities, building blocks, and room specialization</p>
          </div>

          <div className="academic-subtle-card overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Room Number</th>
                  <th className="py-2.5 px-4 font-semibold">Building & Floor</th>
                  <th className="py-2.5 px-4 font-semibold">Type</th>
                  <th className="py-2.5 px-4 font-semibold">Capacity</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rooms.map(rm => (
                  <tr key={rm.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{rm.roomNumber}</td>
                    <td className="py-2.5 px-4 text-slate-600">{rm.building} (Floor {rm.floorLevel})</td>
                    <td className="py-2.5 px-4">
                      {rm.roomType === 'COMPUTER_LAB' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                          <FlaskConical className="w-3 h-3" /> Computer Lab
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                          Lecture Hall
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{rm.capacity} seats</td>
                    <td className="py-2.5 px-4">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Available
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: COURSES */}
      {activeTab === 'COURSES' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Academic Programs / Courses</h3>
            <p className="text-xs text-slate-500">Degree programs registered in the institution (Non-BCA extensible)</p>
          </div>

          <div className="academic-subtle-card overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Course Code</th>
                  <th className="py-2.5 px-4 font-semibold">Program Name</th>
                  <th className="py-2.5 px-4 font-semibold">Department</th>
                  <th className="py-2.5 px-4 font-semibold">Duration</th>
                  <th className="py-2.5 px-4 font-semibold">Total Semesters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {courses.map(crs => (
                  <tr key={crs.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-bold text-blue-900">{crs.code}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{crs.name}</td>
                    <td className="py-2.5 px-4 text-slate-600">{crs.department}</td>
                    <td className="py-2.5 px-4 text-slate-600">{crs.durationYears} Years</td>
                    <td className="py-2.5 px-4 text-slate-600">{crs.totalSemesters} Semesters</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SECTIONS */}
      {activeTab === 'SECTIONS' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Student Cohorts / Sections</h3>
            <p className="text-xs text-slate-500">Student count per section and course linkages</p>
          </div>

          <div className="academic-subtle-card overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Section Name</th>
                  <th className="py-2.5 px-4 font-semibold">Course</th>
                  <th className="py-2.5 px-4 font-semibold">Semester</th>
                  <th className="py-2.5 px-4 font-semibold">Academic Year</th>
                  <th className="py-2.5 px-4 font-semibold">Enrolled Students</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sections.map(sec => (
                  <tr key={sec.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{sec.name}</td>
                    <td className="py-2.5 px-4 font-semibold text-blue-800">{sec.courseCode}</td>
                    <td className="py-2.5 px-4 text-slate-600">Semester {sec.semester}</td>
                    <td className="py-2.5 px-4 text-slate-600">{sec.academicYear}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-700">{sec.studentCount} students</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: TIME SLOTS */}
      {activeTab === 'TIMESLOTS' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Standard Institutional Time Slots</h3>
            <p className="text-xs text-slate-500">Monday through Friday periods, duration, and scheduled recess</p>
          </div>

          <div className="academic-subtle-card overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Day</th>
                  <th className="py-2.5 px-4 font-semibold">Period #</th>
                  <th className="py-2.5 px-4 font-semibold">Time Window</th>
                  <th className="py-2.5 px-4 font-semibold">Slot Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {timeSlots.slice(0, 12).map(slot => (
                  <tr key={slot.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{slot.dayOfWeek}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-700">Period {slot.slotOrder}</td>
                    <td className="py-2.5 px-4 text-slate-700">{slot.startTime} – {slot.endTime}</td>
                    <td className="py-2.5 px-4">
                      {slot.isBreak ? (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">
                          ☕ {slot.breakLabel}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          Instructional Lecture
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
