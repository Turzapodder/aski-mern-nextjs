import UserModel from "../models/User.js";
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import passport from "passport";

var opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
    algorithms: ['HS256']
}

passport.use(new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
        const user = await UserModel.findOne({_id:jwt_payload._id}).select('-password')
        if (user && user.status === 'active') {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
}));