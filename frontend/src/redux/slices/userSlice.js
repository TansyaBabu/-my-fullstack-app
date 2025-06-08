import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
    user: user ? user : null,
    loading: false,
    error: null,
    success: false
};

// Register user
export const register = createAsyncThunk(
    'user/register',
    async ({ username, email, password }, { rejectWithValue }) => {
        try {
            console.log('Attempting to register user:', { username, email });
            const { data } = await api.post('/', { username, email, password });
            localStorage.setItem('user', JSON.stringify(data));
            console.log('Registration successful:', data);
            return data;
        } catch (error) {
            console.error('Registration error:', error.response?.data || error.message);
            return rejectWithValue(
                error.response?.data?.message || 'Registration failed. Please try again.'
            );
        }
    }
);

// Login user
export const login = createAsyncThunk(
    'user/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            console.log('Attempting to login user:', { email });
            const { data } = await api.post('/login', { email, password });
            localStorage.setItem('user', JSON.stringify(data));
            console.log('Login successful:', data);
            return data;
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            if (error.message === 'Network Error') {
                return rejectWithValue('Cannot connect to server. Please check if the server is running.');
            }
            return rejectWithValue(
                error.response?.data?.message || 'Login failed. Please check your credentials.'
            );
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('user');
            state.user = null;
            state.loading = false;
            state.error = null;
            state.success = false;
        },
        reset: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.user = action.payload;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    }
});

export const { logout, reset, clearError } = userSlice.actions;
export default userSlice.reducer; 