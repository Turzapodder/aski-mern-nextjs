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
            throw new Error('Invalid refresh token');
        }
        
        const user = await UserModel.findById(tokenDetails._id);
        if (!user) {
            throw new Error('User not found');
        }
        
        // Find the specific token that matches, not just any token for the user
        const userRefreshToken = await userRefreshTokenModel.findOne({ 
            userId: tokenDetails._id,
            token: oldRefreshToken 
        });
        
        if (!userRefreshToken) {
            throw new Error('Unauthorized access');
        }

        // Check if token is blacklisted
        if (userRefreshToken.blacklisted) {
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
        throw error;
    }
}

export default refreshAccessToken