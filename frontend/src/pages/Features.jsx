import { motion } from 'framer-motion';
import { Bot, Zap, Shield, Globe, Cpu, Layers, MessageSquare, Database, Terminal, Settings } from 'lucide-react';

const Features = () => {
    return (
        <div className="pt-32 pb-24 px-6 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-24">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl md:text-7xl font-black text-white mb-8"
                    >
                        Powerful <span className="text-gradient-accent">Capabilities</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-slate-400 max-w-3xl mx-auto text-xl"
                    >
                        Explore the cutting-edge technology behind Agentic. Designed for high-performance
                        autonomous workflows and seamless AI integration.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <FeatureBlock
                        icon={<Bot size={32} />}
                        title="Autonomous Intelligence"
                        description="Our agents don't just follow instructions; they plan, reason, and execute. They can handle complex multi-step tasks by breaking them down into manageable actions."
                        tags={["Self-Learning", "Task Planning", "Goal Oriented"]}
                    />
                    <FeatureBlock
                        icon={<Database size={32} />}
                        title="Knowledge Integration (RAG)"
                        description="Connect your own documents and databases. Our agents use Retrieval Augmented Generation to provide context-aware responses based on your proprietary data."
                        tags={["PDF/Text Support", "Vector DB", "Contextual Recall"]}
                    />
                    <FeatureBlock
                        icon={<Terminal size={32} />}
                        title="Tool Execution"
                        description="Equip agents with specific tools like Google Search, Calculators, or custom API callers. Watch them interact with the real world to get you the data you need."
                        tags={["Custom Scripts", "Real-time Data", "API Orchestration"]}
                    />
                    <FeatureBlock
                        icon={<Settings size={32} />}
                        title="Fine-grained Control"
                        description="Adjust temperature, top-p, and system prompts for every agent. Fine-tune their personality and strictness to match your specific brand or project needs."
                        tags={["Model Presets", "Persona Building", "Variable Control"]}
                    />
                </div>

                {/* Technical Showcase */}
                <div className="mt-32 p-12 glass-card border-none bg-accent-primary/5 rounded-[40px] flex flex-col md:flex-row items-center gap-16">
                    <div className="md:w-1/2">
                        <h2 className="text-4xl font-bold text-white mb-8">Built for Developers, <br /> Loved by Everyone.</h2>
                        <div className="space-y-6">
                            <CheckItem text="RESTful API for easy integration into existing stacks." />
                            <CheckItem text="Comprehensive SDKs for Python, Node.js, and Go." />
                            <CheckItem text="Webhooks for real-time agent event monitoring." />
                            <CheckItem text="Docker-ready for on-premise deployments." />
                        </div>
                    </div>
                    <div className="md:w-1/2 bg-slate-900 rounded-3xl p-8 font-mono text-sm shadow-2xl relative overflow-hidden group">
                        <div className="flex gap-2 mb-6">
                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        </div>
                        <div className="text-slate-400 group-hover:text-slate-200 transition-colors">
                            <p className="text-accent-primary">const agent = await Agentic.create(&#123;</p>
                            <p className="ml-4">name: <span className="text-emerald-400">"Market Analyst"</span>,</p>
                            <p className="ml-4">model: <span className="text-emerald-400">"gpt-4-turbo"</span>,</p>
                            <p className="ml-4 text-slate-500">// Auto-enable RAG with your docs</p>
                            <p className="ml-4">knowledge: [folder_id],</p>
                            <p className="ml-4">tools: [<span className="text-emerald-400">"web_search"</span>, <span className="text-emerald-400">"data_cruncher"</span>]</p>
                            <p className="text-accent-primary">&#125;);</p>
                            <br />
                            <p className="text-accent-primary">await agent.run(<span className="text-emerald-400">"Analyze Q4 trends"</span>);</p>
                        </div>
                        {/* Glow effect */}
                        <div className="absolute top-0 left-0 w-full h-full bg-accent-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureBlock = ({ icon, title, description, tags }) => (
    <div className="group relative">
        {/* Background Glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent-primary/5 blur-[60px] rounded-full -mr-24 -mt-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10">
            <div className="w-16 h-16 rounded-[20px] bg-accent-primary/10 text-accent-primary flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-accent-primary transition-all duration-500 group-hover:text-white">
                {icon}
            </div>
            <h3 className="text-3xl font-bold text-white mb-6 underline decoration-accent-primary/30 underline-offset-8">{title}</h3>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">{description}</p>
            <div className="flex flex-wrap gap-3">
                {tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-accent-primary/5 text-[10px] uppercase font-black tracking-widest text-slate-500 group-hover:text-accent-primary transition-colors">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    </div>
);

const CheckItem = ({ text }) => (
    <div className="flex items-center gap-4">
        <div className="w-2 h-2 rounded-full bg-accent-primary" />
        <span className="text-slate-300 font-bold">{text}</span>
    </div>
);

export default Features;
