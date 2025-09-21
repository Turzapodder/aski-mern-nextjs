import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const refreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGQwMTk4MzZiYTM2YTdmZjZhMzk3MzIiLCJyb2xlcyI6WyJ0dXRvciJdLCJleHAiOjE3NTg5MTIzMDAsImlhdCI6MTc1ODQ4MDMwMH0.oGkOGJFMfp1i_BBGcsG2eK7HhoBTKoSRDxaVy0-v2kc';

console.log('Testing JWT verification...');
console.log('Refresh Token:', refreshToken);
console.log('JWT_REFRESH_TOKEN_SECRET_KEY exists:', !!process.env.JWT_REFRESH_TOKEN_SECRET_KEY);

try {
  // Decode without verification first
  const decoded = jwt.decode(refreshToken);
  console.log('Decoded token (without verification):', decoded);
  
  // Check expiration
  const currentTime = Math.floor(Date.now() / 1000);
  console.log('Current time (unix):', currentTime);
  console.log('Token exp:', decoded.exp);
  console.log('Token expired:', currentTime > decoded.exp);
  
  // Try to verify with the secret
  const verified = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_KEY);
  console.log('Verified token:', verified);
  
} catch (error) {
  console.error('JWT verification error:', error.message);
  console.error('Error name:', error.name);
}