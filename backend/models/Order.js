import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
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
        merchandiseName: { type: String },
        variantRequested: {
            size: { type: String },
            color: { type: String }
        },
        quantity: { type: Number, default: 1 },
        paymentProof: {
            type: String, // URL/Path to the uploaded image
            required: true
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        },
        ticketId: { type: String }, // Generated only IF approved
        qrCodeUrl: { type: String } // Generated only IF approved
    },
    { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
