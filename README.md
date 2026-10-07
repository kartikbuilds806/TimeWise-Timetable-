# SmartSync: College Timetable Management System

SmartSync is a centralized academic timetable management system engineered for higher-education colleges and universities to systematically generate, validate, optimize, and publish conflict-free course schedules.

---

## 1. Project Purpose & Problem Statement

College timetable scheduling is notoriously complex. Frequent curriculum and faculty adjustments in manual or spreadsheet-based workflows cause:
- **Teacher collisions**: Instructors scheduled for concurrent lectures across different classrooms.
- **Room/Venue collisions**: Multiple cohorts competing for the same lecture hall or specialized laboratory.
- **Section attendance overlaps**: Students expected in two concurrent classes.
- **Facility mismatches**: Practical laboratory sessions scheduled in regular theory lecture halls.
- **Inefficient student/faculty gaps**: Fragmented schedules with prolonged idle wait times.
- **Communication breakdown**: Lack of change tracking when an emergency room swap or reschedule occurs.

SmartSync resolves these challenges with a centralized constraint-satisfaction engine, explicit separation between hard and soft constraints, role-based portals (Admin, Teacher, Student), real-time conflict diagnostics, and version-controlled change auditing.

---

## 2. Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript/TypeScript, React 19, Tailwind CSS with custom academic design tokens, Lucide Icons.
- **Primary Backend**: Java 17+, Spring Boot 3.x, Spring Security, Spring Data JPA, REST APIs.
- **Database**: MySQL 8.0+ (Relational schema with primary keys, foreign keys, unique constraints, and audit tables).
- **Scheduling & Optimization Service**: Python 3.10+, FastAPI, NumPy, Pandas (Constraint satisfaction and genetic heuristics).
- **Testing**: Postman, JUnit 5, Mockito.
- **Version Control**: Git & GitHub.

---

## 3. Architecture Overview

SmartSync adheres to a clean layered architecture:

```text
       Presentation Layer (Web UI: Admin / Teacher / Student)
                               │
                               ▼ HTTP REST / JSON
       Primary Backend (Java Spring Boot REST API)
             │                               │
             ▼ JDBC/JPA                      ▼ HTTP REST
       MySQL Database                 Python FastAPI Scheduler
   (System of Record & Audit)       (CSP Optimization Engine)
```

- **Java Spring Boot**: The authoritative application backend managing authentication, role authorization, resource management, transactions, and timetable publication.
- **Python FastAPI Service**: A dedicated compute micro-service invoked by Spring Boot during schedule generation to evaluate constraint satisfaction and optimization fitness.
- **MySQL**: Persistent relational storage maintaining complete referential integrity and versioned audit logs.

---

## 4. Hard vs. Soft Constraints

SmartSync rigorously distinguishes hard constraints from soft optimization preferences:

### Hard Constraints (Zero Tolerance)
1. **Teacher Concurrency**: A faculty member cannot teach two classes simultaneously.
2. **Room Concurrency**: A classroom or laboratory cannot host two classes simultaneously.
3. **Section Concurrency**: A student cohort cannot attend two classes simultaneously.
4. **Facility Match**: Lab-required courses must be allocated to computer/electronics labs.
5. **Room Capacity**: Student cohort size must not exceed the room's physical seating capacity.
6. **Teacher Availability**: Classes must not be allocated during a teacher's declared unavailable slots.

### Soft Constraints (Quality Objectives)
1. Minimize idle non-instructional wait gaps for students.
2. Minimize fragmented non-instructional gaps for faculty.
3. Prevent more than 3 consecutive lectures without a recess.
4. Distribute faculty weekly workload evenly across academic days.

---

## 5. Database Schema & Setup (MySQL)

The complete SQL DDL script is provided in `docs/schema.sql`.

To initialize the database locally:
```bash
# 1. Login to MySQL
mysql -u root -p

# 2. Run schema creation and sample data seeding
source docs/schema.sql;
```

Key tables include:
- `users` & `roles`: User authentication and role-based access control.
- `courses`, `sections`, `subjects`: Academic curriculum structure (supports BCA, B.Tech, BBA, etc.).
- `teachers`, `rooms`, `time_slots`: Infrastructure and personnel resources.
- `timetables`, `timetable_entries`, `timetable_conflicts`: Generation results and conflict records.
- `timetable_change_logs`: Audit trail capturing old vs. new room, teacher, slot, author, and timestamp.

---

## 6. How the System Runs

