import dotenv from 'dotenv'
dotenv.config()

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const getSender = () => {
    const senderEmail = process.env.EMAIL_FROM;
    if (!senderEmail) {
        throw new Error('EMAIL_FROM is required for Brevo email sending.');
    }

    const sender = { email: senderEmail };
    if (process.env.EMAIL_FROM_NAME) {
        sender.name = process.env.EMAIL_FROM_NAME;
    }
    return sender;
};

const normalizeRecipients = (to) => {
    if (!to) return [];

    if (Array.isArray(to)) {
        return to
            .map((entry) => {
                if (typeof entry === 'string') return { email: entry };
                if (entry && typeof entry === 'object' && entry.email) {
                    return entry.name ? { email: entry.email, name: entry.name } : { email: entry.email };
                }
                return null;
            })
            .filter(Boolean);
    }

    if (typeof to === 'string') {
        return [{ email: to }];
    }

    if (typeof to === 'object' && to.email) {
        return [to.name ? { email: to.email, name: to.name } : { email: to.email }];
    }

    return [];
};

const sendMail = async ({ to, subject, html, text }) => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        throw new Error('BREVO_API_KEY is required to send emails via Brevo API.');
    }

    const recipients = normalizeRecipients(to);
    if (!recipients.length) {
        throw new Error('At least one recipient is required.');
    }

    const payload = {
        sender: getSender(),
        to: recipients,
        subject,
        ...(html ? { htmlContent: html } : {}),
        ...(text ? { textContent: text } : {}),
    };

    const response = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'api-key': apiKey,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Brevo API error (${response.status}): ${errorBody}`);
    }

    return response.json();
};

// Keep transporter-like interface to minimize calling-site changes.
const transporter = { sendMail };

export default transporter;