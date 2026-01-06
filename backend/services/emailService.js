const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendWelcomeEmail = async (to, name) => {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
        console.warn('⚠️ SMTP not configured. Welcome email simulated.');
        console.log(`To: ${to}, Subject: Welcome!`);
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: `"Event Management System" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Welcome to Event Management System",
            text: `Hello ${name},\n\nWelcome to Event Management System! We are excited to have you on board.\n\nBest,\nThe EMS Team`,
            html: `<div style="font-family: sans-serif; padding: 20px;">
                <h2>Hello ${name},</h2>
                <p>Welcome to <strong>Event Management System</strong>! We are excited to have you on board.</p>
                <p>Start exploring events now!</p>
                <br>
                <p>Best,<br>The EMS Team</p>
            </div>`
        });
        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};



const sendPasswordResetEmail = async (to, resetLink) => {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
        console.warn('⚠️ SMTP not configured. Password reset email simulated.');
        console.log(`To: ${to}, Reset Link: ${resetLink}`);
        return;
    }

    try {
        await transporter.sendMail({
            from: `"Event Management System" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Password Reset Request",
            text: `Click the following link to reset your password: ${resetLink}`,
            html: `<div style="font-family: sans-serif; padding: 20px;">
                <h2>Password Reset</h2>
                <p>You requested a password reset. Click the button below to proceed:</p>
                <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>If you didn't request this, please ignore this email.</p>
            </div>`
        });
        console.log("Password reset email sent to %s", to);
    } catch (error) {
        console.error("Error sending password reset email:", error);
    }
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };
