import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import UserModel from "../models/User";
import generateTokens from "../utils/generateTokens.js";


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://www.example.com/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {


    try {
        // check if user already exists in the database
        let user = await UserModel.findOne({email: profile._json.email});
        if(!user){
            const last4DigitsID = profile.id.substring(profile.id.length - 4);
            const last2DigitsName = profile._json.name.substring(profile._json.name.length - 2);
            const newPass = last2DigitsName + last4DigitsID;

            const salt = await bcrypt.genSalt(Number(process.env.SALT));
            const hashedPassword = await bcrypt.hash(newPass, salt);
            await UserModel.create({
                name: profile._json.name,
                email: profile._json.email,
                is_verified: true,
                password: hashedPassword,
            });
        }

        // Generate JWT Tokens
        const { accessToken, refreshToken, accessTokenExp, refreshTokenExp} = await generateTokens(user);
        return done(null, {user, accessToken, refreshToken, accessTokenExp, refreshTokenExp});
    } catch (error) {
        return done(error);
    }
  }
));