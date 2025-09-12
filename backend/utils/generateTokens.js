import jwt from 'jsonwebtoken';
import userRefreshTokenModel from '../models/UserRefreshToken.js';
const generateTokens = async (user) => {
    try{

        const payload = {_id: user._id, roles: user.roles};
        // Access Token expiration time (100s)
        const accessTokenExp = Math.floor(Date.now() / 1000) + 100;
        // Generate Access Token
        const accessToken = jwt.sign(
            {...payload, exp: accessTokenExp},
            process.env.JWT_ACCESS_TOKEN_SECRET_KEY
        );

        // Access Token expiration time (5d)
        const refreshTokenExp = Math.floor(Date.now() / 1000) +60*60*24*5;
        // Generate Refresh Token
        const refreshToken = jwt.sign(
            {...payload, exp: refreshTokenExp},
            process.env.JWT_REFRESH_TOKEN_SECRET_KEY
        );

        // Remove old Refresh token
        const userRefreshToken = await userRefreshTokenModel.findOneAndDelete({userId: user._id});

        // Save new Refresh Token
        await new userRefreshTokenModel({userId: user._id, token:refreshToken}).save();

        return Promise.resolve({ accessToken, refreshToken, accessTokenExp, refreshTokenExp })


    } catch(error){
        return Promise.reject(error);
    }
}

export default generateTokens;