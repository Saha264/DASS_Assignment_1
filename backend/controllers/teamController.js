import Team from '../models/Team.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import crypto from 'crypto';

// @desc    Create a new hackathon team
// @route   POST /api/teams
// @access  Private (Participant)
export const createTeam = async (req, res, next) => {
    try {
        const { eventId, teamName } = req.body;
        const participantId = req.user._id;

        const event = await Event.findById(eventId);
        if (!event) {
            res.status(404); throw new Error('Event not found');
        }
        if (!event.isTeamEvent) {
            res.status(400); throw new Error('This is not a team event');
        }

        // Check if participant is already in a team for this event
        const existingTeam = await Team.findOne({ event: eventId, members: participantId });
        if (existingTeam) {
            res.status(400); throw new Error('You are already part of a team for this event');
        }

        const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();

        const team = await Team.create({
            teamName,
            event: eventId,
            leader: participantId,
            members: [participantId],
            inviteCode,
            maxSize: event.teamSize,
            status: event.teamSize === 1 ? 'Complete' : 'Incomplete' // Handle edge case of team size 1
        });

        // If team size is 1 (weird, but possible), generate ticket immediately
        if (team.status === 'Complete') {
            await generateTicketsForTeam(team._id);
        }

        res.status(201).json(team);
    } catch (error) {
        next(error);
    }
};

// @desc    Join an existing hackathon team
// @route   POST /api/teams/join
// @access  Private (Participant)
export const joinTeam = async (req, res, next) => {
    try {
        const { inviteCode } = req.body;
        const participantId = req.user._id;

        const team = await Team.findOne({ inviteCode }).populate('event');
        if (!team) {
            res.status(404); throw new Error('Invalid invite code');
        }

        // Check if event allows registration (deadline, etc - skipping full checks for brevity, but should be there)

        if (team.members.includes(participantId)) {
            res.status(400); throw new Error('You are already in this team');
        }

        // Check if user is already in another team for this event
        const existingTeam = await Team.findOne({ event: team.event._id, members: participantId });
        if (existingTeam) {
            res.status(400); throw new Error('You are already in a team for this event');
        }

        if (team.status === 'Complete' || team.members.length >= team.maxSize) {
            res.status(400); throw new Error('This team is already full');
        }

        team.members.push(participantId);

        if (team.members.length === team.maxSize) {
            team.status = 'Complete';
        }

        await team.save();

        if (team.status === 'Complete') {
            await generateTicketsForTeam(team._id);
        }

        res.json(team);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all teams for logged-in participant
// @route   GET /api/teams
// @access  Private (Participant)
export const getMyTeams = async (req, res, next) => {
    try {
        const teams = await Team.find({ members: req.user._id })
            .populate('event', 'eventName eventStartDate status')
            .sort({ createdAt: -1 });
        res.json(teams);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single team details
// @route   GET /api/teams/:id
// @access  Private (Participant)
export const getTeamDetails = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id)
            .populate('event', 'eventName eventStartDate description')
            .populate('leader', 'firstName lastName email')
            .populate('members', 'firstName lastName email');

        if (!team) {
            res.status(404); throw new Error('Team not found');
        }

        // Ensure only members can view it
        if (!team.members.some(m => m._id.toString() === req.user._id.toString())) {
            res.status(403); throw new Error('Not authorized to view this team');
        }

        res.json(team);
    } catch (error) {
        next(error);
    }
};


// --- Helper Function ---
const generateTicketsForTeam = async (teamId) => {
    const team = await Team.findById(teamId);

    // For each member, create a registration ticket
    const registrationPromises = team.members.map(async (memberId) => {
        // Check if already registered just in case
        const existingReg = await Registration.findOne({ event: team.event, participant: memberId });
        if (existingReg) return;

        const ticketId = 'FEL-' + crypto.randomBytes(3).toString('hex').toUpperCase();
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${ticketId}`;

        return Registration.create({
            participant: memberId,
            event: team.event,
            ticketId,
            qrCodeUrl,
            status: 'Confirmed'
        });
    });

    await Promise.all(registrationPromises);
};
