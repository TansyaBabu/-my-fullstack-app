import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

// Create axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

const ChatWithFile = () => {
    const { user } = useSelector((state) => state.user);
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchUserFiles = async () => {
        setIsLoadingFiles(true);
        try {
            console.log('Fetching files for user:', user);
            const response = await api.get('/upload/files', {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            console.log('Files response:', response.data);
            setFiles(response.data);
        } catch (error) {
            console.error('Failed to fetch files:', error);
            console.error('Error details:', error.response?.data);
        } finally {
            setIsLoadingFiles(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !selectedFile) return;

        const userMessage = {
            id: Date.now(),
            text: inputMessage,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await api.post('/analysis/chat', {
                message: inputMessage,
                fileId: selectedFile
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            const aiMessage = {
                id: Date.now() + 1,
                text: response.data.response,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: 'Sorry, I encountered an error. Please try again.',
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.value);
        setMessages([]); // Clear chat when file changes
    };

    useEffect(() => {
        if (user && user.token) {
            fetchUserFiles();
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-gradient-to-br from-blue-400/8 to-cyan-400/8 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden mb-8 border border-white/30 transform hover:scale-[1.02] transition-all duration-500">
                    <div className="p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16 animate-pulse delay-1000"></div>
                        <div className="relative z-10">
                            <div className="flex items-center mb-6">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-8 backdrop-blur-sm shadow-2xl">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Chat with Your Files</h2>
                                    <p className="text-indigo-100 text-xl font-medium">Ask questions about your uploaded data files</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Chat Container */}
                <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/30">
                    {/* File Selection */}
                    <div className="p-8 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mr-4 shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <label htmlFor="file-select" className="block text-lg font-bold text-gray-900 mb-1">
                                    Select a file to chat about
                                </label>
                                <p className="text-gray-600 text-sm">Choose from your uploaded data files</p>
                            </div>
                        </div>
                        <div className="relative">
                            <select
                                id="file-select"
                                value={selectedFile}
                                onChange={handleFileChange}
                                className="w-full p-4 pr-12 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/25 focus:border-indigo-500 bg-white/80 backdrop-blur-sm text-lg font-medium transition-all duration-300 hover:border-indigo-300 hover:shadow-xl"
                                disabled={isLoadingFiles}
                            >
                                <option value="">📁 Choose a file...</option>
                                {files.map((file) => (
                                    <option key={file._id} value={file._id}>
                                        📊 {file.fileName}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            {isLoadingFiles && (
                                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                                </div>
                            )}
                        </div>
                        {isLoadingFiles && (
                            <p className="text-sm text-gray-500 mt-3 flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                                Loading files...
                            </p>
                        )}
                    </div>

                    {/* Chat Messages */}
                    <div className="h-96 overflow-y-auto p-8 bg-gradient-to-br from-gray-50 to-blue-50">
                        {selectedFile ? (
                            messages.length > 0 ? (
                                <div className="space-y-6">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${
                                                    message.sender === 'user'
                                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/25'
                                                        : message.isError
                                                        ? 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border border-red-200'
                                                        : 'bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-200 shadow-gray-500/25'
                                                }`}
                                            >
                                                <p className="text-sm leading-relaxed">{message.text}</p>
                                                <p className={`text-xs mt-2 font-medium ${
                                                    message.sender === 'user' ? 'text-indigo-100' : 'text-gray-500'
                                                }`}>
                                                    {message.timestamp}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-200 px-6 py-4 rounded-2xl shadow-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div className="relative">
                                                        <div className="w-5 h-5 border-2 border-indigo-200 rounded-full animate-spin"></div>
                                                        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                                                    </div>
                                                    <span className="text-sm font-medium">AI is thinking...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                                            <span className="text-4xl">💬</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Start chatting about your data!</h3>
                                        <p className="text-gray-600 mb-6">Ask questions to get insights from your uploaded files</p>
                                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
                                            <p className="text-indigo-800 font-semibold mb-3">💡 Try asking questions like:</p>
                                            <ul className="text-indigo-700 space-y-2 text-left">
                                                <li className="flex items-center">
                                                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                                                    "What are the main trends in this data?"
                                                </li>
                                                <li className="flex items-center">
                                                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                                                    "Show me the highest values"
                                                </li>
                                                <li className="flex items-center">
                                                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                                                    "What insights can you find?"
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                                        <span className="text-4xl">📁</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Select a file to start chatting</h3>
                                    <p className="text-gray-600">Choose a file from the dropdown above to begin your conversation</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Message Input */}
                    {selectedFile && (
                        <form onSubmit={sendMessage} className="p-8 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50">
                            <div className="flex space-x-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        placeholder="Ask a question about your data..."
                                        className="w-full p-4 pr-12 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/25 focus:border-indigo-500 bg-white/80 backdrop-blur-sm text-lg font-medium transition-all duration-300 hover:border-indigo-300 hover:shadow-xl"
                                        disabled={isLoading}
                                    />
                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!inputMessage.trim() || isLoading}
                                    className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/25 ${
                                        (!inputMessage.trim() || isLoading)
                                            ? 'bg-gray-400 cursor-not-allowed shadow-lg'
                                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl hover:shadow-indigo-500/25'
                                    }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                            Sending...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            Send
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatWithFile; 