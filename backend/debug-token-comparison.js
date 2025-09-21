import mongoose from 'mongoose';
import userRefreshTokenModel from './models/UserRefreshToken.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.DATABASE_URL)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const userId = '68d019836ba36a7ff6a39732';
    const cookieToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGQwMTk4MzZiYTM2YTdmZjZhMzk3MzIiLCJyb2xlcyI6WyJ0dXRvciJdLCJleHAiOjE3NTg5MTIzMDAsImlhdCI6MTc1ODQ4MDMwMH0.oGkOGJFMfp1i_BBGcsG2eK7HhoBTKoSRDxaVy0-v2kc';
    
    // Find the user's refresh token in database
    const userRefreshToken = await userRefreshTokenModel.findOne({ userId: userId });
    
    if (userRefreshToken) {
      const dbToken = userRefreshToken.token;
      
      console.log('=== TOKEN COMPARISON ===');
      console.log('Cookie token length:', cookieToken.length);
      console.log('DB token length:', dbToken.length);
      console.log('Tokens are equal:', cookieToken === dbToken);
      console.log('');
      
      console.log('Cookie token (first 100 chars):', cookieToken.substring(0, 100));
      console.log('DB token (first 100 chars):', dbToken.substring(0, 100));
      console.log('');
      
      // Find first difference
      let firstDiff = -1;
      const minLength = Math.min(cookieToken.length, dbToken.length);
      
      for (let i = 0; i < minLength; i++) {
        if (cookieToken[i] !== dbToken[i]) {
          firstDiff = i;
          break;
        }
      }
      
      if (firstDiff !== -1) {
        console.log('First difference at position:', firstDiff);
        console.log('Cookie char:', cookieToken[firstDiff], '(code:', cookieToken.charCodeAt(firstDiff), ')');
        console.log('DB char:', dbToken[firstDiff], '(code:', dbToken.charCodeAt(firstDiff), ')');
        console.log('');
        console.log('Context around difference:');
        const start = Math.max(0, firstDiff - 10);
        const end = Math.min(cookieToken.length, firstDiff + 10);
        console.log('Cookie:', cookieToken.substring(start, end));
        console.log('DB:    ', dbToken.substring(start, end));
      } else if (cookieToken.length !== dbToken.length) {
        console.log('Tokens have different lengths but same content up to shorter length');
      } else {
        console.log('Tokens appear to be identical (this should not happen)');
      }
      
      // Check for invisible characters
      console.log('');
      console.log('=== INVISIBLE CHARACTER CHECK ===');
      console.log('Cookie token has non-printable chars:', /[^\x20-\x7E]/.test(cookieToken));
      console.log('DB token has non-printable chars:', /[^\x20-\x7E]/.test(dbToken));
      
      // Show hex representation of first 50 chars
      console.log('');
      console.log('Cookie token hex (first 50 chars):');
      console.log(Buffer.from(cookieToken.substring(0, 50)).toString('hex'));
      console.log('DB token hex (first 50 chars):');
      console.log(Buffer.from(dbToken.substring(0, 50)).toString('hex'));
      
    } else {
      console.log('No refresh token found for user');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });