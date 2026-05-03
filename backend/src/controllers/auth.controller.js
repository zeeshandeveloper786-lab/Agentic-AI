import prisma from '../prisma/client.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/email.js';
import { APP_CONFIG, HTTP_STATUS } from '../config/constants.js';
import firebaseAdmin from '../config/firebase.js';

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'your_secret', { expiresIn: APP_CONFIG.JWT_EXPIRY });
};

const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const signup = async (req, res) => {
    try {
        let { name, email, password } = req.body || {};
        if (!name || !email || !password) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'All fields are required' });

        email = email.trim().toLowerCase();
        name = name.trim();

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Email already registered', message: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = generateVerificationCode();
        const verificationCodeExpiry = new Date(Date.now() + 2 * 60 * 1000);

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, verificationCode, verificationCodeExpiry }
        });

        sendEmail({
            email: user.email,
            subject: 'Verify your email - Agentic AI Platform',
            message: `Your verification code is: ${verificationCode}. It will expire in 2 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
                    <h2 style="color: #007bff; text-align: center;">Email Verification</h2>
                    <p>Hi <b>${user.name}</b>, your verification code is:</p>
                    <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 5px; margin: 20px 0;">
                        ${verificationCode}
                    </div>
                    <p>Valid for 2 minutes.</p>
                </div>
            `
        }).catch(err => console.warn('Signup email failed:', err.message));

        res.status(201).json({ message: 'User registered. Check email.', user: { id: user.id, name: user.name, email: user.email }, requiresVerification: true });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req, res) => {
    try {
        let { email, password } = req.body || {};
        if (!email || !password) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Email and password required' });

        email = email.trim().toLowerCase();
        console.log(`Login attempt for: [${email}]`);

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.warn(`Login failed: User not found [${email}]`);
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Invalid credentials', message: 'Invalid email or password' });
        }

        if (!(await bcrypt.compare(password, user.password))) {
            console.warn(`Login failed: Incorrect password for [${email}]`);
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Invalid credentials', message: 'Invalid email or password' });
        }

        if (user.deletedAt) {
            const daysSinceDeletion = Math.floor((new Date() - new Date(user.deletedAt)) / (1000 * 60 * 60 * 24));
            if (daysSinceDeletion <= 90) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    error: 'Account is deleted',
                    message: `This account was deleted ${daysSinceDeletion} days ago. You can restore it within 90 days.`,
                    canRestore: true,
                    email: user.email
                });
            } else {
                return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Account no longer exists' });
            }
        }

        if (!user.isVerified) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({ error: 'Email not verified', message: 'Email not verified', requiresVerification: true, email: user.email });
        }

        const token = generateToken(user.id);

        sendEmail({
            email: user.email,
            subject: 'New Login Detected',
            message: `New login detected for your account on ${new Date().toLocaleString()}.`,
            html: `<p>New login detected on <b>${new Date().toLocaleString()}</b>.</p>`
        }).catch(err => console.warn('Login alert failed:', err.message));

        res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email }, token });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const googleLogin = async (req, res) => {
    console.log('Attempting Google Login...');
    try {
        const { idToken } = req.body || {};
        if (!idToken) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'ID Token required' });

        const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
        const { name, uid } = decodedToken;
        let { email } = decodedToken;
        email = email.trim().toLowerCase();

        let user = await prisma.user.findUnique({ where: { email } });
        console.log(`Google Login for: [${email}]`);

        if (user && user.deletedAt) {
            const daysSinceDeletion = Math.floor((new Date() - new Date(user.deletedAt)) / (1000 * 60 * 60 * 24));
            if (daysSinceDeletion <= 90) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    error: 'Account is deleted',
                    message: `This account was deleted ${daysSinceDeletion} days ago. You can restore it within 90 days.`,
                    canRestore: true,
                    email: user.email,
                    isGoogleUser: true
                });
            }
            // If more than 90 days, we treat it as a new signup and clear the deleted status
            await prisma.user.update({
                where: { id: user.id },
                data: { deletedAt: null, createdAt: new Date() }
            });
        }

        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            user = await prisma.user.create({
                data: { name: name || 'Google User', email, password: await bcrypt.hash(uid + Math.random(), 10), isVerified: true }
            });

            sendEmail({
                email: user.email,
                subject: 'Welcome to Agentic AI!',
                html: `<h2>Welcome ${user.name}!</h2><p>Registered via Google.</p>`
            }).catch(err => console.warn('Welcome email failed:', err.message));
        } else if (!user.isVerified) {
            user = await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });
        }

        if (!isNewUser) {
            sendEmail({
                email: user.email,
                subject: 'New Login Detected (Google)',
                html: `<p>Login via Google on ${new Date().toLocaleString()}.</p>`
            }).catch(err => console.warn('Google alert failed:', err.message));
        }

        res.json({ message: isNewUser ? 'Account created' : 'Login successful', user: { id: user.id, name: user.name, email: user.email }, token: generateToken(user.id) });
    } catch (error) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Invalid Google token' });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.isVerified) return res.status(400).json({ error: 'Already verified' });
        if (user.verificationCode !== code) return res.status(400).json({ error: 'Invalid code' });
        if (new Date() > new Date(user.verificationCodeExpiry)) return res.status(400).json({ error: 'Code expired' });

        await prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true, verificationCode: null, verificationCodeExpiry: null }
        });

        res.json({ message: 'Email verified', token: generateToken(user.id) });
    } catch (error) {
        res.status(500).json({ error: 'Verification failed' });
    }
};

