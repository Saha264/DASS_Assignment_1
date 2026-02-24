import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import crypto from 'crypto';
import Order from '../models/Order.js';

//Route: POST /api/events
//Description: create a new event(saved as draft by default)

export const createEvent = async (req, res, next) => {
    try {
        const {
            eventName,
            description,
            eventType,
            eligibility,
            registrationDeadline,
            eventStartDate,
            eventEndDate,
            registrationLimit,
            fee,
            tags,
            customFormFields,
            merchandiseDetails,
            isTeamEvent,
            teamSize
        } = req.body;
        const event = await Event.create({
            eventName,
            description,
            eventType,
            eligibility,
            registrationDeadline,
            eventStartDate,
            eventEndDate,
            registrationLimit,
            fee: fee || 0,
            tags: tags || [],
            organizer: req.user._id, // Assign the logged-in organizer to this event
            status: 'Draft',
            customFormFields: customFormFields || [],
            merchandiseDetails: merchandiseDetails || {},
            isTeamEvent: isTeamEvent || false,
            teamSize: teamSize || 1
        });
        res.status(201).json(event);
    } catch (error) {
        next(error);
    }
};


//Route: PUT /api/event/:id
//Description: Update Event Details & Status (Draft -> Published -> Ongoing)

export const updateEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            res.status(404);
            throw new Error('Event not found');
        }
        // Security check: Only the Organizer who created the event can update it
        if (event.organizer.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this event');
        }
        // Apply editing rules based on the event's current status (as per Assignment Rules)
        if (event.status === 'Draft') {
            // Free edits allowed
            const updatedEvent = await Event.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            return res.json(updatedEvent);
        } else if (event.status === 'Published') {
            // Allowed edits: description update, extend deadline, increase limit, close registrations
            if (req.body.description) event.description = req.body.description;
            if (req.body.registrationDeadline) event.registrationDeadline = req.body.registrationDeadline;

            if (req.body.registrationLimit) {
                if (req.body.registrationLimit >= event.registrationLimit) {
                    event.registrationLimit = req.body.registrationLimit;
                } else {
                    res.status(400);
                    throw new Error('Registration limit cannot be decreased once published');
                }
            }
            if (req.body.status) event.status = req.body.status;

            const updatedEvent = await event.save();
            return res.json(updatedEvent);
        } else if (['Ongoing', 'Completed', 'Closed'].includes(event.status)) {
            // No direct edits permitted except changing status
            if (req.body.status && ['Ongoing', 'Completed', 'Closed'].includes(req.body.status)) {
                event.status = req.body.status;
                const updatedEvent = await event.save();
                return res.json(updatedEvent);
            } else {
                res.status(400);
                throw new Error('Cannot edit event details once it is ongoing or completed. Only status changes allowed.');
            }
        }
    } catch (error) {
        next(error);
    }
};


//Route: GET /api/events/organizer
//Description: Get all events created by the logged-in organizer

export const getOrganizerEvents = async (req, res, next) => {
    try {
        // Fetch all events for this specific organizer, sorting by newest first
        const events = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 });
        res.json(events);
    } catch (error) {
        next(error);
    }
};


//Route: GET /api/events/:id/attendees
//Description: Get all attendees for a specific event

export const getEventAttendees = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            res.status(404);
            throw new Error('Event not found');
        }
        if (event.organizer.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to view attendees for this event');
        }
        // Placeholder response: We will link this to the Registration model in Task 4!
        res.json({ attendees: [], message: 'Attendee fetch logic will be enabled when Registration system is built in Task 4' });
    } catch (error) {
        next(error);
    }
};


//Route: GET /api/events/:id
//Description: Get a single event by id

export const getEventById = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            res.status(404);
            throw new Error('Event not found');
        }
        // Verify if the person requesting is the organizer who created it (optional but good for security)
        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            res.status(403);
            throw new Error('Not authorized to view this event details');
        }
        res.json(event);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all public events (with optional filtering/search)
// @route   GET /api/events
// @access  Public
export const getPublicEvents = async (req, res, next) => {
    try {
        const { search, type, organizer } = req.query;

        // Base query: Only show events that are Published or Ongoing
        let query = { status: { $in: ['Published', 'Ongoing'] } };

        // 1. Search by name or description
        if (search) {
            query.$or = [
                { eventName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // 2. Filter by Event Type (Normal vs Merchandise)
        if (type && type !== 'All') {
            query.eventType = type;
        }

        // 3. Filter by Organizer ID (for when a user clicks on an organizer profile)
        if (organizer) {
            query.organizer = organizer;
        }

        // Fetch events, populate the Organizer's name, and sort by upcoming first
        const events = await Event.find(query)
            .populate('organizer', 'organizerName category')
            .sort({ eventStartDate: 1 });

        res.json(events);
    } catch (error) {
        next(error);
    }
};

// @desc    Get public event details
// @route   GET /api/events/public/:id
// @access  Public
export const getPublicEventById = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'organizerName contactEmail discordWebhook category');

        if (!event || !['Published', 'Ongoing', 'Completed', 'Closed'].includes(event.status)) {
            res.status(404);
            throw new Error('Event not found or not available to public');
        }
        res.json(event);
    } catch (error) {
        next(error);
    }
};

