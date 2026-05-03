import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Bot, ChevronRight, Activity, Cpu, Database, Trash2, MessageSquare, ArrowRight, Zap, History, RotateCcw, ShieldAlert, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import useAgentStore from '../store/agentStore';
import useThemeStore from '../store/themeStore';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const {
        agents,
        deletedAgents,
        fetchAgents,
        fetchDeletedAgents,
        loading,
        deleteAgent,
        restoreAgent,
        permanentlyDeleteAgent
    } = useAgentStore();
    const { theme } = useThemeStore();
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'deleted'

    useEffect(() => {
        if (activeTab === 'active') {
            fetchAgents();
        } else {
            fetchDeletedAgents();
        }
    }, [activeTab, fetchAgents, fetchDeletedAgents]);

    const handleDelete = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();

        const result = await Swal.fire({
            title: 'Move to Trash?',
            text: "This agent will be removed from your active workspace but can be restored later.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff4d00',
            cancelButtonColor: '#333',
            confirmButtonText: 'Yes, move to trash',
            customClass: {
                popup: `glass-card border border-white/10 rounded-3xl ${theme === 'light' ? 'bg-white text-slate-900 border-slate-200' : ''}`,
                confirmButton: 'btn-premium px-6 py-2 rounded-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all',
                cancelButton: `px-6 py-2 rounded-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${theme === 'light' ? 'bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-400' : 'bg-accent-primary/5 border border-white/10 hover:border-orange-500'}`
            },
            background: theme === 'dark' ? '#1a1a1c' : '#fff',
            color: theme === 'dark' ? '#fff' : '#0f172a',
        });

        if (result.isConfirmed) {
            await deleteAgent(id);
            Swal.fire({
                title: 'Moved to Trash',
                text: 'The agent is now in your deleted history.',
                icon: 'success',
                confirmButtonColor: '#ff4d00',
                timer: 2000,
                showConfirmButton: false,
                background: theme === 'dark' ? '#1a1a1c' : '#fff',
                color: theme === 'dark' ? '#fff' : '#0f172a',
            });
            fetchAgents();
        }
    };

    const handleRestore = async (id) => {
        const res = await restoreAgent(id);
        if (res.success) {
            Swal.fire({
                title: 'Restored!',
                text: 'Agent has been returned to your workspace.',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                background: theme === 'dark' ? '#1a1a1c' : '#fff',
                color: theme === 'dark' ? '#fff' : '#0f172a',
            });
            fetchDeletedAgents();
        }
    };

    const handlePermanentDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Permanently?',
            text: "This action cannot be undone. All data for this agent will be lost forever.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#333',
            confirmButtonText: 'Yes, delete forever',
            background: theme === 'dark' ? '#1a1a1c' : '#fff',
            color: theme === 'dark' ? '#fff' : '#0f172a',
        });

        if (result.isConfirmed) {
            const res = await permanentlyDeleteAgent(id);
            if (res.success) {
                Swal.fire({
                    title: 'Permanently Deleted',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    background: theme === 'dark' ? '#1a1a1c' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#0f172a',
                });
                fetchDeletedAgents();
            }
        }
    };



    return (
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 relative z-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center gap-2 mb-2 text-accent-primary">
                        <Zap size={18} className="animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest">Workspace</span>
                    </div>
                    <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tight">
                        My <span className="text-gradient-accent">Agents</span>
                    </h1>
                    <p className="text-slate-400 max-w-lg text-lg">
                        Manage, monitor, and interact with your fleet of autonomous AI agents.
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Link
                        to="/agents/create"
                        className="btn-premium py-4 px-8 shadow-glow-orange group cursor-pointer hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        Create New Agent
                    </Link>
                </motion.div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'active' ? 'bg-accent-primary text-white shadow-glow-orange border border-white/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <Activity size={14} /> Active Agents
                </button>
                <button
                    onClick={() => setActiveTab('deleted')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'deleted' ? 'bg-white/10 text-white border border-white/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    <History size={14} /> Deleted History
                </button>
            </div>

            {/* Content Section */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="glass-card h-80 animate-pulse bg-white/5 opacity-50"></div>
                        ))}
                    </div>
                ) : activeTab === 'active' ? (
                    agents.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-20 flex flex-col items-center text-center max-w-3xl mx-auto"
                        >
                            <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mb-8 relative">
                                <Bot size={48} className="text-slate-500" />
                                <div className="absolute inset-0 bg-accent-primary/10 rounded-3xl blur-xl" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">No Agents Configured</h2>
                            <p className="text-slate-400 mb-10 text-lg leading-relaxed">
                                Your workspace is currently empty. Unleash the power of AI by creating your first autonomous agent.
                            </p>
                            <Link
                                to="/agents/create"
                                className="btn-premium px-10 py-4 h-auto cursor-pointer hover:scale-105 active:scale-95 transition-all"
                            >
                                Build your first agent <ArrowRight size={20} />
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {agents.map((agent, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    key={agent.id}
                                >
                                    <Link
                                        to={`/agents/${agent.id}`}
                                        className="glass-card p-8 block border border-white/5 hover:border-orange-500 hover:shadow-[0_0_25px_rgba(246,111,20,0.25)] transition-all group relative h-full"
                                    >
                                        <div className="absolute top-6 right-6">
                                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                                Active
                                            </div>
                                        </div>

                                        <div className="mb-8">
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-accent-primary group-hover:scale-110 group-hover:bg-accent-primary/10 transition-all duration-500">
                                                <Bot size={28} />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-accent-primary transition-colors">
                                                {agent.name || agent.agentName || agent.agent_name || 'Unnamed Agent'}
                                            </h3>
                                            <p className="text-slate-400 text-sm line-clamp-2 h-10 leading-relaxed">
                                                {agent.description || 'No description provided.'}
                                            </p>
                                        </div>

                                        <div className="mb-8">
                                            <div className="flex items-center gap-3 text-slate-300 bg-accent-primary/5 p-3 rounded-xl border border-white/5 group-hover:border-orange-500/50 transition-all">
                                                <Cpu size={16} className="text-accent-secondary" />
                                                <span className="text-xs font-semibold">
                                                    {typeof agent?.model === 'object' ? agent.model.name || agent.model.id : (agent?.model || agent?.modelName || agent?.model_name || 'GPT-4o')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-white/5 group-hover:border-orange-500/50 transition-all">
                                            <button
                                                onClick={(e) => handleDelete(e, agent.id)}
                                                className="text-slate-500 hover:text-red-400 transition-all p-2 hover:bg-red-500/10 rounded-lg cursor-pointer hover:scale-110 active:scale-90"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <div className="flex items-center gap-1 text-slate-400 group-hover:text-white transition-colors text-sm font-bold">
                                                Chat <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )
                ) : (
                    /* Deleted Tab */
                    deletedAgents.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-20 flex flex-col items-center text-center max-w-2xl mx-auto"
                        >
                            <History size={48} className="text-slate-600 mb-6" />
                            <h3 className="text-xl font-bold text-white mb-2">Trash is Empty</h3>
                            <p className="text-slate-500">The agents you delete will appear here for 3 days.</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {deletedAgents.map((agent, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    key={agent.id}
                                    className="glass-card p-8 border border-white/5 relative group grayscale hover:grayscale-0 transition-all duration-500 h-full"
                                >
                                    <div className="absolute top-6 right-6">
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 uppercase tracking-tighter">
                                            Deleted
                                        </div>
                                    </div>

                                    <div className="mb-8 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-slate-500 group-hover:bg-accent-primary/5 transition-all duration-500">
                                            <Bot size={28} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            {agent.name || agent.agentName || agent.agent_name || 'Unnamed Agent'}
                                        </h3>
                                        <p className="text-slate-400 text-sm line-clamp-2 h-10 leading-relaxed">
                                            {agent.description || 'No description provided.'}
                                        </p>
                                    </div>

                                    <div className="mb-8 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5 transition-all">
                                            <Cpu size={16} className="text-slate-500" />
                                            <span className="text-xs font-semibold">
                                                {typeof agent?.model === 'object' ? agent.model.name || agent.model.id : (agent?.model || agent?.modelName || agent?.model_name || 'GPT-4o')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-6 border-t border-white/5">
                                        <button
                                            onClick={() => handleRestore(agent.id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-primary/10 text-accent-primary text-[10px] font-black uppercase tracking-widest hover:bg-accent-primary hover:text-white transition-all cursor-pointer"
                                        >
                                            <RotateCcw size={14} /> Restore
                                        </button>
                                        <button
                                            onClick={() => handlePermanentDelete(agent.id)}
                                            className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                                            title="Delete Permanently"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;

