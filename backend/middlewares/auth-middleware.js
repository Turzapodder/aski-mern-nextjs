import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';

const checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  
  if (authorization && authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = authorization.split(' ')[1];
      
      // Verify token
      const { userID } = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
      
      // Get user from token
      req.user = await UserModel.findById(userID).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          status: 'failed',
          message: 'Unauthorized User'
        });
      }
      
      if (req.user.status !== 'active') {
        return res.status(401).json({
          status: 'failed',
          message: 'User account is not active'
        });
      }
      
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({
        status: 'failed',
        message: 'Unauthorized User'
      });
    }
  } else {
    return res.status(401).json({
      status: 'failed',
      message: 'Unauthorized User, No Token'
    });
  }
};

export default checkUserAuth;