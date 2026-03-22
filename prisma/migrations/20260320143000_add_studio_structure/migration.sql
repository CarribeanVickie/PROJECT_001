CREATE TABLE IF NOT EXISTS "UserAdditionalRole" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserAdditionalRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserAdditionalRole_userId_role_key" ON "UserAdditionalRole"("userId", "role");

CREATE TABLE IF NOT EXISTS "MinistryTeam" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "teamId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "leaderUserId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MinistryTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MinistryTeam_leaderUserId_fkey" FOREIGN KEY ("leaderUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "MinistryTeam_teamId_code_key" ON "MinistryTeam"("teamId", "code");

CREATE TABLE IF NOT EXISTS "UserMinistryMembership" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "ministryTeamId" TEXT NOT NULL,
  "isLeader" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserMinistryMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "UserMinistryMembership_ministryTeamId_fkey" FOREIGN KEY ("ministryTeamId") REFERENCES "MinistryTeam" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserMinistryMembership_userId_ministryTeamId_key" ON "UserMinistryMembership"("userId", "ministryTeamId");

CREATE TABLE IF NOT EXISTS "Device" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "teamId" TEXT NOT NULL,
  "ministryTeamId" TEXT,
  "name" TEXT NOT NULL,
  "imageUrl" TEXT,
  "category" TEXT NOT NULL,
  "assignedUserId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Device_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Device_ministryTeamId_fkey" FOREIGN KEY ("ministryTeamId") REFERENCES "MinistryTeam" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Device_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT OR IGNORE INTO "MinistryTeam" ("id", "teamId", "name", "code") VALUES
  ('team_123_camera', 'team_123', 'Camera Team', 'CAMERA_TEAM'),
  ('team_123_tech', 'team_123', 'Tech Team', 'TECH_TEAM'),
  ('team_123_social', 'team_123', 'Social Media Team', 'SOCIAL_MEDIA_TEAM');

INSERT OR IGNORE INTO "Device" ("id", "teamId", "ministryTeamId", "name", "imageUrl", "category") VALUES
  ('cam_front_left', 'team_123', 'team_123_camera', 'Front Left Camera', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80', 'camera'),
  ('cam_center_stage', 'team_123', 'team_123_camera', 'Center Stage Camera', 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80', 'camera'),
  ('cam_choir_balcony', 'team_123', 'team_123_camera', 'Choir Balcony Camera', 'https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&fit=crop&w=800&q=80', 'camera'),
  ('proj_main_sanctuary', 'team_123', 'team_123_tech', 'Main Sanctuary Projector', 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80', 'projector'),
  ('enc_stream_encoder', 'team_123', 'team_123_tech', 'Streaming Encoder', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', 'encoder'),
  ('swt_video_console', 'team_123', 'team_123_tech', 'Video Switcher Console', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80', 'switcher'),
  ('snd_front_of_house', 'team_123', 'team_123_tech', 'Front Of House Mixer', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80', 'sound');
