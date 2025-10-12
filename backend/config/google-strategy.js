import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import UserModel from "../models/User.js";
import generateTokens from "../utils/generateTokens.js";
import bcrypt from "bcryptjs";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const role = req.query.state || "";

        let user = await UserModel.findOne({ email: profile._json.email });
        let isNewTutor = false;

        if (!user) {
          const lastSixDigitsID = profile.id.substring(profile.id.length - 6);
          const lastTwoDigitsName = profile._json.name.substring(
            profile._json.name.length - 2
          );
          const newPass = lastTwoDigitsName + lastSixDigitsID;

          const salt = await bcrypt.genSalt(Number(process.env.SALT));
          const hashedPassword = await bcrypt.hash(newPass, salt);

          const roles = role === "tutor" ? ["tutor"] : ["user"];
          const onboardingStatus = role === "tutor" ? "pending" : "completed";

          user = await UserModel.create({
            name: profile._json.name,
            email: profile._json.email,
            is_verified: true,
            password: hashedPassword,
            roles: roles,
            onboardingStatus: onboardingStatus,
          });

          if (role === "tutor") {
            isNewTutor = true;
          }
        } else if (role === "tutor" && !user.roles.includes("tutor")) {
          user.roles.push("tutor");
          user.onboardingStatus = "pending";
          await user.save();
          isNewTutor = true;
        }

        // ✅ CRITICAL: Generate tokens here
        const {
          accessToken: jwtAccessToken,
          refreshToken: jwtRefreshToken,
          accessTokenExp,
          refreshTokenExp,
        } = await generateTokens(user);

        console.log("✅ Google Auth - Tokens generated for user:", user.email);
        console.log("✅ Google Auth - Refresh token saved to DB");

        return done(null, {
          user,
          accessToken: jwtAccessToken,
          refreshToken: jwtRefreshToken,
          accessTokenExp,
          refreshTokenExp,
          isNewTutor,
        });
      } catch (error) {
        console.error("❌ Google Auth Error:", error);
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;
