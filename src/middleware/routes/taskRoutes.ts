import { Router } from 'express';
import {
  addTaskComment,
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from '../controllers/taskController';

const router = Router();

router.get('/', listTasks);
router.post('/', createTask);
router.get('/:taskId', getTask);
router.patch('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);
router.post('/:taskId/comments', addTaskComment);

export default router;
