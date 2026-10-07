import React, { useState } from 'react';
import { TimetableEntry, Teacher, Room, TimeSlot } from '../../types';
import { Edit3, MapPin, User, Clock, AlertTriangle, X } from 'lucide-react';

interface EditEntryModalProps {
  entry: TimetableEntry | null;
  teachers: Teacher[];
  rooms: Room[];
  timeSlots: TimeSlot[];
  onClose: () => void;
  onSave: (
    updatedEntry: TimetableEntry,
    reason: string,
    changeType: 'ROOM_CHANGE' | 'TIME_CHANGE' | 'TEACHER_CHANGE' | 'RESCHEDULE'
  ) => void;
}

export const EditEntryModal: React.FC<EditEntryModalProps> = ({
  entry,
  teachers,
  rooms,
  timeSlots,
  onClose,
  onSave
}) => {
  if (!entry) return null;

  const [selectedTeacherId, setSelectedTeacherId] = useState(entry.teacherId);
  const [selectedRoomId, setSelectedRoomId] = useState(entry.roomId);
  const [selectedSlotId, setSelectedSlotId] = useState(entry.timeSlotId);
  const [reason, setReason] = useState('Administrative rescheduling');

  const usableSlots = timeSlots.filter(s => !s.isBreak);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find(t => t.id === selectedTeacherId);
    const room = rooms.find(r => r.id === selectedRoomId);
    const slot = timeSlots.find(s => s.id === selectedSlotId);

    if (!teacher || !room || !slot) return;

    let changeType: 'ROOM_CHANGE' | 'TIME_CHANGE' | 'TEACHER_CHANGE' | 'RESCHEDULE' = 'RESCHEDULE';
    if (selectedRoomId !== entry.roomId && selectedSlotId === entry.timeSlotId && selectedTeacherId === entry.teacherId) {
      changeType = 'ROOM_CHANGE';
    } else if (selectedSlotId !== entry.timeSlotId && selectedRoomId === entry.roomId && selectedTeacherId === entry.teacherId) {
      changeType = 'TIME_CHANGE';
    } else if (selectedTeacherId !== entry.teacherId && selectedRoomId === entry.roomId && selectedSlotId === entry.timeSlotId) {
      changeType = 'TEACHER_CHANGE';
    }

    const updated: TimetableEntry = {
      ...entry,
      teacherId: teacher.id,
      teacherName: teacher.fullName,
      roomId: room.id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      timeSlotId: slot.id,
      dayOfWeek: slot.dayOfWeek,
      slotOrder: slot.slotOrder,
      status: 'CHANGED',
      changeNote: reason
    };

    onSave(updated, reason, changeType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-blue-700" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Adjust Timetable Allocation
              </h3>
              <p className="text-xs text-slate-500">
                {entry.subjectCode}: {entry.subjectName} ({entry.sectionName})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {/* Room Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              Classroom / Laboratory Allocation
            </label>
            <select
              value={selectedRoomId}
              onChange={e => setSelectedRoomId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            >
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.roomNumber} ({room.roomType === 'COMPUTER_LAB' ? 'Lab' : 'Hall'} — Capacity: {room.capacity})
                </option>
              ))}
            </select>
          </div>

          {/* Teacher Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Assigned Faculty Member
            </label>
            <select
              value={selectedTeacherId}
              onChange={e => setSelectedTeacherId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            >
              {teachers.map(tch => (
                <option key={tch.id} value={tch.id}>
                  {tch.fullName} ({tch.department})
                </option>
              ))}
            </select>
          </div>

          {/* Time Slot Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Target Time Slot
            </label>
            <select
              value={selectedSlotId}
              onChange={e => setSelectedSlotId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            >
              {usableSlots.map(slot => (
                <option key={slot.id} value={slot.id}>
                  {slot.dayOfWeek} — Period {slot.slotOrder} ({slot.startTime} - {slot.endTime})
                </option>
              ))}
            </select>
          </div>

          {/* Reason for Change (Rule 11 requirement) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Reason for Schedule Change (Audit Trail)
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Lab equipment maintenance in previous room"
              className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold shadow-xs transition-colors"
            >
              Apply Change & Audit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
