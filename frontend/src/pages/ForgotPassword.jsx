import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Bot, Mail, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

const ForgotPassword = () => {
    const { forgotPassword, loading, error } = useAuthStore();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [serverError, setServerError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(forgotPasswordSchema)
    });

    const onSubmit = async (data) => {
        setServerError('');
        const result = await forgotPassword(data.email);
        if (result.success) {
            setIsSubmitted(true);
        } else {
            setServerError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            <div className="bg-mesh" />
            <div className="bg-grid" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[440px] z-10"
            >
                <div className="glass-card p-10 shadow-2xl">
                    <div className="flex flex-col items-center mb-10 text-center">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center mb-6 shadow-2xl relative group"
                        >
                            <Bot className="text-white w-12 h-12" />

                        </motion.div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                            Reset <span className="text-gradient-accent">Password</span>
                        </h1>
                        <p className="text-slate-400">
                            {isSubmitted
                                ? "Check your email for the reset link."
                                : "Enter your email to receive a password reset link."}
                        </p>
                    </div>

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <AnimatePresence mode="wait">
                                {(error || serverError) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 mb-2"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        {error || serverError}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="relative group">
                                    <input
                                        {...register('email')}
                                        type="email"
                                        className="modern-input w-full pl-6 h-14 text-[15px]"
                                        placeholder="name@example.com"
                                    />
                                </div>
                                {errors.email && <p className="text-[10px] uppercase font-bold text-red-400 mt-2 ml-1 tracking-wider">{errors.email.message}</p>}
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full btn-premium h-14 text-base mt-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>
                                        Send Reset Link <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto"
                            >
                                <CheckCircle2 size={32} />
                            </motion.div>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                We've sent an email to your address with further instructions.
                                Please check your inbox (and spam folder) within the next few minutes.
                            </p>

                            <Link to="/login" className="block w-full btn-premium h-14 text-base pt-4">
                                Back to Login
                            </Link>
                        </div>
                    )}

                    {!isSubmitted && (
                        <p className="mt-10 text-center text-slate-400">
                            Remember your password?{' '}
                            <Link to="/login" className="text-accent-primary hover:underline font-bold transition-all">
                                Log in
                            </Link>
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
