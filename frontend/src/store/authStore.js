import { create } from 'zustand';
import api from '../services/api';

const getInitialUser = () => {
    try {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
        return null;
    }
};

const useAuthStore = create((set) => ({
    user: getInitialUser(),
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;
            const userData = user || response.data.user || response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            set({ user: userData, token, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (error) {
            console.error('Login Error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                config: error.config
            });
            const message = error.response?.data?.message || error.response?.data?.error || 'Login failed';
            const status = error.response?.status;
            const data = error.response?.data;
            set({ error: message, loading: false });
            return { success: false, message, status, data };
        }
    },

    googleLogin: async (idToken) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/auth/google-login', { idToken });
            const { token, user } = response.data;
            const userData = user || response.data.user || response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            set({ user: userData, token, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.error || 'Google login failed';
            const status = error.response?.status;
            const data = error.response?.data;
            set({ error: message, loading: false });
            return { success: false, message, status, data };
        }
    },

    signup: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/auth/signup', { name, email, password });
            set({ loading: false });
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.error || 'Signup failed';
            const status = error.response?.status;
            const data = error.response?.data;
            set({ error: message, loading: false });
            return { success: false, message, status, data };
        }
    },

    verifyEmail: async (email, code) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/auth/verify-email', { email, code });
            const { token, user } = response.data;
            const userData = user || response.data.user || response.data;
            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                set({ user: userData, token, isAuthenticated: true, loading: false });
            } else {
                set({ loading: false });
            }
            return { success: true, message: response.data.message };
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.error || 'Verification failed';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    resendVerification: async (email) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/auth/resend-verification', { email });
            set({ loading: false });
            return { success: true, message: response.data.message };
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.error || 'Failed to resend code';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
    },

    forgotPassword: async (email) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/auth/forgot-password', { email });
            set({ loading: false });
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.error || 'Failed to send reset email';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    resetPassword: async (token, password) => {
        set({ loading: true, error: null });
        try {
            await api.post('/auth/reset-password', { token, password });
            set({ loading: false });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.error || 'Failed to reset password';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    fetchMe: async () => {
        if (!localStorage.getItem('token')) return;
        try {
            const response = await api.get('/auth/profile');
            const userData = response.data.user || response.data;
            localStorage.setItem('user', JSON.stringify(userData));
            set({ user: userData, isAuthenticated: true });
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ user: null, token: null, isAuthenticated: false });
        }
    },

    deleteAccount: async () => {
        set({ loading: true });
        try {
            await api.delete('/auth/account');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ user: null, token: null, isAuthenticated: false, loading: false });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete account';
            set({ loading: false });
            return { success: false, message };
        }
    },

    restoreAccount: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/auth/restore-account', { email, password });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            set({ user, token, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to restore account';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    restoreGoogleAccount: async (idToken) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/auth/restore-google-account', { idToken });
            const { token, user } = response.data;
            const userData = user || response.data.user || response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            set({ user: userData, token, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to restore Google account';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    requestPasswordChange: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/auth/request-password-change');
            set({ loading: false });
            return { success: true, message: response.data.message };
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.error || 'Failed to request code';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    confirmPasswordChange: async (code, newPassword) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/auth/confirm-password-change', { code, newPassword });
            set({ loading: false });
            return { success: true, message: response.data.message };
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.error || 'Failed to update password';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    clearError: () => set({ error: null })
}));

export default useAuthStore;
