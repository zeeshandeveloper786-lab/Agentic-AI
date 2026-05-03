import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bot, LogOut, LayoutDashboard, PlusCircle, User, Home, Mail, Shield, Trash2, X, AlertTriangle, Loader2, MoreVertical, Settings, Activity, Sun, Moon, Menu, Clock } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

const Navbar = () => {
    const { logout, user, isAuthenticated, fetchMe, deleteAccount, loading } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [showProfile, setShowProfile] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Close dropdown and menu on route change
    useEffect(() => {
        setShowProfile(false);
        setIsMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchMe();
        }
    }, [isAuthenticated, fetchMe]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDeleteAccount = async () => {
        const result = await Swal.fire({
            title: 'Delete Account?',
            text: "Your account will be deactivated for 90 days, after which it will be permanently deleted. Your agents will be kept in trash for 3 days before being removed.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: theme === 'dark' ? '#333' : '#e2e8f0',
            confirmButtonText: 'Yes, deactivate account',
            background: theme === 'dark' ? '#1a1a1c' : '#fff',
            color: theme === 'dark' ? '#fff' : '#0f172a',
        });

        if (result.isConfirmed) {
            const res = await deleteAccount();
            if (res.success) {
                Swal.fire({
                    title: 'Account Deleted',
                    text: 'Your account has been successfully removed.',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2000,
                    background: theme === 'dark' ? '#1a1a1c' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#0f172a',
                });
                navigate('/register');
            } else {
                Swal.fire({
                    title: 'Error',
                    text: res.message,
                    icon: 'error',
                    background: theme === 'dark' ? '#1a1a1c' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#0f172a',
                    confirmButtonColor: '#ff4d00',
                });
            }
        }
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-[100] glass-nav h-20 px-4 md:px-8 flex items-center justify-between">
                {/* Left Section: Logo */}
                <div className="flex-shrink-0">
                    <Link to="/" className="flex items-center group">
                        <img src="/logo.png" alt="Agentic AI" className="h-10 md:h-12 w-auto object-contain transition-all group-hover:scale-105" />
                    </Link>
                </div>

                {/* Center Section: Navigation Links (Desktop Only) */}
                <div className="hidden lg:flex items-center justify-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] flex-grow">
                    <Link to="/" className="nav-link-premium group flex items-center gap-2">
                        <Home size={14} className="text-accent-primary group-hover:scale-110 transition-transform" />
                        <span>Home</span>
                    </Link>

                    {isAuthenticated && (
                        <>
                            <Link to="/dashboard" className="nav-link-premium group flex items-center gap-2">
                                <LayoutDashboard size={14} className="text-accent-primary group-hover:scale-110 transition-transform" />
                                <span>Workspace</span>
                            </Link>
                            <Link to="/agents/create" className="nav-link-premium group flex items-center gap-2">
                                <PlusCircle size={14} className="text-accent-primary group-hover:scale-110 transition-transform" />
                                <span>Create Agent</span>
                            </Link>
                        </>
                    )}

                    {!isAuthenticated && (
                        <>
                            <Link to="/features" className="nav-link-premium">Features</Link>
                            <Link to="/pricing" className="nav-link-premium">Pricing</Link>
                            <Link to="/docs" className="nav-link-premium">Docs</Link>
                        </>
                    )}
                </div>

                {/* Right Section: Theme Toggle + User Info / Auth Buttons */}
                <div className="flex-shrink-0 flex justify-end items-center gap-3 md:gap-6 ml-auto">
                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl hover:bg-white/5 dark:hover:bg-white/5 hover:border-white/10 border border-transparent transition-all cursor-pointer group"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        <AnimatePresence mode="wait">
                            {theme === 'dark' ? (
                                <motion.div
                                    key="sun"
                                    initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                    exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Sun size={20} className="text-amber-400 group-hover:text-amber-300 transition-colors" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="moon"
                                    initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                    exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Moon size={20} className="text-slate-600 group-hover:text-slate-500 transition-colors" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>

                    {isAuthenticated ? (
                        <div className="flex items-center gap-3 md:gap-6">
                            <div className="hidden lg:flex items-center gap-2 pr-6 border-r border-theme">
                                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20">
                                    <User size={18} className="text-accent-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-white uppercase tracking-tight">
                                        {user?.name || user?.username || user?.email?.split('@')[0] || 'User'}
                                    </span>
                                    <div className="flex items-center gap-1.5 leading-none mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="text-[9px] font-bold text-emerald-500/80 uppercase tracking-widest">Online</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative group hidden lg:block">
                                <button
                                    onClick={() => setShowProfile(!showProfile)}
                                    className={`p-2.5 rounded-xl transition-all cursor-pointer border ${showProfile ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary' : 'hover:bg-theme-surface text-slate-400 hover:text-white dark:hover:text-white border-transparent hover:border-theme'}`}
                                >
                                    <MoreVertical size={20} className={`${showProfile ? 'rotate-90' : ''} transition-transform duration-300`} />
                                </button>

                                <AnimatePresence>
                                    {showProfile && (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                onClick={() => setShowProfile(false)}
                                                className="fixed inset-0 z-[90]"
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10, x: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 10, x: 10 }}
                                                className="absolute right-0 top-full mt-4 w-[280px] z-[100] origin-top-right"
                                            >
                                                <div className="bg-menu-dropdown shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-theme rounded-[30px] overflow-hidden relative">
                                                    {/* Premium Glow effect */}
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/15 blur-3xl -mr-16 -mt-16 animate-pulse" />

                                                    <div className="p-7">
                                                        <div className="flex items-center gap-4 pb-6 border-b border-white/5 mb-6">
                                                            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center border border-white/10 shrink-0 shadow-inner">
                                                                <User size={26} className="text-accent-primary" />
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <h4 className="text-[13px] font-black text-white uppercase tracking-tight truncate">
                                                                    {user?.name || 'Agentic User'}
                                                                </h4>
                                                                <p className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">{user?.email}</p>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                                                                        <Activity size={14} className="text-emerald-500" />
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                                    <span className="text-[9px] font-black uppercase text-emerald-500">Online</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/10">
                                                                        <Shield size={14} className="text-blue-400" />
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account</span>
                                                                </div>
                                                                <span className="text-[9px] font-black uppercase text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">Verified</span>
                                                            </div>

                                                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                                                        <LayoutDashboard size={14} className="text-slate-400" />
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</span>
                                                                </div>
                                                                <span className="text-[9px] font-black uppercase text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/5">Standard</span>
                                                            </div>
                                                        </div>

                                                        <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
                                                            <div className="px-1 mb-2">
                                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block">Security</span>
                                                                <button
                                                                    onClick={async () => {
                                                                        setShowProfile(false);
                                                                        const { requestPasswordChange, confirmPasswordChange } = useAuthStore.getState();

                                                                        // Step 1: Request Code
                                                                        Swal.fire({
                                                                            title: 'Change Password',
                                                                            text: 'We will send a verification code to your email to confirm your identity.',
                                                                            icon: 'info',
                                                                            showCancelButton: true,
                                                                            confirmButtonText: 'Send Verification Code',
                                                                            confirmButtonColor: '#ff4d00',
                                                                            background: theme === 'dark' ? '#1a1a1c' : '#fff',
                                                                            color: theme === 'dark' ? '#fff' : '#0f172a',
                                                                            showLoaderOnConfirm: true,
                                                                            preConfirm: () => {
                                                                                return requestPasswordChange()
                                                                                    .then(res => {
                                                                                        if (!res.success) throw new Error(res.message);
                                                                                        return res;
                                                                                    })
                                                                                    .catch(error => Swal.showValidationMessage(`Error: ${error.message}`));
                                                                            }
                                                                        }).then((result) => {
                                                                            if (result.isConfirmed) {
                                                                                // Step 2: Enter Code and New Password
                                                                                Swal.fire({
                                                                                    title: 'Verify & Update',
                                                                                    html: `
                                                                                        <div class="flex flex-col gap-4 p-2">
                                                                                            <input id="swal-code" class="swal2-input !mx-0 !w-full" placeholder="Enter 6-digit code" maxlength="6" style="background: ${theme === 'dark' ? '#222' : '#f4f4f4'}; color: ${theme === 'dark' ? '#fff' : '#000'}; border-radius: 12px; border: 1px solid ${theme === 'dark' ? '#333' : '#ddd'}; font-weight: bold; text-align: center; letter-spacing: 5px;">
                                                                                            <input id="swal-password" type="password" class="swal2-input !mx-0 !w-full" placeholder="Enter new password" style="background: ${theme === 'dark' ? '#222' : '#f4f4f4'}; color: ${theme === 'dark' ? '#fff' : '#000'}; border-radius: 12px; border: 1px solid ${theme === 'dark' ? '#333' : '#ddd'};">
                                                                                        </div>
                                                                                    `,
                                                                                    focusConfirm: false,
                                                                                    showCancelButton: true,
                                                                                    confirmButtonText: 'Update Password',
                                                                                    confirmButtonColor: '#ff4d00',
                                                                                    background: theme === 'dark' ? '#1a1a1c' : '#fff',
                                                                                    color: theme === 'dark' ? '#fff' : '#0f172a',
                                                                                    showLoaderOnConfirm: true,
                                                                                    preConfirm: () => {
                                                                                        const code = document.getElementById('swal-code').value;
                                                                                        const password = document.getElementById('swal-password').value;
                                                                                        if (!code || !password) return Swal.showValidationMessage('Please fill all fields');
                                                                                        if (password.length < 6) return Swal.showValidationMessage('Password must be at least 6 characters');

                                                                                        return confirmPasswordChange(code, password)
                                                                                            .then(res => {
                                                                                                if (!res.success) throw new Error(res.message);
                                                                                                return res;
                                                                                            })
                                                                                            .catch(error => Swal.showValidationMessage(`Error: ${error.message}`));
                                                                                    }
                                                                                }).then((res) => {
                                                                                    if (res.isConfirmed) {
                                                                                        Swal.fire({
                                                                                            title: 'Success!',
                                                                                            text: 'Your password has been changed successfully.',
                                                                                            icon: 'success',
                                                                                            background: theme === 'dark' ? '#1a1a1c' : '#fff',
                                                                                            color: theme === 'dark' ? '#fff' : '#0f172a',
                                                                                        });
                                                                                    }
                                                                                });
                                                                            }
                                                                        });
                                                                    }}
                                                                    className="w-full py-4 rounded-2xl bg-white/[0.02] border border-white/5 text-slate-300 font-bold text-[10px] uppercase tracking-widest hover:bg-accent-primary/5 hover:border-accent-primary/20 hover:text-accent-primary transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 duration-300"
                                                                >
                                                                    <Shield size={14} /> Change Password
                                                                </button>
                                                            </div>

                                                            <button
                                                                onClick={handleLogout}
                                                                className="w-full py-4 rounded-2xl bg-white/[0.02] border border-white/5 text-slate-300 font-bold text-[10px] uppercase tracking-widest hover:bg-white/[0.08] hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 duration-300"
                                                            >
                                                                <LogOut size={14} className="text-accent-primary" /> Logout
                                                            </button>

                                                            <button
                                                                onClick={handleDeleteAccount}
                                                                disabled={loading}
                                                                className="w-full py-4 rounded-2xl bg-red-500/[0.03] border border-red-500/10 text-red-500/80 font-bold text-[10px] uppercase tracking-widest hover:bg-red-500/10 hover:border-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-95 duration-300"
                                                            >
                                                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} className="group-hover:scale-110 transition-transform" />}
                                                                Delete Account
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 md:gap-6">
                            <Link to="/login" className="hidden lg:block text-xs font-bold text-theme-primary hover:text-accent-primary transition-all uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-theme-surface hover:scale-105 duration-300">
                                Log In
                            </Link>
                            <Link to="/register" className="hidden lg:flex btn-premium px-8 py-3.5 text-xs shadow-glow-orange">
                                Start Building
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Button - "3 lines" button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-2.5 rounded-xl bg-accent-primary/5 border border-accent-primary/10 text-accent-primary hover:bg-accent-primary/10 transition-all cursor-pointer"
                    >
                        {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[300px] bg-menu-dropdown border-l border-theme z-[120] p-8 lg:hidden overflow-y-auto"
                        >
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20">
                                            <Bot size={20} className="text-accent-primary" />
                                        </div>
                                        <span className="font-black text-white text-sm uppercase tracking-widest">Navigation</span>
                                    </div>
                                    <button
                                        onClick={() => setIsMenuOpen(false)}
                                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        <X size={20} className="text-slate-400" />
                                    </button>
                                </div>

                                <div className="space-y-4 mb-10">
                                    <Link onClick={() => setIsMenuOpen(false)} to="/" className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-sm font-bold text-slate-300 hover:bg-accent-primary/10 hover:border-accent-primary/20 hover:text-accent-primary transition-all">
                                        <Home size={18} /> Home
                                    </Link>

                                    {isAuthenticated && (
                                        <>
                                            <Link onClick={() => setIsMenuOpen(false)} to="/dashboard" className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-sm font-bold text-slate-300 hover:bg-accent-primary/10 hover:border-accent-primary/20 hover:text-accent-primary transition-all">
                                                <LayoutDashboard size={18} /> Workspace
                                            </Link>
                                            <Link onClick={() => setIsMenuOpen(false)} to="/agents/create" className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-sm font-bold text-slate-300 hover:bg-accent-primary/10 hover:border-accent-primary/20 hover:text-accent-primary transition-all">
                                                <PlusCircle size={18} /> Create Agent
                                            </Link>
                                        </>
                                    )}

                                    {!isAuthenticated && (
                                        <>
                                            <Link onClick={() => setIsMenuOpen(false)} to="/features" className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-sm font-bold text-slate-300 hover:bg-accent-primary/10 hover:border-accent-primary/20 hover:text-accent-primary transition-all">
                                                <Activity size={18} /> Features
                                            </Link>
                                            <Link onClick={() => setIsMenuOpen(false)} to="/pricing" className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-sm font-bold text-slate-300 hover:bg-accent-primary/10 hover:border-accent-primary/20 hover:text-accent-primary transition-all">
                                                <Shield size={18} /> Pricing
                                            </Link>
                                            <Link onClick={() => setIsMenuOpen(false)} to="/docs" className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-sm font-bold text-slate-300 hover:bg-accent-primary/10 hover:border-accent-primary/20 hover:text-accent-primary transition-all">
                                                <Mail size={18} /> Docs
                                            </Link>
                                        </>
                                    )}
                                </div>

                                {isAuthenticated ? (
                                    <div className="mt-auto space-y-6">
                                        <div className="p-5 rounded-[24px] bg-white/[0.03] border border-white/5">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20">
                                                    <User size={22} className="text-accent-primary" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs font-black text-white uppercase tracking-tight truncate">
                                                        {user?.name || 'User'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 truncate">{user?.email}</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full py-3 rounded-xl bg-white/5 text-slate-300 font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                                >
                                                    <LogOut size={14} /> Logout
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        setIsMenuOpen(false);
                                                        const { requestPasswordChange, confirmPasswordChange } = useAuthStore.getState();

                                                        Swal.fire({
                                                            title: 'Change Password',
                                                            text: 'Send a verification code to your email?',
                                                            icon: 'info',
                                                            showCancelButton: true,
                                                            confirmButtonText: 'Send Code',
                                                            confirmButtonColor: '#ff4d00',
                                                            background: theme === 'dark' ? '#1a1a1c' : '#fff',
                                                            color: theme === 'dark' ? '#fff' : '#0f172a',
                                                            showLoaderOnConfirm: true,
                                                            preConfirm: () => {
                                                                return requestPasswordChange()
                                                                    .then(res => {
                                                                        if (!res.success) throw new Error(res.message);
                                                                        return res;
                                                                    })
                                                                    .catch(error => Swal.showValidationMessage(`Error: ${error.message}`));
                                                            }
                                                        }).then((result) => {
                                                            if (result.isConfirmed) {
                                                                Swal.fire({
                                                                    title: 'Verify & Update',
                                                                    html: `
                                                                        <div class="flex flex-col gap-4 p-2">
                                                                            <input id="swal-code-mobile" class="swal2-input !mx-0 !w-full" placeholder="6-digit code" maxlength="6" style="background: ${theme === 'dark' ? '#222' : '#f4f4f4'}; color: ${theme === 'dark' ? '#fff' : '#000'}; border-radius: 12px; border: 1px solid ${theme === 'dark' ? '#333' : '#ddd'}; font-weight: bold; text-align: center; letter-spacing: 5px;">
                                                                            <input id="swal-password-mobile" type="password" class="swal2-input !mx-0 !w-full" placeholder="New password" style="background: ${theme === 'dark' ? '#222' : '#f4f4f4'}; color: ${theme === 'dark' ? '#fff' : '#000'}; border-radius: 12px; border: 1px solid ${theme === 'dark' ? '#333' : '#ddd'};">
                                                                        </div>
                                                                    `,
                                                                    focusConfirm: false,
                                                                    showCancelButton: true,
                                                                    confirmButtonText: 'Update',
                                                                    confirmButtonColor: '#ff4d00',
                                                                    background: theme === 'dark' ? '#1a1a1c' : '#fff',
                                                                    color: theme === 'dark' ? '#fff' : '#0f172a',
                                                                    showLoaderOnConfirm: true,
                                                                    preConfirm: () => {
                                                                        const code = document.getElementById('swal-code-mobile').value;
                                                                        const password = document.getElementById('swal-password-mobile').value;
                                                                        if (!code || !password) return Swal.showValidationMessage('Fill all fields');
                                                                        return confirmPasswordChange(code, password)
                                                                            .then(res => {
                                                                                if (!res.success) throw new Error(res.message);
                                                                                return res;
                                                                            })
                                                                            .catch(error => Swal.showValidationMessage(`Error: ${error.message}`));
                                                                    }
                                                                }).then((res) => {
                                                                    if (res.isConfirmed) {
                                                                        Swal.fire({ title: 'Success', icon: 'success', background: theme === 'dark' ? '#1a1a1c' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a' });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }}
                                                    className="w-full py-3 rounded-xl bg-white/5 text-slate-300 font-bold text-[10px] uppercase tracking-widest hover:bg-accent-primary/5 hover:text-accent-primary transition-all flex items-center justify-center gap-2 cursor-pointer"
                                                >
                                                    <Shield size={14} /> Change Password
                                                </button>
                                                <button
                                                    onClick={handleDeleteAccount}
                                                    className="w-full py-3 rounded-xl bg-red-500/5 text-red-500/80 font-bold text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-auto space-y-4">
                                        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full py-4 rounded-2xl bg-white/5 text-slate-300 font-bold text-xs uppercase tracking-widest flex items-center justify-center">
                                            Log In
                                        </Link>
                                        <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full btn-premium py-4 text-xs">
                                            Start Building
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
