import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.string().min(1, 'Type is required'),
  priority: z.enum(['low', 'medium', 'high']),
  assigneeId: z.string().uuid().optional(),
  dueAt: z.string().datetime().optional().nullable(),
  serviceDate: z.string().datetime().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(['assigned', 'in_progress', 'review', 'published']).optional(),
});
