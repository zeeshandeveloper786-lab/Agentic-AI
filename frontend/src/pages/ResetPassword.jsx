import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Bot, Lock, Loader2, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const resetPasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const ResetPassword = () => {
    const { resetPassword, loading, error } = useAuthStore();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [isSuccess, setIsSuccess] = useState(false);
    const [serverError, setServerError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(resetPasswordSchema)
    });

    const onSubmit = async (data) => {
        if (!token) {
            setServerError('Invalid or expired reset token.');
            return;
        }
        setServerError('');
        const result = await resetPassword(token, data.password);
        if (result.success) {
            setIsSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
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
                            New <span className="text-gradient-accent">Password</span>
                        </h1>
                        <p className="text-slate-400">
                            Create a strong password for your account.
                        </p>
                    </div>

                    {!isSuccess ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <AnimatePresence mode="wait">
                                {(error || serverError || !token) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 mb-2"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        {!token ? "Reset token is missing from the URL." : (error || serverError)}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="form-group">
                                <label className="form-label">New Password <span className="text-accent-primary">*</span></label>
                                <div className="relative group">
                                    <input
                                        {...register('password')}
                                        type={showPassword ? "text" : "password"}
                                        className="modern-input w-full pl-6 pr-14 h-14 text-[15px]"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all cursor-pointer z-20"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-[10px] uppercase font-bold text-red-400 mt-2 ml-1 tracking-wider">{errors.password.message}</p>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confirm New Password <span className="text-accent-primary">*</span></label>
                                <div className="relative group">
                                    <input
                                        {...register('confirmPassword')}
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="modern-input w-full pl-6 pr-14 h-14 text-[15px]"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all cursor-pointer z-20"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-[10px] uppercase font-bold text-red-400 mt-2 ml-1 tracking-wider">{errors.confirmPassword.message}</p>}
                            </div>

                            <button
                                disabled={loading || !token}
                                type="submit"
                                className="w-full btn-premium h-14 text-base mt-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>
                                        Reset Password <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
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
                            <h3 className="text-xl font-bold text-white">Success!</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Your password has been successfully reset.
                                Redirecting you to login...
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
