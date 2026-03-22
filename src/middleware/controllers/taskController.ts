import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { createTaskSchema, updateTaskSchema } from '../schemas/taskSchema';
import { LEADERSHIP_ROLES, NON_EXECUTION_ROLES } from '../constants/roles';
import { sanitizeTaskForResponse } from '../services/userViewService';

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function getActor(req: Request) {
  const actorId = req.header('x-user-id');
  if (!actorId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: actorId },
    select: { id: true, role: true },
  });
}

async function ensureLeadership(req: Request) {
  const actor = await getActor(req);
  if (!actor || !LEADERSHIP_ROLES.includes(actor.role as (typeof LEADERSHIP_ROLES)[number])) {
    const error = new Error('Only admin or super admin can assign tasks');
    (error as any).status = 403;
    throw error;
  }

  return actor;
}

async function ensureAssignableAssignee(assigneeId?: string) {
  if (!assigneeId) {
    return null;
  }

  const assignee = await prisma.user.findUnique({
    where: { id: assigneeId },
    select: { id: true, role: true },
  });

  if (!assignee) {
    const error = new Error('Assignee not found');
    (error as any).status = 404;
    throw error;
  }

  if (NON_EXECUTION_ROLES.includes(assignee.role as (typeof NON_EXECUTION_ROLES)[number])) {
    const error = new Error('Default, admin, and super admin users cannot be assigned executable tasks');
    (error as any).status = 400;
    throw error;
  }

  return assignee;
}

async function getTaskWithRelations(taskId: string) {
  return prisma.task.findUnique({
    where: { id: taskId },
    include: {
      comments: {
        include: {
          author: true,
        },
        orderBy: { createdAt: 'asc' },
      },
      attachments: true,
      assignee: true,
    },
  });
}

export async function listTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const teamId = req.query.teamId as string;
    if (!teamId) {
      return res.status(400).json({ error: 'teamId query param is required' });
    }

    const tasks = await prisma.task.findMany({
      where: { teamId },
      include: {
        assignee: true,
      },
      orderBy: { dueAt: 'asc' },
    });

    res.json(tasks.map((task) => sanitizeTaskForResponse(task)));
  } catch (err) {
    next(err);
  }
}

export async function getTask(req: Request, res: Response, next: NextFunction) {
  try {
    const taskId = normalizeParam(req.params.taskId);
    if (!taskId) {
      return res.status(400).json({ error: 'taskId is required' });
    }
    const task = await getTaskWithRelations(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(sanitizeTaskForResponse(task));
  } catch (err) {
    next(err);
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = createTaskSchema.parse(req.body);
    if (validated.type !== 'repair_report') {
      await ensureLeadership(req);
    }
    const teamId = req.body.teamId as string;

    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' });
    }

    await ensureAssignableAssignee(validated.assigneeId);

    const taskId = randomUUID();
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO "Task" (id, teamId, title, description, type, priority, assigneeId, status, dueAt, serviceDate, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'assigned', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      taskId,
      teamId,
      validated.title,
      validated.description || null,
      validated.type,
      validated.priority,
      validated.assigneeId || null,
      validated.dueAt ? new Date(validated.dueAt).toISOString() : null,
      validated.serviceDate ? new Date(validated.serviceDate).toISOString() : null,
    );

    const task = await getTaskWithRelations(taskId);
    res.status(201).json(sanitizeTaskForResponse(task));
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const taskId = normalizeParam(req.params.taskId);
    const validated = updateTaskSchema.parse(req.body);
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, assigneeId: true, type: true, status: true },
    });

    if (!currentTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (validated.assigneeId !== undefined || validated.title || validated.description || validated.type || validated.priority || validated.dueAt !== undefined || validated.serviceDate !== undefined) {
      await ensureLeadership(req);
      await ensureAssignableAssignee(validated.assigneeId);
    }

    if (validated.status) {
      const actor = await getActor(req);
      if (!actor) {
        return res.status(403).json({ error: 'User not found for task update' });
      }

      const isRepairApproval =
        currentTask.type === 'repair_report' &&
        currentTask.status === 'assigned' &&
        validated.status === 'in_progress' &&
        LEADERSHIP_ROLES.includes(actor.role as (typeof LEADERSHIP_ROLES)[number]);

      if (!isRepairApproval) {
        if (NON_EXECUTION_ROLES.includes(actor.role as (typeof NON_EXECUTION_ROLES)[number])) {
          return res.status(403).json({ error: 'Your primary role cannot execute tasks or change task status' });
        }

        if (currentTask.assigneeId !== actor.id) {
          return res.status(403).json({ error: 'Only the assigned team member can change this task status' });
        }
      }
    }

    const nextTitle = validated.title ?? undefined;
    const nextDescription = validated.description !== undefined ? validated.description || null : undefined;
    const nextType = validated.type ?? undefined;
    const nextPriority = validated.priority ?? undefined;
    const nextAssigneeId = validated.assigneeId !== undefined ? validated.assigneeId || null : undefined;
    const nextStatus = validated.status ?? undefined;
    const nextDueAt = validated.dueAt !== undefined ? (validated.dueAt ? new Date(validated.dueAt).toISOString() : null) : undefined;
    const nextServiceDate = validated.serviceDate !== undefined ? (validated.serviceDate ? new Date(validated.serviceDate).toISOString() : null) : undefined;

    await prisma.$executeRawUnsafe(
      `
        UPDATE "Task"
        SET
          title = COALESCE(?, title),
          description = CASE WHEN ? = 1 THEN ? ELSE description END,
          type = COALESCE(?, type),
          priority = COALESCE(?, priority),
          assigneeId = CASE WHEN ? = 1 THEN ? ELSE assigneeId END,
          status = COALESCE(?, status),
          dueAt = CASE WHEN ? = 1 THEN ? ELSE dueAt END,
          serviceDate = CASE WHEN ? = 1 THEN ? ELSE serviceDate END,
          updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      nextTitle ?? null,
      validated.description !== undefined ? 1 : 0,
      nextDescription,
      nextType ?? null,
      nextPriority ?? null,
      validated.assigneeId !== undefined ? 1 : 0,
      nextAssigneeId,
      nextStatus ?? null,
      validated.dueAt !== undefined ? 1 : 0,
      nextDueAt,
      validated.serviceDate !== undefined ? 1 : 0,
      nextServiceDate,
      taskId,
    );

    const task = await getTaskWithRelations(taskId || currentTask.id);
    res.json(sanitizeTaskForResponse(task));
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureLeadership(req);
    const taskId = normalizeParam(req.params.taskId);
    if (!taskId) {
      return res.status(400).json({ error: 'taskId is required' });
    }

    await prisma.task.delete({ where: { id: taskId } });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function addTaskComment(req: Request, res: Response, next: NextFunction) {
  try {
    const taskId = normalizeParam(req.params.taskId);
    const authorId = req.header('x-user-id');
    const text = String(req.body.text || '').trim();

    if (!taskId || !authorId || !text) {
      return res.status(400).json({ error: 'taskId, authorId, and text are required' });
    }

    const comment = await prisma.comment.create({
      data: {
        taskId,
        authorId,
        text,
      },
      include: {
        author: true,
      },
    });

    res.status(201).json({
      ...comment,
      author: comment.author ? { ...comment.author, email: comment.author.email?.endsWith('@pending.local') ? null : comment.author.email } : comment.author,
    });
  } catch (err) {
    next(err);
  }
}


