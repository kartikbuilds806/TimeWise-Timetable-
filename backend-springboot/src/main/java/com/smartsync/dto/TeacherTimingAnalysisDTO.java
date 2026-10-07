package com.smartsync.dto;

import java.util.List;
import java.util.Map;

/**
 * Data Transfer Object for Faculty Timing & Availability Analysis.
 * Shows which time slots a teacher is teaching, which sections, and which slots are completely free.
 */
public class TeacherTimingAnalysisDTO {
    private Long teacherId;
    private String employeeId;
    private String fullName;
    private String department;
    private int maxDailyLectures;
    private int totalWeeklyClasses;
    private int availableFreeSlots;
    private boolean hasConcurrencyConflict;
    
    // Day -> List of Slot Analysis
    private Map<String, List<SlotAllocationDTO>> weeklySchedule;

    public static class SlotAllocationDTO {
        private String slotId;
        private String dayOfWeek;
        private int slotOrder;
        private String startTime;
        private String endTime;
        private boolean isBusy;
        private String subjectCode;
        private String subjectName;
        private String sectionName;
        private String roomNumber;
        private boolean hasConflict;

        public SlotAllocationDTO() {}

        public SlotAllocationDTO(String slotId, String dayOfWeek, int slotOrder, String startTime, String endTime, boolean isBusy) {
            this.slotId = slotId;
            this.dayOfWeek = dayOfWeek;
            this.slotOrder = slotOrder;
            this.startTime = startTime;
            this.endTime = endTime;
            this.isBusy = isBusy;
        }

        // Getters and setters
        public String getSlotId() { return slotId; }
        public void setSlotId(String slotId) { this.slotId = slotId; }
        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
        public int getSlotOrder() { return slotOrder; }
        public void setSlotOrder(int slotOrder) { this.slotOrder = slotOrder; }
        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }
        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }
        public boolean isBusy() { return isBusy; }
        public void setBusy(boolean busy) { isBusy = busy; }
        public String getSubjectCode() { return subjectCode; }
        public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }
        public String getSubjectName() { return subjectName; }
        public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
        public String getSectionName() { return sectionName; }
        public void setSectionName(String sectionName) { this.sectionName = sectionName; }
        public String getRoomNumber() { return roomNumber; }
        public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
        public boolean isHasConflict() { return hasConflict; }
        public void setHasConflict(boolean hasConflict) { this.hasConflict = hasConflict; }
    }

    // Getters and Setters
    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public int getMaxDailyLectures() { return maxDailyLectures; }
    public void setMaxDailyLectures(int maxDailyLectures) { this.maxDailyLectures = maxDailyLectures; }
    public int getTotalWeeklyClasses() { return totalWeeklyClasses; }
    public void setTotalWeeklyClasses(int totalWeeklyClasses) { this.totalWeeklyClasses = totalWeeklyClasses; }
    public int getAvailableFreeSlots() { return availableFreeSlots; }
    public void setAvailableFreeSlots(int availableFreeSlots) { this.availableFreeSlots = availableFreeSlots; }
    public boolean isHasConcurrencyConflict() { return hasConcurrencyConflict; }
    public void setHasConcurrencyConflict(boolean hasConcurrencyConflict) { this.hasConcurrencyConflict = hasConcurrencyConflict; }
    public Map<String, List<SlotAllocationDTO>> getWeeklySchedule() { return weeklySchedule; }
    public void setWeeklySchedule(Map<String, List<SlotAllocationDTO>> weeklySchedule) { this.weeklySchedule = weeklySchedule; }
}
