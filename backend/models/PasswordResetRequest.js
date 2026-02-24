import mongoose from "mongoose";

const passwordResetRequestSchema= new mongoose.Schema({
    organizer:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Organizer'
    },
    status:{
        type:String,
        enum: ['Pending','Approved','Rejected'],
        default:'Pending'
    },
    // We can store the generated password temporarily here once approved 
    newPasswordGenerated:{
        type:String
    }
},{timestamps:true});

const PasswordResetRequest=mongoose.model('PasswordResetRequest',passwordResetRequestSchema);

export default PasswordResetRequest;