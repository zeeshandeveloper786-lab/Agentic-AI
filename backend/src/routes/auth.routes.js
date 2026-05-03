import express from 'express';
import { signup, login, logout, forgotPassword, resetPassword, googleLogin, verifyEmail, resendVerificationCode, getProfile, deleteAccount, restoreAccount, restoreGoogleAccount, requestPasswordChange, confirmPasswordChange } from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();
console.log('Auth routes loaded');

router.post('/signup', signup);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationCode);
router.get('/test', (req, res) => res.json({ message: 'Auth routes are working!' }));

// Profile and Account Management
router.get('/profile', authMiddleware, getProfile);
router.delete('/account', authMiddleware, deleteAccount);
router.post('/restore-account', restoreAccount);
router.post('/restore-google-account', restoreGoogleAccount);
router.post('/request-password-change', authMiddleware, requestPasswordChange);
router.post('/confirm-password-change', authMiddleware, confirmPasswordChange);

// Legacy /me route
router.get('/me', authMiddleware, getProfile);

export default router;
