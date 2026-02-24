import express from 'express';
import { submitFeedback, getEventFeedback } from '../controllers/feedbackController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/:eventId', protect, authorize('Participant'), submitFeedback);
router.get('/event/:eventId', protect, authorize('Organizer', 'Admin'), getEventFeedback);

export default router;
