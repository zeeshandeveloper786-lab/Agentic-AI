import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal, Code, Book, Library, Shield, Zap, Bot, Layers,
    Database, ChevronRight, Globe, Search, Calculator, Cpu,
    Key, Server, Box, Info, CheckCircle2, AlertCircle
} from 'lucide-react';

const Docs = () => {
    const [activeTab, setActiveTab] = useState('Introduction');

    const renderContent = () => {
        switch (activeTab) {
            case 'Introduction':
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                        <header className="mb-16">
                            <div className="flex items-center gap-2 text-accent-primary text-xs font-bold uppercase tracking-widest mb-4">
                                <Book size={14} />
                                Documentation
                            </div>
                            <h1 className="text-5xl font-black text-white mb-8 tracking-tight">Introduction</h1>
                            <p className="text-xl text-slate-400 leading-relaxed">
                                Agentic is a unified platform for building, hosting, and scaling autonomous AI agents.
                                Our infrastructure allows you to create specialized intelligence that can handle
                                complex reasoning, data analysis, and real-world actions.
                            </p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
                            <QuickCard icon={<Zap size={18} />} title="Quickstart" color="text-yellow-400" />
                            <QuickCard icon={<Code size={18} />} title="API Docs" color="text-blue-400" />
                            <QuickCard icon={<Library size={18} />} title="Knowledge" color="text-purple-400" />
                        </div>

                        <section className="space-y-12">
                            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-4">
                                Why Agentic?
                            </h2>
                            <p className="text-slate-400 leading-relaxed">
                                Standard AI applications are limited to chat. **Agentic** flips the script by giving bots "Hands and Eyes."
                                Through our tool-calling architecture and vector-infused memory, agents become active participants
                                in your business workflows rather than just conversationalists.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-8 rounded-3xl bg-white/[0.02]">
                                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                        <Layers size={20} className="text-accent-primary" />
                                        Agentic Architecture
                                    </h4>
                                    <p className="text-slate-500 text-sm">Every agent is equipped with a Reasoning Engine that validates tasks before execution.</p>
                                </div>
                                <div className="p-8 rounded-3xl bg-white/[0.02]">
                                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                        <Database size={20} className="text-blue-400" />
                                        Private Data Isolation
                                    </h4>
                                    <p className="text-slate-500 text-sm">Your knowledge bases are siloed and encrypted. No data leak between agent instances.</p>
                                </div>
                            </div>
                        </section>
                    </motion.div>
                );
            case 'Quickstart Guide':
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                        <h1 className="text-5xl font-black text-white mb-8 tracking-tight">Quickstart Guide</h1>
                        <p className="text-xl text-slate-400 mb-12">Follow these steps to deploy your first agent in under 5 minutes.</p>

                        <div className="space-y-12">
                            <Step number="1" title="Create an Account">
                                <p className="text-slate-400 mb-4">Go to the <Link to="/register" className="text-accent-primary underline">Registration Page</Link> and create your developer workspace.</p>
                            </Step>
                            <Step number="2" title="Define your Agent">
                                <p className="text-slate-400 mb-4">Click "Create New Agent" in your dashboard. Give it a name, select a model (e.g., GPT-4), and define its mission in the System Prompt.</p>
                            </Step>
                            <Step number="3" title="Attach Tools">
                                <p className="text-slate-400 mb-4">Select from our library of built-in tools like "Google Search" or "Calculator" to give your agent external capabilities.</p>
                            </Step>
                            <Step number="4" title="Start Chatting">
                                <p className="text-slate-400 mb-4">Launch the agent interface and start giving it complex tasks. Watch it plan and execute autonomously.</p>
                            </Step>
                        </div>
                    </motion.div>
                );
            case 'Architecture':
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                        <h1 className="text-5xl font-black text-white mb-8 tracking-tight">Architecture</h1>
                        <p className="text-xl text-slate-400 mb-12">Understand the backbone of the Agentic platform.</p>

                        <div className="relative p-12 glass-card border-none bg-accent-primary/5 rounded-[40px] mb-12">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center">
                                <ArchNode icon={<Globe size={24} />} title="User UI / API" />
                                <ChevronRight className="text-slate-700 hidden md:block" />
                                <ArchNode icon={<Server size={24} />} title="Cognitive Proxy" color="border-accent-primary shadow-glow-orange" />
                                <ChevronRight className="text-slate-700 hidden md:block" />
                                <ArchNode icon={<Box size={24} />} title="Agent Executor" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">The Cognitive Proxy</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Our proprietary middleware that handles state management, rate limiting,
                                    and secure key rotation. It ensures your agents remain persistent and secure.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">Vector Compute</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    A high-performance indexing layer that processes files in real-time,
                                    turning static PDFs into a dynamic "Long-term Memory" for your agents.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'Autonomous Agents':
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                        <h1 className="text-5xl font-black text-white mb-8 tracking-tight">Autonomous Agents</h1>
                        <p className="text-xl text-slate-400 mb-12 font-medium">Beyond simple completion.</p>

                        <div className="bg-slate-900 rounded-3xl p-10 mb-12">
                            <h3 className="text-2xl font-bold text-white mb-6">The ReAct Protocol</h3>
                            <p className="text-slate-400 mb-8 font-medium italic">"Reasoning and Acting"</p>
                            <div className="space-y-4">
                                <CodeBlock language="PLAN" text="Break down the user's objective into smaller steps." />
                                <CodeBlock language="ACT" text="Execute a tool or search for information." />
                                <CodeBlock language="OBSERVE" text="Analyze the result of the action." />
                                <CodeBlock language="REFINE" text="Update the internal plan based on new data." />
                            </div>
                        </div>
                    </motion.div>
                );
            case 'Tools & Functions':
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                        <h1 className="text-5xl font-black text-white mb-8 tracking-tight">Tools & Functions</h1>
                        <p className="text-xl text-slate-400 mb-12">Extending your agent's universe.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                            <ToolCard
                                icon={<Search className="text-blue-400" />}
                                title="Web Search"
                                desc="Real-time access to Google, Tavily, and Bing endpoints."
                            />
                            <ToolCard
                                icon={<Calculator className="text-emerald-400" />}
                                title="Code Interpreter"
                                desc="Secure sandboxed environment to run Python and JS logic."
                            />
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-6">Custom Tool Schema</h3>
                        <div className="bg-slate-900 p-8 rounded-3xl font-mono text-sm overflow-x-auto text-emerald-400">
                            {`{
  "name": "get_weather",
  "description": "Get current weather for a city",
  "parameters": {
    "type": "object",
    "properties": {
      "location": { "type": "string" }
    }
  }
}`}
                        </div>
                    </motion.div>
                );
            case 'Knowledge Bases (RAG)':
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                        <h1 className="text-5xl font-black text-white mb-8 tracking-tight text-gradient-accent">Knowledge Bases</h1>
                        <p className="text-xl text-slate-400 mb-12 italic">Connecting your data to intelligence.</p>

                        <div className="flex flex-col md:flex-row gap-8 mb-12">
                            <div className="flex-1 glass-card p-10 bg-blue-500/[0.03]">
                                <h3 className="text-xl font-bold text-white mb-4">Ingestion Flow</h3>
                                <div className="space-y-4 text-sm text-slate-500 font-bold">
                                    <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-blue-400" /> File Upload (.pdf, .txt, .docx)</div>
                                    <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-blue-400" /> Automatic Chunking (512 tokens)</div>
                                    <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-blue-400" /> Vector Embedding (OpenAI text-3)</div>
                                    <div className="flex items-center gap-3"><CheckCircle2 size={16} className="text-blue-400" /> Persistence in Vector DB</div>
                                </div>
                            </div>
                            <div className="flex-1 glass-card p-10 bg-accent-primary/[0.03]">
                                <h3 className="text-xl font-bold text-white mb-4">Retrieval Metrics</h3>
                                <p className="text-slate-400 text-sm mb-6">Our system uses Hybrid Search to ensure the agent finds the most relevant context every time.</p>
                                <div className="flex items-center justify-between font-black uppercase tracking-widest text-[10px]">
                                    <span className="text-accent-primary">Semantic Match</span>
                                    <span className="text-white">99.4%</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 mt-2 rounded-full overflow-hidden">
                                    <div className="w-[99%] h-full bg-accent-primary" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'Authentication':
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                        <h1 className="text-5xl font-black text-white mb-8 tracking-tight">Authentication</h1>
                        <p className="text-xl text-slate-400 mb-12">Secure your agentic ecosystem.</p>

                        <div className="space-y-6">
                            <div className="p-8 rounded-3xl bg-white/[0.02] flex items-start gap-6">
                                <Key className="text-yellow-400 shrink-0" size={24} />
                                <div>
                                    <h4 className="text-white font-bold mb-2">API Keys</h4>
                                    <p className="text-slate-500 text-sm">Used for server-to-server communication. Manage multiple keys in your settings.</p>
                                </div>
                            </div>
                            <div className="p-8 rounded-3xl bg-white/[0.02] flex items-start gap-6">
                                <Shield className="text-blue-400 shrink-0" size={24} />
                                <div>
                                    <h4 className="text-white font-bold mb-2">JWT Tokens</h4>
                                    <p className="text-slate-500 text-sm">Rotating session tokens for frontend client-side interactions. Lifetime: 1 Hour.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'Agent Endpoints':
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                        <h1 className="text-5xl font-black text-white mb-8 tracking-tight">Agent Endpoints</h1>

                        <div className="space-y-8">
                            <EndpointRow method="GET" url="/agents" desc="List all agents in your workspace" />
                            <EndpointRow method="POST" url="/agents" desc="Create a new autonomous agent" />
                            <EndpointRow method="POST" url="/chat" desc="Send a message to an agent session" />
                            <EndpointRow method="DELETE" url="/agents/:id" desc="Permanently delete an agent" />
                        </div>

                        <div className="mt-16 glass-card p-10">
                            <h3 className="text-white font-bold mb-4">Request Example</h3>
                            <div className="bg-black/40 p-6 rounded-2xl font-mono text-sm text-slate-400">
                                <p><span className="text-blue-400">POST</span> /api/v1/chat</p>
                                <p className="text-slate-600">{`{`}</p>
                                <p className="ml-4">"agent_id": <span className="text-emerald-400">"agent_xyz"</span>,</p>
                                <p className="ml-4">"message": <span className="text-emerald-400">"Run a data report"</span></p>
                                <p className="text-slate-600">{`}`}</p>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'SDK Reference':
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                        <h1 className="text-5xl font-black text-white mb-8 tracking-tight">SDK Reference</h1>
                        <p className="text-slate-400 mb-12">Official libraries for building your integration.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SDKCard name="NodeJS" version="v2.4.1" />
                            <SDKCard name="Python" version="v1.0.8" />
                            <SDKCard name="Go" version="v0.9.2" />
                            <SDKCard name="Ruby" version="Coming Soon" disabled />
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="pt-32 pb-24 px-6 md:px-10 relative z-10 max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-8 xl:gap-12">
            {/* Sidebar */}
            <aside className="w-full lg:w-72 shrink-0 border-r border-white/5 pr-4 md:pr-8">
                <div className="sticky top-32 space-y-10">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Getting Started</h3>
                        <div className="space-y-4 text-sm">
                            <NavItem active={activeTab === 'Introduction'} onClick={() => setActiveTab('Introduction')}>Introduction</NavItem>
                            <NavItem active={activeTab === 'Quickstart Guide'} onClick={() => setActiveTab('Quickstart Guide')}>Quickstart Guide</NavItem>
                            <NavItem active={activeTab === 'Architecture'} onClick={() => setActiveTab('Architecture')}>Architecture</NavItem>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Core Concepts</h3>
                        <div className="space-y-4 text-sm">
                            <NavItem active={activeTab === 'Autonomous Agents'} onClick={() => setActiveTab('Autonomous Agents')}>Autonomous Agents</NavItem>
                            <NavItem active={activeTab === 'Tools & Functions'} onClick={() => setActiveTab('Tools & Functions')}>Tools & Functions</NavItem>
                            <NavItem active={activeTab === 'Knowledge Bases (RAG)'} onClick={() => setActiveTab('Knowledge Bases (RAG)')}>Knowledge Bases (RAG)</NavItem>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">API & SDK</h3>
                        <div className="space-y-4 text-sm">
                            <NavItem active={activeTab === 'Authentication'} onClick={() => setActiveTab('Authentication')}>Authentication</NavItem>
                            <NavItem active={activeTab === 'Agent Endpoints'} onClick={() => setActiveTab('Agent Endpoints')}>Agent Endpoints</NavItem>
                            <NavItem active={activeTab === 'SDK Reference'} onClick={() => setActiveTab('SDK Reference')}>SDK Reference</NavItem>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 max-w-6xl min-h-[600px]">
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>

                {/* Helpful Footer */}
                <div className="mt-32 pt-16 flex flex-col md:flex-row justify-between items-center gap-8 bg-transparent">
                    <div className="text-slate-500 text-sm font-bold uppercase tracking-widest">Was this page helpful?</div>
                    <div className="flex gap-4">
                        <button className="px-8 py-3 rounded-xl bg-accent-primary/5 text-slate-300 hover:bg-accent-primary/10 transition-all text-[11px] font-black uppercase tracking-widest cursor-pointer hover:scale-105 active:scale-95">Yes, Thanks!</button>
                        <button className="px-8 py-3 rounded-xl bg-accent-primary/5 text-slate-300 hover:bg-accent-primary/10 transition-all text-[11px] font-black uppercase tracking-widest cursor-pointer hover:scale-105 active:scale-95">Not really</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Sub-components
