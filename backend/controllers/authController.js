import Participant from '../models/Participant.js';
import Organizer from '../models/Organizer.js';
import Admin from '../models/Admin.js';
import generateToken from '../utils/generateToken.js';

//  * @route   POST /api/auth/register

export const registerParticipant = async (req, res, next) => {
  try {
    //unpacking the request body into the fields
    const {
      firstName,
      lastName,
      email,
      participantType,
      collegeName,
      contactNumber,
      password,
    } = req.body;
    // Check if user exists
    const userExists = await Participant.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('Participant already exists');
    }
    // IIIT Email Validation logic
    if (participantType === 'IIIT' && !email.endsWith('@iiit.ac.in') && !email.endsWith('@students.iiit.ac.in') && !email.endsWith('@research.iiit.ac.in')) {
      res.status(400);
      throw new Error('IIIT participants must use an IIIT email domain.');
    }

    //creating the participant db entry
    const participant = await Participant.create({
      firstName,
      lastName,
      email,
      participant_type: participantType,
      collegeName,
      contactNumber,
      password,
    });
    if (participant) {
      res.status(201).json({
        _id: participant._id,
        firstName: participant.firstName,
        lastName: participant.lastName,
        email: participant.email,
        participantType: participant.participantType,
        role: 'Participant',
        token: generateToken(participant._id, 'Participant'),
      });
    } else {
      res.status(400);
      throw new Error('Invalid participant data');
    }
  } catch (error) {
    next(error);
  }
};


 //* @route   POST /api/auth/login

export const loginUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      res.status(400);
      throw new Error('Please provide email, password, and role');
    }
    let user;


    if (role === 'Participant') {
      user = await Participant.findOne({ email });
    } else if (role === 'Organizer') {
      user = await Organizer.findOne({ contactEmail: email });
    } else if (role === 'Admin') {
      user = await Admin.findOne({ email });
    } else {
      res.status(400);
      throw new Error('Invalid role specified');
    }
    // Check password
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email || user.contactEmail,
        role: role,
        name: user.firstName || user.organizerName || 'Admin',
        token: generateToken(user._id, role),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};
