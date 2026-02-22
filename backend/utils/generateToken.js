import jwt from 'jsonwebtoken';

//Generating JSON Web token(JWT)-used for authentication and authorization
//id and role are the user id and role and returns a string which is the signed JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};
export default generateToken;