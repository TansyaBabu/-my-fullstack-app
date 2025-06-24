const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const fileUploadRoutes = require('./routes/fileUploadRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const insightRoutes = require('./routes/insightRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dataProcessingRoutes = require('./routes/dataProcessingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Log environment variables (excluding sensitive data)
console.log('Server Configuration:');
console.log('PORT:', PORT);
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Configured' : 'Not configured');
console.log('JWT Secret:', process.env.JWT_SECRET ? 'Configured' : 'Not configured');

// Connect to MongoDB
connectDB().catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', fileUploadRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/process', dataProcessingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin/analytics', analyticsRoutes);

// Default route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Graceful shutdown function
const gracefulShutdown = (server) => {
    console.log('Closing HTTP server.');
    server.close(() => {
        console.log('HTTP server closed.');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed.');
            process.exit(0);
        });
    });
};

const startServer = async () => {
    try {
        // The new connectDB returns a promise that resolves on a stable connection
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err) => {
            console.error('Unhandled Promise Rejection:', err);
            gracefulShutdown(server);
        });
        
        process.on('SIGTERM', () => {
            console.info('SIGTERM signal received.');
            gracefulShutdown(server);
        });

    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};

startServer();
