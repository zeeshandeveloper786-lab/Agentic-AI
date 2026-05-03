import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bot, Zap, Shield, Globe, ArrowRight, Cpu, Layers } from 'lucide-react';

const Landing = () => {
    return (
        <div className="relative overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center px-6 overflow-hidden">
                <div className="bg-landing-image" />
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-bold uppercase tracking-widest mb-8"
                    >
                        Introducing Agentic 2.0
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-8 tracking-tight leading-[1.1]"
                    >
                        Next Gen <br />
                        <span className="text-gradient-accent italic pr-2">AI Agents</span> Fleet
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl text-slate-400 text-lg md:text-xl mb-12 leading-relaxed"
                    >
                        Build, deploy, and manage a powerful network of autonomous AI agents.
                        Streamline your workflow with intelligence that scales with your ambition.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-6"
                    >
                        <Link to="/register" className="btn-premium px-10 py-5 text-lg shadow-glow-orange group">
                            Start Building Now
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/features" className="px-10 py-5 text-lg font-bold text-white glass-card hover:bg-accent-primary/5 transition-all flex items-center justify-center cursor-pointer hover:scale-[1.02]">
                            Explore Features
                        </Link>
                    </motion.div>
                </div>

                {/* Hero Glow Backdrop */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-accent-primary/10 blur-[120px] rounded-full -z-10 group-hover:bg-accent-primary/20 transition-all duration-1000" />
            </section>

            {/* Features Preview */}
            <section className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Designed for <span className="text-gradient-accent">Scale</span></h2>
                        <p className="text-slate-400 max-w-xl mx-auto">Everything you need to orchestrate complex AI workflows in one premium dashboard.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Cpu className="text-accent-primary" size={32} />}
                            title="Multi-Model Support"
                            description="Access GPT-4, Claude 3, and Open Source models seamlessly within a single interface."
                        />
                        <FeatureCard
                            icon={<Layers className="text-accent-primary" size={32} />}
                            title="Custom Architecture"
                            description="Chain multiple agents together to handle complex, multi-step tasks autonomously."
                        />
                        <FeatureCard
                            icon={<Shield className="text-accent-primary" size={32} />}
                            title="Enterprise Security"
                            description="Bank-grade encryption for your API keys and sensitive processing data."
                        />
                    </div>
                </div>
            </section>

            {/* Platform Stats */}
            <section className="py-20 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
                    <StatItem value="1M+" label="Agents Deployed" />
                    <StatItem value="500M+" label="Tokens Processed" />
                    <StatItem value="50K+" label="Active Users" />
                    <StatItem value="99.9%" label="Uptime SLA" />
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6">
                <div className="max-w-5xl mx-auto glass-card p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/20 blur-[80px] rounded-full -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full -ml-32 -mb-32" />

                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 relative z-10">
                        Ready to automate your <br />
                        <span className="text-gradient-accent">Digital Future?</span>
                    </h2>
                    <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto relative z-10">
                        Join thousands of companies using Agentic to build the next generation of
                        intelligent applications. No credit card required to start.
                    </p>
                    <Link to="/register" className="btn-premium px-12 py-5 text-xl font-bold relative z-10 cursor-pointer hover:scale-105 active:scale-95 transition-all">
                        Get Started for Free
                    </Link>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <motion.div
        whileHover={{ y: -10 }}
        className="glass-card p-10 group"
    >
        <div className="w-16 h-16 rounded-2xl bg-accent-primary/5 flex items-center justify-center mb-8 border border-white/5 group-hover:bg-accent-primary/10 group-hover:border-orange-500 transition-all duration-500">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
);

const StatItem = ({ value, label }) => (
    <div className="text-center">
        <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tighter">{value}</h3>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{label}</p>
    </div>
);

export default Landing;
