import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Zap, Shield, Bot } from 'lucide-react';

const Pricing = () => {
    return (
        <div className="pt-32 pb-24 px-6 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-accent-primary text-xs font-bold uppercase tracking-[0.3em] mb-4"
                    >
                        Pricing Plans
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-extrabold text-white mb-6"
                    >
                        Scale with <span className="text-gradient-accent">Confidence</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 max-w-2xl mx-auto text-lg"
                    >
                        Choose the perfect plan for your project. From individual developers to global enterprises, we've got you covered.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <PricingCard
                        name="Developer"
                        price="0"
                        description="Perfect for exploring agentic workflows and personal projects."
                        features={[
                            "Up to 3 Active Agents",
                            "Standard AI Models",
                            "100 Requests / month",
                            "Community Support",
                            "Basic Knowledge Base (50MB)"
                        ]}
                    />
                    <PricingCard
                        name="Professional"
                        price="49"
                        popular
                        description="Unleash the full power of autonomous agents for your business."
                        features={[
                            "Unlimited Agents",
                            "Advanced Models (GPT-4, Claude 3)",
                            "Unlimited Requests",
                            "Priority Email Support",
                            "Advanced Knowledge Base (1GB)",
                            "Custom Tool Integration",
                            "Team Collaboration"
                        ]}
                    />
                    <PricingCard
                        name="Enterprise"
                        price="Custom"
                        description="Dedicated infrastructure and support for high-scale operations."
                        features={[
                            "Everything in Professional",
                            "Dedicated Infrastructure",
                            "Custom LLM Fine-tuning",
                            "24/7 Dedicated Support",
                            "On-premise Deployment Options",
                            "SSO & Custom Security",
                            "Volume Token Discounts"
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};

const PricingCard = ({ name, price, description, features, popular = false }) => (
    <motion.div
        whileHover={{ y: -10 }}
        className={`glass-card p-10 flex flex-col h-full relative ${popular ? 'shadow-glow-orange' : ''}`}
    >
        {popular && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-accent-primary text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                Most Popular
            </div>
        )}

        <div className="mb-10">
            <h3 className="text-2xl font-bold text-white mb-4">{name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-extrabold text-white">{price !== 'Custom' ? `$${price}` : price}</span>
                {price !== 'Custom' && <span className="text-slate-500 font-bold">/mo</span>}
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
        </div>

        <div className="space-y-4 mb-12 flex-1">
            {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-accent-primary/10 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-accent-primary" />
                    </div>
                    <span className="text-slate-300 text-sm">{feature}</span>
                </div>
            ))}
        </div>

        <Link
            to="/register"
            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center border cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${popular
                ? 'btn-premium border-orange-500 shadow-[0_0_20px_rgba(246,111,20,0.4)]'
                : 'bg-accent-primary/5 text-white hover:bg-accent-primary/10 border-white/10 hover:border-orange-500 transition-all'
                }`}>
            {price === 'Custom' ? 'Contact Sales' : 'Get Started'}
        </Link>
    </motion.div>
);

export default Pricing;
