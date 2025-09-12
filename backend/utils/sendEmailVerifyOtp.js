import transporter from "../config/emailConfig.js";
import EmailVerificationModel from "../models/EmailVerification.js";

const sendEmailVerifyOTP = async (req, user) => {
    // Generate a random 4-digit Number
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Save OTP in Database
    await new EmailVerificationModel({ userId: user._id, otp: otp }).save();

    //OTP Verification Link
    const otpVerifyLink = `${process.env.FRONTEND_HOST}/account/verify-email`;

    const mailBody = `<html>
            <head>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        background-color: #f9f9f9;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .header {
                        background-color: #4CAF50;
                        padding: 20px;
                        text-align: center;
                        color: white;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .content {
                        padding: 20px;
                    }
                    .otp-container {
                        font-size: 32px;
                        font-weight: bold;
                        text-align: center;
                        margin: 30px 0;
                        padding: 15px;
                        background-color: #f1f1f1;
                        border-radius: 8px;
                    }
                    .verify-btn {
                        display: block;
                        text-align: center;
                        background-color: #4CAF50;
                        color: white;
                        padding: 15px;
                        text-decoration: none;
                        font-size: 16px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                    }
                    .footer {
                        font-size: 12px;
                        color: #777;
                        text-align: center;
                        padding: 20px;
                        background-color: #f9f9f9;
                    }
                    .footer a {
                        color: #007bff;
                        text-decoration: none;
                    }
                    .footer p {
                        margin: 5px 0;
                    }
                    @media screen and (max-width: 600px) {
                        .container {
                            padding: 10px;
                        }
                        .header h1 {
                            font-size: 20px;
                        }
                        .otp-container {
                            font-size: 28px;
                        }
                        .verify-btn {
                            font-size: 14px;
                            padding: 12px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Verify Your Account</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${user.name},</p>
                        <p>Thank you for signing up! To complete your registration, please verify your email address.</p>
                        <p>Your one-time password (OTP) is:</p>
                        
                        <!-- OTP Display -->
                        <div class="otp-container">
                            <span>${otp}</span>
                        </div>
                        
                        <p>This OTP is valid for the next 15 minutes. If you didn’t request this, please ignore this email.</p>
                        
                        <!-- Verification Link -->
                         <a href="${otpVerifyLink}" class="verify-btn">Verify Your Email Address</a>
                        
                        <p>If you did not request this verification, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>If you have any questions, feel free to <a href="#">Contact Support</a>.</p>
                        <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
                    </div>
                </div>
            </body>
        </html>`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "OTP - Verify your account",
        html: mailBody
    }

     transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Email sent successfully:", info.response);
        }
    });

    return otp

}

export default sendEmailVerifyOTP;