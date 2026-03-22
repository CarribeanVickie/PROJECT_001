# Backend / Database Documentation

This document captures the backend architecture and database design for the Media Team Task & Workflow app.

## 🔧 Backend Responsibilities
- Persist data (teams, users, tasks, comments, files)
- Serve API endpoints for frontend clients
- Implement business logic (task workflows, permissions)
- Handle notifications (email, push)

## 🗃️ Data Model Overview

### Team
- `id`, `name`, `createdAt`, `updatedAt`
- Members list (references to user IDs)

### User
- `id`, `name`, `email`, `role`, `teamId`
- Authentication data (handled by auth system)

### Task
- `id`, `teamId`, `title`, `description`
- `type` (copy, design, video, social, etc.)
- `priority` (low, medium, high)
- `assigneeId`, `status` (assigned, in_progress, review, published)
- `dueAt`, `createdAt`, `updatedAt`

### Comment
- `id`, `taskId`, `authorId`, `text`, `createdAt`

### Attachment / Asset
- `id`, `taskId`, `type`, `url`, `filename`, `uploadedAt`

## 🗄️ Suggested Database Options
- **Firebase Firestore** (NoSQL, realtime updates)
- **Supabase / Postgres** (SQL, relational, built-in auth)
- **MongoDB Atlas** (NoSQL document store)

## 🗂️ Example Schema (Postgres)
```sql
CREATE TABLE teams (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY,
  team_id uuid REFERENCES teams(id),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
  id uuid PRIMARY KEY,
  team_id uuid REFERENCES teams(id),
  title text NOT NULL,
  description text,
  type text,
  priority text,
  assignee_id uuid REFERENCES users(id),
  status text NOT NULL DEFAULT 'assigned',
  due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE comments (
  id uuid PRIMARY KEY,
  task_id uuid REFERENCES tasks(id),
  author_id uuid REFERENCES users(id),
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

## ☁️ Storage for File Attachments
- Use cloud storage (Firebase Storage, Supabase Storage, S3)
- Store metadata in DB (taskId, url, filename)

## 🔐 Authentication
- Option A: Use Firebase Auth (email/password + social providers)
- Option B: Use Supabase Auth (Postgres + JWT)
- Option C: Custom auth service (bcrypt + JWT)

---

If you'd like, I can also create skeleton API route documentation (endpoints and request/response shapes) for the backend.