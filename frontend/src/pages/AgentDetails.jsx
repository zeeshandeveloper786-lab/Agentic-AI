import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    Bot, Send, User, Cpu, Database,
    Terminal, Calculator, Cloud, Book, Zap,
    Loader2, Info, Maximize2, Minimize2, MoreVertical,
    Settings, Plus, MessageSquare, X, Trash2, Check, ChevronRight, Upload, FileText, Search, Key, Shield, Code, Edit2, Pencil, AlertTriangle, Play, History, Menu
} from 'lucide-react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useAgentStore from '../store/agentStore';
import useThemeStore from '../store/themeStore';
import api from '../services/api';

const MODEL_OPTIONS = {
    'openai': [
        { value: 'gpt-4o', label: 'GPT-4o (High Intelligence)', desc: 'Most advanced multimodal model' },
        { value: 'gpt-4o-mini', label: 'GPT-4o mini (Fast & Cheap)', desc: 'Affordable and fast' },
        { value: 'o1-preview', label: 'o1-preview (Reasoning)', desc: 'Enhanced reasoning' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', desc: 'Enhanced GPT-4 model' },
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
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Complex)', desc: 'Heavy tasks' },
    ],
    'deepseek': [
        { value: 'deepseek-chat', label: 'DeepSeek Chat', desc: 'General purpose' },
        { value: 'deepseek-coder', label: 'DeepSeek Coder', desc: 'Programming specialized' }
    ]
};

