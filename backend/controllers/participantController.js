import Participant from '../models/Participant.js';

// @desc    Get participant profile
// @route   GET /api/participants/profile
// @access  Private (Participant)
export const getParticipantProfile = async (req, res, next) => {
    try {
        const participant = await Participant.findById(req.user._id).select('-password').populate('preferences.followedOrganizers', 'organizerName');
        
        if (participant) {
            res.json(participant);
        } else {
            res.status(404);
            throw new Error('Participant not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update participant profile (including onboarding preferences)
// @route   PUT /api/participants/profile
// @access  Private (Participant)
export const updateParticipantProfile = async (req, res, next) => {
    try {
        const participant = await Participant.findById(req.user._id);

        if (participant) {
            participant.firstName = req.body.firstName || participant.firstName;
            participant.lastName = req.body.lastName || participant.lastName;
            participant.contactNumber = req.body.contactNumber || participant.contactNumber;
            
            if (req.body.password) {
                participant.password = req.body.password; // pre-save hook will hash it
            }

            // Update preferences if provided (for onboarding)
            if (req.body.preferences) {
                participant.preferences = {
                    areasOfIntersest: req.body.preferences.areasOfIntersest || participant.preferences.areasOfIntersest,
                    followedOrganizers: req.body.preferences.followedOrganizers || participant.preferences.followedOrganizers,
                };
            }

            const updatedParticipant = await participant.save();

            res.json({
                _id: updatedParticipant._id,
                firstName: updatedParticipant.firstName,
                lastName: updatedParticipant.lastName,
                email: updatedParticipant.email,
                participant_type: updatedParticipant.participant_type,
                contactNumber: updatedParticipant.contactNumber,
                preferences: updatedParticipant.preferences
            });
        } else {
            res.status(404);
            throw new Error('Participant not found');
        }
    } catch (error) {
        next(error);
    }
};
