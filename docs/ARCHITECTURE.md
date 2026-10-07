# SmartSync Architecture & System Design Document

## 1. Executive Overview
SmartSync is a centralized academic timetable management system engineered for higher-education colleges. It provides end-to-end management for academic programs, course sections, teacher assignments, infrastructure facilities (lecture halls and computer labs), automated constraint-based timetable generation, hard and soft conflict detection, version history, and publishing workflows.

---

## 2. Multi-Tier Layered Architecture

```text
+-------------------------------------------------------------------------+
|                              PRESENTATION LAYER                         |
|  - Academic Administrative Portal (Resource Management, Generation, V&P)|
|  - Faculty Schedule Console (Personal Timetable, Workload, Change Feed) |
|  - Student Timetable Viewer (Section Schedule, Daily/Weekly View)       |
+-------------------------------------------------------------------------+
                                    │
                                    │ HTTP / REST / JSON
                                    ▼
+-------------------------------------------------------------------------+
|                           APPLICATION SERVER LAYER                      |
|                  Primary Backend: Java Spring Boot REST API             |
|                                                                         |
|  Controllers:                                                           |
|   - AuthController          (/api/auth)                                 |
|   - AcademicController      (/api/academic/courses, /sections, /subjects|
|   - ResourceController      (/api/resources/teachers, /rooms, /slots)   |
|   - TimetableController     (/api/timetables, /generate, /conflicts)   |
|   - ChangeLogController     (/api/timetables/{id}/changes)              |
|                                                                         |
|  Core Services:                                                         |
|   - TimetableValidationService (Hard constraint verification)           |
|   - ConflictDetectionService   (Collision checks & diagnostic messages) |
|   - TimetablePublishingService (Status transitions & notifications)     |
|   - AuditAndVersionService     (Immutability & historical snapshots)    |
|                                                                         |
|  Security:                                                              |
|   - Spring Security + JWT Authentication                                |
|   - Role-Based Access Control (ADMIN, TEACHER, STUDENT)                 |
+-------------------------------------------------------------------------+
                    │                                 │
                    │ JDBC / JPA / Hibernate          │ HTTP REST
                    ▼                                 ▼
+------------------------------------+   +--------------------------------+
|           DATA STORAGE             |   |     OPTIMIZATION SERVICE       |
|               MySQL                |   |        Python FastAPI          |
|                                    |   |                                |
|  - Relational Integrity            |   |  - Constraint Satisfaction     |
|  - Transaction Management (ACID)   |   |  - Genetic Algorithm Engine    |
|  - Versioning & Audit Logs         |   |  - Soft Penalty Minimization   |
|  - Foreign Keys & Unique Indicies  |   |  - Schedule Stability Metrics  |
+------------------------------------+   +--------------------------------+
```

---

## 3. Separation of Responsibilities

### Primary Backend (Java Spring Boot)
- **Role**: System of record, business logic authority, authentication, authorization, and data persistence.
- **Key Modules**:
  - `com.smartsync.controller`: Exposes REST endpoints strictly following role-based permissions.
  - `com.smartsync.service`: Implements academic validation rules, transaction management, conflict reporting, and version control.
  - `com.smartsync.repository`: Spring Data JPA repositories with parameterized queries to prevent SQL injection.
  - `com.smartsync.entity`: JPA mappings corresponding directly to the MySQL schema.
  - `com.smartsync.dto`: Strict request/response payload contracts.

### Scheduling Engine (Python FastAPI)
- **Role**: Specialized compute engine called synchronously by Spring Boot during schedule generation.
- **Responsibilities**:
  - Receives normalized JSON payloads containing slots, teachers, sections, and room constraints.
  - Executes constraint satisfaction heuristics and Genetic Algorithm optimization.
  - Computes fitness scores based on hard constraint feasibility and soft penalty minimization.
  - Returns a candidate schedule matrix with metric scores back to Spring Boot.

---

## 4. Constraint Classification

### Hard Constraints (Zero Tolerance - Inviolable)
1. **Teacher Concurrency**: A teacher cannot be scheduled in more than one classroom at any given time slot.
2. **Room Concurrency**: A classroom or lab cannot be occupied by more than one section at any given time slot.
3. **Section Concurrency**: A student section cannot attend two different classes at the same time slot.
4. **Facility Match**: Lab-required subjects (`requires_lab = true`) must be scheduled in designated computer/electronics laboratories.
5. **Room Capacity**: The section student count must not exceed the room's physical seating capacity.
6. **Teacher Availability**: Classes must not be allocated during times a faculty member has designated as unavailable.
7. **Curriculum Frequency**: The required weekly lecture and lab counts must be satisfied.

### Soft Constraints (Optimization Objectives)
1. **Student Idle Gaps**: Minimize fragmented non-instructional waiting intervals between classes for student sections.
2. **Faculty Idle Gaps**: Minimize sporadic gap hours for teachers on any single teaching day.
3. **Consecutive Lecture Limits**: Prevent scheduling more than 3 consecutive high-intensity lectures for a single group or teacher without a recess.
4. **Workload Balance**: Distribute weekly teaching loads evenly across Monday through Friday rather than clustering on two days.
5. **Appropriate Scheduling Horizons**: Avoid early morning slots or late evening slots for difficult analytical subjects when possible.

---

## 5. Change Management & Versioning Lifecycle
- Every generated timetable begins as a `DRAFT`.
- When administrative adjustments are made (e.g. room reallocations, faculty swaps), SmartSync generates a record in `timetable_change_logs` capturing:
  - Timestamp of edit
  - User ID of administrator making the modification
  - Previous assignment snapshot `{ room, teacher, slot }`
  - New assignment snapshot `{ room, teacher, slot }`
  - Reason for change
- The version counter is incremented, ensuring historical auditability.
- Upon publication (`PUBLISHED`), students and teachers receive active notification badges indicating modified slots.
