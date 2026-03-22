import { Router } from 'express';
import {
  addMinistryTeamMember,
  getAdminPermissions,
  getDevices,
  getMinistryTeams,
  patchDeviceRole,
  postDevice,
  updateAdminPermissions,
  updateMinistryTeamLeader,
} from '../controllers/studioController';

const router = Router();

router.get('/devices', getDevices);
router.post('/devices', postDevice);
router.patch('/devices/:deviceId/role', patchDeviceRole);
router.get('/teams', getMinistryTeams);
router.get('/permissions', getAdminPermissions);
router.patch('/permissions', updateAdminPermissions);
router.patch('/teams/:ministryTeamId/leader', updateMinistryTeamLeader);
router.post('/teams/:ministryTeamId/members', addMinistryTeamMember);

export default router;
