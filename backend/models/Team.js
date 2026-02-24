import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    teamName: {
        type: String,
        required: true,
        trim: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Participant',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Participant'
    }],
    inviteCode: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['Incomplete', 'Complete'],
        default: 'Incomplete'
    },
    maxSize: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);
export default Team;
