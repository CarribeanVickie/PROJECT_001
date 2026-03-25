import { randomUUID } from 'crypto';
import { prisma } from '../db';
import {
  LEADERSHIP_ROLES,
  MAX_LEADERSHIP_EXTRA_ROLES,
  USER_ROLES,
  type UserRole,
} from '../constants/roles';
import { sanitizeUserForResponse } from './userViewService';

type UserWithBaseRole = {
  id: string;
  role: string;
};

type AdditionalRoleRow = {
  role: string;
};

type DeviceRow = {
  id: string;
  name: string;
  imageUrl: string | null;
  category: string;
  assignedRole: string | null;
  assignedUserId: string | null;
  assignedUserName: string | null;
  assignedUserLabel: string | null;
  assignedUserProfilePhotoUrl: string | null;
  ministryTeamId: string | null;
  ministryTeamName: string | null;
  status: string;
};

type MinistryTeamRow = {
  id: string;
  name: string;
  code: string;
  leaderUserId: string | null;
  leaderName: string | null;
};

type TeamPermissionRow = {
  teamId: string;
  adminCanAllocateRoles: number;
  adminCanAllocateMembers: number;
};

export async function listUserAdditionalRoles(userId: string) {
  const rows = await prisma.$queryRawUnsafe<AdditionalRoleRow[]>(
    'SELECT "role" FROM "UserAdditionalRole" WHERE "userId" = $1 ORDER BY "role" ASC',
    userId,
  );

  return rows.map((row) => row.role);
}

export async function augmentUserWithRoles<T extends UserWithBaseRole>(user: T) {
  const additionalRoles = await listUserAdditionalRoles(user.id);
  return sanitizeUserForResponse({
    ...user,
    additionalRoles,
  });
}

export async function augmentUsersWithRoles<T extends UserWithBaseRole>(users: T[]) {
  return Promise.all(users.map((user) => augmentUserWithRoles(user)));
}

export function validateAdditionalRoles(primaryRole: string, additionalRoles: string[]) {
  const normalizedRoles = Array.from(
    new Set(additionalRoles.map((role) => role.trim().toUpperCase()).filter(Boolean)),
  );

  for (const role of normalizedRoles) {
    if (!USER_ROLES.includes(role as UserRole)) {
      throw new Error(`Invalid additional role: ${role}`);
    }
  }

  if (normalizedRoles.includes(primaryRole)) {
    throw new Error('Additional roles cannot contain the primary role');
  }

  if (LEADERSHIP_ROLES.includes(primaryRole as UserRole)) {
    if (normalizedRoles.length > MAX_LEADERSHIP_EXTRA_ROLES) {
      throw new Error(`Leadership users can have at most ${MAX_LEADERSHIP_EXTRA_ROLES} additional roles`);
    }

    return normalizedRoles;
  }

  if (normalizedRoles.length > 0) {
    throw new Error('Only admin or super admin can have additional roles');
  }

  return normalizedRoles;
}

export async function replaceUserAdditionalRoles(userId: string, primaryRole: string, additionalRoles: string[]) {
  const validRoles = validateAdditionalRoles(primaryRole, additionalRoles);

  await prisma.$executeRawUnsafe('DELETE FROM "UserAdditionalRole" WHERE userId = ?', userId);

  for (const role of validRoles) {
    await prisma.$executeRawUnsafe(
      'INSERT INTO "UserAdditionalRole" (id, userId, role, createdAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      randomUUID(),
      userId,
      role,
    );
  }

  return validRoles;
}

export async function listDevices(teamId: string, category?: string, roles?: string[]) {
  const params: string[] = [teamId];
  let sql = `
    SELECT
      d.id,
      d.name,
      d.imageUrl,
      d.category,
      d.assignedRole,
      d.assignedUserId,
      u.name AS assignedUserName,
      CASE
        WHEN u.identityVisibility = 'ID' THEN u.id
        ELSE u.name
      END AS assignedUserLabel,
      u.profilePhotoUrl AS assignedUserProfilePhotoUrl,
      d.ministryTeamId,
      mt.name AS ministryTeamName,
      d.status
    FROM "Device" d
    LEFT JOIN "User" u ON u.id = d.assignedUserId
    LEFT JOIN "MinistryTeam" mt ON mt.id = d.ministryTeamId
    WHERE d.teamId = ?
  `;

  if (category) {
    sql += ' AND d.category = ?';
    params.push(category);
  }

  if (roles && roles.length > 0) {
    sql += ` AND d.assignedRole IN (${roles.map(() => '?').join(', ')})`;
    params.push(...roles);
  }

  sql += ' ORDER BY d.name ASC';

  return prisma.$queryRawUnsafe<DeviceRow[]>(sql, ...params);
}

