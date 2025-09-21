import jwt from 'jsonwebtoken';
import verifyRefreshToken from "./verifyRefreshToken.js";
import userRefreshTokenModel from "../models/UserRefreshToken.js";
import generateTokens from "./generateTokens.js";
import UserModel from '../models/User.js';

const refreshAccessToken = async (req, res) => {
    try {
        const oldRefreshToken = req.cookies.refreshToken;
        console.log("refreshAccessToken - Refeshtoken::", oldRefreshToken)

        // Verify Refresh Token is valid or not 
        console.log("refreshAccessToken - About to verify refresh token");
        const { tokenDetails, error } = await verifyRefreshToken(oldRefreshToken);
        console.log("refreshAccessToken - verifyRefreshToken result:", { tokenDetails, error });
        
        if (error) {
            console.log('refreshAccessToken - Error verifying refresh token:', error);
            throw new Error('Invalid refresh token');
        }
        
        console.log("refreshAccessToken - Looking for user with ID:", tokenDetails._id);
        const user = await UserModel.findById(tokenDetails._id);
        if (!user) {
            console.log('refreshAccessToken - User not found for ID:', tokenDetails._id);
            throw new Error('User not found');
        }
        console.log("refreshAccessToken - User found:", user.email);
        
        console.log("refreshAccessToken - Looking for user refresh token in database");
        // FIXED: Find the specific token that matches, not just any token for the user
        const userRefreshToken = await userRefreshTokenModel.findOne({ 
            userId: tokenDetails._id,
            token: oldRefreshToken 
        });
        console.log("refreshAccessToken - userRefreshToken found:", !!userRefreshToken);
        
        if (!userRefreshToken) {
            console.log('refreshAccessToken - No matching refresh token record found for user');
            // Also check if there are any tokens for this user
            const anyTokens = await userRefreshTokenModel.find({ userId: tokenDetails._id });
            console.log('refreshAccessToken - Total tokens for user:', anyTokens.length);
            anyTokens.forEach((token, index) => {
                console.log(`  Token ${index + 1}: ${token.token.substring(0, 50)}... (blacklisted: ${token.blacklisted})`);
            });
            throw new Error('Unauthorized access');
        }

        console.log("refreshAccessToken - Token found and matches:");
        console.log("  userRefreshToken.blacklisted:", userRefreshToken.blacklisted);

        // Since we found the token by exact match, we only need to check if it's blacklisted
        if (userRefreshToken.blacklisted) {
            console.log('refreshAccessToken - Token is blacklisted');
            throw new Error('Unauthorized access');
        }

        console.log("refreshAccessToken - Generating new tokens");
        const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } = await generateTokens(user);

        console.log("refreshAccessToken - New tokens generated successfully");
        return {
            newAccessToken: accessToken,
            newRefreshToken: refreshToken,
            newAccessTokenExp: accessTokenExp,
            newRefreshTokenExp: refreshTokenExp
        };

    } catch (error) {
        console.error('refreshAccessToken - Refresh token error:', error.message);
        throw error; // Re-throw the error to be handled by the middleware
    }
}

export default refreshAccessToken