import transporter from "../config/emailConfig.js";

const sendNotificationEmail = async (userEmail, userName, title, message, link) => {
    const actionLink = link ? `${process.env.FRONTEND_HOST}${link}` : process.env.FRONTEND_HOST;

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
                        color: #333;
                        font-size: 16px;
                        line-height: 1.5;
                    }
                    .action-btn {
                        display: block;
                        text-align: center;
                        background-color: #4CAF50;
                        color: #ffffff !important;
                        padding: 15px;
                        text-decoration: none;
                        font-size: 16px;
                        border-radius: 8px;
                        margin: 30px 0;
                        font-weight: bold;
                    }
                    .footer {
                        font-size: 12px;
                        color: #777;
                        text-align: center;
                        padding: 20px;
                        background-color: #f9f9f9;
                    }
                    .footer a {
                        color: #4CAF50;
                        text-decoration: none;
                    }
                    .footer p {
                        margin: 5px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>${title}</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${userName},</p>
                        <p>${message}</p>
                        
                        <a href="${actionLink}" class="action-btn">View Details</a>
                        
                    </div>
                    <div class="footer">
                        <p>If you have any questions, feel free to contact support.</p>
                        <p>&copy; ${new Date().getFullYear()} ASKI Platform. All rights reserved.</p>
                    </div>
                </div>
            </body>
        </html>`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: userEmail,
        subject: `(ASKI) ${title}`,
        html: mailBody
    }

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending notification email:", error?.message || error);
    }
}

export default sendNotificationEmail;
