import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { getOrganizerRegistrationAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/organizer/registrations', protect, authorize('Organizer'), getOrganizerRegistrationAnalytics);

export default router;
