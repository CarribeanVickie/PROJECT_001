# Middleware Documentation

This document describes the **middleware layer** for the Media Team Task & Workflow app. The middleware layer handles business logic, request validation, and orchestrates between frontend clients and backend persistence.

## 🔌 Responsibilities
- **Authentication & Authorization**
  - Validate JWTs or session tokens
  - Ensure users belong to the requested team
  - Enforce role-based permissions (e.g., only editors can move tasks to Published)

- **Input Validation**
  - Validate request payloads (task payload schemas, comment text, etc.)
  - Sanitize strings and file metadata to avoid injection attacks

- **Business Rules / Workflow Enforcement**
  - Transition rules (e.g., Task can only move to Review after In Progress)
  - Notification triggers (e.g., send notification when task is assigned)
  - Rate limits (prevent spamming comments or rapid task changes)

- **API Routing**
  - Define REST endpoints or GraphQL resolvers for client actions
  - Map REST request paths to service methods

- **Logging & Metrics**
  - Log important events (task created, task status changed)
  - Emit basic metrics (tasks created per day, overdue task count)

## 🧱 Example Middleware Structure
```
src/
  middleware/
    auth/
      authMiddleware.ts
      permissions.ts
    validation/
      schemas/
        taskSchema.ts
        commentSchema.ts
    routers/
      taskRouter.ts
      userRouter.ts
    services/
      taskService.ts
      notificationService.ts
```

## 📝 Typical Middleware Flow
1. Frontend sends request (e.g., POST /tasks)
2. Middleware authenticates the user (extracts userId from token)
3. Payload is validated against a schema
4. Business rules are applied (e.g., ensure assignee is on same team)
5. Calls backend/data layer to persist the update
6. Optional: triggers notifications or audit logs
7. Returns response to the client
