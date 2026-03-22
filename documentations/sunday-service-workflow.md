# Integrated System: Sunday Service Workflow

Complete workflow combining roles, service dates, and door access.

## 🎯 Full Sunday Service Workflow

### Phase 1: Pre-Service Planning (Friday/Saturday)

**SuperAdmin:**
1. Create Sunday service date in system
2. Plan tasks needed for the service
3. Create task cards (via mobile app or web)
   - "Setup Media Equipment" for Media Room
   - "Sound Test" for Control Room
   - "Greeting Team" for Main Entrance
   - etc.
4. Assign tasks to team members based on roles
5. Issue new access cards if needed (or verify existing cards are active)
6. Grant door location access:
   - Media Manager → Media Room + Control Room
   - Greeting Team → Main Entrance
   - Tech Lead → Control Room + Equipment Storage

### Phase 2: Service Day (Sunday Morning)

**Admin (Manager - if SuperAdmin unavailable):**
1. Check task board filtered to "This Sunday"
2. See all tasks and their status (all showing "Assigned")
3. If someone is running late, can reassign tasks
4. Access control system shows which team members have arrived (via access logs)

**Team Members:**
1. Open app on phone
2. See their assigned tasks for "This Sunday"
3. Use access card at relevant doors
   - Access Log automatically tracks: "John accessed Media Room at 9:45 AM"
4. Update task status as they work:
   - "Setting up equipment" → In Progress
   - "Equipment ready" → move to Review
5. Leave comments for other team members
6. SuperAdmin can see status in real-time

**SuperAdmin (overseeing):**
1. Views task board
2. Monitors access logs (who arrived when)
3. Approves task status changes (Review → Published)
4. Communicates via in-app comments if issues arise

### Phase 3: Post-Service (Sunday Evening)

**SuperAdmin:**
1. Mark remaining tasks as Published
2. Review access logs for attendance
3. Archive completed tasks
4. Plan for next Sunday:
   - Which tasks succeeded?
   - What needs improvement?
   - Any access card changes needed?

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  SUNDAY SERVICE (March 24, 2026 @ 10:00 AM)            │
└─────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
        ┌────────┐    ┌───────────┐   ┌──────────┐
        │  Tasks │    │   Users   │   │ Locations│
        │(Monday)│    │   (Roles) │   │(Doors)   │
        └───┬────┘    └─────┬─────┘   └─────┬────┘
            │               │               │
            └───────────────┼───────────────┘
                            │
                      ┌─────▼──────┐
                      │ Access Card│
                      │  & Logs    │
                      └────────────┘
```

---

## 🔗 Key Features Integration

### 1. **Role-Based Authorization**
- Controls who can create/edit/assign tasks
- Determines access permissions for doors
- Limits what data each user can see

### 2. **Service Dates**
- Organize tasks by Sunday
- Quick filtering: "Show me this Sunday's tasks"
- Team knows exactly what's expected for that service date

### 3. **Door Access Cards**
- Attendance tracking (who swiped, when)
- Physical security (only authorized people in restricted areas)
- Audit trail (who was where during the service)

---

## 👥 Example Team

| Name | Role | Tasks | Door Access |
|------|------|-------|-------------|
| James | SuperAdmin | All management | Master (All doors) |
| Sarah | Admin | Task reassignment, service lead | Media Room + Control Room + Main Entrance |
| John | Media Member | Setup media, run stream | Media Room + Control Room |
| Mike | Greeting Member | Welcome people | Main Entrance |
| Lisa | Tech Member | Sound, lights | Control Room + Equipment Storage |

---

## 📱 Sample Mobile App Screens (Sunday Morning)

### HomeScreen - Task Board
```
┌─────────────────────────────────┐
│  TASKS FOR: SUN, MAR 24         │
├─────────────────────────────────┤
│  📋 ASSIGNED                    │
│  ├─ Setup Media Room            │
│  ├─ Greeting Team (you)         │
│  └─ Sound Check                 │
│                                 │
│  ▶️ IN PROGRESS                 │
│  ├─ Setup Media Equipment       │
│                                 │
│  ✅ REVIEW                      │
│  └─ Lights Test                 │
│                                 │
│  ✔️ PUBLISHED                   │
│  └─ (none yet)                  │
└─────────────────────────────────┘
```

### TaskDetailScreen - Your Task
```
┌─────────────────────────────────┐
│  GREETING TEAM               [HIGH] │
├─────────────────────────────────┤
│  Status: ASSIGNED               │
│  Service: Sun, Mar 24 @ 10 AM   │
│  Assigned to: You (Mike)        │
│  Due: Mar 24 @ 10:30 AM         │
│                                 │
│  [ASSIGNED] [IN PROGRESS]       │
│            [REVIEW]             │
│                                 │
│  📝 Comments                    │
│  Sarah: "Please arrive by 9:45" │
│                                 │
│  ➕ Add Comment                 │
└─────────────────────────────────┘
```

### Access Log (SuperAdmin View, Sunday @ 11 AM)
```
┌──────────────────────────────────┐
│  ACCESS LOG - SUN, MAR 24        │
├──────────────────────────────────┤
│  9:42 AM | Mike → Main Entrance  │ ✓
│  9:45 AM | John → Media Room     │ ✓
│  9:47 AM | Sarah → Control Rm    │ ✓
│  9:52 AM | Lisa → Equip Storage  │ ✓
│  10:05 AM| Mike → Main Entrance  │ ✓
│  (late arrival notice if no log) │
└──────────────────────────────────┘
```

---

## 🚀 Implementation Timeline

### Phase 1: Immediate (MVP)
- ✅ Tasks + Service Dates
- ✅ Role-based task permissions
- ✅ Role-based API access

### Phase 2: Access Card Schema (Ready)
- ✅ Door Location model
- ✅ DoorAccessCard model
- ✅ CardLocationAccess junction
- ✅ AccessLog model
- ⏳ Backend API endpoints for card management
- ⏳ Frontend screens for admin to manage cards

### Phase 3: Physical Integration
- ⏳ API integration with door hardware (future)
- ⏳ Real-time access attempt logging
- ⏳ Automated access grant/deny

---

## 📚 Related Documentation

- [Role-Based Permissions](role-based-permissions.md)
- [Service Dates](service-dates.md)
- [Door Access System](door-access-system.md)
- [Backend Database](backend-db.md)
