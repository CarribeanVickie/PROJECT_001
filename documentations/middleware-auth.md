# Middleware Authentication & Authorization

Initial MVP authentication can be a simple header-based token for development.

Production should use:
- JWT or session cookies
- Role-based access control (editor, writer, admin)
- Ensure users can only access data for their team
