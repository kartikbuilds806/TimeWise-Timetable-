package com.smartsync.service;

import com.smartsync.dto.TeacherTimingAnalysisDTO;
import com.smartsync.dto.TeacherTimingAnalysisDTO.SlotAllocationDTO;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service to analyze faculty timing across all cohorts and academic programs.
 * Identifies:
 * 1. When teachers are busy in active instruction.
 * 2. When teachers are free and eligible for conflict-free scheduling.
 * 3. Any double-booking hard concurrency violations.
 */
@Service
public class TeacherTimingService {

    /**
     * Analyzes availability and teaching load for a specific faculty member across all scheduled sections.
     */
    public TeacherTimingAnalysisDTO analyzeFacultyTiming(
            Long teacherId,
            String teacherName,
            String employeeId,
            String department,
            int maxDailyLimit,
            List<Map<String, Object>> scheduledClasses,
            List<Map<String, Object>> institutionalTimeSlots
    ) {
        TeacherTimingAnalysisDTO analysis = new TeacherTimingAnalysisDTO();
        analysis.setTeacherId(teacherId);
        analysis.setFullName(teacherName);
        analysis.setEmployeeId(employeeId);
        analysis.setDepartment(department);
        analysis.setMaxDailyLectures(maxDailyLimit);

        Map<String, List<SlotAllocationDTO>> weeklyMap = new LinkedHashMap<>();
        String[] days = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"};
        for (String day : days) {
            weeklyMap.put(day, new ArrayList<>());
        }

        int busyCount = 0;
        boolean hasConflict = false;

        // Group scheduled classes by timeSlotId
        Map<String, List<Map<String, Object>>> slotToClasses = new HashMap<>();
        for (Map<String, Object> cls : scheduledClasses) {
            String slotId = (String) cls.get("timeSlotId");
            slotToClasses.computeIfAbsent(slotId, k -> new ArrayList<>()).add(cls);
        }

        for (Map<String, Object> slot : institutionalTimeSlots) {
            String day = (String) slot.get("dayOfWeek");
            String slotId = (String) slot.get("id");
            int slotOrder = (int) slot.get("slotOrder");
            String start = (String) slot.get("startTime");
            String end = (String) slot.get("endTime");

            List<Map<String, Object>> activeInSlot = slotToClasses.getOrDefault(slotId, Collections.emptyList());

            SlotAllocationDTO dto = new SlotAllocationDTO();
            dto.setSlotId(slotId);
            dto.setDayOfWeek(day);
            dto.setSlotOrder(slotOrder);
            dto.setStartTime(start);
            dto.setEndTime(end);

            if (!activeInSlot.isEmpty()) {
                busyCount++;
                dto.setBusy(true);
                Map<String, Object> first = activeInSlot.get(0);
                dto.setSubjectCode((String) first.get("subjectCode"));
                dto.setSubjectName((String) first.get("subjectName"));
                dto.setSectionName((String) first.get("sectionName"));
                dto.setRoomNumber((String) first.get("roomNumber"));

                if (activeInSlot.size() > 1) {
                    dto.setHasConflict(true);
                    hasConflict = true;
                }
            } else {
                dto.setBusy(false);
            }

            if (weeklyMap.containsKey(day)) {
                weeklyMap.get(day).add(dto);
            }
        }

        analysis.setTotalWeeklyClasses(busyCount);
        analysis.setAvailableFreeSlots(institutionalTimeSlots.size() - busyCount);
        analysis.setHasConcurrencyConflict(hasConflict);
        analysis.setWeeklySchedule(weeklyMap);

        return analysis;
    }
}
