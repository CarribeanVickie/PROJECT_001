import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import {
  addUserToMinistryTeam,
  createDevice,
  getTeamPermissions,
  listDevices,
  listMinistryTeams,
  setMinistryTeamLeader,
  setTeamPermissions,
  updateDeviceRole,
} from '../services/studioService';

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function getActor(req: Request) {
  const actorId = req.header('x-user-id');
  if (!actorId) {
    const error = new Error('Missing actor');
    (error as any).status = 401;
    throw error;
  }

  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    select: { id: true, role: true, teamId: true },
  });

  if (!actor) {
    const error = new Error('Actor not found');
    (error as any).status = 404;
    throw error;
  }

  return actor;
}

async function ensureCanManageMembers(req: Request) {
  const actor = await getActor(req);

  if (actor.role === 'SUPER_ADMIN') {
    return actor;
  }

  if (actor.role === 'ADMIN') {
    const permissions = await getTeamPermissions(actor.teamId);
    if (permissions.adminCanAllocateMembers) {
      return actor;
    }
  }

  const error = new Error('You do not have permission to allocate members');
  (error as any).status = 403;
  throw error;
}

async function ensureSuperAdmin(req: Request) {
  const actor = await getActor(req);
  if (actor.role !== 'SUPER_ADMIN') {
    const error = new Error('Only super admin can change admin permissions');
    (error as any).status = 403;
    throw error;
  }

  return actor;
}

export async function getDevices(req: Request, res: Response, next: NextFunction) {
  try {
    const teamId = req.query.teamId as string;
    const category = req.query.category as string | undefined;
    const actor = await getActor(req);

    if (!teamId) {
      return res.status(400).json({ error: 'teamId query param is required' });
    }

    if (actor.role === 'DEFAULT') {
      return res.json([]);
    }

    let roles: string[] | undefined;
    if (actor.role !== 'SUPER_ADMIN' && actor.role !== 'ADMIN') {
      const additionalRows = await prisma.$queryRawUnsafe<Array<{ role: string }>>(
        'SELECT role FROM "UserAdditionalRole" WHERE userId = ?',
        actor.id,
      );
      roles = [actor.role, ...additionalRows.map((row) => row.role)];
    }

    res.json(await listDevices(teamId, category, roles));
  } catch (err) {
    next(err);
  }
}

export async function postDevice(req: Request, res: Response, next: NextFunction) {
  try {
    const actor = await ensureSuperAdmin(req);
    const { name, category, imageUrl, assignedRole, ministryTeamId } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'name and category are required' });
    }

    const device = await createDevice({
      teamId: actor.teamId,
      ministryTeamId,
      name: String(name).trim(),
      imageUrl: imageUrl ? String(imageUrl).trim() : null,
      category: String(category).trim(),
      assignedRole: assignedRole ? String(assignedRole).trim().toUpperCase() : null,
    });

    res.status(201).json(device);
  } catch (err) {
    next(err);
  }
}

export async function patchDeviceRole(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureSuperAdmin(req);
    const deviceId = normalizeParam(req.params.deviceId);
    const assignedRole = req.body.assignedRole ? String(req.body.assignedRole).trim().toUpperCase() : null;

    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    await updateDeviceRole(deviceId, assignedRole);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getMinistryTeams(req: Request, res: Response, next: NextFunction) {
  try {
    const teamId = req.query.teamId as string;

    if (!teamId) {
      return res.status(400).json({ error: 'teamId query param is required' });
    }

    res.json(await listMinistryTeams(teamId));
  } catch (err) {
    next(err);
  }
}

export async function getAdminPermissions(req: Request, res: Response, next: NextFunction) {
  try {
    const teamId = req.query.teamId as string;

    if (!teamId) {
      return res.status(400).json({ error: 'teamId query param is required' });
    }

    res.json(await getTeamPermissions(teamId));
  } catch (err) {
    next(err);
  }
}

export async function updateAdminPermissions(req: Request, res: Response, next: NextFunction) {
  try {
    const actor = await ensureSuperAdmin(req);
    const teamId = String(req.body.teamId || actor.teamId).trim();

    res.json(
      await setTeamPermissions(teamId, {
        adminCanAllocateRoles:
          req.body.adminCanAllocateRoles !== undefined
            ? Boolean(req.body.adminCanAllocateRoles)
            : undefined,
        adminCanAllocateMembers:
          req.body.adminCanAllocateMembers !== undefined
            ? Boolean(req.body.adminCanAllocateMembers)
            : undefined,
      }),
    );
  } catch (err) {
    next(err);
  }
}

export async function updateMinistryTeamLeader(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureCanManageMembers(req);
    const ministryTeamId = normalizeParam(req.params.ministryTeamId);
    const userId = String(req.body.userId || '').trim();

    if (!ministryTeamId || !userId) {
      return res.status(400).json({ error: 'ministryTeamId and userId are required' });
    }

    await setMinistryTeamLeader(ministryTeamId, userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function addMinistryTeamMember(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureCanManageMembers(req);
    const ministryTeamId = normalizeParam(req.params.ministryTeamId);
    const userId = String(req.body.userId || '').trim();
    const isLeader = Boolean(req.body.isLeader);

    if (!ministryTeamId || !userId) {
      return res.status(400).json({ error: 'ministryTeamId and userId are required' });
    }

    await addUserToMinistryTeam(ministryTeamId, userId, isLeader);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
