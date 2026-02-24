import express from 'express';
import { getOrganizers, createOrganizer, deleteOrganizer, getPasswordRequests, updatePasswordRequestStatus } from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to ALL routes in this file
// Only users with the 'Admin' role can access these endoints
router.use(protect);
router.use(authorize('Admin'));

//Admin Organizer Routes
router.route('/organizers')
    .get(getOrganizers)
    .post(createOrganizer);

router.route('organizers/:id')
    .delete(deleteOrganizer);

router.route('/password-requests')
    .get(getPasswordRequests);

router.route('/password-requests/:id')
    .put(updatePasswordRequestStatus);

export default router;