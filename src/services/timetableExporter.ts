import { TimetableEntry, Section, Teacher, Room, TimeSlot } from '../types';

/**
 * Service to export timetable matrices into standard CSV format and print-ready HTML/PDF.
 */
export function exportTimetableToCSV(
  entries: TimetableEntry[],
  timeSlots: TimeSlot[],
  filename = 'SmartSync_College_Timetable.csv'
): void {
  const headers = [
    'Entry ID',
    'Day',
    'Slot Order',
    'Time Window',
    'Subject Code',
    'Subject Name',
    'Course & Section',
    'Teacher Name',
    'Room Number',
    'Room Type',
    'Status',
    'Cancellation / Substitution Notes'
  ];

  const rows = entries.map(e => {
    const slot = timeSlots.find(s => s.id === e.timeSlotId);
    const timeText = e.slotOrder === 10 ? '17:00 - 17:55' : slot ? `${slot.startTime} - ${slot.endTime}` : `Slot ${e.slotOrder}`;
    
    let note = '';
    if (e.status === 'CANCELLED' && e.cancellationNotice) {
      note = `CANCELLED: ${e.cancellationNotice.reason} (notified at ${e.cancellationNotice.cancellationTime || e.cancellationNotice.cancellationNoticeTime})`;
    } else if (e.status === 'SUBSTITUTED' && e.proxySubstitution) {
      note = `PROXY: Substituted by ${e.proxySubstitution.proxyTeacherName}`;
    }

    return [
      `"${e.id}"`,
      `"${e.dayOfWeek}"`,
      e.slotOrder,
      `"${timeText}"`,
      `"${e.subjectCode}"`,
      `"${e.subjectName.replace(/"/g, '""')}"`,
      `"${e.sectionName}"`,
      `"${e.teacherName}"`,
      `"${e.roomNumber}"`,
      `"${e.roomType}"`,
      `"${e.status}"`,
      `"${note.replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Prepares the window for official timetable printing
 */
export function triggerPrintTimetable(): void {
  window.print();
}
