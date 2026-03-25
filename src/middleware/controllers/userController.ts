import { randomBytes, randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { DEFAULT_USER_ROLE, USER_ROLES } from '../constants/roles';
import {
  augmentUserWithRoles,
  augmentUsersWithRoles,
  getTeamPermissions,
  replaceUserAdditionalRoles,
} from '../services/studioService';
import { hashPassword, verifyPassword } from '../services/passwordService';
import { createPlaceholderEmail, isPlaceholderEmail } from '../services/userViewService';
import { saveBase64ProfilePhoto } from '../services/uploadService';

type UserRow = {
  id: string;
  teamId: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  profilePhotoUrl: string | null;
  identityVisibility: string | null;
  passwordHash: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
};

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeRole(role: unknown) {
  return String(role || '').trim().toUpperCase();
}

function normalizeVisibility(value: unknown) {
  const visibility = String(value || 'NAME').trim().toUpperCase();
  return visibility === 'ID' ? 'ID' : 'NAME';
}

async function getUserRowById(userId: string) {
  const rows = await prisma.$queryRawUnsafe<UserRow[]>(`
    SELECT "id", "teamId", "name", "email", "phoneNumber", "profilePhotoUrl",
           "identityVisibility", "passwordHash", "role", "createdAt", "updatedAt"
    FROM "User"
    WHERE "id" = $1
    LIMIT 1
  `, userId);
  return rows[0] || null;
}

async function getUserRowByEmail(email: string) {
  const rows = await prisma.$queryRawUnsafe<UserRow[]>(`
    SELECT "id", "teamId", "name", "email", "phoneNumber", "profilePhotoUrl",
           "identityVisibility", "passwordHash", "role", "createdAt", "updatedAt"
    FROM "User"
    WHERE "email" = $1
    LIMIT 1
  `, email);
  return rows[0] || null;
}

async function getActorFromHeader(req: Request) {
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

async function ensureCanManageRoles(req: Request) {
  const actor = await getActorFromHeader(req);

  if (actor.role === 'SUPER_ADMIN') {
    return actor;
  }

  if (actor.role === 'ADMIN') {
    const permissions = await getTeamPermissions(actor.teamId);
    if (permissions.adminCanAllocateRoles) {
      return actor;
    }
  }

  const error = new Error('You do not have permission to allocate roles');
  (error as any).status = 403;
  throw error;
}

async function ensureSuperAdmin(req: Request) {
  const actor = await getActorFromHeader(req);

  if (actor.role !== 'SUPER_ADMIN') {
    const error = new Error('Only super admin can manage generated user credentials');
    (error as any).status = 403;
    throw error;
  }

  return actor;
}

async function ensureOwnUser(req: Request) {
  const actor = await getActorFromHeader(req);
  const userId = normalizeParam(req.params.userId);

  if (!userId || actor.id !== userId) {
    const error = new Error('You can only update your own profile');
    (error as any).status = 403;
    throw error;
  }

  return userId;
}

function generateTemporaryPassword() {
  return `MS-${randomBytes(4).toString('hex')}`;
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password, teamId, teamName } = req.body;

    if (!name || !email || !password || !teamId) {
      return res.status(400).json({ error: 'name, email, password, and teamId are required' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    await prisma.team.upsert({
      where: { id: teamId },
      update: {},
      create: { id: teamId, name: teamName || 'Default Team' },
    });

    const userId = randomUUID();
    await prisma.$executeRawUnsafe(`
      INSERT INTO "User"
        ("id", "teamId", "name", "email", "phoneNumber", "profilePhotoUrl", 
        "identityVisibility", "passwordHash", "role", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`, 
      userId, teamId, String(name).trim(), String(email).trim().toLowerCase(),
      null, null, 'NAME', hashPassword(String(password)), DEFAULT_USER_ROLE
    );

    const user = await getUserRowById(userId);
    res.status(201).json(await augmentUserWithRoles(user as UserRow));
  } catch (err) {
    next(err);
  }
}

export async function createManagedUser(req: Request, res: Response, next: NextFunction) {
  try {
    const actor = await ensureSuperAdmin(req);
    const name = String(req.body.name || '').trim();
    const role = normalizeRole(req.body.role);

    if (!name || !role) {
      return res.status(400).json({ error: 'name and role are required' });
    }

    if (!USER_ROLES.includes(role as (typeof USER_ROLES)[number])) {
      return res.status(400).json({ error: 'Invalid role supplied' });
    }

    const userId = randomUUID();
    const temporaryPassword = generateTemporaryPassword();

    await prisma.$executeRawUnsafe(`
      INSERT INTO "User"
        ("id", "teamId", "name", "email", "phoneNumber", "profilePhotoUrl",
        "identityVisibility", "passwordHash", "role", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`, 
      userId, actor.teamId, name, createPlaceholderEmail(userId),
      null, null, 'NAME', hashPassword(temporaryPassword), role
    );

    const user = await getUserRowById(userId);
    res.status(201).json({
      user: await augmentUserWithRoles(user as UserRow),
      temporaryPassword,
    });
  } catch (err) {
    next(err);
  }
}

export async function resetManagedUserPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const actor = await ensureSuperAdmin(req);
    const userId = normalizeParam(req.params.userId);

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const managedUser = await getUserRowById(userId);
    if (!managedUser || managedUser.teamId !== actor.teamId) {
      return res.status(404).json({ error: 'User not found' });
    }

    const temporaryPassword = generateTemporaryPassword();

    await prisma.$executeRawUnsafe(`
      UPDATE "User"
      SET "passwordHash" = $1, "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = $2`, 
      hashPassword(temporaryPassword), userId
    );

    res.json({ userId, temporaryPassword });
  } catch (err) {
    next(err);
  }
}

export async function signInUser(req: Request, res: Response, next: NextFunction) {
  try {
    const identifier = String(req.body.identifier || req.body.email || '').trim();
    const password = String(req.body.password || '');

    if (!identifier || !password) {
      return res.status(400).json({ error: 'identifier and password are required' });
    }

    const emailLookup = identifier.toLowerCase();
    const user = (await getUserRowByEmail(emailLookup)) || (await getUserRowById(identifier));

    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid user ID/email or password' });
    }

    res.json(await augmentUserWithRoles(user));
  } catch (err) {
    next(err);
  }
}

