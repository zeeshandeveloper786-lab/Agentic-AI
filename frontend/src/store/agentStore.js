import { create } from 'zustand';
import api from '../services/api';

const useAgentStore = create((set, get) => ({
    agents: [],
    deletedAgents: [],
    currentAgent: null,
    loading: false,
    error: null,

    fetchAgents: async () => {
        set({ loading: true });
        try {
            const response = await api.get('/agents');
            set({ agents: response.data, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch agents', loading: false });
        }
    },

    fetchDeletedAgents: async () => {
        set({ loading: true });
        try {
            const response = await api.get('/agents/deleted');
            set({ deletedAgents: response.data, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch deleted agents', loading: false });
        }
    },

    fetchAgentDetails: async (id) => {
        set({ loading: true });
        try {
            const response = await api.get(`/agents/${id}`);
            set({ currentAgent: response.data, loading: false });
        } catch (error) {
            set({ error: 'Failed to fetch agent details', loading: false });
        }
    },

    createAgent: async (agentData) => {
        set({ loading: true });
        try {
            const response = await api.post('/agents', agentData);
            set((state) => ({
                agents: [...state.agents, response.data],
                loading: false
            }));
            return { success: true, agent: response.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create agent';
            set({ error: message, loading: false });
            return { success: false, error: message };
        }
    },

    deleteAgent: async (id) => {
        set({ loading: true });
        try {
            // Simply call delete - if backend supports Trash, it will move there.
            // If the backend doesn't support soft delete, this will still remove it from active list.
            await api.delete(`/agents/${id}`);

            set((state) => ({
                agents: state.agents.filter((a) => a.id !== id),
                loading: false
            }));
            return { success: true };
        } catch (error) {
            console.error('Failed to delete agent:', error);
            set({ loading: false });
            return { success: false };
        }
    },

    restoreAgent: async (id) => {
        set({ loading: true });
        try {
            await api.post(`/agents/${id}/restore`);
            set({ loading: false });
            return { success: true };
        } catch (error) {
            set({ error: 'Failed to restore agent', loading: false });
            return { success: false };
        }
    },

    permanentlyDeleteAgent: async (id) => {
        set({ loading: true });
        try {
            await api.delete(`/agents/${id}/permanent`);
            set((state) => ({
                deletedAgents: state.deletedAgents.filter((a) => a.id !== id),
                loading: false
            }));
            return { success: true };
        } catch (error) {
            console.error('Failed to permanently delete agent:', error);
            set({ loading: false });
            return { success: false };
        }
    }
}));

export default useAgentStore;
