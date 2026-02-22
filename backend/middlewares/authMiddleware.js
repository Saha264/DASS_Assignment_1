import jwt from 'jsonwebtoken';
import Participant from '../models/Participant.js';
import Organizer from '../models/Organizer.js';
import Admin from '../models/Admin.js';

export const protect =async(req,res,next)=>{
    let token;

    if(
        req.headers.authorization && req.headers.authorization.startsWith('Bearer')
    ){
        try{
            // Get token from header (Format: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            //verify token
            const decoded = jwt.verify(token,process.env.JWT_SECRET);

            let user;
            if (decoded.role === 'Admin') {
                //find admin by id and exclude password
                user = await Admin.findById(decoded.id).select('-password');
            } else if (decoded.role === 'Organizer') {
                //find organizer by id and exclude password
                user = await Organizer.findById(decoded.id).select('-password');
            } else if (decoded.role === 'Participant') {
                //find participant by id and exclude password
                user = await Participant.findById(decoded.id).select('-password');
            }

            if(!user){
                return res.status(401).json({message:'Not authorized, user not found'});
            }

            req.user = user;
            req.role=decoded.role;
            next();

        }catch(error){
            console.error(error);
            res.status(401).json({message:'Not authorized, token failed'});
        }
    }
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token provided');
    }
};

export const authorize=(...roles )=>{
    return (req,res,next)=> {
        if(!role.includes(req.role)){
            res.status(403);
            return next(new Error(`Role ${req.role} is not authorized to acces this option`));
        }
        next();
    };
};