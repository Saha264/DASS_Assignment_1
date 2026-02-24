import Message from '../models/Message.js';
import Team from '../models/Team.js';

// @desc    Get all messages for a team
// @route   GET /api/messages/:teamId
// @access  Private (Participant)
export const getTeamMessages = async (req, res, next) => {
    try {
        const teamId = req.params.teamId;

        // Verify the user is a member of the team
        const team = await Team.findById(teamId);
        if (!team) {
            res.status(404);
            throw new Error('Team not found');
        }

        if (!team.members.includes(req.user._id)) {
            res.status(403);
            throw new Error('Not authorized to view messages for this team');
        }

        const messages = await Message.find({ team: teamId })
            .populate('sender', 'firstName lastName email')
            .sort({ createdAt: 1 }); // Oldest first (for chat logs)

        res.json(messages);
    } catch (error) {
        next(error);
    }
};