export async function createDevice(data: {
  teamId: string;
  ministryTeamId?: string | null;
  name: string;
  imageUrl?: string | null;
  category: string;
  assignedRole?: string | null;
}) {
  const id = randomUUID();
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "Device" (id, teamId, ministryTeamId, name, imageUrl, category, assignedRole, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    id,
    data.teamId,
    data.ministryTeamId || null,
    data.name,
    data.imageUrl || null,
    data.category,
    data.assignedRole || null,
  );

  const rows = await prisma.$queryRawUnsafe<DeviceRow[]>(
    `
      SELECT d.id, d.name, d.imageUrl, d.category, d.assignedRole, d.assignedUserId,
        u.name AS assignedUserName,
        CASE WHEN u.identityVisibility = 'ID' THEN u.id ELSE u.name END AS assignedUserLabel,
        u.profilePhotoUrl AS assignedUserProfilePhotoUrl,
        d.ministryTeamId, mt.name AS ministryTeamName, d.status
      FROM "Device" d
      LEFT JOIN "User" u ON u.id = d.assignedUserId
      LEFT JOIN "MinistryTeam" mt ON mt.id = d.ministryTeamId
      WHERE d.id = ?
    `,
    id,
  );

  return rows[0];
}

export async function updateDeviceRole(deviceId: string, assignedRole: string | null) {
  await prisma.$executeRawUnsafe(
    'UPDATE "Device" SET assignedRole = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    assignedRole,
    deviceId,
  );
}

export async function listMinistryTeams(teamId: string) {
  return prisma.$queryRawUnsafe<MinistryTeamRow[]>(
    `
      SELECT
        mt.id,
        mt.name,
        mt.code,
        mt.leaderUserId,
        u.name AS leaderName
      FROM "MinistryTeam" mt
      LEFT JOIN "User" u ON u.id = mt.leaderUserId
      WHERE mt.teamId = ?
      ORDER BY mt.name ASC
    `,
    teamId,
  );
}

export async function setMinistryTeamLeader(ministryTeamId: string, userId: string) {
  await prisma.$executeRawUnsafe(
    'UPDATE "MinistryTeam" SET leaderUserId = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    userId,
    ministryTeamId,
  );

  await prisma.$executeRawUnsafe(
    'INSERT OR IGNORE INTO "UserMinistryMembership" (id, userId, ministryTeamId, isLeader, createdAt) VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)',
    randomUUID(),
    userId,
    ministryTeamId,
  );
}

export async function addUserToMinistryTeam(ministryTeamId: string, userId: string, isLeader = false) {
  await prisma.$executeRawUnsafe(
    'INSERT OR IGNORE INTO "UserMinistryMembership" (id, userId, ministryTeamId, isLeader, createdAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
    randomUUID(),
    userId,
    ministryTeamId,
    isLeader ? 1 : 0,
  );
}

export async function getTeamPermissions(teamId: string) {
  const rows = await prisma.$queryRawUnsafe<TeamPermissionRow[]>(
    'SELECT teamId, adminCanAllocateRoles, adminCanAllocateMembers FROM "TeamPermission" WHERE teamId = ?',
    teamId,
  );

  const row = rows[0] || {
    teamId,
    adminCanAllocateRoles: 0,
    adminCanAllocateMembers: 0,
  };

  return {
    teamId: row.teamId,
    adminCanAllocateRoles: Boolean(row.adminCanAllocateRoles),
    adminCanAllocateMembers: Boolean(row.adminCanAllocateMembers),
  };
}

export async function setTeamPermissions(
  teamId: string,
  updates: { adminCanAllocateRoles?: boolean; adminCanAllocateMembers?: boolean },
) {
  const current = await getTeamPermissions(teamId);
  const next = {
    adminCanAllocateRoles:
      updates.adminCanAllocateRoles ?? current.adminCanAllocateRoles,
    adminCanAllocateMembers:
      updates.adminCanAllocateMembers ?? current.adminCanAllocateMembers,
  };

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "TeamPermission" (teamId, adminCanAllocateRoles, adminCanAllocateMembers, updatedAt)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(teamId) DO UPDATE SET
        adminCanAllocateRoles = excluded.adminCanAllocateRoles,
        adminCanAllocateMembers = excluded.adminCanAllocateMembers,
        updatedAt = CURRENT_TIMESTAMP
    `,
    teamId,
    next.adminCanAllocateRoles ? 1 : 0,
    next.adminCanAllocateMembers ? 1 : 0,
  );

  return getTeamPermissions(teamId);
}
