import express from 'express';
import {
    createEvent,
    updateEvent,
    getOrganizerEvents,
    getEventAttendees,
    getEventById
} from '../controllers/eventController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
const router = express.Router();

//get all events of an organizer
router.get('/organizer', protect, authorize('Organizer'), getOrganizerEvents);

//create event
router.post('/', protect, authorize('Organizer'), createEvent);

//update event
router.route('/:id')
    .get(protect, authorize('Organizer', 'Admin'), getEventById)
    .put(protect, authorize('Organizer'), updateEvent);

router.route('/:id/attendees')
    .get(protect, authorize('Organizer'), getEventAttendees);

export default router;
