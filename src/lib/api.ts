import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            const message = error.response.data?.message;
            if (message === 'Không được phép, token không hợp lệ' || message === 'Không được phép, không có token') {
                // Clear token and user data
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Redirect to login page
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Confession API functions
export const getConfessions = async () => {
    const response = await api.get('/confessions');
    return response.data;
};

export const createConfession = async (content: string, tags: string[], anonymous: boolean) => {
    const response = await api.post('/confessions', { content, tags, anonymous });
    return response.data;
};

export const reactToConfessionAPI = async (id: string, emoji: string) => {
    const response = await api.post(`/confessions/${id}/reactions`, { emoji });
    return response.data;
};

export const addCommentAPI = async (id: string, content: string) => {
    const response = await api.post(`/confessions/${id}/comments`, { content });
    return response.data;
};

export const deleteCommentAPI = async (confessionId: string, commentId: string) => {
    const response = await api.delete(`/confessions/${confessionId}/comments/${commentId}`);
    return response.data;
};


export const getConfessionDetail = async (id: string) => {
    const response = await api.get(`/confessions/${id}`);
    return response.data;
};

export const deleteConfessionAPI = async (id: string) => {
    const response = await api.delete(`/confessions/${id}`);
    return response.data;
};

export const getConfessionTags = async () => {
    const response = await api.get('/confessions/tags');
    return response.data;
};

// Chatbot API functions
export const startChat = async (topic?: string) => {
    const response = await api.post('/chatbot/start', { topic });
    return response.data;
};

export const sendChatMessage = async (message: string) => {
    const response = await api.post('/chatbot/message', { message });
    return response.data;
};

export const getChatHistory = async () => {
    const response = await api.get('/chatbot/history');
    return response.data;
};

export const clearChatHistory = async () => {
    const response = await api.delete('/chatbot/history');
    return response.data;
};


export default api;