### A. Web Frontend (AI Studio & Vite Dev Server)
The frontend runs on port `3000`:
```bash
npm run dev
```

### B. Java Spring Boot Backend (For Local / IntelliJ Development)
Prerequisites: JDK 17+, Maven 3.8+
```bash
cd backend-springboot
mvn clean spring-boot:run
# Listens on http://localhost:8080
```

### C. Python FastAPI Scheduling Service (For Local Development)
Prerequisites: Python 3.10+, pip
```bash
cd python-scheduler
pip install fastapi uvicorn pandas numpy
uvicorn main:app --port 8000 --reload
# Listens on http://localhost:8000
```

---

## 7. REST API Overview

| Method | Endpoint | Description | Role |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate and issue JWT token | Public |
| `GET` | `/api/academic/courses` | List all registered academic programs | All |
| `GET` | `/api/academic/sections` | List student cohorts and enrollment counts | All |
| `GET` | `/api/academic/subjects` | List subjects with lecture/lab hours | All |
| `GET` | `/api/resources/teachers` | List faculty with qualified subject codes | Admin |
| `GET` | `/api/resources/rooms` | List classrooms and labs with capacities | Admin |
| `GET` | `/api/resources/slots` | List weekly institutional time slots | All |
| `POST` | `/api/timetables/generate` | Trigger constraint-satisfaction generator | Admin |
| `GET` | `/api/timetables/active` | Get current active timetable matrix | All |
| `POST` | `/api/timetables/publish` | Approve and publish current timetable draft | Admin |
| `PUT` | `/api/timetables/entries/{id}` | Adjust slot / swap room with audit logging | Admin |
| `GET` | `/api/timetables/{id}/changes` | View complete change history and audit log | All |
| `GET` | `/api/timetables/{id}/conflicts`| Review hard violations and soft penalties | Admin |

---

## 8. Development Log & Incremental Roadmap

- **Phase 1 (Completed)**:
  - System architecture specification (`docs/ARCHITECTURE.md`).
  - Production-ready MySQL DDL schema with primary/foreign keys and sample seed data (`docs/schema.sql`).
  - Academic Design System established with tokens in `src/styles/design-tokens.css`.
  - Core TypeScript data contracts in `src/types/index.ts`.
  - First working flow completed: Admin Login, Resource management, Constraint generator, Hard/soft conflict detector, Timetable Grid (Weekly/Daily/Section/Teacher/Room views), and Change History audit logger.

- **Phase 2 (Completed)**:
  - Role-Based Access Control (RBAC) with strict data boundaries:
    - **Student Isolation**: Authentication via 8-digit Student ID and default credentials (`Moodle@123`). Students have strict zero-visibility into teacher directories and administrative panels, seeing only their personal profile, assigned section cohort, and official message cancellation notices.
    - **Teacher Portal**: Faculty members view their personal teaching schedule and have an option to view other faculty members' timings without accessing student rosters or administrative settings.
    - **Admin Control**: Complete administrative supervision across all students, faculty, room venues, and master schedule matrices.
  - **4:00 PM Faculty Cancellation Protocol**: Enforces mandatory policy rule where teachers cancelling lectures must submit reasons and timing before 4:00 PM. Notice is broadcasted in real-time to the student message section.

- **Phase 3 (Completed)**:
  - **Scheduling Optimization Engine (Genetic Algorithm)**:
    - Client-side & Python FastAPI GA heuristics evaluating population fitness, chromosome crossover, adaptive mutation, hard conflict elimination, and soft constraint minimization.
    - `OptimizationStudio`: Real-time GA progress visualization (generations, best fitness, conflict curves, penalty reduction) with interactive commit to draft.
  - **Proxy Faculty Substitution Workflow**:
    - `substitutionEngine.ts`: Automated multi-criteria ranking of substitute faculty based on concurrent slot availability, subject expertise/qualification match, and workload balance.
    - `ProxySubstitutionModal` & `ProxyManagerTab`: Allows administrators to instantly reassign cancelled classes to qualified available proxies with reasons and instructions.
    - Real-time notification dispatched to both proxy faculty and affected student cohorts.
  - **Timetable Diff Viewer & Version Audit**:
    - `TimetableDiffViewer`: Side-by-side comparison of timetable iterations highlighting room swaps, time reschedules, teacher adjustments, and proxy substitutions with detailed change logs.
  - **Official Export & Print Studio**:
    - `timetableExporter.ts` & `TimetableExportModal`: High-resolution print styling, PDF print preview, and CSV data export supporting master, section, and faculty workload filters.
