import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import connectDB from './config/connectdb.js';
import passport from 'passport';
import userRoutes from './routes/userRoutes.js';
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

app.listen(port, () => {
    console.log(`Server listening at port ${port}`);
})
