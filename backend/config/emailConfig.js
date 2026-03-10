import dotenv from 'dotenv'
dotenv.config()
import nodemailer from 'nodemailer'

const emailPort = Number(process.env.EMAIL_PORT || 587);
const emailSecure = String(process.env.EMAIL_SECURE || '').toLowerCase() === 'true' || emailPort === 465;
const connectTimeout = Number(process.env.EMAIL_CONNECT_TIMEOUT_MS || 10000);
const greetingTimeout = Number(process.env.EMAIL_GREETING_TIMEOUT_MS || 10000);
const socketTimeout = Number(process.env.EMAIL_SOCKET_TIMEOUT_MS || 20000);

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: emailPort,
    secure: emailSecure,
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: connectTimeout,
    greetingTimeout,
    socketTimeout,
});

if (String(process.env.EMAIL_VERIFY_ON_STARTUP || '').toLowerCase() === 'true') {
    transporter.verify((error) => {
        if (error) {
            console.error("SMTP connection error:", error);
        } else {
            console.log("SMTP connection is successful and ready to send emails.");
        }
    });
}

export default transporter;