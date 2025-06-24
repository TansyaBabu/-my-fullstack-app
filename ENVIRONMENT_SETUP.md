# Environment Setup Guide

This guide explains how to set up environment variables for the ExcelVerse application.

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database?retryWrites=true&w=majority

# JWT Secret (for authentication)
JWT_SECRET=your_very_secure_jwt_secret_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# OpenAI API Key (for AI features)
OPENAI_API_KEY=sk-proj-your_openai_api_key_here

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

## Frontend Environment Variables

Create a `.env` file in the `frontend/` directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Application Name
VITE_APP_NAME=ExcelVerse
```

## How to Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy the key and paste it in your backend `.env` file

## Security Notes

- **Never commit your `.env` files to version control**
- The `.env` files are already included in `.gitignore`
- Keep your API keys secure and don't share them publicly
- Use different API keys for development and production

## Testing the Setup

To verify your environment variables are loaded correctly:

```bash
# Test backend environment
cd backend
node -e "require('dotenv').config(); console.log('API Key loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');"

# Test frontend environment
cd frontend
node -e "console.log('API URL:', process.env.VITE_API_URL);"
```

## Features That Use the API Key

The OpenAI API key is used for the following features:

1. **AI Summary Generation** - Automatically generates insights from uploaded Excel files
2. **Chat with File** - Allows users to ask questions about their data
3. **Data Analysis** - Provides intelligent analysis of uploaded data

## Troubleshooting

If you encounter issues:

1. **API Key Not Working**: Ensure the key is valid and has sufficient credits
2. **Environment Variables Not Loading**: Restart your development server
3. **CORS Issues**: Check that `FRONTEND_URL` matches your frontend URL
4. **Database Connection**: Verify your MongoDB connection string

## Production Deployment

For production deployment:

1. Use environment variables provided by your hosting platform
2. Set `NODE_ENV=production`
3. Use a production MongoDB instance
4. Use a strong, unique JWT secret
5. Ensure all API keys are properly secured 