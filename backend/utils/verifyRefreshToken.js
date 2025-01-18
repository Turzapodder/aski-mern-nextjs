import jwt from 'jsonwebtoken';
import userRefreshTokenModel from '../models/UserRefreshToken.js';

const verifyRefreshToken = async (refreshToken) => {
   try {
    const privateKey = process.env.JWT_REFRESH_TOKEN_SECRET_KEY;

    //Find the refresh token document
    const userRefreshToken =  await userRefreshTokenModel.findOne({ token: refreshToken });
    
    if(!userRefreshToken){
        throw {error : true, message: "Invalid refresh token"};
    }

    //Verify Refresh TOken
    const tokenDetails = jwt.verify(refreshToken, privateKey);
    return {
        tokenDetails,
        error: false,
        message: "Valid refresh Token",
    }
   } catch (error) {
    console.error('Error verifying refresh token:', error);
        throw { error: true, message: 'Invalid refresh Token'};
   }
}

export default verifyRefreshToken;