const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const send = async ({ to, subject, text, html }) => {
    if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) {
        console.warn('⚠️ Email not configured. Simulated email.');
        console.log(`To: ${to}, Subject: ${subject}`);
        return;
    }
    try {
        const res = await fetch(BREVO_URL, {
            method: 'POST',
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json',
                accept: 'application/json',
            },
            body: JSON.stringify({
                sender: { name: 'Event Management System', email: process.env.EMAIL_FROM },
                to: [{ email: to }],
                subject,
                textContent: text,
                htmlContent: html,
            }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || `Brevo error ${res.status}`);
        console.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
        console.error('Error sending email:', error.message);
    }
};

const sendWelcomeEmail = (to, name) => send({
    to,
    subject: 'Welcome to Event Management System',
    text: `Hello ${name},\n\nWelcome to Event Management System! We are excited to have you on board.\n\nBest,\nThe EMS Team`,
    html: `<div style="font-family: sans-serif; padding: 20px;">
        <h2>Hello ${esc(name)},</h2>
        <p>Welcome to <strong>Event Management System</strong>! We are excited to have you on board.</p>
        <p>Start exploring events now!</p>
        <br><p>Best,<br>The EMS Team</p>
    </div>`,
});

const sendPasswordResetEmail = (to, resetLink) => send({
    to,
    subject: 'Password Reset Request',
    text: `Click the following link to reset your password: ${resetLink}`,
    html: `<div style="font-family: sans-serif; padding: 20px;">
        <h2>Password Reset</h2>
        <p>You requested a password reset. Click the button below to proceed:</p>
        <a href="${esc(resetLink)}" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
    </div>`,
});

const sendEventRegistrationEmail = (to, name, eventName, eventDate, eventLoc) => {
    const date = new Date(eventDate).toLocaleDateString();
    return send({
        to,
        subject: `Registration Confirmed: ${eventName}`,
        text: `Hello ${name},\n\nYou have successfully registered for "${eventName}".\n\nDate: ${date}\nLocation: ${eventLoc}\n\nWe look forward to seeing you there!\n\nBest,\nThe EMS Team`,
        html: `<div style="font-family: sans-serif; padding: 20px;">
            <h2>Registration Confirmed!</h2>
            <p>Hello ${esc(name)},</p>
            <p>You have successfully registered for <strong>${esc(eventName)}</strong>.</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Date:</strong> ${esc(date)}</p>
                <p><strong>Location:</strong> ${esc(eventLoc)}</p>
            </div>
            <p>We look forward to seeing you there!</p>
            <br><p>Best,<br>The EMS Team</p>
        </div>`,
    });
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail, sendEventRegistrationEmail };
