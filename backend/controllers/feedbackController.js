import Feedback from '../models/Feedback.js';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';

// @desc    Submit feedback for an event
// @route   POST /api/feedback/:eventId
// @access  Private (Participant)
export const submitFeedback = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const { rating, comment, isAnonymous } = req.body;
        const participantId = req.user._id;

        // Verify the event exists
        const event = await Event.findById(eventId);
        if (!event) {
            res.status(404);
            throw new Error('Event not found');
        }

        // Verify the event has actually occurred or is marked as closed/completed
        if (new Date(event.eventStartDate) > new Date() && !['Closed', 'Completed'].includes(event.status)) {
            res.status(400);
            throw new Error('Cannot review an event that has not started yet');
        }

        // Verify participant was registered for it
        const registration = await Registration.findOne({ event: eventId, participant: participantId, status: 'Confirmed' });
        if (!registration) {
            res.status(403);
            throw new Error('You can only review events you have attended');
        }

        // Check if feedback already exists
        const existingFeedback = await Feedback.findOne({ event: eventId, participant: participantId });
        if (existingFeedback) {
            res.status(400);
            throw new Error('You have already submitted feedback for this event');
        }

        const feedback = await Feedback.create({
            event: eventId,
            participant: participantId,
            rating: Number(rating),
            comment,
            isAnonymous
        });

        res.status(201).json({ message: 'Feedback submitted successfully', feedback });
    } catch (error) {
        // Handle Mongoose duplicate key error specifically, just in case
        if (error.code === 11000) {
            res.status(400);
            next(new Error('You have already submitted feedback for this event'));
            return;
        }
        next(error);
    }
};

// @desc    Get all feedback for a specific event
// @route   GET /api/feedback/event/:eventId
// @access  Private (Organizer)
export const getEventFeedback = async (req, res, next) => {
    try {
        const { eventId } = req.params;

        // Verify Organizer owns to the event
        const event = await Event.findById(eventId);
        if (!event) {
            res.status(404); throw new Error('Event not found');
        }
        if (event.organizer.toString() !== req.user._id.toString()) {
            res.status(403); throw new Error('Not authorized to view feedback for this event');
        }

        const feedbacks = await Feedback.find({ event: eventId })
            .populate('participant', 'firstName lastName avatarUrl')
            .sort({ createdAt: -1 });

        // Calculate Average
        const totalRating = feedbacks.reduce((acc, current) => acc + current.rating, 0);
        const averageRating = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(1) : 0;

        // Map feedback to hide sensitive details if anonymous
        const sanitizedFeedback = feedbacks.map(fb => {
            const fbObj = fb.toObject();
            if (fbObj.isAnonymous) {
                fbObj.participant = {
                    firstName: 'Anonymous',
                    lastName: 'Participant',
                    avatarUrl: null
                };
            }
            return fbObj;
        });

        res.json({
            count: feedbacks.length,
            averageRating: Number(averageRating),
            feedbacks: sanitizedFeedback
        });
    } catch (error) {
        next(error);
    }
};
