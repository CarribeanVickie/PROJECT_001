ALTER TABLE "Device" ADD COLUMN "assignedRole" TEXT;

UPDATE "Device"
SET "assignedRole" = CASE
  WHEN category = 'camera' THEN 'CAMERAMAN'
  WHEN category = 'projector' THEN 'CHURCH_PROJECTOR'
  WHEN category = 'encoder' THEN 'LIVE_STREAM'
  WHEN category = 'switcher' THEN 'VIDEO_SWITCHER'
  WHEN category = 'sound' THEN 'SOUND_ENGINEER'
  ELSE NULL
END
WHERE "assignedRole" IS NULL;
