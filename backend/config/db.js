require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = () => {
    return new Promise((resolve, reject) => {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is not defined in environment variables');
            return reject(new Error('MONGODB_URI is not defined in environment variables'));
        }

        const connect = () => {
            mongoose.connect(process.env.MONGODB_URI)
                .then((conn) => {
        console.log(`MongoDB Connected: ${conn.connection.host}`);
                })
                .catch((error) => {
                    console.error(`MongoDB Connection Error: ${error.message}`);
                    // Retry connection after 5 seconds
                    setTimeout(connect, 5000);
                });
        };

        // Initial connection
        connect();

        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to db');
            resolve();
        });

        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
            reject(err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose connection is disconnected. Retrying...');
            connect();
        });
    });
};

module.exports = connectDB;