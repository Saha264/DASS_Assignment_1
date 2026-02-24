import express from 'express';
import { getParticipantProfile, updateParticipantProfile } from '../controllers/participantController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/profile')
    .get(protect, authorize('Participant'), getParticipantProfile)
    .put(protect, authorize('Participant'), updateParticipantProfile);

export default router;
