# Frontend API Integration

The frontend communicates with the middleware via REST endpoints.

Example endpoints:
- `GET /api/tasks?teamId={teamId}`
- `POST /api/tasks`
- `PATCH /api/tasks/{taskId}`
- `GET /api/users?teamId={teamId}`

Requests must include auth headers (e.g., `Authorization: Bearer <token>`).