const AgentDetails = () => {
    const { id } = useParams();
    const { currentAgent, fetchAgentDetails, loading } = useAgentStore();
    const { theme } = useThemeStore();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [activeModal, setActiveModal] = useState(null); // 'model', 'knowledge', 'tools'
    const scrollRef = useRef(null);

    // Chat Session Management
    const [chatSessions, setChatSessions] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [showChatList, setShowChatList] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sessionMenuId, setSessionMenuId] = useState(null);

    // Settings States
    const [updatedModel, setUpdatedModel] = useState({ provider: '', model: '' });
    const [updatedName, setUpdatedName] = useState('');
    const [updatedPrompt, setUpdatedPrompt] = useState('');
    const [newFiles, setNewFiles] = useState([]);
    const [updating, setUpdating] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);

    // API Keys for updates
    const [modelApiKey, setModelApiKey] = useState('');
    const [toolApiKey, setToolApiKey] = useState({ type: '', key: '' });
    const [showToolKeyInput, setShowToolKeyInput] = useState(false);

    // Custom Tool State
    const [showToolEditor, setShowToolEditor] = useState(false);
    const [showToolDocs, setShowToolDocs] = useState(false);
    const [editingToolId, setEditingToolId] = useState(null);
    const [newTool, setNewTool] = useState({ name: '', description: '', code: 'async function tool(input) {\n  return "result";\n}' });
    const [newChatInput, setNewChatInput] = useState('');
    const [testInput, setTestInput] = useState('{"query": "hello"}');
    const [testResult, setTestResult] = useState(null);
    const [isTesting, setIsTesting] = useState(false);

    const [vHeight, setVHeight] = useState(window.innerHeight);

    useEffect(() => {
        const init = async () => {
            setLoadingSessions(true);
            try {
                await fetchAgentDetails(id);
                // Fetch all chat sessions for this agent
                const response = await api.get(`/chat/sessions/${id}`);

                // Robust extraction: Handle various potential backend response formats
                const rawSessions = response.data.sessions || (Array.isArray(response.data) ? response.data : []);

                // Deduplicate sessions by ID
                const seenIds = new Set();
                const uniqueSessions = rawSessions.filter(s => {
                    const sid = String(s.id || s._id || (s._id && s._id.$oid) || '');
                    if (sid && !seenIds.has(sid)) {
                        seenIds.add(sid);
                        return true;
                    }
                    return false;
                });

                // Sort unique sessions by newest first
                uniqueSessions.sort((a, b) =>
                    new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0)
                );

                setChatSessions(uniqueSessions);

                // PER BACKEND GUIDANCE: Start with sessionId: null for a "New Chat" on reload
                setActiveChatId(null);
                setMessages([
                    { role: 'assistant', content: `Hello! I'm ${currentAgent?.name || 'ready'}. How can I help you?` }
                ]);

            } catch (error) {
                console.error("Initialization failed:", error);
                setActiveChatId(null);
            } finally {
                setLoadingSessions(false);
            }
        };
        init();
    }, [id, fetchAgentDetails]);

    useEffect(() => {
        if (currentAgent) {
            const rawModel = currentAgent.model;
            const modelStr = typeof rawModel === 'object' ? (rawModel.id || rawModel.name) : (rawModel || currentAgent.modelName || currentAgent.model_name || 'gpt-4o');

            setUpdatedModel({
                provider: currentAgent.provider || currentAgent.modelProvider || 'openai',
                model: modelStr
            });
            setUpdatedName(currentAgent.name || currentAgent.agentName || currentAgent.agent_name || '');
            setUpdatedPrompt(currentAgent.systemPrompt || currentAgent.system_prompt || '');
        }
    }, [currentAgent]);

    useEffect(() => {
        document.body.classList.add('no-scroll');
        document.documentElement.classList.add('no-scroll');
        return () => {
            document.body.classList.remove('no-scroll');
            document.documentElement.classList.remove('no-scroll');
        };
    }, []);


    // Keyboard & Viewport handling
    useEffect(() => {
        const handleViewportChange = () => {
            if (window.visualViewport) {
                setVHeight(window.visualViewport.height);
            }
            if (scrollRef.current) {
                setTimeout(() => {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }, 100);
            }
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportChange);
            window.visualViewport.addEventListener('scroll', handleViewportChange);
            return () => {
                window.visualViewport.removeEventListener('resize', handleViewportChange);
                window.visualViewport.removeEventListener('scroll', handleViewportChange);
            };
        }
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Listen for global open-chat-history event
    useEffect(() => {
        const handleOpenHistory = () => setShowChatList(true);
        window.addEventListener('open-chat-history', handleOpenHistory);
        return () => window.removeEventListener('open-chat-history', handleOpenHistory);
    }, []);

    const handleNewChat = () => {
        // PER BACKEND GUIDANCE: Reset local state for a fresh start.
        // A real session is only created on the first message.
        setActiveChatId(null);
        setMessages([
            { role: 'assistant', content: `Hello! I'm ${currentAgent?.name || 'your agent'}. How can I help you today?` }
        ]);
        setShowChatList(false);
    };

    const handleSwitchSession = async (sid) => {
        const sessionId = String(sid.$oid || sid.id || sid._id || sid);

        // Prevent redundant switching if already active
        if (sessionId === String(activeChatId) && messages.length > 0) {
            setShowChatList(false);
            return;
        }

        try {
            setLoadingSessions(true);
            setMessages([]); // Clear for clean transition
            setActiveChatId(sessionId);
            // Verify path and ID
            // Syncing transition state
            const response = await api.get(`/chat/sessions/${sessionId}/messages`);
            // PER BACKEND GUIDANCE: Use history key from response
            const history = response.data.history || response.data.messages || [];
            setMessages(history);
            setShowChatList(false);
        } catch (error) {
            console.error("Failed to switch session:", error);
            // Fallback: find session in local state if API fails
            const session = chatSessions.find(s => {
                const s_id = typeof s._id === 'object' ? (s._id.$oid || s._id.toString()) : (s.id || s._id);
                return s_id === sessionId;
            });
            if (session) setMessages(session.messages || []);
        } finally {
            setLoadingSessions(false);
        }
    };

    const handleDeleteSession = async (sessionId, e) => {
        e.stopPropagation();
        try {
            const result = await Swal.fire({
                title: 'Delete Chat?',
                text: "This session and its messages will be permanently removed.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#333',
                background: theme === 'dark' ? '#1a1a1c' : '#fff',
                color: theme === 'dark' ? '#fff' : '#0f172a',
            });

            if (result.isConfirmed) {
                await api.delete(`/chat/sessions/${sessionId}`);
                setChatSessions(prev => {
                    const filtered = prev.filter(s => (s.id || s._id) !== sessionId);
                    if (activeChatId === sessionId) {
                        if (filtered.length > 0) {
                            handleSwitchSession(filtered[0].id || filtered[0]._id);
                        } else {
                            handleNewChat();
                        }
                    }
                    return filtered;
                });
            }
        } catch (error) {
            console.error("Delete session error:", error);
        }
    };

    const handleRenameSession = async (sessionId, currentTitle) => {
        const { value: newTitle } = await Swal.fire({
            title: 'Rename Chat',
            input: 'text',
            inputLabel: 'New title',
            inputValue: currentTitle,
            showCancelButton: true,
            background: theme === 'dark' ? '#1a1a1c' : '#fff',
            color: theme === 'dark' ? '#fff' : '#0f172a',
            confirmButtonColor: '#ff4d00',
            cancelButtonColor: '#333',
            inputValidator: (value) => {
                if (!value) return 'Title cannot be empty!';
            }
        });

        if (newTitle) {
            try {
                await api.patch(`/chat/sessions/${sessionId}`, { title: newTitle });
                setChatSessions(prev => prev.map(s => {
                    const sId = String(s.id || s._id || (s._id && s._id.$oid) || '');
                    return sId === sessionId ? { ...s, title: newTitle } : s;
                }));
                Swal.fire({
                    title: 'Renamed',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    background: theme === 'dark' ? '#1a1a1c' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#0f172a',
                });
            } catch (error) {
                console.error("Rename failed:", error);
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to rename chat',
                    icon: 'error',
                    background: theme === 'dark' ? '#1a1a1c' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#0f172a',
                    confirmButtonColor: '#ff4d00',
                });
            }
        }
        setSessionMenuId(null);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsTyping(true);

        try {
            const response = await api.post('/chat', {
                agentId: id,
                sessionId: activeChatId, // If null, backend force-creates session
                message: currentInput
            });

            const assistantResponse = response.data.response;
            setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);

            // Syncing sessions after first message to get the new session object
            let sessionsToSearch = chatSessions;
            let targetId = activeChatId;

            if (!activeChatId && response.data.sessionId) {
                targetId = String(response.data.sessionId);
                setActiveChatId(targetId);

                const sessionsRes = await api.get(`/chat/sessions/${id}`);
                const rawSessions = sessionsRes.data.sessions || (Array.isArray(sessionsRes.data) ? sessionsRes.data : []);
                setChatSessions(rawSessions);
                sessionsToSearch = rawSessions; // Use the fresh list for title update check
            }

            // Update session title locally and on backend if generic
            const currentSession = sessionsToSearch.find(s => {
                const sId = String(s.id || s._id || (s._id && s._id.$oid) || '');
                return sId === String(targetId);
            });

            if (!activeChatId || (currentSession && (
                currentSession.title === "New Chat" ||
                currentSession.title === "New Conversation" ||
                currentSession.title === "Initial Conversation"
            ))) {
                // Smart Topic Generator: Extract main topic from first message
                let newTitle = currentInput.trim();

                // Remove common filler phrases from the start
                const fillers = /^(can you |please |i want to |tell me about |what is |how to |could you |help me with )/i;
                newTitle = newTitle.replace(fillers, '');

                // Capitalize and format
                newTitle = newTitle.charAt(0).toUpperCase() + newTitle.slice(1);

                // Truncate to a reasonable length but keep it meaningful
                if (newTitle.length > 35) {
                    newTitle = newTitle.substring(0, 35).split(' ').slice(0, -1).join(' ') + '...';
                }

                // If title becomes empty or too short after cleaning, fallback to original
                if (newTitle.length < 3) {
                    newTitle = currentInput.length > 40 ? currentInput.substring(0, 40) + '...' : currentInput;
                }

                if (targetId) {
                    // Update local state for immediate feedback
                    setChatSessions(prev => prev.map(s => {
                        const sId = String(s.id || s._id || (s._id && s._id.$oid) || '');
                        return sId === String(targetId) ? { ...s, title: newTitle } : s;
                    }));

                    // Update backend title
                    api.patch(`/chat/sessions/${targetId}`, { title: newTitle });
                }
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Sorry, I encountered an error. Please try again.';
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `### ⚠️ Execution Error\n\n${errorMsg}\n\n*Please check your tool configurations or API keys.*`,
                isError: true
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const ToolIcon = ({ type }) => {
        switch (type) {
            case 'tavily_search': return <Search size={14} />;
            case 'calculator': return <Calculator size={14} />;
            case 'weather': return <Cloud size={14} />;
            default: return <Terminal size={14} />;
        }
    };

    const handleUpdateModel = async () => {
        // Check if provider has changed
        const currentProvider = currentAgent.provider || currentAgent.modelProvider || currentAgent.model_provider || 'openai';
        const hasProviderChanged = currentProvider !== updatedModel.provider;

        // If provider changed but no API key provided, show error
        if (hasProviderChanged && !modelApiKey.trim()) {
            const providerNames = {
                'openai': 'OpenAI',
                'gemini': 'Google Gemini',
                'anthropic': 'Anthropic Claude',
                'deepseek': 'DeepSeek'
            };

            Swal.fire({
                title: 'Authentication Required',
                html: `<p style="margin-bottom: 10px;"><strong>Switching providers requires a new API key.</strong></p>
                       <p style="font-size: 13px;">You are switching from <strong style="color: #ff4d00;">${providerNames[currentProvider] || currentProvider}</strong> to <strong style="color: #ff4d00;">${providerNames[updatedModel.provider] || updatedModel.provider}</strong>. 
                       Please provide the corresponding API key to continue.</p>`,
                icon: 'info',
                background: theme === 'dark' ? '#1a1a1c' : '#fff',
                color: theme === 'dark' ? '#fff' : '#0f172a',
                confirmButtonColor: '#ff4d00',
                confirmButtonText: 'Understood'
            });
            return;
        }

        setUpdating(true);
        try {
            if (modelApiKey) {
                // If provider changed, delete the key for the OLD provider
                if (hasProviderChanged) {
                    try {
                        await api.delete(`/keys/${currentProvider}`);
                    } catch (err) {
                        // Ignore error if key doesn't exist or other issue
                    }
                }

                // Delete any existing key for the NEW provider first, then add new one
                try {
                    await api.delete(`/keys/${updatedModel.provider}`);
                } catch (err) {
                    // Ignore error if key doesn't exist
                }

                await api.post('/keys', {
                    provider: updatedModel.provider,
                    key: modelApiKey
                });
            }

            await api.patch(`/agents/${id}`, {
                name: updatedName,
                agent_name: updatedName,
                agentName: updatedName,
                description: currentAgent.description,
                model_provider: updatedModel.provider,
                provider: updatedModel.provider,
                modelProvider: updatedModel.provider,
                model_name: updatedModel.model,
                model: updatedModel.model,
                modelName: updatedModel.model,
                system_prompt: `${updatedPrompt}`,
                systemPrompt: `${updatedPrompt}`,
                prompt: `${updatedPrompt}`
            });
            await fetchAgentDetails(id);
            setActiveModal(null);
            setModelApiKey('');
            Swal.fire({ title: 'Configuration Updated', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to update configuration';
            Swal.fire({ title: 'Error', text: errorMsg, icon: 'error' });
        } finally {
            setUpdating(false);
        }
    };

    const handleUploadDocs = async () => {
        if (newFiles.length === 0) return;
        setUpdating(true);
        try {
            const formData = new FormData();
            formData.append('agentId', id);
            newFiles.forEach(file => formData.append('file', file));
            await api.post('/documents/upload', formData);
            await fetchAgentDetails(id);
            setNewFiles([]);
            setActiveModal(null);
            Swal.fire({
                title: 'Documents Added',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                background: theme === 'dark' ? '#1a1a1c' : '#fff',
                color: theme === 'dark' ? '#fff' : '#0f172a',
            });
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Failed to upload documents',
                icon: 'error',
                background: theme === 'dark' ? '#1a1a1c' : '#fff',
                color: theme === 'dark' ? '#fff' : '#0f172a',
                confirmButtonColor: '#ff4d00',
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteDoc = async (docId) => {
        try {
            const result = await Swal.fire({
                title: 'Delete Document?',
                text: "This document will be removed from the agent's knowledge base.",
                icon: 'warning',
                showCancelButton: true,
                background: theme === 'dark' ? '#1a1a1c' : '#fff',
                color: theme === 'dark' ? '#fff' : '#0f172a',
                confirmButtonColor: '#ff4d00',
                cancelButtonColor: '#333'
            });

            if (result.isConfirmed) {
                setUpdating(true);
                await api.delete(`/documents/${docId}`);
                await fetchAgentDetails(id);
                Swal.fire({
                    title: 'Deleted',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    background: theme === 'dark' ? '#1a1a1c' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#0f172a',
                });
            }
        } catch (error) {
            console.error("Delete doc error:", error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to delete document',
                icon: 'error',
                background: theme === 'dark' ? '#1a1a1c' : '#fff',
                color: theme === 'dark' ? '#fff' : '#0f172a',
                confirmButtonColor: '#ff4d00',
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleAddTool = async (toolId) => {
        // Step 1: Handle API Key Requirement
        const needsKey = toolId === 'tavily_search' || toolId === 'weather';

        if (needsKey && !showToolKeyInput) {
            setToolApiKey({ type: toolId, key: '' });
            setShowToolKeyInput(true);
            return;
        }

        // Strict Requirement: Without Key, you cannot proceed for Tavily/Weather
        if (needsKey && !toolApiKey.key.trim()) {
            Swal.fire({
                title: 'API Key Required',
                text: `You must provide a valid API key to enable the ${toolId.split('_').join(' ')} tool.`,
                icon: 'error',
                background: theme === 'dark' ? '#1a1a1c' : '#fff',
                color: theme === 'dark' ? '#fff' : '#0f172a',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }

        setUpdating(true);
        try {
            // Step 2: Handle API Key Update if provided
            if (toolApiKey.key) {
                const provider = toolId === 'tavily_search' ? 'tavily' : 'weather';

                // Delete old API key first, then add new one (functionally an update)
                try {
                    await api.delete(`/keys/${provider}`);
                } catch (err) {
                    // Ignore error if key doesn't exist
                }

                await api.post('/keys', {
                    provider: provider,
                    key: toolApiKey.key
                });
            }

            // Step 3: Prevent duplicate tool entry in Agent
            // Explicitly check for BUILT_IN tool with this name to avoid interference with custom tools
            const isAlreadyActive = currentAgent?.tools?.some(t => t.name === toolId && t.toolType === 'BUILT_IN');

            if (!isAlreadyActive) {
                await api.post('/tools', {
                    agentId: id,
                    toolType: 'BUILT_IN',
                    name: toolId
                });
            }

            // Step 4: Refresh and notify
            await fetchAgentDetails(id);
            setToolApiKey({ type: '', key: '' });
            setShowToolKeyInput(false);

            Swal.fire({
                title: isAlreadyActive ? 'API Key Updated' : 'Tool Added Successfully',
                icon: 'success',
                background: theme === 'dark' ? '#1a1a1c' : '#fff',
                color: theme === 'dark' ? '#fff' : '#0f172a',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000
            });
        } catch (error) {
            console.error("Tool action failed:", error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || error.response?.data?.error || 'Failed to manage tool',
                icon: 'error',
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleRemoveTool = async (toolId) => {
        setUpdating(true);
        try {
            await api.delete(`/tools/${toolId}`);
            await fetchAgentDetails(id);
            Swal.fire({
                title: 'Tool Removed',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                background: theme === 'dark' ? '#1a1a1c' : '#fff',
                color: theme === 'dark' ? '#fff' : '#0f172a',
            });
        } catch (error) {
            console.error("Delete tool error:", error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Failed to remove tool',
                icon: 'error',
                background: theme === 'dark' ? '#1a1a1c' : '#fff',
                color: theme === 'dark' ? '#fff' : '#0f172a',
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleAddCustomTool = async () => {
        if (!newTool.name || !newTool.description) {
            Swal.fire({ title: 'Missing Fields', text: 'Please provide both a name and a description.', icon: 'warning' });
            return;
        }
        setUpdating(true);
        try {
            if (editingToolId) {
                await api.patch(`/tools/${editingToolId}`, {
                    name: newTool.name,
                    description: newTool.description,
                    code: newTool.code
                });
                Swal.fire({ title: 'Tool Updated', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
            } else {
                await api.post('/tools', {
                    agentId: id,
                    toolType: 'CUSTOM',
                    name: newTool.name,
                    description: newTool.description,
                    code: newTool.code
                });
                Swal.fire({ title: 'Custom Tool Added', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
            }
            await fetchAgentDetails(id);
            setNewTool({ name: '', description: '', code: 'async function tool(input) {\n  return "result";\n}' });
            setShowToolEditor(false);
            setEditingToolId(null);
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: `Failed to ${editingToolId ? 'update' : 'add'} custom tool`,
                icon: 'error',
                background: theme === 'dark' ? '#1a1a1c' : '#fff',
                color: theme === 'dark' ? '#fff' : '#0f172a',
                confirmButtonColor: '#ff4d00',
            });
        } finally {
            setUpdating(false);
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

    const handleEditCustomTool = (tool) => {
        setNewTool({
            name: tool.name,
            description: tool.description,
            code: tool.code || 'async function tool(input) {\n  return "result";\n}'
        });
        setEditingToolId(tool.id);
        setShowToolEditor(true);
    };

    if (loading && !currentAgent) {
        return (
            <div className="flex items-center justify-center h-[calc(100dvh-5rem)]">
                <Loader2 className="animate-spin text-accent-primary" size={40} />
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-[50] lg:relative lg:inset-auto lg:h-[calc(100vh-5rem)] flex bg-chat-main overflow-hidden scrollbar-none"
            style={{
                height: window.innerWidth < 1024
                    ? `${vHeight - 80}px`
                    : `calc(100vh - 5rem)`,
                top: window.innerWidth < 1024
                    ? `${80 + (window.visualViewport?.offsetTop || 0)}px`
                    : 'auto',
            }}
        >
            {/* Sidebar - Agent Info */}
            <AnimatePresence>
                {!isMaximized && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                        className="bg-chat-sidebar backdrop-blur-sm overflow-y-auto hidden lg:block border-r border-theme custom-scrollbar"
                    >
                        <div className="w-80 p-6 space-y-8 pb-20">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-2xl border border-white/10 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center mb-4 shadow-inner hover:scale-105 transition-transform cursor-pointer group">
                                    <Bot size={40} className="text-accent-primary" />
                                </div>
                                <h2 className="text-xl font-bold text-white">{currentAgent?.name || currentAgent?.agentName || currentAgent?.agent_name}</h2>
                                <p className="text-sm text-white/40 mt-1 line-clamp-2">{currentAgent?.description}</p>
                            </div>

                            <div className="h-px bg-white/5 mx-2"></div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-xs font-semibold text-white/50 flex items-center gap-2 cursor-default group">
                                            Your chats
                                            <ChevronRight size={12} className="rotate-90 group-hover:text-white transition-colors" />
                                        </h3>

                                    </div>
                                    <button
                                        onClick={() => handleNewChat()}
                                        className="p-1 px-2 rounded-lg bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 transition-all cursor-pointer flex items-center gap-1.5"
                                        title="New Chat"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                <div className="px-1">
                                    <div className="relative group">
                                        <input
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search chats..."
                                            className="w-full bg-theme-surface border border-theme rounded-xl px-3.5 py-2 text-[10px] text-theme-primary focus:outline-none focus:border-accent-primary transition-all placeholder:text-theme-secondary font-bold uppercase tracking-wider focus:shadow-[0_0_15px_rgba(246,111,20,0.3)]"
                                        />
                                        <div className="absolute inset-y-0 right-3 flex items-center">
                                            <Search size={10} className="text-white/10 group-focus-within:text-accent-primary/40 transition-colors" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1 pr-2 pb-4">
                                    {loadingSessions ? (
                                        <div className="flex flex-col gap-2 p-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-10 w-full bg-white/5 animate-pulse rounded-xl"></div>
                                            ))}
                                        </div>
                                    ) : chatSessions.length > 0 ? (
                                        chatSessions
                                            .filter(s => s && (s.id || s._id))
                                            .filter(s => (s.title || 'New Chat').toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map((session) => {
                                                const sId = String(session.id || session._id || (session._id && session._id.$oid) || '');
                                                const isActive = String(activeChatId) === sId;
                                                return (
                                                    <div
                                                        key={sId}
                                                        onClick={() => handleSwitchSession(sId)}
                                                        className={`group px-4 py-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 relative border-2 ${sessionMenuId === sId ? 'z-[60] scale-[1.02]' : 'hover:scale-[1.01] z-0'} active:scale-[0.99] ${isActive
                                                            ? 'bg-accent-primary/15 text-white shadow-[0_0_20px_rgba(246,111,20,0.3)] border-orange-500'
                                                            : 'text-theme-secondary hover:bg-theme-surface hover:text-theme-primary border-theme'
                                                            }`}
                                                    >
                                                        <span className="text-[13px] font-medium truncate flex-1 tracking-tight">
                                                            {session.title || 'New Chat'}
                                                        </span>

                                                        <div className="relative flex items-center">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSessionMenuId(sessionMenuId === sId ? null : sId);
                                                                }}
                                                                className={`p-1.5 rounded-lg transition-all cursor-pointer hover:scale-110 active:scale-90 ${sessionMenuId === sId ? 'bg-accent-primary text-white' : 'text-white/20 hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100'}`}
                                                            >
                                                                <MoreVertical size={14} />
                                                            </button>

                                                            <AnimatePresence>
                                                                {sessionMenuId === sId && (
                                                                    <>
                                                                        <div className="fixed inset-0 z-[60]" onClick={(e) => { e.stopPropagation(); setSessionMenuId(null); }} />
                                                                        <motion.div
                                                                            initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                            exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                                                            className="absolute right-0 top-full mt-1 w-36 bg-menu-dropdown border border-theme rounded-xl shadow-2xl z-[70] overflow-hidden p-1 backdrop-blur-xl"
                                                                        >
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleRenameSession(sId, session.title || 'New Chat');
                                                                                }}
                                                                                className="w-full flex items-center gap-2 px-3 py-2.5 text-[10px] font-bold text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all uppercase tracking-wider cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                                                            >
                                                                                <Pencil size={12} className="text-accent-primary" /> Rename
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleDeleteSession(sId, e);
                                                                                    setSessionMenuId(null);
                                                                                }}
                                                                                className="w-full flex items-center gap-2 px-3 py-2.5 text-[10px] font-bold text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all uppercase tracking-wider cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                                                            >
                                                                                <Trash2 size={12} /> Delete
                                                                            </button>
                                                                        </motion.div>
                                                                    </>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                    ) : (
                                        <div className="px-3 py-6 border border-dashed border-white/5 rounded-2xl flex flex-col items-center gap-2 opacity-20">
                                            <MessageSquare size={20} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Empty History</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="h-px bg-white/5 mx-2"></div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/30">Configuration</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-config-item border border-transparent hover:border-white/5 transition-all cursor-pointer hover:bg-white/5">
                                        <Cpu size={16} className="text-accent-primary" />
                                        <div>
                                            <div className="text-xs font-semibold text-white">Model</div>
                                            <div className="text-[10px] text-white/40 uppercase tracking-tighter text-ellipsis overflow-hidden max-w-[180px]">
                                                {typeof currentAgent?.model === 'object' ? currentAgent.model.name || currentAgent.model.id : (currentAgent?.model || currentAgent?.modelName || currentAgent?.model_name)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 p-3 rounded-xl bg-config-item border border-transparent hover:border-white/5 transition-all cursor-pointer hover:bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <Database size={16} className="text-accent-secondary" />
                                            <div>
                                                <div className="text-xs font-semibold text-white">Knowledge Base</div>
                                                <div className="text-[10px] text-white/40">{currentAgent?.documents?.length || 0} Files Attached</div>
                                            </div>
                                        </div>
                                        {currentAgent?.documents?.length > 0 && (
                                            <div className="space-y-2 pt-2">
                                                {currentAgent.documents.map((doc) => (
                                                    <div key={doc.id} className="flex items-center gap-2 px-1">
                                                        <div className="w-1 h-1 rounded-full bg-accent-secondary/40"></div>
                                                        <span className="text-[10px] text-white/40 truncate max-w-[200px] hover:text-white/60 transition-colors cursor-default" title={doc.name || doc.filename}>
                                                            {doc.name || doc.filename}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/30">Active Tools</h3>
                                <div className="flex flex-wrap gap-2">
                                    {currentAgent?.tools?.map((tool) => (
                                        <div key={tool.id} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-accent-primary/5 text-[10px] text-white font-medium">
                                            <ToolIcon type={tool.name} />
                                            {tool.name}
                                        </div>
                                    ))}
                                    {!currentAgent?.tools?.length && <p className="text-xs text-white/20 italic">No tools active</p>}
                                </div>
                                <button
                                    onClick={() => setActiveModal('api_config')}
                                    className="w-full mt-2 flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-[10px] font-bold text-white uppercase tracking-[0.15em] hover:bg-white/10 hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(246,111,20,0.15)] transition-all group cursor-pointer"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary group-hover:scale-110 transition-transform">
                                        <Code size={16} />
                                    </div>
                                    Use as a Code
                                </button>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col relative bg-chat-main w-full min-w-0 overflow-hidden">
                <header className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-theme shrink-0">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="hidden lg:flex w-8 h-8 rounded-lg bg-accent-primary/20 items-center justify-center">
                            <Bot size={18} className="text-accent-primary" />
                        </div>
                        <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider truncate max-w-[120px] md:max-w-none">{currentAgent?.name || currentAgent?.agentName || currentAgent?.agent_name}</h3>
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/20 shrink-0"></div>
                    </div>
                    <div className="flex items-center gap-2 relative">
                        <button
                            onClick={() => setIsMaximized(!isMaximized)}
                            className={`p-2 cursor-pointer transition-all hover:scale-110 active:scale-95 ${isMaximized ? 'text-accent-primary bg-accent-primary/10 rounded-lg' : 'text-white/40 hover:text-white hover:bg-white/5 rounded-lg'}`}
                            title={isMaximized ? "Minimize Sidebar" : "Maximize Chat"}
                        >
                            {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>

                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className={`p-2 cursor-pointer transition-all hover:scale-110 active:scale-95 ${showMenu ? 'text-accent-primary bg-accent-primary/10 rounded-lg' : 'text-white/40 hover:text-white hover:bg-white/5 rounded-lg'}`}
                        >
                            <MoreVertical size={18} />
                        </button>

                        <AnimatePresence>
                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute top-full right-0 mt-2 w-64 bg-menu-dropdown rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                                    >
                                        <div className="h-px bg-white/5 my-2"></div>
                                        {/* Mobile Only Options */}
                                        <button
                                            onClick={() => { setShowChatList(true); setShowMenu(false); }}
                                            className="lg:hidden w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-all group cursor-pointer"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary group-hover:scale-110 transition-transform"><History size={16} /></div>
                                            <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">Your Chats</span>
                                        </button>

                                        <button
                                            onClick={() => { setActiveModal('agent_details'); setShowMenu(false); }}
                                            className="lg:hidden w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-all group cursor-pointer"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary group-hover:scale-110 transition-transform"><Info size={16} /></div>
                                            <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">Model Details</span>
                                        </button>

                                        <button
                                            onClick={() => { setActiveModal('model'); setShowMenu(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-all group cursor-pointer"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary group-hover:scale-110 transition-transform"><Cpu size={16} /></div>
                                            <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">Agent Settings</span>
                                        </button>
                                        <button
                                            onClick={() => { setActiveModal('knowledge'); setShowMenu(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-all group cursor-pointer"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-accent-secondary/10 flex items-center justify-center text-accent-secondary group-hover:scale-110 transition-transform"><Database size={16} /></div>
                                            <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">Manage Documents</span>
                                        </button>
                                        <button
                                            onClick={() => { setActiveModal('tools'); setShowMenu(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-all group cursor-pointer"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform"><Terminal size={16} /></div>
                                            <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">Manage Tools</span>
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </header>

                {/* Mobile Chat List Drawer */}
                <AnimatePresence>
                    {showChatList && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowChatList(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-md z-[130] lg:hidden"
                            />
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed top-20 left-0 bottom-0 w-[300px] bg-chat-sidebar border-r border-theme z-[140] p-6 lg:hidden flex flex-col overflow-y-auto custom-scrollbar"
                            >
                                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                        Your chats <ChevronRight size={12} className="rotate-90 text-accent-primary" />
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleNewChat()}
                                            className="p-2 bg-accent-primary/10 text-accent-primary rounded-lg hover:bg-accent-primary/20 transition-all cursor-pointer"
                                            title="New Chat"
                                        >
                                            <Plus size={18} />
                                        </button>
                                        <button onClick={() => setShowChatList(false)} className="p-2 hover:bg-white/5 rounded-lg text-white/40"><X size={18} /></button>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="relative group">
                                        <input
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search chats..."
                                            className="w-full bg-theme-surface border border-theme rounded-xl px-4 py-3 text-[11px] text-theme-primary focus:outline-none focus:border-accent-primary transition-all placeholder:text-theme-secondary font-bold uppercase tracking-wider shadow-inner"
                                        />
                                        <div className="absolute inset-y-0 right-3 flex items-center">
                                            <Search size={14} className="text-white/10 group-focus-within:text-accent-primary/40 transition-colors" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 pr-1 pb-10">
                                    {chatSessions
                                        .filter(s => (s.title || 'New Chat').toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map((session) => {
                                            const sId = String(session.id || session._id || (session._id && session._id.$oid) || '');
                                            const isActive = String(activeChatId) === sId;
                                            return (
                                                <div
                                                    key={sId}
                                                    onClick={() => { handleSwitchSession(sId); setShowChatList(false); }}
                                                    className={`group px-4 py-3 rounded-xl transition-all border-2 relative flex items-center justify-between gap-3 ${isActive ? 'bg-accent-primary/10 border-accent-primary shadow-[0_0_15px_rgba(246,111,20,0.2)]' : 'border-transparent text-white/40 hover:bg-white/5'}`}
                                                >
                                                    <span className="text-[12px] font-medium truncate block flex-1">{session.title || 'New Chat'}</span>

                                                    <div className="relative flex items-center">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSessionMenuId(sessionMenuId === sId ? null : sId);
                                                            }}
                                                            className={`p-2 rounded-lg transition-all ${sessionMenuId === sId ? 'bg-accent-primary text-white' : 'text-white/20 hover:text-white'}`}
                                                        >
                                                            <MoreVertical size={14} />
                                                        </button>

                                                        <AnimatePresence>
                                                            {sessionMenuId === sId && (
                                                                <>
                                                                    <div className="fixed inset-0 z-[150]" onClick={(e) => { e.stopPropagation(); setSessionMenuId(null); }} />
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.95, x: -10 }}
                                                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                                                        exit={{ opacity: 0, scale: 0.95, x: -10 }}
                                                                        className="absolute right-full mr-2 top-0 w-32 bg-menu-dropdown border border-theme rounded-xl shadow-2xl z-[160] overflow-hidden p-1 backdrop-blur-xl"
                                                                    >
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleRenameSession(sId, session.title || 'New Chat');
                                                                                setSessionMenuId(null);
                                                                            }}
                                                                            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all uppercase tracking-wider"
                                                                        >
                                                                            <Pencil size={12} className="text-accent-primary" /> Rename
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDeleteSession(sId, e);
                                                                                setSessionMenuId(null);
                                                                            }}
                                                                            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all uppercase tracking-wider"
                                                                        >
                                                                            <Trash2 size={12} /> Delete
                                                                        </button>
                                                                    </motion.div>
                                                                </>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    {chatSessions.length === 0 && (
                                        <div className="text-center py-10 opacity-20">
                                            <MessageSquare size={32} className="mx-auto mb-2" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">No History</p>
                                        </div>
                                    )}
                                </div>

                                {/* Additional Mobile Drawer Content */}
                                <div className="mt-8 pt-8 border-t border-white/5 space-y-8 pb-20">
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/30 px-1">Configuration</h3>
                                        <div className="space-y-2">
                                            <div onClick={() => { setActiveModal('model'); setShowChatList(false); }} className="flex items-center gap-3 p-3 rounded-xl bg-config-item border border-transparent active:bg-white/5">
                                                <Cpu size={16} className="text-accent-primary" />
                                                <div className="min-w-0">
                                                    <div className="text-xs font-semibold text-white">Model</div>
                                                    <div className="text-[10px] text-white/40 uppercase truncate max-w-[150px]">
                                                        {typeof currentAgent?.model === 'object' ? currentAgent.model.name || currentAgent.model.id : (currentAgent?.model || currentAgent?.modelName || currentAgent?.model_name)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div onClick={() => { setActiveModal('knowledge'); setShowChatList(false); }} className="flex items-center gap-3 p-3 rounded-xl bg-config-item border border-transparent active:bg-white/5">
                                                <Database size={16} className="text-accent-secondary" />
                                                <div>
                                                    <div className="text-xs font-semibold text-white">Knowledge Base</div>
                                                    <div className="text-[10px] text-white/40">{currentAgent?.documents?.length || 0} Files</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/30 px-1">Active Tools</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {currentAgent?.tools?.map((tool) => (
                                                <div key={tool.id} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-accent-primary/5 text-[10px] text-white font-medium">
                                                    <ToolIcon type={tool.name} />
                                                    {tool.name}
                                                </div>
                                            ))}
                                            {!currentAgent?.tools?.length && <p className="text-xs text-white/20 italic">No tools active</p>}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => { setActiveModal('api_config'); setShowChatList(false); }}
                                        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-[10px] font-bold text-white uppercase tracking-[0.15em] active:bg-white/10 transition-all font-jakarta"
                                    >
                                        <Code size={16} className="text-accent-primary" />
                                        Use as a Code
                                    </button>
                                </div>
                            </motion.div>

                        </>
                    )}
                </AnimatePresence>

                <div
                    ref={scrollRef}
                    onClick={() => {
                        const activeEl = document.activeElement;
                        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
                            activeEl.blur();
                        }
                    }}
                    className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8 space-y-6 scroll-smooth relative"
                    style={{ overscrollBehaviorY: 'contain' }}
                >
                    {loadingSessions && messages.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-loading-overlay backdrop-blur-[2px] z-10">
                            <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center">
                                <Loader2 className="animate-spin text-accent-primary" size={24} />
                            </div>
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Syncing Thread...</span>
                        </div>
                    )}
                    <AnimatePresence initial={false}>
                        {messages.map((m, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                key={idx}
                                className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${m.role === 'user' ? 'bg-accent-primary shadow-accent-primary/20' :
                                    m.isError ? 'bg-red-500 shadow-red-500/20' : 'bg-accent-primary/5'
                                    }`}>
                                    {m.role === 'user' ? <User size={20} className="text-white" /> :
                                        m.isError ? <AlertTriangle size={20} className="text-white" /> :
                                            <Bot size={20} className="text-accent-primary" />}
                                </div>
                                <div className="max-w-[80%] space-y-2">
                                    <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm markdown-content border ${m.isError ? 'bg-red-500/10 text-red-200 border-red-500/20 rounded-tl-none' :
                                        m.role === 'user' ? 'bg-chat-message-user text-white rounded-tr-none border-white/20' :
                                            'bg-chat-message-bot text-chat-message-bot rounded-tl-none border-chat-message'
                                        }`}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {m.content}
                                        </ReactMarkdown>
                                    </div>
                                    <span className="text-[10px] text-white/20 uppercase font-bold px-1">
                                        {m.role === 'user' ? 'You' : (currentAgent?.name || currentAgent?.agentName || currentAgent?.agent_name)}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-4 items-start"
                            >
                                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center shrink-0 border border-accent-primary/20 shadow-inner">
                                    <Bot size={20} className="text-accent-primary animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <div className="bg-chat-message-bot p-4 rounded-2xl rounded-tl-none border border-chat-message flex gap-1.5 items-center">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 rounded-full bg-accent-primary animate-bounce shadow-[0_0_8px_rgba(246,111,20,0.5)]"></span>
                                            <span className="w-2 h-2 rounded-full bg-accent-primary animate-bounce [animation-delay:0.2s] shadow-[0_0_8px_rgba(246,111,20,0.5)]"></span>
                                            <span className="w-2 h-2 rounded-full bg-accent-primary animate-bounce [animation-delay:0.4s] shadow-[0_0_8px_rgba(246,111,20,0.5)]"></span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-1">
                                        <span className="text-[9px] text-accent-primary font-bold uppercase tracking-widest animate-pulse">
                                            Agent is thinking...
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-4 sm:p-6 bg-gradient-to-t from-[var(--chat-bg)] to-transparent pt-0 shrink-0">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-2 rounded-2xl bg-input-chat border border-chat-message focus-within:border-orange-500 focus-within:bg-accent-primary/10 focus-within:shadow-[0_0_20px_rgba(246,111,20,0.4)] transition-all shadow-xl">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Message agent..."
                            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-theme-primary px-4 py-2 placeholder:text-white/20 dark:placeholder:text-white/20 light:placeholder:text-black/20"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="w-10 h-10 rounded-xl bg-accent-primary hover:bg-accent-hover text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent-primary/20 cursor-pointer"
                        >
                            {isTyping ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        </button>
                    </form>
                </div>
            </main>

            {/* MODALS */}
            <AnimatePresence>
                {activeModal === 'agent_details' && (
                    <div className="fixed inset-0 z-[999] flex justify-center items-center p-4 backdrop-blur-xl bg-black/60 overflow-hidden">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-modal-dark border border-white/10 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
                        >
                            {/* Premium Backdrop Glows */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/10 blur-[80px] rounded-full pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-secondary/5 blur-[80px] rounded-full pointer-events-none" />

                            <div className="relative z-10 flex flex-col max-h-[90vh]">
                                <div className="p-6 flex justify-between items-center bg-white/[0.02] border-b border-white/5 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                                            <Bot size={20} className="text-accent-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Model Details</h3>
                                            <p className="text-[10px] text-white/30 uppercase font-bold tracking-tight">Agent Configuration</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveModal(null)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer">
                                        <X size={20} className="text-white/40" />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto custom-scrollbar space-y-8 pb-20">
                                    {/* Configuration Section */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/20">Configuration</h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center shrink-0">
                                                    <Cpu size={18} className="text-accent-primary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Active Model</div>
                                                    <div className="text-xs font-bold text-white uppercase truncate">
                                                        {typeof currentAgent?.model === 'object' ? currentAgent.model.name || currentAgent.model.id : (currentAgent?.model || currentAgent?.modelName || currentAgent?.model_name)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-accent-secondary/10 flex items-center justify-center shrink-0">
                                                    <Database size={18} className="text-accent-secondary" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Knowledge Base</div>
                                                    <div className="text-xs font-bold text-white">{currentAgent?.documents?.length || 0} Files Attached</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Active Tools Section */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/20">Active Tools</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {currentAgent?.tools?.map((tool) => (
                                                <div key={tool.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent-primary/5 border border-accent-primary/10 text-[10px] text-white font-bold uppercase tracking-wider">
                                                    <ToolIcon type={tool.name} />
                                                    {tool.name}
                                                </div>
                                            ))}
                                            {!currentAgent?.tools?.length && (
                                                <div className="w-full text-center py-4 rounded-2xl border border-dashed border-white/5 opacity-30">
                                                    <span className="text-[10px] uppercase font-bold tracking-widest">No tools active</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Code Access Button */}
                                    <button
                                        onClick={() => setActiveModal('api_config')}
                                        className="w-full flex items-center justify-center gap-4 py-5 rounded-[24px] bg-white/[0.03] border border-white/5 text-[11px] font-black text-white uppercase tracking-[0.2em] hover:bg-white/10 hover:border-accent-primary/40 hover:shadow-[0_0_30px_rgba(246,111,20,0.15)] transition-all group cursor-pointer"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary group-hover:scale-110 transition-transform">
                                            <Code size={20} />
                                        </div>
                                        Use as a Code
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {activeModal === 'model' && (
                    <div className="fixed inset-0 z-[999] flex justify-center items-center p-4 backdrop-blur-xl bg-black/40 overflow-hidden">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-modal-dark border border-white/5 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
                        >
                            {/* Background Glow */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-accent-primary/15 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-secondary/10 blur-[100px] rounded-full -ml-40 -mb-40 pointer-events-none" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full pointer-events-none" />

                            <div className="relative z-10">
                                <div className="p-6 flex justify-between items-center bg-white/[0.02]">
                                    <h3 className="text-xl font-bold text-white">Agent Settings</h3>
                                    <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-white/5 rounded-full cursor-pointer"><X size={20} className="text-white/40" /></button>
                                </div>
                                <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Agent Name</label>
                                            <input
                                                type="text"
                                                value={updatedName}
                                                onChange={(e) => setUpdatedName(e.target.value)}
                                                className="w-full bg-accent-primary/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 focus:bg-accent-primary/10 focus:shadow-[0_0_20px_rgba(246,111,20,0.5)] shadow-[0_0_10px_rgba(246,111,20,0.1)] transition-all font-medium"
                                                placeholder="Enter agent name..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">System Prompt (Instructions)</label>
                                            <textarea
                                                value={updatedPrompt}
                                                onChange={(e) => setUpdatedPrompt(e.target.value)}
                                                rows={6}
                                                className="w-full bg-accent-primary/[0.02] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:bg-accent-primary/10 focus:shadow-[0_0_20px_rgba(246,111,20,0.5)] shadow-[0_0_10px_rgba(246,111,20,0.1)] transition-all resize-none text-xs leading-relaxed"
                                                placeholder="Give your agent specific instructions..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Model Provider</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {['openai', 'gemini', 'anthropic', 'deepseek'].map(p => (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => setUpdatedModel({ ...updatedModel, provider: p })}
                                                        className={`p-3 rounded-xl border transition-all capitalize font-bold text-xs cursor-pointer ${updatedModel.provider === p ? 'border-orange-500 bg-transparent text-white shadow-[0_0_20px_rgba(246,111,20,0.5)]' : 'border-white/5 text-white/40 hover:bg-white/5 hover:border-orange-500'}`}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between ml-1">
                                                <label className="text-[10px] uppercase font-bold tracking-widest text-white/30">Select Model</label>
                                                <div className="px-2 py-0.5 rounded-md bg-accent-primary/10 text-[9px] font-bold text-accent-primary uppercase tracking-tighter shadow-sm shadow-accent-primary/10">Current: {updatedModel.model.split('/').pop()}</div>
                                            </div>
                                            <div className="h-64 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                                {MODEL_OPTIONS[updatedModel.provider]?.map(m => (
                                                    <button
                                                        key={m.value}
                                                        type="button"
                                                        onClick={() => setUpdatedModel({ ...updatedModel, model: m.value })}
                                                        className={`w-full px-4 py-3 text-left rounded-xl transition-all flex items-center justify-between group cursor-pointer ${updatedModel.model === m.value ? 'bg-[#f66f14]/10 shadow-[0_0_15px_rgba(246,111,20,0.1)]' : 'bg-white/2 hover:bg-white/5'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Cpu size={14} className={updatedModel.model === m.value ? 'text-[#f66f14]' : 'text-white/40'} />
                                                            <div className="flex flex-col">
                                                                <span className={`text-sm font-medium ${updatedModel.model === m.value ? 'text-white' : 'text-white/60'}`}>{m.label}</span>
                                                                <span className="text-[10px] text-white/20 uppercase font-bold tracking-tight">{m.desc}</span>
                                                            </div>
                                                        </div>
                                                        {updatedModel.model === m.value && <Check size={16} className="text-[#f66f14]" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 p-4 rounded-2xl bg-accent-primary/5">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-accent-primary ml-1">
                                            {updatedModel.provider === (currentAgent.provider || currentAgent.modelProvider)
                                                ? 'Update API Key (Leave blank to keep current)'
                                                : `Enter ${updatedModel.provider} API Key`}
                                        </label>
                                        <div className="relative group">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-primary/30 group-focus-within:text-accent-primary" size={14} />
                                            <input
                                                type="password"
                                                value={modelApiKey}
                                                onChange={(e) => setModelApiKey(e.target.value)}
                                                placeholder={`Enter your ${updatedModel.provider} API Key`}
                                                className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 focus:bg-accent-primary/10 focus:shadow-[0_0_20px_rgba(246,111,20,0.5)] transition-all"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleUpdateModel}
                                        disabled={updating}
                                        className="w-full py-4 bg-gradient-to-r from-[#f66f14] to-[#ff8542] text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-orange-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
                                    >
                                        {updating ? <Loader2 size={20} className="animate-spin" /> : <><Settings size={20} /> Update Configuration</>}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {activeModal === 'knowledge' && (
                    <div className="fixed inset-0 z-[999] flex justify-center items-center p-4 backdrop-blur-xl bg-black/40 overflow-hidden">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-modal-dark w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative border border-white/5 flex flex-col max-h-[90vh]">
                            {/* Background Glow - Enhanced */}
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-primary/20 blur-[140px] rounded-full -mr-64 -mt-64 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-secondary/15 blur-[120px] rounded-full -ml-48 -mb-48 pointer-events-none" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-500/8 blur-[100px] rounded-full pointer-events-none" />

                            <div className="relative z-10">
                                <div className="p-6 flex justify-between items-center bg-white/[0.02]">
                                    <h3 className="text-xl font-bold text-white">Manage Knowledge Base</h3>
                                    <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-white/5 rounded-full cursor-pointer"><X size={20} className="text-white/40" /></button>
                                </div>
                                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 pb-10">
                                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:bg-accent-primary/5 hover:border-orange-500 hover:scale-[1.01] transition-all cursor-pointer group relative">

                                        <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setNewFiles([...newFiles, ...Array.from(e.target.files)])} />
                                        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-white/20 group-hover:text-accent-primary transition-all"><Plus size={28} /></div>
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Upload Documents</h3>
                                        <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">PDF or TXT (Max 5MB)</p>
                                    </div>
                                    {newFiles.length > 0 && (
                                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                            {newFiles.map((f, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-accent-primary/5">
                                                    <div className="flex items-center gap-3">
                                                        <FileText size={14} className="text-accent-primary" />
                                                        <span className="text-[11px] text-white/80 font-bold max-w-[200px] truncate">{f.name}</span>
                                                    </div>
                                                    <button onClick={() => setNewFiles(newFiles.filter((_, idx) => idx !== i))} className="text-white/20 hover:text-red-500 cursor-pointer p-1 rounded-md hover:bg-red-500/10"><X size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        onClick={handleUploadDocs}
                                        disabled={updating || (newFiles.length === 0)}
                                        className="w-full py-4 bg-gradient-to-r from-[#f66f14] to-[#ff8542] text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-orange-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-30 cursor-pointer flex items-center justify-center gap-3"
                                    >
                                        {updating ? <Loader2 size={20} className="animate-spin" /> : <><Upload size={20} /> Update Knowledge</>}
                                    </button>

                                    {currentAgent?.documents?.length > 0 && (
                                        <div className="space-y-3 pt-6">
                                            <div className="flex items-center justify-between ml-1">
                                                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Existing Documents</h4>
                                                <span className="text-[10px] font-bold text-accent-primary uppercase tracking-widest">{currentAgent.documents.length} Files</span>
                                            </div>
                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                {currentAgent.documents.map((doc) => (
                                                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-accent-primary/5 hover:bg-accent-primary/10 border border-white/5 group transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-accent-primary/20 transition-colors">
                                                                <Database size={14} className="text-accent-primary" />
                                                            </div>
                                                            <span className="text-xs text-white font-bold max-w-[220px] truncate">{doc.name || doc.filename || 'Unnamed document'}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteDoc(doc.id)}
                                                            className="text-red-500 hover:text-red-400 cursor-pointer p-2 rounded-lg hover:bg-red-500/10 transition-all"
                                                            title="Delete File"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {activeModal === 'tools' && (
                    <div className="fixed inset-0 z-[999] flex justify-center items-center p-4 backdrop-blur-xl bg-black/40 overflow-hidden">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-modal-dark w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative border border-white/5 flex flex-col max-h-[90vh]">
                            {/* Background Glow */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-accent-primary/15 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-secondary/10 blur-[100px] rounded-full -ml-40 -mb-40 pointer-events-none" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full pointer-events-none" />

                            <div className="relative z-10">
                                <div className="p-6 flex justify-between items-center bg-white/[0.02]">
                                    <h3 className="text-xl font-bold text-white">Manage Tools</h3>
                                    <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-white/5 rounded-full cursor-pointer"><X size={20} className="text-white/40" /></button>
                                </div>
                                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 pb-10">
                                    <div className="grid grid-cols-2 gap-3">

                                        {
                                            [
                                                { id: 'tavily_search', name: 'Tavily Search', icon: Search },
                                                { id: 'weather', name: 'Weather', icon: Cloud },
                                                { id: 'calculator', name: 'Calculator', icon: Calculator }
                                            ].map(tool => {
                                                // Robust check for BUILT_IN tools specifically
                                                const activeTool = currentAgent?.tools?.find(t => t.name === tool.id && t.toolType === 'BUILT_IN');
                                                const isActive = !!activeTool;

                                                return (
                                                    <div key={tool.id} className={`p-4 rounded-2xl flex items-center justify-between group transition-all ${isActive ? 'bg-accent-primary/5' : 'bg-accent-primary/[0.02]'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${isActive ? 'bg-accent-primary text-white' : 'bg-white/5 text-white/40'}`}><tool.icon size={16} /></div>
                                                            <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-white/40'}`}>{tool.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {isActive && (tool.id === 'tavily_search' || tool.id === 'weather') && (
                                                                <button onClick={() => { setToolApiKey({ type: tool.id, key: '' }); setShowToolKeyInput(true); }} className="text-accent-primary/40 hover:text-accent-primary cursor-pointer p-2 rounded-lg" title="Edit API Key"><Key size={14} /></button>
                                                            )}
                                                            {isActive ? (
                                                                <button
                                                                    onClick={() => handleRemoveTool(activeTool.id || activeTool._id)}
                                                                    className="text-red-500/40 hover:text-red-500 cursor-pointer p-2 rounded-lg hover:scale-125 transition-all"
                                                                    title="Remove Tool"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleAddTool(tool.id)}
                                                                    disabled={updating}
                                                                    className="text-accent-primary/40 hover:text-accent-primary cursor-pointer p-2 rounded-lg hover:scale-125 transition-all disabled:opacity-30"
                                                                    title="Add Tool"
                                                                >
                                                                    <Plus size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        }
                                        {currentAgent?.tools?.filter(t => t.toolType === 'CUSTOM').map((tool) => (
                                            <div key={tool.id} className="p-4 rounded-2xl bg-accent-primary/5 flex items-center justify-between group transition-all">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="p-2 rounded-lg bg-accent-primary text-white shrink-0"><Terminal size={16} /></div>
                                                    <span className="text-xs font-bold text-white truncate max-w-[120px]">{tool.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => handleEditCustomTool(tool)} className="text-accent-primary/40 hover:text-accent-primary cursor-pointer p-2 rounded-lg" title="Edit Code"><Settings size={14} /></button>
                                                    <button onClick={() => handleRemoveTool(tool.id || tool._id)} className="text-red-500/40 hover:text-red-400 cursor-pointer p-2 rounded-lg hover:bg-red-500/10" title="Remove Tool"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setShowToolEditor(true)}
                                            className="p-4 rounded-2xl border border-dashed border-white/10 bg-accent-primary/[0.02] hover:bg-accent-primary/5 hover:border-orange-500 hover:scale-[1.03] flex items-center justify-center gap-2 group transition-all cursor-pointer"
                                        >
                                            <Plus size={16} className="text-white/40 group-hover:text-accent-primary" />
                                            <span className="text-xs font-bold text-white/40 group-hover:text-white uppercase tracking-wider">Add Custom Tool</span>
                                        </button>
                                    </div>
                                    <AnimatePresence>
                                        {showToolKeyInput && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="p-6 rounded-2xl bg-accent-primary/5 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{toolApiKey.type} API Key</h4>
                                                    <button onClick={() => setShowToolKeyInput(false)} className="text-white/20 hover:text-white cursor-pointer hover:scale-110 active:scale-95 transition-all"><X size={14} /></button>
                                                </div>
                                                <input
                                                    type="password"
                                                    value={toolApiKey.key}
                                                    onChange={(e) => setToolApiKey({ ...toolApiKey, key: e.target.value })}
                                                    placeholder={`Enter Key...`}
                                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500 focus:bg-accent-primary/10 focus:shadow-[0_0_20px_rgba(246,111,20,0.5)] transition-all"
                                                />
                                                <button
                                                    onClick={() => handleAddTool(toolApiKey.type)}
                                                    disabled={!toolApiKey.key}
                                                    className="w-full py-3 bg-gradient-to-r from-[#f66f14] to-[#ff8542] text-sm font-bold text-white rounded-xl cursor-pointer hover:shadow-orange-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all"
                                                >
                                                    Enable Tool
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Developer Documentation Toggle */}
                                    <div className="pt-2 border-t border-white/5">
                                        <button
                                            onClick={() => setShowToolDocs(!showToolDocs)}
                                            className="w-full py-3 px-4 rounded-xl bg-accent-primary/5 hover:bg-accent-primary/10 border border-white/5 hover:border-orange-500/30 flex items-center justify-between group transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-orange-500/10 text-accent-primary group-hover:scale-110 transition-transform">
                                                    <Book size={16} />
                                                </div>
                                                <span className="text-sm font-bold text-white/70 group-hover:text-white">Developer Documentation</span>
                                            </div>
                                            <ChevronRight size={16} className={`text-white/20 transition-transform ${showToolDocs ? 'rotate-90' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {showToolDocs && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6 max-h-[350px] overflow-y-auto custom-scrollbar">
                                                        <div className="prose prose-invert prose-sm max-w-none">
                                                            <header>
                                                                <h4 className="text-accent-primary font-black uppercase tracking-widest text-[10px] mb-2">Platform Custom Tooling Engine</h4>
                                                                <p className="text-white/40 text-[11px] leading-relaxed">
                                                                    Our platform runs your JavaScript code in a secure, isolated sandbox. Below are the guidelines and supported formats.
                                                                </p>
                                                            </header>

                                                            <div className="space-y-8 mt-6">
                                                                <section>
                                                                    <div className="flex items-center gap-2 mb-4">
                                                                        <Zap size={14} className="text-orange-400" />
                                                                        <h5 className="text-white font-bold text-xs uppercase tracking-wider">Supported Patterns</h5>
                                                                    </div>
                                                                    <div className="space-y-5">
                                                                        <DocCode title="1. Simple Return (Recommended)" code={`const greeting = "Hello " + input.name;\nreturn greeting;`} />
                                                                        <DocCode title="2. Named Function (tool or handler)" code={`async function tool(input) {\n  // Your logic here\n  return \`Found result for \${input.query}\`;\n}`} />
                                                                        <DocCode title="3. Module Exports (Node.js Style)" code={`module.exports = async (input) => {\n  return "Results from module export";\n};`} />
                                                                    </div>
                                                                </section>

                                                                <section>
                                                                    <div className="flex items-center gap-2 mb-4">
                                                                        <Database size={14} className="text-blue-400" />
                                                                        <h5 className="text-white font-bold text-xs uppercase tracking-wider">Global API</h5>
                                                                    </div>
                                                                    <div className="rounded-xl overflow-hidden border border-white/5 bg-black/20">
                                                                        <div className="grid grid-cols-2 p-3 border-b border-white/5 bg-white/5 font-black uppercase tracking-widest text-[9px] text-white/40">
                                                                            <span>Variable</span>
                                                                            <span>Description</span>
                                                                        </div>
                                                                        <div className="divide-y divide-white/5">
                                                                            <div className="grid grid-cols-2 p-3 text-[11px]">
                                                                                <code className="text-accent-primary">input</code>
                                                                                <span className="text-white/60">Object/string sent by the AI Agent.</span>
                                                                            </div>
                                                                            <div className="grid grid-cols-2 p-3 text-[11px]">
                                                                                <code className="text-accent-primary">console.log()</code>
                                                                                <span className="text-white/60">Prints messages to server logs.</span>
                                                                            </div>
                                                                            <div className="grid grid-cols-2 p-3 text-[11px]">
                                                                                <code className="text-accent-primary">fetch()</code>
                                                                                <span className="text-white/60">(Coming Soon) External API calls.</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </section>

                                                                <section className="p-5 rounded-2xl bg-accent-primary/5 border border-orange-500/10 relative overflow-hidden">
                                                                    <div className="absolute top-0 right-0 p-4 opacity-10"><Shield size={40} /></div>
                                                                    <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Execution Context</h5>
                                                                    <div className="space-y-2 text-[11px]">
                                                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                                                            <span className="text-white/40">Runtime</span>
                                                                            <span className="text-white font-mono">isolated-vm (V8)</span>
                                                                        </div>
                                                                        <div className="flex justify-between border-b border-white/5 pb-2">
                                                                            <span className="text-white/40">Memory Limit</span>
                                                                            <span className="text-white font-mono">128MB</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-white/40">Timeout</span>
                                                                            <span className="text-white font-mono text-red-400">5.0 Seconds</span>
                                                                        </div>
                                                                    </div>
                                                                </section>

                                                                <section className="space-y-4">
                                                                    <h5 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                                                                        <Check size={14} className="text-emerald-400" /> Best Practices
                                                                    </h5>
                                                                    <DocCode title="Structured Output (Best for AI)" code={`try {\n  const result = calculate(input);\n  return { success: true, data: result };\n} catch (err) {\n  return { success: false, error: err.message };\n}`} />
                                                                </section>

                                                                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                                                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                        <Info size={12} /> Pro-Tips
                                                                    </p>
                                                                    <ul className="text-[11px] text-white/50 list-disc ml-4 space-y-1">
                                                                        <li>Always return a result or the AI receives undefined.</li>
                                                                        <li>External <span className="text-blue-400 font-mono">require()</span> is not supported.</li>
                                                                        <li>Use the <span className="text-blue-400 font-mono">input</span> variable for incoming data.</li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {showChatList && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowChatList(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-chat-sidebar z-[120] flex flex-col shadow-2xl border-l border-white/5">
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                {loadingSessions ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <Loader2 size={32} className="animate-spin text-accent-primary" />
                                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Loading Chats...</p>
                                    </div>
                                ) : chatSessions.length > 0 ? (
                                    chatSessions.filter(s => s && (s.id || s._id)).map((session) => (
                                        <div
                                            key={session.id || session._id}
                                            onClick={() => handleSwitchSession(session.id || session._id)}
                                            className={`group px-4 py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between ${activeChatId === (session.id || session._id)
                                                ? 'bg-white/10 text-white shadow-lg'
                                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeChatId === (session.id || session._id) ? 'bg-accent-primary shadow-[0_0_8px_rgba(246,111,20,0.5)]' : 'bg-white/10'}`}></div>
                                                <span className="text-sm font-medium truncate">
                                                    {session.title || 'New Chat'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-white/20 font-medium hidden sm:block">
                                                    {session.updated_at ? new Date(session.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recently'}
                                                </span>
                                                <button
                                                    onClick={(e) => handleDeleteSession(session.id || session._id, e)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                <ChevronRight size={14} className={`transition-transform duration-300 ${activeChatId === (session.id || session._id) ? 'text-accent-primary translate-x-0.5' : 'text-white/10 group-hover:text-white/30'}`} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                                        <MessageSquare size={48} className="mb-4" />
                                        <p className="text-sm font-bold uppercase tracking-widest">No chats yet</p>
                                        <p className="text-xs mt-1 italic">Start a new conversation to begin</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}

                {activeModal === 'api_config' && (
                    <div className="fixed inset-0 z-[999] flex justify-center items-center p-4 backdrop-blur-2xl bg-black/60 overflow-hidden">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-modal-dark border border-white/5 w-full max-w-xl rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] relative flex flex-col max-h-[90vh]"
                        >
                            {/* Background Glow */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-accent-primary/10 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-secondary/5 blur-[100px] rounded-full -ml-40 -mb-40 pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex justify-between items-center p-8 border-b border-white/5 bg-white/[0.02]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-accent-primary/20 flex items-center justify-center text-accent-primary shadow-inner">
                                            <Code size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white tracking-tight uppercase">Developer API</h3>
                                            <p className="text-[10px] text-white/30 uppercase font-bold tracking-[0.2em]">Connect this agent anywhere</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveModal(null)}
                                        className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all hover:rotate-90 cursor-pointer"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-8 space-y-8">
                                    {/* cURL Request Example */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">cURL Request Example</label>
                                            <button
                                                onClick={() => {
                                                    const curlCommand = `curl -X POST http://localhost:5000/api/chat/${id} \\
                                                           -H "Content-Type: application/json" \\
                                                           -H "Authorization: Bearer ${localStorage.getItem('token')}" \\
                                                           -d '{"message": "Hello, how can you help me?"}'`;
                                                    navigator.clipboard.writeText(curlCommand);
                                                    Swal.fire({ title: 'cURL Copied!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
                                                }}
                                                className="text-[10px] text-accent-primary font-bold uppercase hover:underline cursor-pointer flex items-center gap-1.5"
                                            >
                                                <Code size={12} />
                                                Copy cURL
                                            </button>
                                        </div>
                                        <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-5 font-mono text-[11px] text-emerald-400 shadow-inner overflow-x-auto max-h-[300px] overflow-y-auto custom-scrollbar">
                                            <pre className="whitespace-pre-wrap break-all leading-relaxed">
                                                {`curl -X POST http://localhost:5000/api/chat/${id} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${localStorage.getItem('token') || 'YOUR_TOKEN_HERE'}" \\
  -d '{"message": "Hello, how can you help me?"}'`}
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Quick Reference */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 p-4 rounded-2xl bg-theme-surface border border-theme">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                    <Database size={12} className="text-blue-400" />
                                                </div>
                                                <h4 className="text-[10px] font-black text-white/60 uppercase tracking-widest">Endpoint</h4>
                                            </div>
                                            <p className="text-[10px] font-mono text-white/40 break-all">
                                                POST /api/chat/{id}
                                            </p>
                                        </div>
                                        <div className="space-y-2 p-4 rounded-2xl bg-theme-surface border border-theme">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                                    <Shield size={12} className="text-purple-400" />
                                                </div>
                                                <h4 className="text-[10px] font-black text-white/60 uppercase tracking-widest">Auth Type</h4>
                                            </div>
                                            <p className="text-[10px] font-mono text-white/40">
                                                Bearer Token
                                            </p>
                                        </div>
                                    </div>

                                    {/* Request Body Format */}
                                    <div className="p-5 rounded-2xl bg-accent-primary/5 border border-theme">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center shrink-0 border border-accent-primary/20">
                                                <Info size={18} className="text-accent-primary" />
                                            </div>
                                            <div className="space-y-2 flex-1">
                                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Request Body Format</h4>
                                                <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                                                    <pre className="font-mono text-[10px] text-emerald-400">
                                                        {`{
  "message": "Your question here",
  "sessionId": "optional-session-id"
}`}
                                                    </pre>
                                                </div>
                                                <p className="text-[10px] text-white/40 leading-relaxed">
                                                    The <span className="text-white/60 font-bold">message</span> field is required. Include <span className="text-white/60 font-bold">sessionId</span> to continue an existing conversation.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setActiveModal(null)}
                                        className="w-full py-4 bg-theme-surface border border-theme hover:bg-accent-primary/5 text-theme-primary rounded-2xl font-bold uppercase tracking-widest transition-all cursor-pointer"
                                    >
                                        Close Settings
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
                {showToolEditor && (
                    <div className="fixed inset-0 z-[999] flex justify-center items-center p-4 backdrop-blur-2xl bg-black/60 overflow-hidden">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-modal-dark border border-white/5 w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_50px_-12px_rgba(255,100,0,0.2)] relative flex flex-col max-h-[90vh]"
                        >
                            {/* Background Glow */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-accent-primary/15 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-secondary/10 blur-[100px] rounded-full -ml-40 -mb-40 pointer-events-none" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex justify-between items-center p-6 border-b border-theme bg-theme-surface">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center text-accent-primary shadow-inner">
                                            <Code size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white tracking-tight">{editingToolId ? 'Edit Custom Tool' : 'Create Custom Tool'}</h3>
                                            <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{editingToolId ? 'Update tool logic' : 'Logic & Configuration'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setShowToolEditor(false); setEditingToolId(null); setNewTool({ name: '', description: '', code: 'async function tool(input) {\n  return "result";\n}' }); }}
                                        className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all hover:rotate-90 duration-300 cursor-pointer"
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
                                                className="w-full bg-theme-surface border border-theme rounded-xl px-4 py-3 text-theme-primary focus:outline-none focus:border-orange-500 focus:shadow-[0_0_20px_rgba(246,111,20,0.5)] transition-all placeholder:text-theme-secondary"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Description</label>
                                            <input
                                                value={newTool.description}
                                                onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                                                placeholder="What does this tool do?"
                                                className="w-full bg-theme-surface border border-theme rounded-xl px-4 py-3 text-theme-primary focus:outline-none focus:border-orange-500 focus:shadow-[0_0_20px_rgba(246,111,20,0.5)] transition-all placeholder:text-theme-secondary"
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
                                        <div className="h-64 border border-white/10 rounded-2xl overflow-hidden shadow-2xl bg-[#010101] focus-within:border-orange-500 focus-within:shadow-[0_0_20px_rgba(246,111,20,0.3)] transition-all">
                                            <Editor
                                                theme="vs-dark"
                                                defaultLanguage="javascript"
                                                value={newTool.code}
                                                onChange={(val) => setNewTool({ ...newTool, code: val })}
                                                options={{
                                                    minimap: { enabled: false },
                                                    fontSize: 14,
                                                    lineNumbers: 'on',
                                                    padding: { top: 16 }
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
                                        onClick={handleAddCustomTool}
                                        disabled={updating}
                                        className="w-full py-4 bg-gradient-to-r from-[#f66f14] to-[#ff8542] text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer  border-accent-primary/20 hover:border-accent-secondary/50"
                                    >
                                        {updating ? <Loader2 size={20} className="animate-spin" /> : editingToolId ? <><Settings size={20} /> Update Tool</> : <><Plus size={20} /> Create custom tool</>}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence >
        </div >
    );
};

const DocCode = ({ title, code }) => (
    <div className="space-y-2">
        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest ml-1">{title}</p>
        <div className="bg-theme-surface rounded-xl p-3 border border-theme font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre">
            {code}
        </div>
    </div>
);

export default AgentDetails;
