# Media Team Task & Workflow App

A mobile-first application for media teams to assign tasks, manage workflows, collaborate on content, and track progress. Designed for editors, writers, designers, producers, and other media roles.

---

## 📌 Key Goals

- Give teams a clear, shared view of what needs to be done (content, media, schedules).
- Make assignments simple and visible, with due dates and status tracking.
- Support collaboration via comments, file attachments, and workflow transitions.
- Enable quick status updates and notifications so nothing slips through.

---

## 🎯 MVP Feature Set (Minimum Viable Product)

### 1) Authentication
- Email/password sign-up & sign-in
- Basic profile (name, role)

### 2) Team Roster + Roles
- Create / join a team workspace
- Assign roles (writer, editor, designer, publisher, etc.)

### 3) Task Board (Kanban-style)
- Tasks have: title, description, type, priority, assignee, due date, status
- Predefined status columns: **Assigned**, **In Progress**, **Review**, **Published**
- Drag/drop tasks between statuses (optional for mobile UX)

### 4) Task Details + Collaboration
- Comments thread per task
- File attachments (drafts, assets, scripts)
- Activity feed (status changes, new comments)

### 5) Notifications
- In-app notifications for:
  - New assignment
  - Status change
  - Comment mention
  - Due soon reminder

### 6) Basic Reporting
- View tasks by assignee, status, due date
- Identify overdue tasks and upcoming deadlines

---

## 🧩 Suggested Tech Stack

### Frontend (Mobile)
- **React Native** (cross-platform iOS + Android)
- **Expo** (fast iteration + OTA updates) or **React Native CLI** (more native control)

### Backend
- **Firebase** (Auth + Firestore + Storage + Cloud Functions)
- OR **Supabase** (Auth + Postgres + Storage + Realtime)

### Optional (Web / Admin)
- **React** web dashboard for administrators and power users

---

## 🗂️ Data Model (Example)

### Team
```json
{
  "id": "team_123",
  "name": "Media Team",
  "members": ["user_1", "user_2"],
  "createdAt": "2026-03-18T..."
}
```

### User
```json
{
  "id": "user_1",
  "name": "Taylor",
  "email": "taylor@example.com",
  "role": "editor",
  "teamId": "team_123"
}
```

### Task
```json
{
  "id": "task_abc",
  "teamId": "team_123",
  "title": "Draft newsletter copy",
  "description": "Write the 4/1 newsletter draft about the upcoming campaign.",
  "type": "copy",
  "priority": "high",
  "assigneeId": "user_1",
  "status": "in_progress",
  "dueAt": "2026-03-21T17:00:00Z",
  "attachments": ["file_1", "file_2"],
  "comments": ["comment_1", "comment_2"],
  "createdAt": "2026-03-18T09:00:00Z",
  "updatedAt": "2026-03-18T09:00:00Z"
}
```

### Comment
```json
{
  "id": "comment_1",
  "taskId": "task_abc",
  "authorId": "user_2",
  "text": "Can you add the social media copy too?",
  "createdAt": "2026-03-18T10:00:00Z"
}
```

---

## 🧭 Example User Flows

### 1) Assigning a Task
1. Team lead creates a task and selects an assignee.
2. Assignee gets notified and sees the task appear in their inbox/board.
3. Assignee updates status as they make progress.

### 2) Reviewing & Approving
1. Assignee moves task to **Review**.
2. Reviewer opens task, reads details, adds comments if needed.
3. Reviewer either moves task to **Published** or back to **In Progress** with feedback.

### 3) Daily Standup (Optional)
1. Open backlog view filtered to **Assigned**/**In Progress**.
2. Check “Due Today” tasks and update statuses.
3. Use comment thread for quick sync.

---

## 🧩 Optional Extended Features (Phase 2+)

- **Calendar / Shift View:** schedule people for specific dates and roles.
- **Asset Library:** store approved assets/brand templates with tagging.
- **Integration:** connect with Slack/Teams, Google Drive, Notion, or Figma.
- **Analytics:** throughput metrics, average lead time, bottleneck heatmap.
- **Gamification:** checkpoints + rewards for completing tasks on time.

---

## 🚀 Next Steps (How You Can Start)
1. Choose your preferred stack (Firebase vs Supabase, React Native vs Flutter).
2. Scaffold the project (e.g., `npx create-expo-app media-team-app`).
3. Build core screens: Auth → Team lobby → Task Board → Task Detail.
4. Wire up backend data model and basic CRUD operations.

---

If you'd like, I can also generate a full scaffolded starter project structure (folders + key screens) or propose a concrete schema and API routes for your chosen backend.

---

## 🧩 Middleware + Backend Setup (Local)

This repo includes a TypeScript Express middleware server and a Prisma + SQLite backend.

### Run the server (development)
1. Copy `.env.example` → `.env`
2. `npm install`
3. `npm run dev`

### DB migrations (Prisma + SQLite)
- `npm run prisma:migrate`
- `npm run prisma:generate`

### Docs
Additional architecture docs are in `documentations/`.
