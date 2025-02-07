import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import connectDB from './config/connectdb.js';
import passport from 'passport';
import userRoutes from './routes/userRoutes.js';
import './config/passport-jwt-strategy.js';
import setTokensCookies from './utils/setTokensCookies.js';
import './config/google-strategy.js';
const app = express()
const port = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL

//cors policy error solve
const corsOptions = {
    origin: process.env.FRONTEND_HOST,
    optionsSuccessStatus: 200,
    credentials: true
};

app.use(cors(corsOptions))

connectDB(DATABASE_URL)

app.use(express.json())

app.use(passport.initialize())

app.use(cookieParser())

//Load Routes
app.use('/api/user', userRoutes)
app.get('/auth/google',
    passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));
  
  app.get('/auth/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_HOST}/account/login` }),
    (req, res) => {
      // Access user object and token from req.user
      const { user, accessToken, refreshToken, accessTokenExp, refreshTokenExp } = req.user;
      setTokensCookies( res, accessToken, refreshToken, accessTokenExp, refreshTokenExp);

      res.redirect( `${process.env.FRONTEND_HOST}/user/profile`);
    });

app.listen(port, () => {
    console.log(`Server listening at port ${port}`);
})
