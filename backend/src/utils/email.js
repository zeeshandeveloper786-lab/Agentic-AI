import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    try {
        console.log(`📧 Attempting to send email to: ${options.email}...`);

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: `"Agentic AI Platform" <${process.env.EMAIL_FROM}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully! MessageId: ${info.messageId}`);
    } catch (error) {
        console.warn(`⚠️ Email sending failed for ${options.email}: ${error.message}`);
    }
};

export default sendEmail;
