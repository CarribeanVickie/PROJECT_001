# Middleware Routing

Routes should be organized by resource type.

Example route structure:
- `GET /api/tasks` (list tasks)
- `POST /api/tasks` (create task)
- `PATCH /api/tasks/{taskId}` (update task)
- `GET /api/users` (list users)

Use Express routers to keep routes modular.
