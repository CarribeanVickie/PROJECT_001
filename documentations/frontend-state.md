# Frontend State Management

Considerations for state storage:

- Auth state (current user, token)
- Active team context
- Task list caching (offline-first)
- UI state (current tab, filters)

Suggested approaches:
- Context API + useReducer
- Redux / Zustand for complex state
- Local storage / AsyncStorage for persistence
