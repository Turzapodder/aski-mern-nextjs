import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import UserModel from '../models/User.js';
import generateTokens from '../utils/generateTokens.js';
import bcrypt from 'bcrypt';

// Add session middleware to app.js before this file is imported
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
  passReqToCallback: true // This allows us to access the request object
},
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      // Get role from state parameter
      const role = req.query.state || '';
      
      // Check if user already exists in the database
      let user = await UserModel.findOne({ email: profile._json.email });
      let isNewTutor = false;
      
      if (!user) {
        const lastSixDigitsID = profile.id.substring(profile.id.length - 6);
        const lastTwoDigitsName = profile._json.name.substring(profile._json.name.length - 2);
        const newPass = lastTwoDigitsName + lastSixDigitsID;
        
        // Generate salt and hash password
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashedPassword = await bcrypt.hash(newPass, salt);
        
        // Set roles based on the role parameter
        const roles = role === 'tutor' ? ['tutor'] : ['user'];
        const onboardingStatus = role === 'tutor' ? 'pending' : 'completed';
        
        user = await UserModel.create({
          name: profile._json.name,
          email: profile._json.email,
          is_verified: true,
          password: hashedPassword,
          roles: roles,
          onboardingStatus: onboardingStatus,
        });
        
        // Mark as new tutor if role is tutor
        if (role === 'tutor') {
          isNewTutor = true;
        }
      } else if (role === 'tutor' && !user.roles.includes('tutor')) {
        // If existing user is trying to become a tutor
        user.roles.push('tutor');
        user.onboardingStatus = 'pending';
        await user.save();
        isNewTutor = true; // This is a new tutor role for an existing user
      }
      
      // Generate JWT tokens
      const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } = await generateTokens(user);
      return done(null, { user, accessToken, refreshToken, accessTokenExp, refreshTokenExp, isNewTutor });

    } catch (error) {
      return done(error);
    }
  }
));