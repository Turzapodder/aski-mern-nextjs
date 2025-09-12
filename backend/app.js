import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/connectdb.js';
import passport from 'passport';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import socketManager from './config/socket.js';
import './config/passport-jwt-strategy.js';
import setTokensCookies from './utils/setTokensCookies.js';
import './config/google-strategy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const server = createServer(app);
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

// Remove the session middleware - we don't need it

app.use(passport.initialize())

app.use(cookieParser())

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//Load Routes
app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)

// Modified Google auth route to handle role parameter
app.get('/auth/google', (req, res, next) => {
    // Store role in state parameter if provided
    const role = req.query.role || '';
    const authOptions = { 
        session: false, 
        scope: ['profile', 'email'],
        state: role // Pass role as state parameter
    };
    passport.authenticate('google', authOptions)(req, res, next);
});
  
app.get('/auth/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_HOST}/account/login` }),
    (req, res) => {
      // Access user object and token from req.user
      const { user, accessToken, refreshToken, accessTokenExp, refreshTokenExp } = req.user;
      setTokensCookies(res, accessToken, refreshToken, accessTokenExp, refreshTokenExp, user);

      // Redirect based on role and onboarding status
      if (user.roles.includes('tutor') && user.onboardingStatus === 'pending') {
          res.redirect(`${process.env.FRONTEND_HOST}/account/tutor-onboarding`);
      } else {
          res.redirect(`${process.env.FRONTEND_HOST}/user/profile`);
      }
    });

// Initialize Socket.IO
socketManager.initialize(server);

server.listen(port, () => {
    console.log(`Server listening at port ${port}`);
    console.log(`Socket.IO server ready for real-time chat`);
})
