import { Link } from 'react-router-dom';
import { Bot, Twitter, Github, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="relative mt-20 py-20 px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                <div className="col-span-1 md:col-span-1">
                    <Link to="/" className="flex items-center group mb-8">
                        <img src="/logo.png" alt="Agentic AI" className="h-12 w-auto object-contain transition-all group-hover:scale-105" />
                    </Link>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        The ultimate platform for building, scaling, and managing autonomous AI agents.
                        Join the intelligence revolution today.
                    </p>
                    <div className="flex gap-4">
                        <SocialLink icon={<Twitter size={18} />} />
                        <SocialLink icon={<Github size={18} />} />
                        <SocialLink icon={<Linkedin size={18} />} />
                        <SocialLink icon={<Mail size={18} />} />
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Product</h3>
                    <ul className="space-y-4 text-sm font-medium text-slate-500">
                        <li><Link to="/features" className="hover:text-accent-primary transition-colors">Features</Link></li>
                        <li><Link to="/pricing" className="hover:text-accent-primary transition-colors">Pricing</Link></li>
                        <li><Link to="/docs" className="hover:text-accent-primary transition-colors">API & Docs</Link></li>
                        <li className="hover:text-accent-primary transition-colors cursor-pointer">Changelog</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Resources</h3>
                    <ul className="space-y-4 text-sm font-medium text-slate-500">
                        <li className="hover:text-accent-primary transition-colors cursor-pointer">Community</li>
                        <li className="hover:text-accent-primary transition-colors cursor-pointer">Blog</li>
                        <li className="hover:text-accent-primary transition-colors cursor-pointer">Support</li>
                        <li className="hover:text-accent-primary transition-colors cursor-pointer">Status</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">Company</h3>
                    <ul className="space-y-4 text-sm font-medium text-slate-500">
                        <li className="hover:text-accent-primary transition-colors cursor-pointer">About Us</li>
                        <li className="hover:text-accent-primary transition-colors cursor-pointer">Privacy Policy</li>
                        <li className="hover:text-accent-primary transition-colors cursor-pointer">Terms of Service</li>
                        <li className="hover:text-accent-primary transition-colors cursor-pointer">Contact</li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-20 mt-20 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">
                    © 2025 AGENTIC AI PLATFORM. ALL RIGHTS RESERVED.
                </p>
                <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-600">
                    <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
                    <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
                    <span className="hover:text-white cursor-pointer transition-colors">Cookies</span>
                </div>
            </div>

            {/* Background Glow */}
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent-primary/5 blur-[120px] rounded-full -mr-64 -mb-64 pointer-events-none" />
        </footer>
    );
};

const SocialLink = ({ icon }) => (
    <div className="w-9 h-9 rounded-lg bg-accent-primary/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-accent-primary hover:border-orange-500 hover:shadow-[0_0_10px_rgba(246,111,20,0.3)] cursor-pointer hover:scale-110 active:scale-90 transition-all">
        {icon}
    </div>
);

export default Footer;
