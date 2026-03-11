import jwt from 'jsonwebtoken';
import userRefreshTokenModel from '../models/UserRefreshToken.js';
const generateTokens = async (user) => {
  try {
    const payload = { _id: user._id, roles: user.roles };

    const accessTokenExp = Math.floor(Date.now() / 1000) + 900;
    const accessToken = jwt.sign(
      { ...payload, exp: accessTokenExp },
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY
    );

    const refreshTokenExp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
    const refreshToken = jwt.sign(
      { ...payload, exp: refreshTokenExp },
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY
    );

    // Remove old tokens
    await userRefreshTokenModel.deleteMany({ userId: user._id });

    // Save new refresh token
    await new userRefreshTokenModel({
      userId: user._id,
      token: refreshToken,
    }).save();

    return { accessToken, refreshToken, accessTokenExp, refreshTokenExp };
  } catch (error) {
    throw error;
  }
};

export default generateTokens;