const NavItem = ({ children, active, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center justify-between group cursor-pointer transition-all px-4 py-2 rounded-xl h-10 ${active ? 'bg-accent-primary/10 text-accent-primary font-bold border border-orange-500 shadow-[0_0_15px_rgba(194,65,12,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
            }`}
    >
        <span className="truncate">{children}</span>
        <ChevronRight size={14} className={`shrink-0 transition-transform ${active ? 'translate-x-1 opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
    </div>
);

const Step = ({ number, title, children }) => (
    <div className="flex gap-6">
        <div className="w-12 h-12 rounded-2xl bg-accent-primary flex items-center justify-center font-black text-xl text-white shadow-glow-orange shrink-0">
            {number}
        </div>
        <div className="pt-2">
            <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
            {children}
        </div>
    </div>
);

const ArchNode = ({ icon, title, color = "" }) => (
    <div className={`w-32 h-32 rounded-3xl bg-slate-900 border border-white/5 ${color} flex flex-col items-center justify-center p-4 group hover:scale-105 hover:border-orange-500 transition-all shadow-xl hover:shadow-[0_0_20px_rgba(246,111,20,0.2)]`}>
        <div className="text-accent-primary mb-3">{icon}</div>
        <div className="text-[10px] font-black text-white uppercase tracking-tighter text-center">{title}</div>
    </div>
);

const CodeBlock = ({ language, text }) => (
    <div className="flex gap-4 items-center bg-black/30 p-4 rounded-xl group transition-all">
        <div className="text-[10px] font-black text-accent-primary w-16 tracking-widest uppercase">{language}</div>
        <div className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">{text}</div>
    </div>
);

const ToolCard = ({ icon, title, desc }) => (
    <div className="glass-card p-8 hover:bg-white/[0.04] transition-all cursor-pointer">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 shadow-inner">{icon}</div>
        <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
        <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
    </div>
);

const EndpointRow = ({ method, url, desc }) => (
    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 p-6 rounded-2xl bg-white/[0.02] transition-all group">
        <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit min-w-[60px] text-center ${method === 'GET' ? 'bg-blue-500/10 text-blue-400' :
            method === 'POST' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
            {method}
        </div>
        <div className="font-mono text-sm text-slate-300 flex-1">{url}</div>
        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">{desc}</div>
    </div>
);

const SDKCard = ({ name, version, disabled }) => (
    <div className={`p-6 rounded-2xl transition-all flex items-center justify-between ${disabled ? 'bg-white/[0.01] opacity-50' : 'bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer'
        }`}>
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-slate-500">{name[0]}</div>
            <div>
                <div className="text-white font-bold">{name} SDK</div>
                <div className="text-[10px] text-slate-600 font-black">{version}</div>
            </div>
        </div>
        {!disabled && <ChevronRight size={16} className="text-slate-700" />}
    </div>
);

// Link replacement for Docs - Using React Router
const Link = ({ to, children, className }) => <RouterLink to={to} className={className}>{children}</RouterLink>;

const QuickCard = ({ icon, title, color }) => (
    <div className="glass-card p-5 bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer flex items-center gap-4 group">
        <div className={`w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center shrink-0 ${color}`}>
            {icon}
        </div>
        <div className="font-bold text-white text-sm group-hover:text-accent-primary transition-colors">{title}</div>
    </div>
);

export default Docs;
