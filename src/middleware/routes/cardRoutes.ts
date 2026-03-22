import { Router } from 'express';
import {
  issueCard,
  grantAccess,
  revokeAccess,
  listCards,
  getCard,
  deactivateCard,
  listLocations,
  createLocation,
  getAccessLogs,
} from '../controllers/cardController';

const router = Router();

// Card endpoints
router.get('/', listCards);
router.post('/', issueCard);
router.get('/:cardId', getCard);
router.patch('/:cardId/deactivate', deactivateCard);

// Access grant/revoke
router.post('/access/grant', grantAccess);
router.post('/access/revoke', revokeAccess);

// Location endpoints
router.get('/locations', listLocations);
router.post('/locations', createLocation);

// Access logs
router.get('/logs', getAccessLogs);

export default router;
