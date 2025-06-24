import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api/insights',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

export const getInsights = async (token) => {
    const res = await api.get('/', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const getInsight = async (id, token) => {
    const res = await api.get(`/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const createInsight = async (data, token) => {
    const res = await api.post('/', data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const updateInsight = async (id, data, token) => {
    const res = await api.put(`/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const deleteInsight = async (id, token) => {
    const res = await api.delete(`/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}; 