// @desc    Check if participant is registered or has an order
// @route   GET /api/events/:id/check-registration
// @access  Private (Participant)
export const checkRegistrationStatus = async (req, res, next) => {
    try {
        const registration = await Registration.findOne({ event: req.params.id, participant: req.user._id });
        if (registration) {
            return res.json({ isRegistered: true, ticket: registration, type: 'Registration' });
        }

        const order = await Order.findOne({ event: req.params.id, participant: req.user._id });
        if (order) {
            return res.json({ isRegistered: true, ticket: order, type: 'Order' });
        }

        res.json({ isRegistered: false });
    } catch (error) {
        next(error);
    }
};


// @desc    Register for a Normal Event
// @route   POST /api/events/:id/register
// @access  Private (Participant)
export const registerForEvent = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const participantId = req.user._id;

        const event = await Event.findById(eventId);
        if (!event) {
            res.status(404); throw new Error('Event not found');
        }

        if (event.eventType !== 'Normal') {
            res.status(400); throw new Error('Use purchase route for merchandise');
        }

        if (!['Published', 'Ongoing'].includes(event.status)) {
            res.status(400); throw new Error('Event is not open for registration');
        }

        if (new Date() > new Date(event.registrationDeadline)) {
            res.status(400); throw new Error('Registration deadline has passed');
        }

        const currentRegistrations = await Registration.countDocuments({ event: eventId, status: 'Confirmed' });
        if (currentRegistrations >= event.registrationLimit) {
            res.status(400); throw new Error('Event has reached maximum capacity');
        }

        // Generate Ticket ID & Public QR Code
        const ticketId = 'FEL-' + crypto.randomBytes(3).toString('hex').toUpperCase();
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${ticketId}`;

        const registration = await Registration.create({
            participant: participantId,
            event: eventId,
            ticketId,
            qrCodeUrl,
            status: 'Confirmed',
            customFormData: req.body.customFormData || {}
        });

        res.status(201).json(registration);
    } catch (error) {
        // Handle duplicate error code gracefully
        if (error.code === 11000) {
            res.status(400); next(new Error('You have already registered for this event.'));
        } else {
            next(error);
        }
    }
};

// @desc    Submit merchandise purchase proof
// @route   POST /api/events/:id/purchase
// @access  Private (Participant)
export const purchaseMerchandise = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const participantId = req.user._id;

        const event = await Event.findById(eventId);
        if (!event || event.eventType !== 'Merchandise') {
            res.status(400); throw new Error('Not a valid merchandise event');
        }

        if (!req.file) {
            res.status(400); throw new Error('Payment proof image is required');
        }

        const activeOrder = await Order.findOne({ participant: participantId, event: eventId });
        if (activeOrder && activeOrder.status !== 'Rejected') {
            res.status(400); throw new Error('You already have a pending or approved order for this item.');
        }

        // Create the pending order
        const order = await Order.create({
            participant: participantId,
            event: eventId,
            merchandiseName: event.merchandiseDetails?.itemName || 'Merch Item',
            variantRequested: {
                size: req.body.size || '',
                color: req.body.color || ''
            },
            quantity: req.body.quantity || 1,
            paymentProof: `/uploads/${req.file.filename}`, // Save local path
            status: 'Pending'
        });

        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders for an event (Organizer view)
// @route   GET /api/events/:id/orders
// @access  Private (Organizer)
export const getEventOrders = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event.organizer.toString() !== req.user._id.toString()) {
            res.status(401); throw new Error('Not authorized for this event');
        }

        const orders = await Order.find({ event: req.params.id }).populate('participant', 'firstName lastName email');
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Verify (Approve or Reject) an order
// @route   PUT /api/events/orders/:orderId/verify
// @access  Private (Organizer)
export const verifyOrder = async (req, res, next) => {
    try {
        const { status } = req.body; // 'Approved' or 'Rejected'
        const order = await Order.findById(req.params.orderId).populate('event');

        if (!order) {
            res.status(404); throw new Error('Order not found');
        }
        if (order.event.organizer.toString() !== req.user._id.toString()) {
            res.status(401); throw new Error('Not authorized');
        }
        if (order.status !== 'Pending') {
            res.status(400); throw new Error('Order is already processed');
        }

        order.status = status;

        if (status === 'Approved') {
            // Generate QR Code and Ticket ID
            const ticketId = 'MERCH-' + crypto.randomBytes(3).toString('hex').toUpperCase();
            order.ticketId = ticketId;
            order.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${ticketId}`;

            // (Advanced Bonus: decrementing stock would happen here)
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        next(error);
    }
};


// @desc    Get all registrations for logged-in participant
// @route   GET /api/events/participant/registrations
// @access  Private (Participant)
export const getParticipantRegistrations = async (req, res, next) => {
    try {
        const registrations = await Registration.find({ participant: req.user._id })
            .populate('event', 'eventName eventStartDate eventEndDate status eventType')
            .sort({ createdAt: -1 });
        res.json(registrations);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all merchandise orders for logged-in participant
// @route   GET /api/events/participant/orders
// @access  Private (Participant)
export const getParticipantOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ participant: req.user._id })
            .populate('event', 'eventName eventStartDate status eventType')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

