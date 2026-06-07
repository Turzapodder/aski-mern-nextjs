import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

let cachedTransporter = null;

const getTransport = () => {
    const host = process.env.EMAIL_HOST;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;
    const port = Number(process.env.EMAIL_PORT) || 587;

    if (!host || !user || !pass) {
        throw new Error('EMAIL_HOST, EMAIL_USER and EMAIL_PASSWORD are required for SMTP email sending.');
    }

    if (!cachedTransporter) {
        cachedTransporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
        });
    }

    return cachedTransporter;
};

const getFrom = () => {
    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    if (!fromEmail) {
        throw new Error('EMAIL_FROM (or EMAIL_USER) is required as the sender address.');
    }
    const name = process.env.EMAIL_FROM_NAME;
    return name ? `${name} <${fromEmail}>` : fromEmail;
};

const normalizeRecipients = (to) => {
    if (!to) return [];

    const toAddress = (entry) => {
        if (typeof entry === 'string') return entry;
        if (entry && typeof entry === 'object' && entry.email) {
            return entry.name ? `${entry.name} <${entry.email}>` : entry.email;
        }
        return null;
    };

    if (Array.isArray(to)) {
        return to.map(toAddress).filter(Boolean);
    }

    const single = toAddress(to);
    return single ? [single] : [];
};

const sendMail = async ({ to, subject, html, text }) => {
    const recipients = normalizeRecipients(to);
    if (!recipients.length) {
        throw new Error('At least one recipient is required.');
    }

    const transport = getTransport();

    return transport.sendMail({
        from: getFrom(),
        to: recipients,
        subject,
        ...(html ? { html } : {}),
        ...(text ? { text } : {}),
    });
};

// Keep transporter-like interface to minimize calling-site changes.
const transporter = { sendMail };

export default transporter;
