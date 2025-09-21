import jwt from 'jsonwebtoken';
import verifyRefreshToken from "./verifyRefreshToken.js";
import userRefreshTokenModel from "../models/UserRefreshToken.js";
import generateTokens from "./generateTokens.js";
import UserModel from '../models/User.js';

const refreshAccessToken = async (req, res) => {
    try {
        const oldRefreshToken = req.cookies.refreshToken;

        // Verify Refresh Token is valid or not 
        const { tokenDetails, error } = await verifyRefreshToken(oldRefreshToken);
        
        if (error) {
            console.log('Error verifying refresh token:', error);
            throw new Error('Invalid refresh token');
        }
        
        const user = await UserModel.findById(tokenDetails._id);
        if (!user) {
            throw new Error('User not found');
        }
        
        const userRefreshToken = await userRefreshTokenModel.findOne({ userId: tokenDetails._id });

        if (oldRefreshToken !== userRefreshToken.token || userRefreshToken.blacklisted) {
            throw new Error('Unauthorized access');
        }

        const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } = await generateTokens(user);

        return {
            newAccessToken: accessToken,
            newRefreshToken: refreshToken,
            newAccessTokenExp: accessTokenExp,
            newRefreshTokenExp: refreshTokenExp
        };

    } catch (error) {
        console.error('Refresh token error:', error.message);
        throw error; // Re-throw the error to be handled by the middleware
    }
}

export default refreshAccessToken