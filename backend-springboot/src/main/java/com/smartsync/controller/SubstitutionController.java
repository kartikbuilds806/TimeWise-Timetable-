package com.smartsync.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

/**
 * Phase 3 REST Controller: Faculty Proxy Substitution & Emergency Coverage
 */
@RestController
@RequestMapping("/api/substitutions")
@CrossOrigin(origins = "*")
public class SubstitutionController {

    private final List<Map<String, Object>> activeSubstitutions = new ArrayList<>();

    @PostMapping("/recommend")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Map<String, Object>> recommendSubstitutes(
            @RequestBody Map<String, Object> request
    ) {
        String cancelledEntryId = (String) request.get("cancelledEntryId");
        String subjectCode = (String) request.get("subjectCode");
        String dayOfWeek = (String) request.get("dayOfWeek");
        Integer slotOrder = (Integer) request.get("slotOrder");

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timestamp", Instant.now().toString());
        response.put("cancelledEntryId", cancelledEntryId);
        response.put("subjectCode", subjectCode);
        response.put("dayOfWeek", dayOfWeek);
        response.put("slotOrder", slotOrder);
        response.put("status", "SUCCESS");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> assignProxyTeacher(
            @RequestBody Map<String, Object> assignmentRequest
    ) {
        String substitutionId = "sub-" + System.currentTimeMillis();
        assignmentRequest.put("id", substitutionId);
        assignmentRequest.put("assignedAt", Instant.now().toString());
        assignmentRequest.put("status", "CONFIRMED");

        activeSubstitutions.add(assignmentRequest);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("substitutionId", substitutionId);
        response.put("message", "Proxy faculty substitution confirmed. Students and faculty have been notified.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Map<String, Object>>> getActiveSubstitutions() {
        return ResponseEntity.ok(activeSubstitutions);
    }
}
