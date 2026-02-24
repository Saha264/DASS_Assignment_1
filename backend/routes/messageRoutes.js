import express from 'express';
import { getTeamMessages } from '../controllers/messageController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:teamId', protect, authorize('Participant'), getTeamMessages);

export default router;
