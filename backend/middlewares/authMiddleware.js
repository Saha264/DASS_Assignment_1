import jwt from 'jsonwebtoken';
import Participant from '../models/Participant.js';
import Organizer from '../models/Organizer.js';
import Admin from '../models/Admin.js';

//protect routes by checking if the user is authenticated(is he an actual registered user with username and password)
export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization && req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header (Format: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            //verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            let user;
            if (decoded.role === 'Admin') {
                user = await Admin.findById(decoded.id).select('-password');
            } else if (decoded.role === 'Organizer') {
                user = await Organizer.findById(decoded.id).select('-password');
            } else if (decoded.role === 'Participant') {
                user = await Participant.findById(decoded.id).select('-password');
            }

            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            req.user = user;
            req.role = decoded.role;
            return next();

        } catch (error) {
            console.error('PROTECT MIDDLEWARE ERROR:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};


//authorize specific roles to access specific routes
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.role)) {
            res.status(403);
            return next(new Error(`Role ${req.role} is not authorized to acces this option`));
        }
        next();
    };
};