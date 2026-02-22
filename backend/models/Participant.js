import mongoose from "mongoose";
import bycrypt from "bycrypt";

const participantSchema= new mongoose.Schema(
    {
        firstName:{
            type: String,
            required:true,
            trim:true,
        },
        lastName:{
            type:String,
            required:true,
            trim:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
            trim:true,
            lowercase:true,
        },
        particpant_type:{
            type:String,
            required:true,
            enum:['IIIT','Non-IIIT'],

        },
        contactNumber:{
            type:String,
            required:true,
            trim:true,
        },
        password:{
            type:String,
            required:true,
            
        },
        preferences:{
            areasOfIntersest: [{type:String}],
            followedOrganizers: [
                {
                    type:mongoose.Schema.Types.ObjectId,
                    ref:'Organizer',
                },
            ],
        },
        
    },
    {
        timestamps:true,
    }

);

//hashing the password before saving to db
participantSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        next();
    }
    const salt= await bycrypt.genSalt(10);
    this.password= await bycrypt.hasg(this.password,salt);
});

//verifying the password when entered by hashing and comparing
participantSchema.methods.matchPassword= async function(enteredPassword){
    return await bycrypt.compare(enteredPassword,this.password);
};

const Participant=mongoose.model('Participant',participantSchema);

export default Participant;
