import dotenv from 'dotenv'
dotenv.config()
import mongoose from "mongoose";

const connectDB = async (DATABASE_URL) => {
    const maxRetries = 5;
    let currentTry = 1;

    while (currentTry <= maxRetries) {
        try {
            const DB_OPTIONS = {
                dbName: 'aski-db',
                serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            };
            
            await mongoose.connect(DATABASE_URL, DB_OPTIONS);
            console.log('Successfully connected to MongoDB');
            return;
            
        } catch (error) {
            console.error(`Attempt ${currentTry} failed. Error connecting to MongoDB:`, error.message);
            
            if (currentTry === maxRetries) {
                console.error('Max retries reached. Could not connect to MongoDB');
                process.exit(1);
            }
            
            // Wait for 2 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));
            currentTry++;
        }
    }
};

export default connectDB