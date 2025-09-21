import jwt from 'jsonwebtoken';
import userRefreshTokenModel from '../models/UserRefreshToken.js';

const verifyRefreshToken = async (refreshToken) => {
   try {
    const privateKey = process.env.JWT_REFRESH_TOKEN_SECRET_KEY;
    console.log('verifyRefreshToken - privateKey exists:', !!privateKey);
    console.log('verifyRefreshToken - refreshToken:', refreshToken);

    //Find the refresh token document
    const userRefreshToken =  await userRefreshTokenModel.findOne({ token: refreshToken });
    console.log('verifyRefreshToken - userRefreshToken found:', !!userRefreshToken);
    
    if(!userRefreshToken){
        console.log('verifyRefreshToken - Token not found in database');
        throw {error : true, message: "Invalid refresh token"};
    }

    //Verify Refresh TOken
    console.log('verifyRefreshToken - Attempting JWT verification');
    const tokenDetails = jwt.verify(refreshToken, privateKey);
    console.log('verifyRefreshToken - JWT verification successful:', tokenDetails);
    
    return {
        tokenDetails,
        error: false,
        message: "Valid refresh Token",
    }
   } catch (error) {
    console.error('verifyRefreshToken - Error:', error);
    if (error.error && error.message) {
        // This is our custom error
        throw error;
    } else {
        // This is a JWT error or other error
        throw { error: true, message: 'Invalid refresh Token'};
    }
   }
}

export default verifyRefreshToken;