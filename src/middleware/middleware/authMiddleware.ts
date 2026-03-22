import { Request, Response, NextFunction } from 'express';

// Placeholder auth middleware - replace with real auth in the future.
// For MVP, this sets `req.userId` from an `x-user-id` header.

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.header('x-user-id');
  if (!userId) {
    return res.status(401).json({ error: 'Missing x-user-id header for auth' });
  }

  (req as any).userId = userId;
  next();
}