export const resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.isVerified) return res.status(400).json({ error: 'Invalid request' });

        const code = generateVerificationCode();
        await prisma.user.update({ where: { id: user.id }, data: { verificationCode: code, verificationCodeExpiry: new Date(Date.now() + 2 * 60 * 1000) } });

        sendEmail({
            email: user.email,
            subject: 'New Verification Code',
            html: `<p>Your code: <b>${code}</b></p>`
        }).catch(err => console.warn('Resend failed:', err.message));

        res.json({ message: 'Code resent' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to resend' });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetTokenExpiry: new Date(Date.now() + 3600000) } });

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
        sendEmail({
            email: user.email,
            subject: 'Password Reset',
            html: `<a href="${resetUrl}">Reset Password</a>`
        }).catch(err => console.warn('Reset email failed:', err.message));

        res.json({ message: 'Reset link sent', resetToken });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const user = await prisma.user.findFirst({ where: { resetToken: token, resetTokenExpiry: { gt: new Date() } } });
        if (!user) return res.status(400).json({ error: 'Invalid/expired token' });

        await prisma.user.update({
            where: { id: user.id },
            data: { password: await bcrypt.hash(password, 10), resetToken: null, resetTokenExpiry: null }
        });

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ error: 'Reset failed' });
    }
};

export const logout = (req, res) => res.json({ message: 'Logout successful' });

export const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, createdAt: true, deletedAt: true }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const deletedAt = new Date();
        await prisma.$transaction([
            prisma.user.update({
                where: { id: req.user.id },
                data: { deletedAt }
            }),
            prisma.agent.updateMany({
                where: { userId: req.user.id, deletedAt: null },
                data: { deletedAt }
            })
        ]);
        res.json({ message: 'Account deleted successfully. You have 90 days to recover it. agents will be permanently deleted after 3 days.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete account' });
    }
};

export const restoreAccount = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.deletedAt) return res.status(400).json({ error: 'Invalid request' });
        if (!(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Incorrect password' });

        const daysSinceDeletion = Math.floor((new Date() - new Date(user.deletedAt)) / (1000 * 60 * 60 * 24));
        if (daysSinceDeletion > 90) return res.status(400).json({ error: 'Grace period expired. Account cannot be restored.' });

        await prisma.user.update({
            where: { id: user.id },
            data: { deletedAt: null }
        });

        res.json({ message: 'Account restored successfully. You can now login.', token: generateToken(user.id), user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: 'Failed to restore account' });
    }
};

export const restoreGoogleAccount = async (req, res) => {
    console.log('Attempting Google Account Restoration...');
    try {
        const { idToken } = req.body || {};
        if (!idToken) return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'ID Token required' });

        const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
        const { email } = decodedToken;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.deletedAt) return res.status(400).json({ error: 'Invalid request' });

        const daysSinceDeletion = Math.floor((new Date() - new Date(user.deletedAt)) / (1000 * 60 * 60 * 24));
        if (daysSinceDeletion > 90) return res.status(400).json({ error: 'Grace period expired. Account cannot be restored.' });

        await prisma.user.update({
            where: { id: user.id },
            data: { deletedAt: null }
        });

        res.json({ message: 'Account restored successfully', token: generateToken(user.id), user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error('Google restore error:', error);
        res.status(500).json({ error: 'Failed to restore Google account' });
    }
};

export const requestPasswordChange = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const code = generateVerificationCode();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.user.update({
            where: { id: user.id },
            data: { verificationCode: code, verificationCodeExpiry: expiry }
        });

        sendEmail({
            email: user.email,
            subject: 'Password Change Verification Code',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2>Change Your Password</h2>
                    <p>Use the code below to verify your password change request:</p>
                    <div style="background: #f8f9fa; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; color: #ff4d00;">
                        ${code}
                    </div>
                    <p>This code is valid for 10 minutes.</p>
                </div>
            `
        }).catch(err => console.warn('Password change email failed:', err.message));

        res.json({ message: 'Verification code sent to your email' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to request password change' });
    }
};

export const confirmPasswordChange = async (req, res) => {
    try {
        const { code, newPassword } = req.body;
        if (!code || !newPassword) return res.status(400).json({ error: 'Code and new password are required' });

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.verificationCode !== code || new Date() > new Date(user.verificationCodeExpiry)) {
            return res.status(400).json({ error: 'Invalid or expired verification code' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                verificationCode: null,
                verificationCodeExpiry: null
            }
        });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to change password' });
    }
};
