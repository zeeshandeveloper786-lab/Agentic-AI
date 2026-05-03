import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const VerifyEmail = () => {
    const { verifyEmail, resendVerification, loading, error, clearError } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [email, setEmail] = useState('');
    const [serverError, setServerError] = useState('');
    const [resendMessage, setResendMessage] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (clearError) clearError();
    }, []);

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    useEffect(() => {
        const stateEmail = location.state?.email;
        const queryEmail = new URLSearchParams(location.search).get('email');
        if (stateEmail || queryEmail) {
            setEmail(stateEmail || queryEmail);
        } else {
            // If no email, redirect to login
            navigate('/login');
        }
    }, [location, navigate]);

    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value) {
            element.nextSibling.focus();
        }
        if (clearError) clearError();
        setServerError('');
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
            e.target.previousSibling.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        setResendMessage('');

        const fullOtp = otp.join('');
        if (fullOtp.length !== 6) {
            setServerError('Please enter the full 6-digit code');
            return;
        }

        const result = await verifyEmail(email, fullOtp);
        if (result.success) {
            // If token was returned, authStore already set it and logged in
            navigate('/dashboard');
        } else {
            setServerError(result.message);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setResendLoading(true);
        setServerError('');
        setResendMessage('');
        const result = await resendVerification(email);
        setResendLoading(false);
        if (result.success) {
            setResendMessage(result.message || 'Verification code resent successfully!');
            setTimeLeft(120);
            setCanResend(false);
        } else {
            setServerError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Premium Background Elements */}
            <div className="bg-mesh" />
            <div className="bg-grid" />

            {/* Floating Orbs */}
            <div className="absolute top-1/4 -right-20 w-80 h-80 bg-accent-primary/10 rounded-full blur-[100px] animate-float" />
            <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-3s' }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-[480px] z-10"
            >
                <div className="glass-card p-10 shadow-2xl">
                    <div className="flex flex-col items-center mb-10 text-center">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-20 h-20 bg-accent-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-accent-primary/20"
                        >
                            <ShieldCheck className="text-accent-primary" size={40} />
                        </motion.div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                            Verify Your Email
                        </h1>
                        <p className="text-slate-400 mb-4">
                            We've sent a 6-digit verification code to <br />
                            <span className="text-white font-medium">{email}</span>
                        </p>
                        <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-accent-primary flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
                            CODE EXPIRES IN: {formatTime(timeLeft)}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <AnimatePresence mode="wait">
                            {(error || serverError) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    {error || serverError}
                                </motion.div>
                            )}
                            {resendMessage && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-3"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    {resendMessage}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex justify-between gap-2">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    className="w-12 h-14 md:w-14 md:h-16 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-xl focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50 outline-none transition-all text-white"
                                    value={data}
                                    onChange={(e) => handleOtpChange(e.target, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                />
                            ))}
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full btn-premium h-14 text-base mt-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    Verify Account <ArrowRight size={20} />
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-slate-400 mb-2">Didn't receive the code?</p>
                        <button
                            onClick={handleResend}
                            disabled={!canResend || resendLoading}
                            className={`font-bold transition-all flex items-center gap-2 mx-auto ${canResend ? 'text-accent-primary hover:underline cursor-pointer' : 'text-slate-600 cursor-not-allowed'}`}
                        >
                            {resendLoading && <Loader2 className="animate-spin" size={16} />}
                            {canResend ? 'Resend Verification Code' : `Resend available in ${formatTime(timeLeft)}`}
                        </button>
                    </div>

                    <p className="mt-8 text-center text-slate-500 text-sm">
                        Back to{' '}
                        <Link to="/login" className="text-white hover:underline font-medium transition-all">
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
