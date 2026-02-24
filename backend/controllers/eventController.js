import Event from '../models/Event.js';

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
            merchandiseDetails
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
            merchandiseDetails: merchandiseDetails || {}
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