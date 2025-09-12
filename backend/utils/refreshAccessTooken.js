import jwt from 'jsonwebtoken';
import verifyRefreshToken from "./verifyRefreshToken.js";
import userRefreshTokenModel from "../models/UserRefreshToken.js";
import generateTokens from "./generateTokens.js";
import UserModel from '../models/User.js';

const refreshAccessToken = async (req,res) =>{
    try{
        const oldRefreshToken = req.cookies.refreshToken;

       // Verify Refresh Token is valid or not 
       const {tokenDetails, error} = await verifyRefreshToken(oldRefreshToken);
       
       if(error){
        return res.status(401).send({status: "failed", message: "Invalid refresh token"});
       }
       const user = await UserModel.findById(tokenDetails._id);
       if(!user){
        return res.status(404).send({status: "failed", message: "User not Found"});
       }
       const userRefreshToken = await userRefreshTokenModel.findOne({userId: tokenDetails._id});

       if(oldRefreshToken !== userRefreshToken.token || userRefreshToken.blacklisted){
        return res.status(401).send({status: "failed", message: "Unauthorized access"});
       }

       const {accessToken, refreshToken, accessTokenExp, refreshTokenExp} = await generateTokens(user);

       return {
        newAccessToken : accessToken,
        newRefreshToken : refreshToken,
        newAccessTokenExp : accessTokenExp,
        newRefreshTokenExp : refreshTokenExp
       };

    }catch(error){
        console.error(error);
        return res.status(500).send({status: "failed", message: "Internel Server error"});
    }
}

export default refreshAccessToken