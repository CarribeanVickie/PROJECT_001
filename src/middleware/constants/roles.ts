 export const USER_ROLES = [
  'DEFAULT',
  'SUPER_ADMIN',
  'ADMIN',
  'CAMERAMAN',
  'CHURCH_PROJECTOR',
  'LIVE_STREAM',
  'VIDEO_SWITCHER',
  'SOUND_ENGINEER',
  'SOCIAL_MEDIA',
  'REPAIRER',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const DEFAULT_USER_ROLE: UserRole = 'DEFAULT';
export const LEADERSHIP_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN'];
export const NON_EXECUTION_ROLES: UserRole[] = ['DEFAULT', 'SUPER_ADMIN'];
export const MAX_LEADERSHIP_EXTRA_ROLES = 3;
