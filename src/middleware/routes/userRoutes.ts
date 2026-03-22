import { Router } from 'express';
import {
  changeUserPassword,
  createManagedUser,
  createUser,
  getUserByEmail,
  listUsers,
  resetManagedUserPassword,
  signInUser,
  updateUserProfile,
  updateUserRole,
  uploadUserProfilePhoto,
} from '../controllers/userController';

const router = Router();

router.post('/sign-in', signInUser);
router.get('/by-email', getUserByEmail);
router.get('/', listUsers);
router.post('/', createUser);
router.post('/managed', createManagedUser);
router.post('/:userId/reset-password', resetManagedUserPassword);
router.patch('/:userId/role', updateUserRole);
router.patch('/:userId/profile', updateUserProfile);
router.post('/:userId/profile-photo', uploadUserProfilePhoto);
router.patch('/:userId/password', changeUserPassword);

export default router;
