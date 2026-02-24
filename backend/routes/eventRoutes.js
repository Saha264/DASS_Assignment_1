import express from 'express';
import {
    createEvent,
    updateEvent,
    getOrganizerEvents,
    getEventAttendees,
    getEventById,
    getPublicEvents,
    getPublicEventById,
    checkRegistrationStatus,
    registerForEvent,
    purchaseMerchandise,
    getEventOrders,
    verifyOrder,
    getParticipantRegistrations,
    getParticipantOrders
} from '../controllers/eventController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';
const router = express.Router();

// Get all public events (with search/filters)
router.get('/', getPublicEvents);

router.get('/public/:id', getPublicEventById);

// Participant specific fetch routes must go BEFORE /:id to avoid being swallowed
router.get('/participant/registrations', protect, authorize('Participant'), getParticipantRegistrations);
router.get('/participant/orders', protect, authorize('Participant'), getParticipantOrders);

// Parameterized routes (/:id)
router.route('/:id/check-registration')
    .get(protect, authorize('Participant'), checkRegistrationStatus);

router.route('/:id/register')
    .post(protect, authorize('Participant'), registerForEvent);

router.route('/:id/purchase')
    .post(protect, authorize('Participant'), upload.single('paymentProof'), purchaseMerchandise);

router.route('/:id/orders')
    .get(protect, authorize('Organizer'), getEventOrders);

router.route('/orders/:orderId/verify')
    .put(protect, authorize('Organizer'), verifyOrder);




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
