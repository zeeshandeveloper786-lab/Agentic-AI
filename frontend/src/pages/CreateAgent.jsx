import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bot, Plus, ChevronRight, ChevronLeft,
    Trash2, Code, Shield, Send, Loader2, Upload, FileText,
    Cloud, Calculator, Terminal, Check, X, Cpu, Settings, Save, Search, Play, Zap
} from 'lucide-react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import useAgentStore from '../store/agentStore';
import useThemeStore from '../store/themeStore';
import api from '../services/api';

const STEPS = [
    { id: 1, title: 'Identity', icon: Bot },
    { id: 2, title: 'Model', icon: Cpu },
    { id: 3, title: 'Capabilities', icon: Terminal },
    { id: 4, title: 'Knowledge', icon: FileText },
    { id: 5, title: 'Instructions', icon: Settings },
];

const MODEL_OPTIONS = {
    'openai': [
        { value: 'gpt-4o', label: 'GPT-4o (High Intelligence)', desc: 'Most advanced multimodal model' },
        { value: 'gpt-4o-mini', label: 'GPT-4o mini (Fast & Cheap)', desc: 'Affordable and fast' },
        { value: 'o1', label: 'o1 (Advanced Reasoning)', desc: 'Complex problem-solving' },
        { value: 'o1-mini', label: 'o1-mini (Fast Reasoning)', desc: 'Faster and affordable' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', desc: 'Enhanced GPT-4 model' },
        { value: 'gpt-4', label: 'GPT-4', desc: 'Classic GPT-4' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', desc: 'Fast and reliable' }
    ],
    'gemini': [
        { value: 'models/gemini-3-pro-preview', label: 'Gemini 3 Pro (Preview)', desc: 'Next-gen high-intelligence' },
        { value: 'models/gemini-3-pro-image-preview', label: 'Gemini 3 Pro Image (Preview)', desc: 'Optimized for vision' },
        { value: 'models/gemini-3-flash-preview', label: 'Gemini 3 Flash (Preview)', desc: 'Fastest next-gen model' },
        { value: 'models/gemini-2.5-pro', label: 'Gemini 2.5 Pro', desc: 'Powerful multimodal reasoning' },
        { value: 'models/gemini-2.5-flash', label: 'Gemini 2.5 Flash', desc: 'High-speed performance' },
        { value: 'models/gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', desc: 'Ultra-low latency' },
        { value: 'models/gemini-2.5-flash-image', label: 'Gemini 2.5 Flash Image', desc: 'Vision-optimized flash' },
        { value: 'models/gemini-2.0-flash', label: 'Gemini 2.0 Flash', desc: 'Fast and capable' },
        { value: 'models/gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite', desc: 'Lightweight and fast' },
        { value: 'models/gemini-flash-latest', label: 'Gemini Flash (Latest)', desc: 'Always newest flash' },
        { value: 'models/gemini-flash-lite-latest', label: 'Gemini Flash Lite (Latest)', desc: 'Newest lightweight' },
        { value: 'models/gemini-robotics-er-1.5-preview', label: 'Gemini Robotics ER 1.5 (Preview)', desc: 'Specialized for physical reasoning' },
        { value: 'models/gemini-2.5-pro-preview-tts', label: 'Gemini 2.5 Pro TTS (Preview)', desc: 'Text-to-Speech optimized' },
        { value: 'models/gemini-2.5-flash-preview-tts', label: 'Gemini 2.5 Flash TTS (Preview)', desc: 'Fast Speech optimized' }
    ],
    'anthropic': [
        { value: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet (Latest)', desc: 'Best balanced model' },
        { value: 'claude-3-5-haiku-latest', label: 'Claude 3.5 Haiku (Speed)', desc: 'Ultra-fast inference' },
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Complex)', desc: 'Heavy tasks' },
        { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet', desc: 'Legacy balanced' },
        { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku', desc: 'Legacy fast' }
    ],
    'deepseek': [
        { value: 'deepseek-chat', label: 'DeepSeek Chat', desc: 'General purpose' },
        { value: 'deepseek-coder', label: 'DeepSeek Coder', desc: 'Programming specialized' }
    ]
};

const CreateAgent = () => {
    const navigate = useNavigate();
    const { createAgent } = useAgentStore();
    const { theme } = useThemeStore();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        agent_name: '',
        description: '',
        model_provider: 'openai',
        model_name: 'gpt-4o',
        system_prompt: '',
        api_key: '',
        tavily_api_key: '',
        weather_api_key: '',
        tools: [], // { toolType, name, description, code }
        files: []
    });

    const [customTools, setCustomTools] = useState([]);
    const [newTool, setNewTool] = useState({ name: '', description: '', code: 'async function tool(input) {\n  return "result";\n}' });
    const [showToolEditor, setShowToolEditor] = useState(false);
    const [testInput, setTestInput] = useState('{"query": "hello"}');
    const [testResult, setTestResult] = useState(null);
    const [isTesting, setIsTesting] = useState(false);

    const handleNext = () => {
        // Step Validation
        if (currentStep === 1) {
            if (!formData.agent_name.trim()) {
                Swal.fire({
                    title: 'Name Required',
                    text: 'Please enter a name for your agent.',
                    icon: 'warning',
                    confirmButtonColor: '#ff4d00',
                    background: theme === 'dark' ? '#1a1a1c' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#0f172a',
                });
                return;
            }
        }

        if (currentStep === 2) {
            if (!formData.model_name) {
                Swal.fire({
                    title: 'Model Required',
                    text: 'Please select an AI model to power your agent.',
                    icon: 'warning',
                    confirmButtonColor: '#ff4d00',
                    background: theme === 'dark' ? '#1a1a1c' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#0f172a',
                });
                return;
            }
            if (!formData.api_key.trim()) {
                Swal.fire({
                    title: 'API Key Required',
                    text: `Please provide your ${formData.model_provider} API key to proceed.`,
                    icon: 'warning',
                    confirmButtonColor: '#ff4d00',
                    background: theme === 'dark' ? '#1a1a1c' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#0f172a',
                });
                return;
            }
        }

        setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    };
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleCreate = async () => {
        // Final Validation check
        if (!formData.agent_name.trim() || !formData.model_name || !formData.api_key.trim() || !formData.system_prompt.trim()) {
            let missing = [];
            if (!formData.agent_name.trim()) missing.push('Agent Name');
            if (!formData.model_name) missing.push('Model');
            if (!formData.api_key.trim()) missing.push('API Key');
            if (!formData.system_prompt.trim()) missing.push('System Prompt');

            Swal.fire({
                title: 'Missing Information',
                text: `Please fill in all required fields: ${missing.join(', ')}`,
                icon: 'error',
                confirmButtonColor: '#ff4d00',
                background: theme === 'dark' ? '#1a1a1c' : '#fff',
                color: theme === 'dark' ? '#fff' : '#0f172a',
            });
            return;
        }

        setLoading(true);
        try {
            // 1. Save API Key
            if (formData.api_key) {
                // Delete old API key first, then add new one
                try {
                    await api.delete(`/keys/${formData.model_provider}`);
                } catch (err) {
                    // Ignore error if key doesn't exist
                }

                await api.post('/keys', {
                    provider: formData.model_provider,
                    key: formData.api_key
                });
            }

            if (formData.tavily_api_key && formData.tools.includes('tavily_search')) {
                // Delete old API key first, then add new one
                try {
                    await api.delete('/keys/tavily');
                } catch (err) {
                    // Ignore error if key doesn't exist
                }

                await api.post('/keys', {
                    provider: 'tavily',
                    key: formData.tavily_api_key
                });
            }

            if (formData.weather_api_key && formData.tools.includes('weather')) {
                // Delete old API key first, then add new one
                try {
                    await api.delete('/keys/weather');
                } catch (err) {
                    // Ignore error if key doesn't exist
                }

                await api.post('/keys', {
                    provider: 'weather',
                    key: formData.weather_api_key
                });
            }

            // 2. Create Agent
            const agentResult = await createAgent({
                name: formData.agent_name,
                agentName: formData.agent_name,
                description: formData.description,
                provider: formData.model_provider,
                modelProvider: formData.model_provider,
                model: formData.model_name,
                modelName: formData.model_name,
                prompt: formData.system_prompt,
                systemPrompt: formData.system_prompt
            });

            if (agentResult.success) {
                const agentId = agentResult.agent.id;

                // 3. Add Built-in Tools
                try {
                    for (const toolName of formData.tools) {
                        await api.post('/tools', {
                            agentId,
                            toolType: 'BUILT_IN',
                            name: toolName
                        });
                    }
                } catch (toolErr) {
                    console.error('Failed to add built-in tools:', toolErr);
                }

                // 4. Add Custom Tools
                try {
                    for (const tool of customTools) {
                        await api.post('/tools', {
                            agentId,
                            toolType: 'CUSTOM',
                            name: tool.name,
                            description: tool.description,
                            code: tool.code
                        });
                    }
                } catch (customToolErr) {
                    console.error('Failed to add custom tools:', customToolErr);
                }

                // 5. Upload files (RAG)
                if (formData.files.length > 0) {
                    try {
                        const uploadData = new FormData();
                        uploadData.append('agentId', agentId);
                        formData.files.forEach(file => uploadData.append('file', file));
                        await api.post('/documents/upload', uploadData);
                    } catch (uploadErr) {
                        console.error('Document upload failed:', uploadErr);
                        Swal.fire({
                            title: 'Partial Success',
                            text: 'Agent created, but document upload failed. You can try uploading them later in settings.',
                            icon: 'warning',
                            confirmButtonColor: '#ff4d00',
                            background: theme === 'dark' ? '#1a1a1c' : '#fff',
                            color: theme === 'dark' ? '#fff' : '#0f172a',
                        });
                    }
                }

                navigate(`/agents/${agentId}`);
            } else {
                Swal.fire({
                    title: 'Error',
                    text: agentResult.error || 'Failed to create agent',
                    icon: 'error',
                    confirmButtonColor: '#ff4d00',
                    background: theme === 'dark' ? '#1a1a1c' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#0f172a',
                });
            }
        } catch (error) {
            console.error('Failed to create agent process:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to create agent';
            Swal.fire({
                title: 'Error',
                text: errorMsg,
                icon: 'error',
                confirmButtonColor: '#ff4d00',
                background: theme === 'dark' ? '#1a1a1c' : '#fff',
                color: theme === 'dark' ? '#fff' : '#0f172a',
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleBuiltInTool = (toolName) => {
        setFormData(prev => ({
            ...prev,
            tools: prev.tools.includes(toolName)
                ? prev.tools.filter(t => t !== toolName)
                : [...prev.tools, toolName]
        }));
    };

    const addCustomTool = () => {
        if (!newTool.name || !newTool.description) {
            Swal.fire({
                title: 'Missing Fields',
                text: 'Please provide both a name and a description for your tool.',
                icon: 'warning',
                confirmButtonColor: '#ff4d00'
            });
            return;
        }

        try {
            // Basic syntax validation
            new Function(newTool.code);

            setCustomTools(prev => [...prev, newTool]);
            setNewTool({ name: '', description: '', code: 'async function tool(input) {\n  return "result";\n}' });
            setShowToolEditor(false);
        } catch (e) {
            Swal.fire({
                title: 'Syntax Error',
                text: `There is an error in your code: ${e.message}`,
                icon: 'error',
                confirmButtonColor: '#ff4d00'
            });
        }
    };

    const handleTestTool = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const response = await api.post('/tools/test', {
                code: newTool.code,
                input: {}
            });

            setTestResult({
                success: true,
                output: response.data
            });
        } catch (error) {
            setTestResult({
                success: false,
                error: error.response?.data?.error || error.message || 'Execution failed'
            });
        } finally {
            setIsTesting(false);
        }
    };

    const removeCustomTool = (index) => {
        setCustomTools(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-12">
                {STEPS.map((step) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 relative flex-1">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 ${isActive ? 'bg-accent-primary text-white scale-110 shadow-lg shadow-accent-primary/20' :
                                    isCompleted ? 'bg-green-500 text-white' : 'bg-accent-primary/5 text-white/40'
                                    }`}
                            >
                                {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                            </div>
                            <span className={`hidden md:block text-[10px] uppercase font-bold tracking-wider ${isActive ? 'text-white' : 'text-white/40'}`}>
                                {step.title}
                            </span>
                            {step.id < STEPS.length && (
                                <div className="absolute top-5 left-1/2 w-full h-[1px] bg-white/10 -z-0">
                                    <div
                                        className="h-full bg-accent-primary transition-all duration-500"
                                        style={{ width: isCompleted ? '100%' : '0%' }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="glass-card p-4 md:p-8 min-h-[500px] flex flex-col">
                <AnimatePresence mode="wait">
                    {/* STEP 1: IDENTITY */}
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 flex-1"
                        >
                            <h2 className="text-2xl font-bold text-white">Agent Identity</h2>
                            <p className="text-white/40">Give your agent a name and a clear description of its purpose.</p>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/60">Agent Name</label>
                                    <input
                                        value={formData.agent_name}
                                        onChange={(e) => setFormData({ ...formData, agent_name: e.target.value })}
                                        type="text"
                                        className="w-full bg-accent-primary/[0.02] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:bg-accent-primary/10 focus:shadow-[0_0_20px_rgba(246,111,20,0.5)] transition-all placeholder:text-white/20 font-medium"
                                        placeholder="e.g. Research Assistant"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/60">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-accent-primary/[0.02] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:bg-accent-primary/10 focus:shadow-[0_0_20px_rgba(246,111,20,0.5)] transition-all placeholder:text-white/20 h-32 leading-relaxed"
                                        placeholder="Briefly describe what this agent does..."
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: MODEL */}
                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 flex-1"
                        >
                            <h2 className="text-2xl font-bold text-white">Model Configuration</h2>
                            <p className="text-white/40">Select the LLM that will power your agent's reasoning.</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                {[
                                    { id: 'openai', name: 'OpenAI', icon: '🤖' },
                                    { id: 'gemini', name: 'Google Gemini', icon: '✨' },
                                    { id: 'anthropic', name: 'Anthropic Claude', icon: '🧠' },
                                    { id: 'deepseek', name: 'DeepSeek', icon: '🌊' }
                                ].map(provider => (
                                    <button
                                        key={provider.id}
                                        onClick={() => {
                                            const defaultModel = MODEL_OPTIONS[provider.id][0].value;
                                            setFormData({ ...formData, model_provider: provider.id, model_name: defaultModel });
                                        }}
                                        className={`p-4 rounded-xl border transition-all text-center group cursor-pointer ${formData.model_provider === provider.id
                                            ? 'border-orange-500 bg-accent-primary/10 scale-[1.02] shadow-[0_0_25px_rgba(246,111,20,0.4)]'
                                            : 'border-white/5 bg-white/5 hover:border-orange-500 hover:bg-white/8 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(246,111,20,0.2)]'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">{provider.icon}</div>
                                        <div className="font-semibold text-white">{provider.name}</div>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/80 uppercase tracking-wider">Model Name</label>
                                    <div className="relative">
                                        {/* Custom Dropdown Button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const dropdown = document.getElementById('model-dropdown');
                                                dropdown.classList.toggle('hidden');
                                            }}
                                            className="w-full bg-gradient-to-br from-[#0a0a0b] to-[#1a1a1c] border-2 border-white/5 rounded-xl px-4 py-3.5 pr-12 text-white font-medium focus:outline-none focus:border-orange-500 focus:shadow-[0_0_25px_rgba(246,111,20,0.4)] cursor-pointer hover:border-orange-500 transition-all shadow-lg text-left flex items-center justify-between"
                                            style={{
                                                backgroundImage: 'linear-gradient(135deg, rgba(255, 77, 0, 0.05) 0%, rgba(255, 77, 0, 0.02) 100%)'
                                            }}
                                        >
                                            <span>{
                                                MODEL_OPTIONS[formData.model_provider]?.find(m => m.value === formData.model_name)?.label || 'Select a model'
                                            }</span>
                                            <ChevronRight className={`transition-transform duration-300 text-accent-primary ${document.getElementById('model-dropdown')?.classList.contains('hidden') ? 'rotate-90' : '-rotate-90'}`} size={20} />
                                        </button>

                                        {/* Custom Dropdown Menu */}
                                        <div
                                            id="model-dropdown"
                                            className="hidden absolute top-full left-0 right-0 mt-2 bg-[#1a1a1c] border-2 border-accent-primary/40 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
                                            style={{
                                                backdropFilter: 'blur(20px)',
                                                backgroundColor: 'rgba(26, 26, 28, 0.98)'
                                            }}
                                        >
                                            <div className="py-2">
                                                {MODEL_OPTIONS[formData.model_provider] ? (
                                                    MODEL_OPTIONS[formData.model_provider].map((model, idx) => {
                                                        // Add section headers for OpenAI and Gemini
                                                        const showHeader = (formData.model_provider === 'openai' && (idx === 0 || idx === 2 || idx === 4 || idx === 6)) ||
                                                            (formData.model_provider === 'gemini' && (idx === 0 || idx === 3 || idx === 7 || idx === 9 || idx === 11));

                                                        const getHeaderName = () => {
                                                            if (formData.model_provider === 'openai') {
                                                                if (idx === 0) return 'GPT-4o Series';
                                                                if (idx === 2) return 'o1 Reasoning Series';
                                                                if (idx === 4) return 'GPT-4 Series';
                                                                if (idx === 6) return 'Legacy Models';
                                                            }
                                                            if (formData.model_provider === 'gemini') {
                                                                if (idx === 0) return 'Gemini 3 (Experimental)';
                                                                if (idx === 3) return 'Gemini 2.5 Series';
                                                                if (idx === 7) return 'Gemini 2.0 Series';
                                                                if (idx === 9) return 'Continuous Updates';
                                                                if (idx === 11) return 'Specialty Models';
                                                            }
                                                            return '';
                                                        }

                                                        return (
                                                            <div key={model.value}>
                                                                {showHeader && (
                                                                    <div className={`px-3 py-2 text-[10px] uppercase font-bold text-white/40 tracking-wider ${idx > 0 ? 'mt-2 border-t border-accent-primary/10' : ''}`}>
                                                                        {getHeaderName()}
                                                                    </div>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormData({ ...formData, model_name: model.value });
                                                                        document.getElementById('model-dropdown').classList.add('hidden');
                                                                    }}
                                                                    className={`w-full px-4 py-3.5 text-left rounded-xl transition-all flex items-start gap-4 transition-all group cursor-pointer hover:bg-white/10 active:scale-[0.98] ${formData.model_name === model.value ? 'bg-accent-primary/15 border-l-4 border-accent-primary shadow-[0_0_20px_rgba(246,111,20,0.2)]' : ''}`}
                                                                >
                                                                    <Cpu size={16} className={`mt-0.5 ${formData.model_name === model.value ? 'text-accent-primary' : 'text-white/40 group-hover:text-white/60'}`} />
                                                                    <div className="flex-1">
                                                                        <div className={`text-sm font-medium ${formData.model_name === model.value ? 'text-accent-primary' : 'text-white group-hover:text-white'}`}>{model.label}</div>
                                                                        <div className="text-[11px] text-white/30 mt-0.5">{model.desc}</div>
                                                                    </div>
                                                                    {formData.model_name === model.value && <Check size={16} className="text-accent-primary mt-0.5" />}
                                                                </button>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="px-4 py-8 text-center text-white/20 italic text-sm">
                                                        Select a provider first
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                                            API Key <span className="text-[10px] text-accent-primary font-bold uppercase">(Required)</span>
                                        </label>
                                        <input
                                            value={formData.api_key}
                                            onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                                            type="password"
                                            className="w-full bg-accent-primary/[0.02] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:bg-accent-primary/10 focus:shadow-[0_0_20px_rgba(246,111,20,0.5)] transition-all placeholder:text-white/20"
                                            placeholder={`sk-... (for ${formData.model_provider})`}
                                        />
                                        <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Encrypted and securely stored in your keychain</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-accent-primary/5 border border-white/5 shadow-[0_0_10px_rgba(246,111,20,0.1)] transition-all">
                                        <p className="text-[10px] text-accent-primary/80 leading-relaxed font-bold italic">
                                            💡 Security Note: Your API key is encrypted and never shared. We need it to initialize your agent's reasoning capabilities.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: CAPABILITIES (TOOLS) */}
                    {currentStep === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 flex-1"
                        >
                            <h2 className="text-2xl font-bold text-white">Capabilities & Tools</h2>
                            <p className="text-white/40">Equip your agent with tools to interact with the world.</p>

                            <div>
                                <h3 className="text-sm font-bold text-white/60 mb-4 uppercase tracking-wider">Built-in Tools</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { id: 'tavily_search', name: 'Tavily Search', icon: Search, desc: 'AI-optimized web search' },
                                        { id: 'weather', name: 'Weather', icon: Cloud, desc: 'Current weather data' },
                                        { id: 'calculator', name: 'Math Tool', icon: Calculator, desc: 'Complex calculations' },
                                    ].map(tool => {
                                        const Icon = tool.icon;
                                        const isSelected = formData.tools.includes(tool.id);
                                        return (
                                            <button
                                                key={tool.id}
                                                onClick={() => toggleBuiltInTool(tool.id)}
                                                className={`p-4 rounded-xl flex items-center gap-4 transition-all group cursor-pointer ${isSelected ? 'bg-accent-primary/5 scale-[1.02]' : 'bg-white/2 hover:-translate-y-1'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg transition-colors ${isSelected ? 'bg-accent-primary text-white' : 'bg-white/5 text-white/40'}`}>
                                                    <Icon size={20} />
                                                </div>
                                                <div className="text-left">
                                                    <div className={`font-semibold ${isSelected ? 'text-white' : 'text-white/60'}`}>{tool.name}</div>
                                                    <div className="text-[10px] text-white/30">{tool.desc}</div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Tavily API Key Input - Shows if search tool is selected */}
                                {formData.tools.includes('tavily_search') && (
                                    <div className="mt-6 p-6 rounded-2xl bg-accent-primary/5 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-lg bg-accent-primary/20 flex items-center justify-center text-accent-primary">
                                                <Shield size={16} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Tavily Search Configuration</h4>
                                                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">API Key Required</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <input
                                                type="password"
                                                value={formData.tavily_api_key}
                                                onChange={(e) => setFormData({ ...formData, tavily_api_key: e.target.value })}
                                                placeholder="Enter Tavily API Key (tvly-...)"
                                                className="w-full bg-accent-primary/[0.02] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:bg-accent-primary/10 focus:shadow-[0_0_20px_rgba(246,111,20,0.5)] transition-all placeholder:text-white/20"
                                            />
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Your key is encrypted and stored securely</p>
                                                <a
                                                    href="https://tavily.com/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] text-accent-primary hover:underline uppercase font-bold tracking-widest"
                                                >
                                                    Get API Key
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Weather API Key Input */}
                                {formData.tools.includes('weather') && (
                                    <div className="mt-4 p-6 rounded-2xl bg-blue-500/5 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                <Cloud size={16} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Weather tool Configuration</h4>
                                                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">OpenWeather API Key Required</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <input
                                                type="password"
                                                value={formData.weather_api_key}
                                                onChange={(e) => setFormData({ ...formData, weather_api_key: e.target.value })}
                                                placeholder="Enter OpenWeather API Key"
                                                className="w-full bg-accent-primary/[0.02] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:bg-accent-primary/10 focus:shadow-[0_0_20px_rgba(246,111,20,0.5)] transition-all placeholder:text-white/20"
                                            />
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Setup weather services for your agent</p>
                                                <a
                                                    href="https://openweathermap.org/api"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] text-blue-400 hover:underline uppercase font-bold tracking-widest"
                                                >
                                                    Get API Key
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Custom Tools</h3>
                                    <button
                                        onClick={() => setShowToolEditor(true)}
                                        className="px-4 py-2 bg-accent-primary/10 border border-accent-primary/20 text-accent-primary hover:bg-accent-primary hover:text-white rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 group cursor-pointer hover:scale-105 active:scale-95"
                                    >
                                        <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" /> Add Code Tool
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {customTools.map((tool, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-accent-primary/5">
                                            <div className="flex items-center gap-3">
                                                <Terminal size={14} className="text-accent-secondary" />
                                                <span className="text-sm font-medium text-white">{tool.name}</span>
                                            </div>
                                            <button onClick={() => removeCustomTool(idx)} className="text-white/20 hover:text-red-400 transition-colors cursor-pointer p-1 rounded-md hover:bg-red-400/10">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {customTools.length === 0 && (
                                        <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-xl">
                                            <p className="text-sm text-white/20 italic">No custom tools added yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tool Editor Modal */}
                            {showToolEditor && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/40">
                                    <motion.div
                                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        className="bg-modal-dark w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_50px_-12px_rgba(255,100,0,0.2)]"
                                    >
                                        <div className="flex justify-between items-center p-6 bg-white/[0.03]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center text-accent-primary shadow-inner">
                                                    <Code size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white tracking-tight">Create Custom Tool</h3>
                                                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Logic & Configuration</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setShowToolEditor(false)}
                                                className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all hover:rotate-90 duration-300 cursor-pointer hover:scale-110 active:scale-90"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>

                                        <div className="p-6 space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Tool Name</label>
                                                    <input
                                                        value={newTool.name}
                                                        onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                                                        placeholder="e.g. format_date"
                                                        className="w-full bg-accent-primary/[0.02] border border-orange-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:bg-accent-primary/10 focus:shadow-[0_0_20px_rgba(246,111,20,0.5)] transition-all placeholder:text-white/20"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Description</label>
                                                    <input
                                                        value={newTool.description}
                                                        onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                                                        placeholder="What does this tool do?"
                                                        className="w-full bg-accent-primary/[0.02] border border-orange-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:bg-accent-primary/10 focus:shadow-[0_0_20px_rgba(246,111,20,0.5)] transition-all placeholder:text-white/20"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between ml-1">
                                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Tool Logic (Javascript)</label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></span>
                                                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Sandbox Environment</span>
                                                    </div>
                                                </div>
                                                <div className="h-80 rounded-2xl overflow-hidden shadow-2xl bg-[#010101]">
                                                    <Editor
                                                        theme="vs-dark"
                                                        defaultLanguage="javascript"
                                                        value={newTool.code}
                                                        onChange={(val) => setNewTool({ ...newTool, code: val })}
                                                        options={{
                                                            minimap: { enabled: false },
                                                            fontSize: 14,
                                                            lineNumbers: 'on',
                                                            roundedSelection: true,
                                                            scrollBeyondLastLine: false,
                                                            padding: { top: 16, bottom: 16 },
                                                            backgroundColor: '#010101'
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Test Sandbox Section */}
                                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                                                            <Zap size={14} />
                                                        </div>
                                                        <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">Test Sandbox</h4>
                                                    </div>
                                                    <button
                                                        onClick={handleTestTool}
                                                        disabled={isTesting || !newTool.code}
                                                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer border border-emerald-500/20 group"
                                                    >
                                                        {isTesting ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} className="group-hover:scale-110 transition-transform" />}
                                                        Execute Test
                                                    </button>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between ml-1">
                                                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Execution Result</label>
                                                        {testResult && (
                                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${testResult.success ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                {testResult.success ? 'Success' : 'Error'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className={`w-full min-h-[120px] max-h-[300px] overflow-y-auto bg-[#050505] border rounded-xl px-5 py-4 text-[11px] font-mono custom-scrollbar transition-all shadow-inner ${testResult?.success ? 'border-emerald-500/30 text-emerald-400/90 shadow-emerald-500/5' : testResult ? 'border-red-500/30 text-red-400/90 shadow-red-500/5' : 'border-white/5 text-white/5'}`}>
                                                        {testResult ? (
                                                            <pre className="whitespace-pre-wrap break-all leading-relaxed">
                                                                {testResult.success
                                                                    ? (typeof testResult.output === 'object' ? JSON.stringify(testResult.output, null, 2) : String(testResult.output))
                                                                    : (typeof testResult.error === 'object' ? JSON.stringify(testResult.error, null, 2) : String(testResult.error))
                                                                }
                                                            </pre>
                                                        ) : (
                                                            <div className="h-full flex flex-col items-center justify-center py-6 text-white/10 opacity-50">
                                                                <Terminal size={24} className="mb-2" />
                                                                <p>Results will appear here after execution</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={addCustomTool}
                                                className="w-full py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-2xl font-bold text-lg shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/40 hover:-translate-y-1 hover:scale-[1.02] hover:brightness-125 active:scale-[0.98] transition-all duration-300 cursor-pointer"
                                            >
                                                Add Custom Tool
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 4: KNOWLEDGE (RAG) */}
                    {currentStep === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 flex-1"
                        >
                            <h2 className="text-2xl font-bold text-white">Knowledge Base (RAG)</h2>
                            <p className="text-white/40">Upload documents to give your agent proprietary knowledge.</p>

                            <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:bg-accent-primary/5 transition-all cursor-pointer group relative">
                                <input
                                    type="file"
                                    multiple
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => setFormData({ ...formData, files: [...formData.files, ...Array.from(e.target.files)] })}
                                />
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-white/20 group-hover:text-accent-primary transition-colors">
                                    <Upload size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-white">Click to upload or drag & drop</h3>
                                <p className="text-sm text-white/40 mt-1">PDF or TXT (Max 5MB each)</p>
                            </div>

                            <div className="space-y-2">
                                {formData.files.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-accent-primary/5">
                                        <div className="flex items-center gap-3">
                                            <FileText size={14} className="text-accent-primary" />
                                            <span className="text-sm text-white">{file.name}</span>
                                            <span className="text-[10px] text-white/20">{(file.size / 1024).toFixed(1)} KB</span>
                                        </div>
                                        <button
                                            onClick={() => setFormData({ ...formData, files: formData.files.filter((_, i) => i !== idx) })}
                                            className="text-white/20 hover:text-red-400 transition-colors cursor-pointer p-1 rounded-md hover:bg-red-400/10"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 5: INSTRUCTIONS */}
                    {currentStep === 5 && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 flex-1"
                        >
                            <h2 className="text-2xl font-bold text-white">Instructions & Prompt</h2>
                            <p className="text-white/40">Define the personality and behavior of your agent.</p>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">System Prompt</label>
                                <textarea
                                    value={formData.system_prompt}
                                    onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                                    className="w-full bg-accent-primary/5 border border-orange-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:bg-accent-primary/10 focus:shadow-[0_0_20px_rgba(246,111,20,0.5)] transition-all h-[300px] font-mono text-sm leading-relaxed"
                                    placeholder="Enter system prompt here..."
                                />
                            </div>

                            <div className="p-4 rounded-xl bg-accent-primary/5">
                                <p className="text-xs text-accent-primary/80 leading-relaxed font-medium">
                                    💡 Tip: Be specific about the goals, tone, and constraints. The more detail you provide in the system prompt, the better your agent will perform its role.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-between pt-8 mt-auto">
                    <button
                        disabled={currentStep === 1}
                        onClick={handleBack}
                        className="flex items-center gap-2 text-white/40 hover:text-white transition-all cursor-pointer disabled:opacity-0 disabled:cursor-default group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back
                    </button>

                    {currentStep < STEPS.length ? (
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 bg-accent-primary/5 hover:bg-accent-primary/10 text-white rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-lg hover:shadow-accent-primary/5"
                        >
                            Next <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button
                            disabled={loading}
                            onClick={handleCreate}
                            className="px-8 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-accent-primary/20 cursor-pointer hover:scale-105 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    <Save size={20} /> Create Agent
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateAgent;
