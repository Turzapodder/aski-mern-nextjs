import jwt from 'jsonwebtoken';
import userRefreshTokenModel from '../models/UserRefreshToken.js';

const verifyRefreshToken = async (refreshToken) => {
  try {
    const privateKey = process.env.JWT_REFRESH_TOKEN_SECRET_KEY;

    // ✅ Log token details
    console.log("🔍 Verifying token - Length:", refreshToken?.length);

    const userRefreshToken = await userRefreshTokenModel.findOne({
      token: refreshToken,
    });

    if (!userRefreshToken) {
      // ✅ Debug: Check if ANY tokens exist for this user
      const decoded = jwt.decode(refreshToken);
      const allTokens = await userRefreshTokenModel.find({
        userId: decoded?._id,
      });

      console.log("❌ Token not found. Tokens in DB:", allTokens.length);
      allTokens.forEach((t, i) => {
        console.log(`  Token ${i}: ${t.token.substring(0, 30)}...`);
        console.log(`    Matches: ${t.token === refreshToken}`);
      });

      throw { error: true, message: "Invalid refresh token" };
    }

    const tokenDetails = jwt.verify(refreshToken, privateKey);

    return {
      tokenDetails,
      error: false,
      message: "Valid refresh Token",
    };
  } catch (error) {
    console.error("❌ Verification error:", error.message);
    throw { error: true, message: "Invalid refresh Token" };
  }
};

export default verifyRefreshToken;