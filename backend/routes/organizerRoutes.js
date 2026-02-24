import express from 'express';
import {
    requestPasswordReset, getOrganizerProfile,
    updateOrganizerProfile
} from '../controllers/organizerController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/reset-password-request', requestPasswordReset);

router.route('/profile')
    .get(protect, authorize('Organizer'), getOrganizerProfile)
    .put(protect, authorize('Organizer'), updateOrganizerProfile);

export default router;