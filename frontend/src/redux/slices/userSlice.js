import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Login action
export const login = createAsyncThunk(
    'user/login',
    async (credentials, { rejectWithValue }) => {
        try {
            console.log('Login attempt with:', { email: credentials.email });
            const response = await api.post('/login', credentials);
            console.log('Login response:', response.data);
            
            if (!response.data || !response.data.user || !response.data.user.token) {
                console.error('Invalid login response format:', response.data);
                throw new Error('Invalid response from server');
            }

            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data.user;
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    }
);

// Register action
export const register = createAsyncThunk(
    'user/register',
    async (userData, { rejectWithValue }) => {
        try {
            console.log('Registration attempt with:', { email: userData.email });
            const response = await api.post('/register', userData);
            console.log('Registration response:', response.data);
            
            if (!response.data || !response.data.user || !response.data.user.token) {
                console.error('Invalid registration response format:', response.data);
                throw new Error('Invalid response from server');
            }

            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(response.data.user));
            return response.data.user;
        } catch (error) {
            console.error('Registration error:', error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || 'Registration failed. Please try again.');
        }
    }
);

// Logout action
export const logout = createAsyncThunk(
    'user/logout',
    async () => {
        localStorage.removeItem('user');
    }
);

const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    loading: false,
    error: null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.error = null;
            });
    }
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer; 