export async function getUserByEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const email = req.query.email as string;

    if (!email) {
      return res.status(400).json({ error: 'email query param is required' });
    }

    const user = await getUserRowByEmail(String(email).trim().toLowerCase());

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(await augmentUserWithRoles(user));
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const teamId = req.query.teamId as string;

    if (!teamId) {
      return res.status(400).json({ error: 'teamId query param is required' });
    }

    const users = await prisma.$queryRawUnsafe<UserRow[]>(`
      SELECT "id", "teamId", "name", "email", "phoneNumber", "profilePhotoUrl",
            "identityVisibility", "passwordHash", "role", "createdAt", "updatedAt"
      FROM "User"
      WHERE "teamId" = $1
      ORDER BY "name" ASC`, teamId
    );

    res.json(await augmentUsersWithRoles(users));
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    await ensureCanManageRoles(req);
    const userId = normalizeParam(req.params.userId);
    const role = normalizeRole(req.body.role);
    const additionalRoles = Array.isArray(req.body.additionalRoles)
      ? req.body.additionalRoles.map((item: unknown) => String(item))
      : [];

    if (!userId || !role) {
      return res.status(400).json({ error: 'userId and role are required' });
    }

    if (!USER_ROLES.includes(role as (typeof USER_ROLES)[number])) {
      return res.status(400).json({ error: 'Invalid role supplied' });
    }

    await prisma.$executeRawUnsafe(
      `
      UPDATE "User"
      SET role = $1, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      role,
      userId
    );

    try {
      await replaceUserAdditionalRoles(userId, role, additionalRoles);
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Invalid additional roles supplied' });
    }

    const user = await getUserRowById(userId);
    res.json(await augmentUserWithRoles(user as UserRow));
  } catch (err) {
    next(err);
  }
}

export async function updateUserProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = await ensureOwnUser(req);
    const emailInput = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const phoneNumber = typeof req.body.phoneNumber === 'string' ? req.body.phoneNumber.trim() : '';
    const profilePhotoUrl = typeof req.body.profilePhotoUrl === 'string' ? req.body.profilePhotoUrl.trim() : '';
    const identityVisibility = normalizeVisibility(req.body.identityVisibility);

    const currentUser = await getUserRowById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const nextEmail = emailInput || (isPlaceholderEmail(currentUser.email) ? createPlaceholderEmail(userId) : currentUser.email);

    await prisma.$executeRawUnsafe(`
      UPDATE "User"
      SET "email" = $1, "phoneNumber" = $2, "profilePhotoUrl" = $3,
          "identityVisibility" = $4, "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = $5`, nextEmail, phoneNumber ?? null, profilePhotoUrl ?? null, identityVisibility, userId
    );

    const updatedUser = await getUserRowById(userId);
    res.json(await augmentUserWithRoles(updatedUser as UserRow));
  } catch (err) {
    next(err);
  }
}

export async function uploadUserProfilePhoto(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = await ensureOwnUser(req);
    const imageBase64 = String(req.body.imageBase64 || '').trim();
    const mimeType = String(req.body.mimeType || 'image/jpeg').trim();

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const profilePhotoUrl = saveBase64ProfilePhoto(userId, imageBase64, mimeType);

    await prisma.$executeRawUnsafe(`
      UPDATE "User"
      SET "profilePhotoUrl" = $1, "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = $2`, profilePhotoUrl, userId
    );

    const updatedUser = await getUserRowById(userId);
    res.json(await augmentUserWithRoles(updatedUser as UserRow));
  } catch (err) {
    next(err);
  }
}

export async function changeUserPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const actor = await getActorFromHeader(req);
    const userId = normalizeParam(req.params.userId);
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');

    if (!userId || actor.id !== userId) {
      return res.status(403).json({ error: 'You can only change your own password' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const currentUser = await getUserRowById(userId);
    if (!currentUser || !currentUser.passwordHash || !verifyPassword(currentPassword, currentUser.passwordHash)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    await prisma.$executeRawUnsafe(`
      UPDATE "User"
      SET "passwordHash" = $1, "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = $2`, 
      hashPassword(newPassword), userId
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

