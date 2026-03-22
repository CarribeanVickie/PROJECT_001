# Frontend Documentation

This document outlines the expected structure and features of the **mobile frontend** for the Media Team Task & Workflow app.

## 📱 Scope
- Mobile-first experience (iOS + Android)
- Task board, task details, task creation/editing
- Authentication (sign up, sign in)
- Notifications and in-app alerts
- Basic team roster + profile view

## 🔧 Key Screens
- **Auth Screen** – login / signup flow
- **Home (Task Board)** – Kanban-style task columns (Assigned, In Progress, Review, Published)
- **Task Detail** – task info, comments, attachments, status controls
- **Create/Edit Task** – form for title, description, assignee, due date, priority, type
- **Profile/Settings** – user info, role, team selection

## 🧩 Core Client Architecture
- Use a navigation library (React Navigation for React Native)
- Global state for user session + team context (e.g., Context API or Redux)
- API client layer for backend communication (REST or GraphQL)
- Offline caching (optional) for tasks and comments

## 🗂️ Example Folder Structure
```
src/
  frontend/
    App.tsx
    screens/
      AuthScreen.tsx
      HomeScreen.tsx
      TaskDetailScreen.tsx
      TaskFormScreen.tsx
    components/
      TaskCard.tsx
      Header.tsx
    services/
      api.ts
    hooks/
      useAuth.ts
    types/
      models.ts
```
