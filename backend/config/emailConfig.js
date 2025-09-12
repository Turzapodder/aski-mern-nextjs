import dotenv from 'dotenv'
dotenv.config()
import nodemailer from 'nodemailer'


const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },     
});

transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP connection error:", error);
    } else {
        console.log("SMTP connection is successful and ready to send emails.");
    }
});

export default transporter;