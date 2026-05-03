import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
    const { login, restoreAccount, restoreGoogleAccount, googleLogin, loading, error, clearError } = useAuthStore();
    const { theme } = useThemeStore();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Clear background errors on mount
    useEffect(() => {
        if (clearError) clearError();
    }, []);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data) => {
        setServerError('');
        const result = await login(data.email, data.password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            if (result.status === 403 && result.data?.requiresVerification) {
                // Email not verified
                navigate('/verify-email', { state: { email: data.email } });
            } else if (result.status === 403 && (result.message?.toLowerCase().includes('deleted') || result.data?.isDeleted)) {
                // Account soft-deleted, show restoration option
                const restoreResult = await Swal.fire({
                    title: 'Account Recovery',
                    text: 'Your account is deactivated and can be restored within 90 days of deletion. Would you like to recover it now?',
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Restore My Account',
                    cancelButtonText: 'No, stay out',
                    confirmButtonColor: '#ff4d00',
                    background: theme === 'dark' ? '#1a1a1c' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#0f172a',
                });

                if (restoreResult.isConfirmed) {
                    const res = await restoreAccount(data.email, data.password);
                    if (res.success) {
                        Swal.fire({
                            title: 'Welcome Back!',
                            text: 'Your account has been successfully restored.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false,
                            background: theme === 'dark' ? '#1a1a1c' : '#fff',
                            color: theme === 'dark' ? '#fff' : '#0f172a',
                        });
                        navigate('/dashboard');
                    } else {
                        setServerError(res.message);
                    }
                }
            } else {
                setServerError(result.message);
            }
        }
    };

    const handleGoogleLogin = async () => {
        setServerError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
            const loginResult = await googleLogin(idToken);

            if (loginResult.success) {
                navigate('/dashboard');
            } else if (loginResult.status === 403 && (loginResult.message?.toLowerCase().includes('deleted') || loginResult.data?.isDeleted)) {
                // Account soft-deleted, show restoration option
                const restoreResult = await Swal.fire({
                    title: 'Account Recovery',
                    text: 'This Google account was deactivated and can be restored within 90 days of deletion. Would you like to recover it now?',
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Restore Account',
                    cancelButtonText: 'No, Cancel',
                    confirmButtonColor: '#ff4d00'
                });

                if (restoreResult.isConfirmed) {
                    const res = await restoreGoogleAccount(idToken);
                    if (res.success) {
                        Swal.fire({
                            title: 'Welcome Back!',
                            text: 'Your account has been successfully restored.',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });
                        navigate('/dashboard');
                    } else {
                        setServerError(res.message);
                    }
                }
            } else {
                setServerError(loginResult.message);
            }
        } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') {
                setServerError('Google authentication failed');
            }
        }
    };

    const isEmailError = serverError?.toLowerCase().includes('email');
    const isPasswordError = serverError?.toLowerCase().includes('password') || serverError?.toLowerCase().includes('credentials');

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Premium Background Elements */}
            <div className="bg-mesh" />
            <div className="bg-grid" />

            {/* Floating Orbs */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-accent-primary/10 rounded-full blur-[100px] animate-float" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-3s' }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={serverError ? 'error' : 'normal'}
                shake={serverError ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                className="w-full max-w-[440px] z-10"
            >
                <div className="glass-card p-10 shadow-2xl">
                    <div className="flex flex-col items-center mb-10">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="mb-8"
                        >
                            <img src="/logo.png" alt="Agentic AI" className="h-24 w-auto object-contain" />
                        </motion.div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
                            Welcome <span className="text-gradient-accent">Back</span>
                        </h1>
                        <p className="text-slate-400 text-center text-sm">
                            Enter your credentials to access your AI workplace.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {(error || serverError) && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-3 mb-2 shadow-lg shadow-red-500/5"
                                >
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                                    <span className="leading-tight">{error || serverError}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="form-group">
                            <label className={`form-label transition-colors ${isEmailError ? 'text-red-400' : ''}`}>Email Address <span className="text-accent-primary">*</span></label>
                            <div className="relative group">
                                <input
                                    {...register('email')}
                                    onChange={(e) => {
                                        setServerError('');
                                        if (clearError) clearError();
                                        register('email').onChange(e);
                                    }}
                                    type="email"
                                    className={`modern-input w-full pl-6 h-14 text-[15px] transition-all ${isEmailError ? 'border-red-500/50 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : ''}`}
                                    placeholder="name@example.com"
                                />
                            </div>
                            {errors.email && <p className="text-[10px] uppercase font-bold text-red-400 mt-2 ml-1 tracking-wider">{errors.email.message}</p>}
                        </div>

                        <div className="form-group">
                            <div className="flex justify-between items-center mb-3">
                                <label className={`form-label !mb-0 transition-colors ${isPasswordError ? 'text-red-400' : ''}`}>Password <span className="text-accent-primary">*</span></label>
                                <Link to="/forgot-password" size="sm" className="text-[10px] uppercase font-bold text-accent-primary hover:text-accent-secondary transition-colors underline-offset-4 hover:text-orange-500">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <input
                                    {...register('password')}
                                    onChange={(e) => {
                                        setServerError('');
                                        if (clearError) clearError();
                                        register('password').onChange(e);
                                    }}
                                    type={showPassword ? "text" : "password"}
                                    className={`modern-input w-full pl-6 pr-14 h-14 text-[15px] transition-all ${isPasswordError ? 'border-red-500/50 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : ''}`}
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

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full btn-premium h-14 text-base mt-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                            <span className="bg-black/5 px-2 py-1 text-white/80">Or continue with google</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        type="button"
                        className="w-full h-14 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] text-white font-bold transition-all flex items-center justify-center gap-3 cursor-pointer group"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
                                <span className="text-sm">Sign in with Google</span>
                            </>
                        )}
                    </button>

                    <p className="mt-10 text-center text-slate-400">
                        New to Agentic?{' '}
                        <Link to="/register" className="text-accent-primary hover:underline font-bold transition-all">
                            Create account
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;


