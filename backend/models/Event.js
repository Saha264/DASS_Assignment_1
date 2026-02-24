import mongoose from 'mongoose';

//Dynamic form fields for normal events
const formFieldSchema=new mongoose.Schema({
    label:{type:String,required:true},
    type:{
        type:String,
        enum:['text','dropdown','checkbox','file'],
        required:true
    },
    options:[{type:String}], //used only if type is dropdown
    required: {type:Boolean,default:false},
    order:{type:Number,required:true} //preserves UI layout order
});


//Variants for Merchandise events

const variantSchema = new mongoose.Schema({
    size: {type:String},
    color:{type:String},
    stock:{type:Number,required:true,min:0}
});


//Main event schema

const eventSchema= new mongoose.Schema({
    eventName: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    eventType: {
      type: String,
      required: true,
      enum: ['Normal', 'Merchandise']
    },
    eligibility: {
      type: String,
      required: true,
      default: 'Open to All'
    },
    registrationDeadline: {
      type: Date,
      required: true
    },
    eventStartDate: {
      type: Date,
      required: true
    },
    eventEndDate: {
      type: Date,
      required: true
    },
    registrationLimit: {
      type: Number,
      required: true,
      min: 1
    },
    fee: { // 0 implies it is a free event
      type: Number,
      default: 0
    },
    tags: [{
      type: String,
      trim: true
    }],
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizer',
      required: true
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Ongoing', 'Completed', 'Closed'],
      default: 'Draft'
    },
    
    // Normal Event Specifics
    
    customFormFields: [formFieldSchema],
    isFormLocked: {
      type: Boolean,
      default: false // Set to true after the first registration is recorded
    },
   
    // Merchandise Event Specifics
   
    merchandiseDetails: {
      itemName: { type: String },
      variants: [variantSchema],
      purchaseLimitPerParticipant: { type: Number, default: 1 }
    }
  },
  {
    timestamps: true
  }
);
const Event = mongoose.model('Event', eventSchema);
export default Event;
