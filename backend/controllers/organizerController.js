import Organizer from '../models/Organizer.js';
import PasswordResetRequest from '../models/PasswordResetRequest.js';

//Route: POST /api/organizers/reset-password-request
//Description: Request a password reset for an Organizer

export const requestPasswordReset= async(req,res,next)=>{
    try{
        const {contactEmail}= req.body;

        const organizer = await Organizer.findOne({ contactEmail });
        if (!organizer) {
            res.status(404);
            throw new Error("no organizer found with that email");
        }

        //check if such request already exists
        const existingRequest = await PasswordResetRequest.findOne({
            organizer: organizer._id,
            status: 'Pending'
        });
        if(existingRequest){
            res.status(400);
            throw new Error('A password reset request has already been sent and is currently being considered');

        }

        await PasswordResetRequest.create({
            organizer: organizer._id,
            status: 'Pending'
        });

        res.status(202).json({ message: 'Passowrd reset request send successfully and is being considered' })

    } catch (error) {
        next(error);
    }
};

//Route: GET /api/organizers/profile
//Description: get organizer profile

export const getOrganizerProfile = async (req, res, next) => {
    try {
        //get the organizer profile excluding password
        const organizer = await Organizer.findById(req.user._id).select('-password');

        if (organizer) {
            res.json(organizer);

        }else{
            res.status(404);
            throw new Error('Organizer not found');
        }
    } catch (error) {
        next(error);
    }
};

//Route: PUT /api/organizers/profile
//Description: update organizer profile

export const updateOrganizerProfile = async (req, res, next) => {
    try {
        const organizer = await Organizer.findById(req.user._id);
        if (organizer) {
            // Update fields if they are provided in the request
            organizer.organizerName = req.body.organizerName || organizer.organizerName;
            organizer.category = req.body.category || organizer.category;
            organizer.description = req.body.description || organizer.description;
            organizer.contactEmail = req.body.contactEmail || organizer.contactEmail;

            // Update webhook. Allow explicitly setting it to empty string to remove it.
            if (req.body.discordWebhook !== undefined) {
                organizer.discordWebhook = req.body.discordWebhook;
            }
            // Update password if a new one is provided. 
            // The pre-save hook in the model will handle hashing it.
            if (req.body.password) {
                organizer.password = req.body.password;
            }
            const updatedOrganizer = await organizer.save();
            res.json({
                _id: updatedOrganizer._id,
                organizerName: updatedOrganizer.organizerName,
                category: updatedOrganizer.category,
                description: updatedOrganizer.description,
                contactEmail: updatedOrganizer.contactEmail,
                discordWebhook: updatedOrganizer.discordWebhook
            });
        } else {
            res.status(404);
            throw new Error('Organizer not found');
        }
    } catch (error) {
        next(error);
    }
};