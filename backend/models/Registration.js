import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
    {
        participant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Participant',
            required: true
        },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true
        },
        ticketId: {
            type: String,
            required: true,
            unique: true
        },
        qrCodeUrl: {
            type: String
        },
        status: {
            type: String,
            enum: ['Confirmed', 'Pending', 'Cancelled'],
            default: 'Confirmed'
        },
        customFormData: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    {
        timestamps: true
    }
);

// Prevent a user from registering for the same event multiple times
registrationSchema.index({ participant: 1, event: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;
