import mongoose from 'mongoose';
import userRefreshTokenModel from './models/UserRefreshToken.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.DATABASE_URL)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const userId = '68d019836ba36a7ff6a39732';
    const refreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGQwMTk4MzZiYTM2YTdmZjZhMzk3MzIiLCJyb2xlcyI6WyJ0dXRvciJdLCJleHAiOjE3NTg5MTIzMDAsImlhdCI6MTc1ODQ4MDMwMH0.oGkOGJFMfp1i_BBGcsG2eK7HhoBTKoSRDxaVy0-v2kc';
    
    console.log('Looking for refresh token records for user:', userId);
    
    // Find all refresh tokens for this user
    const userTokens = await userRefreshTokenModel.find({ userId: userId });
    console.log('Found refresh token records:', userTokens.length);
    
    userTokens.forEach((token, index) => {
      console.log(`Token ${index + 1}:`);
      console.log('  ID:', token._id);
      console.log('  Token (first 50 chars):', token.token.substring(0, 50) + '...');
      console.log('  Blacklisted:', token.blacklisted);
      console.log('  Created:', token.createdAt);
      console.log('  Matches provided token:', token.token === refreshToken);
      console.log('---');
    });
    
    // Also check if the specific token exists
    const specificToken = await userRefreshTokenModel.findOne({ token: refreshToken });
    console.log('Specific token found:', !!specificToken);
    if (specificToken) {
      console.log('Specific token details:', {
        userId: specificToken.userId,
        blacklisted: specificToken.blacklisted,
        createdAt: specificToken.createdAt
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });